import type { Resource } from "./cluster-model.js";

export function encodeSecret(value: string) {
  return btoa(
    Array.from(new TextEncoder().encode(value), (byte) =>
      String.fromCharCode(byte),
    ).join(""),
  );
}
export function secretValue(secret: Resource | undefined, key: string) {
  if (secret?.stringData?.[key] !== undefined) return secret.stringData[key];
  const encoded = secret?.data?.[key];
  if (encoded === undefined) return undefined;
  return new TextDecoder().decode(
    Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)),
  );
}
/** Kubernetes consumes stringData on write; clients read base64 data. Also upgrades local saves. */
export function normalizeSecret(secret: Resource) {
  if (secret.kind !== "Secret") return;
  secret.type ??= "Opaque";
  secret.data = {
    ...secret.data,
    ...Object.fromEntries(
      Object.entries(secret.stringData ?? {}).map(([key, value]) => [
        key,
        encodeSecret(value),
      ]),
    ),
  };
  delete secret.stringData;
}
