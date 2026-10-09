// Test plan from the authored catalog. No browser state is injected.
import { chapters, materialize } from "../.test-build/src/campaign/catalog.js";
import { resourceTypes, refreshResourceTypes } from "../.test-build/src/simulation/resource-types.js";
refreshResourceTypes();
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
          namespace: materialize(value,ch.namespace).metadata.namespace ?? ch.namespace,
          admin:
            !Object.values(resourceTypes).find((d) => d.kind === value.kind)
              .namespaced || value.metadata?.namespace === "openshift-gitops" || ["Role", "RoleBinding"].includes(value.kind),
        })),
    })),
  ),
);
