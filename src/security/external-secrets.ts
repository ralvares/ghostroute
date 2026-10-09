import type { Resource } from "../simulation/cluster-model.js";
import { S } from "../simulation/state.js";
import { emulatorTime } from "../simulation/clock.js";
import { encodeSecret } from "../simulation/secrets.js";
import { providerValue } from "./provider-fixtures.js";
import { esoDataHash, esoMetaHash, sha3_224 } from "./eso-hash.js";

export function durationMs(text: string): number {
  if (text === "0") return 0;
  let total = 0,
    remaining = text;
  while (remaining) {
    const part = remaining.match(/^(\d+(?:\.\d+)?)(ns|us|µs|ms|s|m|h)/);
    if (!part) throw new Error("simulation: invalid duration " + text);
    total +=
      Number(part[1]) *
      {
        ns: 0.000001,
        us: 0.001,
        µs: 0.001,
        ms: 1,
        s: 1000,
        m: 60000,
        h: 3600000,
      }[part[2]]!;
    remaining = remaining.slice(part[0].length);
  }
  return total;
}
function condition(external: Resource, valid: boolean, message: string) {
  const old = (external.status?.conditions as any[])?.find(
    (c) => c.type === "Ready",
  );
  const status = valid ? "True" : "False",
    reason = valid ? "SecretSynced" : "SecretSyncedError";
  external.status = {
    ...external.status,
    conditions: [
      {
        type: "Ready",
        status,
        reason,
        message,
        lastTransitionTime:
          old?.status === status && old.reason === reason
            ? old.lastTransitionTime
            : new Date(emulatorTime()).toISOString(),
      },
    ],
  };
}
export function reconcileExternalSecrets() {
  const resources = S.cluster.resources;
  const externals = resources.filter((r) => r.kind === "ExternalSecret");
  // Owner policy uses Kubernetes garbage collection, not deletionPolicy.
  for (let i = resources.length - 1; i >= 0; i--)
    if (
      resources[i].kind === "Secret" &&
      resources[i].metadata.ownerReferences?.some(
        (o) =>
          o.kind === "ExternalSecret" &&
          !externals.some(
            (e) =>
              e.metadata.namespace === resources[i].metadata.namespace &&
              e.metadata.uid === o.uid,
          ),
      )
    )
      resources.splice(i, 1);
  for (const external of externals) {
    const namespace = external.metadata.namespace!,
      target = external.spec?.target ?? {};
    const name = target.name ?? external.metadata.name;
    const key = namespace + "/" + external.metadata.name;
    const existing = resources.find(
      (r) =>
        r.kind === "Secret" &&
        r.metadata.namespace === namespace &&
        r.metadata.name === name,
    );
    const saved = S.cluster.externalSecrets[key];
    const previous =
      saved && JSON.parse(saved.fingerprint)[0] === external.metadata.uid
        ? saved
        : undefined;
    const fingerprint = JSON.stringify([
      external.metadata.uid,
      external.spec,
      external.metadata.labels,
      external.metadata.annotations,
    ]);
    const policy = external.spec?.refreshPolicy ?? "Periodic",
      creation = target.creationPolicy ?? "Owner",
      deletion = target.deletionPolicy ?? "Retain";
    try {
      if (!["Owner", "Orphan", "Merge", "None"].includes(creation))
        throw new Error(
          "simulation: unsupported ExternalSecret creationPolicy " + creation,
        );
      if (!["Periodic", "OnChange", "CreatedOnce"].includes(policy))
        throw new Error(
          "simulation: unsupported ExternalSecret refreshPolicy " + policy,
        );
      if (!["Retain", "Delete", "Merge"].includes(deletion))
        throw new Error(
          "simulation: unsupported ExternalSecret deletionPolicy " + deletion,
        );
      if (creation === "None") continue;
      if (
        (deletion === "Delete" && creation !== "Owner") ||
        (deletion === "Merge" && creation === "None")
      )
        throw new Error("invalid creationPolicy/deletionPolicy combination");
      const interval = durationMs(external.spec?.refreshInterval ?? "1h");
      const invalid =
        !existing ||
        (previous &&
          JSON.stringify(existing.data ?? {}) !== previous.targetData);
      const changed = !previous || previous.fingerprint !== fingerprint;
      const due =
        policy === "Periodic" &&
        interval > 0 &&
        previous &&
        emulatorTime() - previous.time >= interval;
      const refresh =
        !previous ||
        invalid ||
        (policy === "OnChange" && changed) ||
        (policy === "Periodic" && interval > 0 && (changed || due));
      if (!refresh) continue;
      if (
        external.spec?.dataFrom?.length ||
        target.template?.data ||
        target.template?.templateFrom
      )
        throw new Error(
          "simulation: ExternalSecret templating/dataFrom is not implemented",
        );
      const storeRef = external.spec?.secretStoreRef;
      const storeKind = storeRef?.kind ?? "SecretStore";
      const store = resources.find(
        (r) =>
          r.kind === storeKind &&
          r.metadata.name === storeRef?.name &&
          (storeKind === "ClusterSecretStore" ||
            r.metadata.namespace === namespace),
      );
      if (!store)
        throw new Error(`${storeKind} ${storeRef?.name ?? ""} is absent`);
      const data: Record<string, string> = {};
      const missing: string[] = [];
      for (const mapping of external.spec?.data ?? []) {
        if (
          mapping.sourceRef ||
          (mapping.remoteRef?.decodingStrategy &&
            mapping.remoteRef.decodingStrategy !== "None")
        )
          throw new Error(
            "simulation: sourceRef and decoding strategies are not implemented",
          );
        try {
          data[mapping.secretKey] = encodeSecret(
            providerValue(
              resources,
              store,
              namespace,
              mapping.remoteRef.key,
              mapping.remoteRef.property,
              mapping.remoteRef.version,
            ),
          );
        } catch (error) {
          if (
            (error as Error).message.startsWith(
              "provider secret does not exist:",
            )
          )
            missing.push(mapping.secretKey);
          else throw error;
        }
      }
      if (missing.length && deletion === "Retain")
        throw new Error("provider secret does not exist: " + missing.join(","));
      if (
        missing.length &&
        !Object.keys(data).length &&
        deletion === "Delete"
      ) {
        if (
          existing &&
          !existing.metadata.ownerReferences?.some(
            (o) => o.uid === external.metadata.uid,
          )
        )
          throw new Error("cannot delete a Secret owned by another controller");
        if (existing) resources.splice(resources.indexOf(existing), 1);
        condition(
          external,
          true,
          "secret deleted due to DeletionPolicy=Delete",
        );
        S.cluster.externalSecrets[key] = {
          fingerprint,
          time: emulatorTime(),
          targetData: "{}",
        };
        continue;
      }
      if (creation === "Merge" && !existing)
        throw new Error(
          "target Secret does not exist for creationPolicy=Merge",
        );
      const owner = existing?.metadata.ownerReferences?.find(
        (o) => o.controller,
      );
      if (
        owner &&
        owner.uid !== external.metadata.uid &&
        (owner.kind === "ExternalSecret" || creation === "Owner")
      )
        throw new Error("Secret is owned by another controller");
      const secret =
        existing ??
        ({
          apiVersion: "v1",
          kind: "Secret",
          metadata: {
            name,
            namespace,
            creationTimestamp: new Date(emulatorTime()).toISOString(),
          },
          type: target.template?.type ?? "Opaque",
        } as Resource);
      const merged = { ...secret.data };
      for (const oldKey of previous?.managedKeys ?? []) delete merged[oldKey];
      Object.assign(merged, data);
      for (const missingKey of missing) delete merged[missingKey];
      if (
        secret.immutable &&
        JSON.stringify(secret.data) !== JSON.stringify(merged)
      )
        throw new Error("target Secret is immutable");
      secret.data = merged;
      secret.metadata.labels = {
        ...secret.metadata.labels,
        ...external.metadata.labels,
        ...target.template?.metadata?.labels,
        "reconcile.external-secrets.io/managed": "true",
      };
      secret.metadata.annotations = {
        ...secret.metadata.annotations,
        ...external.metadata.annotations,
        ...target.template?.metadata?.annotations,
        "reconcile.external-secrets.io/data-hash": esoDataHash(secret.data),
      };
      if (creation === "Owner")
        secret.metadata.ownerReferences = [
          {
            apiVersion: external.apiVersion,
            kind: external.kind,
            name: external.metadata.name,
            uid: external.metadata.uid!,
            controller: true,
            blockOwnerDeletion: true,
          },
        ];
      else if (owner?.uid === external.metadata.uid)
        secret.metadata.ownerReferences =
          secret.metadata.ownerReferences?.filter(
            (o) => o.uid !== external.metadata.uid,
          );
      if (creation === "Owner")
        secret.metadata.labels!["reconcile.external-secrets.io/created-by"] =
          sha3_224(namespace + "/" + external.metadata.name);
      else
        delete secret.metadata.labels![
          "reconcile.external-secrets.io/created-by"
        ];
      if (target.immutable) secret.immutable = true;
      if (!existing) resources.push(secret);
      const time = emulatorTime();
      S.cluster.externalSecrets[key] = {
        fingerprint,
        time,
        targetData: JSON.stringify(secret.data),
        managedKeys: Object.keys(data),
      };
      external.status = {
        ...external.status,
        refreshTime: new Date(time).toISOString(),
        syncedResourceVersion: `${external.metadata.generation ?? 1}-${esoMetaHash(external.metadata.labels, external.metadata.annotations)}`,
      };
      condition(external, true, "Secret was synced");
    } catch (error) {
      condition(external, false, (error as Error).message);
    }
  }
}
