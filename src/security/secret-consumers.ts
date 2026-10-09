import { prepareCsiMount } from "./csi-lifecycle.js";
import type { Resource } from "../simulation/cluster-model.js";
import { S } from "../simulation/state.js";
import { secretValue } from "../simulation/secrets.js";

export const podRuntimeKey = (pod: Resource) =>
  pod.metadata.namespace + "/" + pod.metadata.name;
const find = (kind: string, name: string, namespace?: string) =>
  S.cluster.resources.find(
    (r) =>
      r.kind === kind &&
      r.metadata.name === name &&
      (!namespace || r.metadata.namespace === namespace),
  );

/** Kubelet startup environment is a snapshot; volume data and subPath have different lifetimes. */
export function prepareSecretConsumer(pod: Resource, fresh = false): string {
  const key = podRuntimeKey(pod),
    ns = pod.metadata.namespace!;
  const runtime: (typeof S.cluster.podRuntime)[string] =
    fresh || !S.cluster.podRuntime[key]
      ? { env: {}, files: {}, subPaths: {} }
      : S.cluster.podRuntime[key];
  S.cluster.podRuntime[key] = runtime;
  try {
    for (const volume of pod.spec?.volumes ?? []) {
      const name = String(volume.name);
      if (volume.secret) {
        const source = volume.secret as any,
          secret = find("Secret", source.secretName, ns);
        if (!secret && !source.optional)
          throw new Error(`secret "${source.secretName}" not found`);
        const fields: Record<string, string> = {};
        for (const item of source.items ??
          Object.keys(secret?.data ?? {}).map((key) => ({ key, path: key }))) {
          const value = secretValue(secret, item.key);
          if (value === undefined && !source.optional)
            throw new Error(`references non-existent secret key: ${item.key}`);
          if (value !== undefined) fields[item.path] = value;
        }
        runtime.files[name] = fields;
      }
      if (volume.csi) prepareCsiMount(pod, volume, runtime, fresh);
    }
    for (const container of pod.spec?.containers ?? []) {
      if (
        runtime.env[container.name] ||
        (pod.status?.containerStatuses as any[])?.find(
          (c) => c.name === container.name,
        )?.state?.waiting?.reason === "ImagePullBackOff"
      )
        continue;
      const env: Record<string, string> = {};
      for (const variable of container.env ?? []) {
        const ref = variable.valueFrom?.secretKeyRef;
        if (!ref) {
          if (variable.value !== undefined) env[variable.name] = variable.value;
          continue;
        }
        const secret = find("Secret", ref.name, ns),
          value = secretValue(secret, ref.key);
        if (value === undefined && !ref.optional)
          throw new Error(
            secret
              ? `couldn't find key ${ref.key} in Secret ${ns}/${ref.name}`
              : `secret "${ref.name}" not found`,
          );
        if (value !== undefined) env[variable.name] = value;
      }
      runtime.env[container.name] = env;
    }
    for (const container of pod.spec?.containers ?? [])
      for (const mount of container.volumeMounts ?? [])
        if (mount.subPath) {
          const subKey = container.name + "/" + mount.mountPath;
          runtime.subPaths[subKey] ??=
            runtime.files[mount.name]?.[mount.subPath];
        }
    return "";
  } catch (error) {
    return (error as Error).message;
  }
}
export function consumerEnvironment(
  pod: Resource,
  container: string,
): Record<string, string> {
  return S.cluster.podRuntime[podRuntimeKey(pod)]?.env[container] ?? {};
}
export function consumerFile(
  pod: Resource,
  container: string,
  path: string,
): string | undefined {
  const runtime = S.cluster.podRuntime[podRuntimeKey(pod)];
  const mounts =
    pod.spec?.containers?.find((c) => c.name === container)?.volumeMounts ?? [];
  for (const mount of [...mounts].sort(
    (a, b) => b.mountPath.length - a.mountPath.length,
  )) {
    if (mount.subPath && path === mount.mountPath)
      return runtime?.subPaths[container + "/" + mount.mountPath];
    if (path.startsWith(mount.mountPath.replace(/\/$/, "") + "/"))
      return runtime?.files[mount.name]?.[
        path.slice(mount.mountPath.replace(/\/$/, "").length + 1)
      ];
  }
}
export function csiInstallationFixtures(): Resource[] {
  return [
    {
      apiVersion: "storage.k8s.io/v1",
      kind: "CSIDriver",
      metadata: { name: "secrets-store.csi.k8s.io" },
      spec: {
        attachRequired: false,
        podInfoOnMount: true,
        volumeLifecycleModes: ["Ephemeral"],
        fsGroupPolicy: "None",
      },
    },
    ...["worker-01", "worker-02"].map((name) => ({
      apiVersion: "storage.k8s.io/v1",
      kind: "CSINode",
      metadata: { name },
      spec: {
        drivers: [
          { name: "secrets-store.csi.k8s.io", nodeID: name, topologyKeys: [] },
        ],
      },
    })),
  ];
}
