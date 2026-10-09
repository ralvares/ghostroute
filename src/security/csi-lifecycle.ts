import { parse } from "yaml";
import type { Resource } from "../simulation/cluster-model.js";
import { S } from "../simulation/state.js";
import { emulatorTime } from "../simulation/clock.js";
import { synchronizeMetadata } from "../simulation/api-storage.js";
import { encodeSecret } from "../simulation/secrets.js";
import { roleAllows } from "./rbac.js";
import { providerValue } from "./provider-fixtures.js";

const find = (kind: string, name: string, namespace?: string) =>
  S.cluster.resources.find(
    (r) =>
      r.kind === kind &&
      r.metadata.name === name &&
      (!namespace || r.metadata.namespace === namespace),
  );
const namespace = "openshift-csi-secrets-store",
  driverName = "secrets-store-csi-driver";
function installation() {
  const driver = find("DaemonSet", driverName, namespace);
  const args =
    driver?.spec?.template?.spec?.containers?.find(
      (c: any) => c.name === "secrets-store",
    )?.args ?? [];
  const text =
    args
      .find((a: string) => a.startsWith("--rotation-poll-interval="))
      ?.split("=")[1] ?? "2m";
  const match = text.match(/^(\d+)(ms|s|m|h)$/);
  return {
    rotation: args.includes("--enable-secret-rotation=true"),
    interval: match
      ? Number(match[1]) *
        { ms: 1, s: 1000, m: 60000, h: 3600000 }[match[2] as "s"]
      : 120000,
    identity: `system:serviceaccount:${namespace}:${driver?.spec?.template?.spec?.serviceAccountName ?? driverName}`,
  };
}
/** v1.5.3 rotation and Secret sync use the mounted file names and provider's opaque versions. */
export function prepareCsiMount(
  pod: Resource,
  volume: any,
  runtime: (typeof S.cluster.podRuntime)[string],
  fresh: boolean,
) {
  const ns = pod.metadata.namespace!,
    name = String(volume.name),
    csi = volume.csi;
  if (csi.driver !== "secrets-store.csi.k8s.io")
    throw new Error(
      "simulation: this CSI provider is not implemented: " + csi.driver,
    );
  if (csi.readOnly !== true) throw new Error("Readonly is not true in request");
  if (!find("CSIDriver", csi.driver))
    throw new Error(
      `driver name ${csi.driver} not found in the list of registered CSI drivers`,
    );
  if (
    !find("CSINode", pod.spec?.nodeName ?? "")?.spec?.drivers?.some(
      (d: any) => d.name === csi.driver,
    )
  )
    throw new Error("CSI driver is not registered on this node");
  const spc = find(
    "SecretProviderClass",
    csi.volumeAttributes?.secretProviderClass,
    ns,
  );
  if (!spc)
    throw new Error("SecretProviderClass is absent in the Pod namespace");
  if (spc.spec?.provider !== "vault")
    throw new Error("simulation: CSI supports the recorded Vault provider");
  runtime.csiRefresh ??= {};
  const config = installation(),
    now = emulatorTime();
  const initial = !runtime.files[name];
  const rotate =
    config.rotation &&
    now - (runtime.csiRefresh[name] ?? now) >= config.interval;
  const statusName = `${pod.metadata.name}-${ns}-${spc.metadata.name}`;
  let status = find("SecretProviderClassPodStatus", statusName, ns);
  if (initial || rotate) {
    try {
      const parameters = spc.spec?.parameters ?? {},
        objects = parse(parameters.objects ?? "[]");
      if (!Array.isArray(objects) || !objects.length)
        throw new Error("Vault provider objects must be a YAML list");
      const store: Resource = {
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        metadata: { name: "inline-vault" },
        spec: {
          provider: {
            vault: {
              server: parameters.vaultAddress,
              path: "secret",
              version: "v2",
              auth: {
                kubernetes: {
                  role: parameters.roleName,
                  serviceAccountRef: {
                    name: pod.spec?.serviceAccountName ?? "default",
                  },
                },
              },
            },
          },
        },
      };
      const fields = Object.fromEntries(
        objects.map((o: any) => {
          if (
            !o.objectName ||
            o.objectName.includes("/") ||
            o.objectName === ".."
          )
            throw new Error("invalid CSI objectName");
          return [
            o.objectName,
            providerValue(
              S.cluster.resources,
              store,
              ns,
              o.secretPath,
              o.secretKey,
              o.secretVersion,
            ),
          ];
        }),
      );
      runtime.files[name] = fields;
      runtime.csiRefresh[name] = now;
      if (!status) {
        status = {
          apiVersion: "secrets-store.csi.x-k8s.io/v1",
          kind: "SecretProviderClassPodStatus",
          metadata: { name: statusName, namespace: ns },
        };
        S.cluster.resources.push(status);
      }
      const versions = JSON.parse(
        find("ConfigMap", "provider-record", ns)?.data?.csiObjectVersions ??
          "{}",
      );
      status.status = {
        mounted: true,
        podName: pod.metadata.name,
        secretProviderClassName: spc.metadata.name,
        objects: objects.map((o: any) => ({
          id: o.objectName,
          version: versions[o.objectName] ?? "",
        })),
        targetPath: `/var/lib/kubelet/pods/${pod.metadata.uid ?? ""}/volumes/kubernetes.io~csi/${name}/mount`,
      };
    } catch (error) {
      runtime.csiRefresh[name] = now;
      if (initial) throw error;
      warning(pod, "FailedToRotate", (error as Error).message);
      return;
    }
  }
  if (!status) return;
  status.metadata.ownerReferences = [
    {
      apiVersion: "v1",
      kind: "Pod",
      name: pod.metadata.name,
      uid: pod.metadata.uid ?? "",
    },
  ];
  status.metadata.labels = {
    ...status.metadata.labels,
    "internal.secrets-store.csi.k8s.io/node-name": pod.spec?.nodeName ?? "",
  };
  status.status!.targetPath = `/var/lib/kubelet/pods/${pod.metadata.uid ?? ""}/volumes/kubernetes.io~csi/${name}/mount`;
  synchronizeMetadata([status], false);
  for (const object of spc.spec?.secretObjects ?? []) {
    try {
      syncSecret(
        pod,
        status,
        object,
        runtime.files[name],
        config.identity,
        rotate,
      );
    } catch (error) {
      warning(
        pod,
        rotate ? "FailedToRotate" : "FailedToCreateSecret",
        (error as Error).message,
      );
    }
  }
}
function syncSecret(
  pod: Resource,
  status: Resource,
  object: any,
  files: Record<string, string>,
  identity: string,
  rotate: boolean,
) {
  const ns = pod.metadata.namespace!,
    name = String(object.secretName ?? "").trim();
  if (!name || !object.data?.length)
    throw new Error("secretObject secretName and data are required");
  const data = Object.fromEntries(
    object.data.map((d: any) => {
      if (!d.key || files[d.objectName] === undefined)
        throw new Error(
          `file matching objectName ${d.objectName} not found in the pod`,
        );
      return [d.key, encodeSecret(files[d.objectName])];
    }),
  );
  let secret = find("Secret", name, ns);
  if (
    !roleAllows(
      identity,
      secret ? (rotate ? "patch" : "get") : "create",
      "secrets",
      ns,
      name,
    )
  )
    throw new Error(
      "The secret operation failed with forbidden error. If you installed the CSI driver using helm, ensure syncSecret.enabled=true is set.",
    );
  if (!secret) {
    secret = {
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        name,
        namespace: ns,
        labels: {
          ...object.labels,
          "secrets-store.csi.k8s.io/managed": "true",
        },
        annotations: object.annotations ?? {},
      },
      type: object.type || "Opaque",
      data,
    };
    S.cluster.resources.push(secret);
  } else if (rotate && JSON.stringify(secret.data) !== JSON.stringify(data)) {
    if (secret.immutable)
      throw new Error(
        `Secret "${name}" is invalid: data: Forbidden: field is immutable when immutable is set`,
      );
    secret.data = data;
  }
  const owners = pod.metadata.ownerReferences?.length
    ? pod.metadata.ownerReferences
    : [
        {
          apiVersion: status.apiVersion,
          kind: status.kind,
          name: status.metadata.name,
          uid: status.metadata.uid!,
        },
      ];
  secret.metadata.ownerReferences ??= [];
  for (const owner of owners)
    if (!secret.metadata.ownerReferences.some((o) => o.uid === owner.uid))
      secret.metadata.ownerReferences.push({
        apiVersion: owner.apiVersion,
        kind: owner.kind,
        name: owner.name,
        uid: owner.uid,
      });
}
function warning(pod: Resource, reason: string, message: string) {
  const at = new Date(emulatorTime()).toISOString();
  if (
    S.cluster.events.some(
      (e) =>
        e.reason === reason &&
        e.message === message &&
        (e.involvedObject as any)?.uid === pod.metadata.uid,
    )
  )
    return;
  S.cluster.events.push({
    apiVersion: "v1",
    kind: "Event",
    metadata: {
      name: `${pod.metadata.name}.csi-${S.cluster.events.length}`,
      namespace: pod.metadata.namespace,
    },
    type: "Warning",
    reason,
    message,
    involvedObject: {
      apiVersion: "v1",
      kind: "Pod",
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      uid: pod.metadata.uid ?? "",
    },
    source: { component: "csi-secrets-store-controller" },
    firstTimestamp: at,
    lastTimestamp: at,
    count: 1,
  });
}
/** SPCPS lifetime follows the Pod; synced Secrets follow their recorded owner references. */
export function collectCsiSecrets() {
  const resources = S.cluster.resources;
  S.cluster.resources = resources.filter(
    (r) =>
      r.kind !== "Secret" ||
      r.metadata.labels?.["secrets-store.csi.k8s.io/managed"] !== "true" ||
      !r.metadata.ownerReferences?.length ||
      r.metadata.ownerReferences.some((o) =>
        resources.some(
          (owner) =>
            owner.kind === o.kind &&
            owner.metadata.uid === o.uid &&
            owner.metadata.namespace === r.metadata.namespace,
        ),
      ),
  );
}
