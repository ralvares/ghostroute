// Test plan from the authored catalog. No browser state is injected.
import { chapters } from "../.test-build/src/campaign/catalog.js";
import { resourceTypes } from "../.test-build/src/simulation/resource-types.js";
console.log(
  JSON.stringify(
    chapters.slice(1).map((ch) => ({
      id: ch.id,
      title: ch.title,
      namespace: ch.namespace,
      witnesses: ch.witnesses,
      probes: ch.probes.map((p) => p.id),
      conclusion: ch.conclusion,
      files: Object.entries(ch.files)
        .filter(
          ([name, value]) =>
            name.endsWith(".yaml") &&
            !["root.yaml", "oversized.yaml", "missing.yaml"].includes(name),
        )
        .map(([name, value]) => ({
          name,
          kind: value.kind,
          admin:
            !Object.values(resourceTypes).find((d) => d.kind === value.kind)
              .namespaced || ["Role", "RoleBinding"].includes(value.kind),
        })),
    })),
  ),
);
