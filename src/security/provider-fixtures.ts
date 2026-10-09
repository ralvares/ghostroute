import type { Resource } from "../simulation/cluster-model.js";

/** A provider adapter boundary. Vault contents/authority are authored records, never remote calls. */
export function providerValue(
  resources: Resource[],
  store: Resource,
  namespace: string,
  key: string,
  property?: string,
  version?: string,
): string {
  const fake = store.spec?.provider?.fake;
  if (fake) {
    const entry = fake.data?.find(
      (d: any) => d.key === key && (!version || d.version === version),
    );
    if (!entry) throw new Error("provider secret does not exist: " + key);
    if (!property) return entry.value;
    const value = JSON.parse(entry.value)?.[property];
    if (value === undefined)
      throw new Error("provider property does not exist: " + property);
    return typeof value === "string" ? value : JSON.stringify(value);
  }
  const vault = store.spec?.provider?.vault;
  if (!vault)
    throw new Error(
      "simulation: this provider adapter supports Fake and recorded Vault stores",
    );
  const auth = vault.auth?.kubernetes;
  if (
    !auth ||
    !resources.some(
      (r) =>
        r.kind === "ServiceAccount" &&
        r.metadata.namespace === namespace &&
        r.metadata.name === (auth.serviceAccountRef?.name ?? "default"),
    )
  )
    throw new Error("Vault authentication failed: ServiceAccount is absent");
  const record = resources.find(
    (r) =>
      r.kind === "ConfigMap" &&
      r.metadata.namespace === namespace &&
      r.metadata.name === "provider-record",
  );
  if (!record) throw new Error("Vault provider record is absent");
  const roles = (record.data?.roles ?? "database-reader").split(",");
  const accounts = (record.data?.serviceAccounts ?? "default").split(",");
  if (
    !roles.includes(auth.role) ||
    !accounts.includes(auth.serviceAccountRef?.name ?? "default")
  )
    throw new Error(
      "Vault authorization denied for this role and ServiceAccount",
    );
  const path = vault.path ?? "secret";
  const fullKey = key.startsWith(path + "/")
    ? key
    : `${path}/${vault.version === "v1" ? "" : "data/"}${key}`;
  const records = record.data?.records
    ? (JSON.parse(record.data.records) as Record<
        string,
        { version: string; value: unknown }
      >)
    : {
        [record.data?.path ?? "secret/data/database"]: {
          version: record.data?.version ?? "",
          value: { password: record.data?.value },
        },
      };
  const entry = records[fullKey];
  if (!entry || (version && entry.version !== version))
    throw new Error("provider secret does not exist: " + fullKey);
  const value = property
    ? (entry.value as Record<string, unknown>)?.[property]
    : entry.value;
  if (value === undefined)
    throw new Error("provider property does not exist: " + property);
  return typeof value === "string" ? value : JSON.stringify(value);
}
