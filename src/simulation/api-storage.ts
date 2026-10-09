import type { Resource } from "./cluster-model.js";
import { S } from "./state.js";

export function resourceKey(resource: Resource) {
  return [
    resource.apiVersion,
    resource.kind,
    resource.metadata.namespace ?? "",
    resource.metadata.name,
  ].join("/");
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, entry) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(
          Object.keys(entry)
            .sort()
            .map((key) => [key, entry[key]]),
        )
      : entry,
  );
}

/** Persist opaque object revisions independently from audit reads and the controller clock. */
export function synchronizeMetadata(resources: Resource[], prune = true) {
  const storage = S.cluster.apiStorage;
  const retained = new Set<string>();
  for (const resource of resources) {
    resource.metadata.creationTimestamp ??= "2026-10-01T02:14:00Z";
    const key = resourceKey(resource);
    retained.add(key);
    const content = structuredClone(resource);
    delete content.metadata.uid;
    delete content.metadata.resourceVersion;
    delete content.metadata.generation;
    const fingerprint = canonicalJson(content);
    const spec = canonicalJson(resource.spec ?? null);
    let entry = storage.objects[key];
    if (!entry) {
      entry = storage.objects[key] = {
        uid: `00000000-0000-4000-9000-${String(++storage.nextUid).padStart(12, "0")}`,
        resourceVersion: String(++storage.revision),
        generation: resource.spec ? (resource.metadata.generation ?? 1) : 0,
        fingerprint,
        spec,
      };
    } else if (entry.fingerprint !== fingerprint) {
      entry.resourceVersion = String(++storage.revision);
      if (entry.spec !== spec && resource.spec) entry.generation++;
      entry.fingerprint = fingerprint;
      entry.spec = spec;
    }
    resource.metadata.uid = entry.uid;
    resource.metadata.resourceVersion = entry.resourceVersion;
    if (resource.spec) resource.metadata.generation = entry.generation;
  }
  if (prune)
    for (const key of Object.keys(storage.objects))
      if (!retained.has(key)) {
        delete storage.objects[key];
        storage.revision++;
      }
}
