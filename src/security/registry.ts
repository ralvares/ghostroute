import { S } from "../simulation/state.js";
import { getImage } from "./rhacs/images.js";
import type { Resource } from "../simulation/cluster-model.js";
import { secretValue, encodeSecret } from "../simulation/secrets.js";
export const registryHost = "registry.example.test";
export const leakedToken = "training-registry-v1-revoked";
export const replacementToken = "training-registry-v2";
export const registryCredential = (token: string) =>
  JSON.stringify({
    auths: { [registryHost]: { auth: encodeSecret("release-bot:" + token) } },
  });
export function createRegistry() {
  return {
    sessions: {} as Record<string, { username: string; token: string }>,
    pulled: [] as string[],
    pushed: [] as string[],
  };
}
export function registryAuthorized(
  host: string,
  username: string,
  token: string,
  operation: "pull" | "push",
) {
  // Authored authority: v1 was revoked after the Chapter 07/09 leak; v2 is scoped to this registry.
  return (
    host === registryHost &&
    username === "release-bot" &&
    token === replacementToken
  );
}
export function registryImageKnown(ref: string) {
  try {
    return !!getImage(ref);
  } catch {
    return false;
  }
}
export function privatePullFailure(ref: string, pod: Resource): string {
  if (!ref.startsWith(registryHost + "/private/")) return "";
  const names = [
    ...(pod.spec?.imagePullSecrets ?? []),
    ...((S.cluster.resources.find(
      (r) =>
        r.kind === "ServiceAccount" &&
        r.metadata.name === (pod.spec?.serviceAccountName ?? "default") &&
        r.metadata.namespace === pod.metadata.namespace,
    )?.imagePullSecrets as any[]) ?? []),
  ];
  for (const item of names) {
    const secret = S.cluster.resources.find(
      (r) =>
        r.kind === "Secret" &&
        r.metadata.name === item.name &&
        r.metadata.namespace === pod.metadata.namespace,
    );
    if (secret?.type !== "kubernetes.io/dockerconfigjson") continue;
    try {
      const cfg = JSON.parse(secretValue(secret, ".dockerconfigjson") ?? "{}");
      const encoded = cfg.auths?.[registryHost]?.auth;
      if (!encoded) continue;
      const decoded = new TextDecoder().decode(
        Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)),
      );
      const colon = decoded.indexOf(":");
      if (
        registryAuthorized(
          registryHost,
          decoded.slice(0, colon),
          decoded.slice(colon + 1),
          "pull",
        )
      )
        return "";
    } catch {}
  }
  return `Failed to pull image "${ref}": unable to retrieve auth token: invalid username/password: unauthorized: authentication required`;
}
