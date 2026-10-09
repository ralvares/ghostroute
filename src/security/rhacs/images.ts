import { artifactDigests } from "./image-digests.js";
import type { ImageAsset, Component } from "./types.js";
const component = (version: string, vulnerable = false): Component => ({
  name: "log4j-core",
  version,
  purl: `pkg:maven/org.apache.logging.log4j/log4j-core@${version}`,
  vulns: vulnerable
    ? [
        {
          cve: "CVE-2021-44228",
          severity: "CRITICAL",
          cvss: 10,
          link: "https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
          fixedBy: "2.17.1",
        },
        {
          cve: "CVE-2021-45046",
          severity: "CRITICAL",
          cvss: 9,
          link: "https://nvd.nist.gov/vuln/detail/CVE-2021-45046",
          fixedBy: "2.17.1",
        },
      ]
    : [],
});
function image(
  ref: string,
  user = "1001",
  components: Component[] = [],
): ImageAsset {
  return {
    ref,
    digest: artifactDigests[ref],
    user,
    created: "2026-10-01T00:00:00Z",
    scanned: "2026-10-08T00:00:00Z",
    labels: {
      "org.opencontainers.image.source":
        "https://git.example.test/" + ref.split("/").at(-1)?.split(":")[0],
      "org.opencontainers.image.version": ref.split(":").at(-1) ?? "",
    },
    dockerfile: [
      { instruction: "FROM", value: "scratch" },
      { instruction: "USER", value: user },
    ],
    components,
  };
}
/** Authored game artifacts, not vendor vulnerability reports. Tags are immutable in this catalog. */
export const imageAssets: ImageAsset[] = [
  image("registry.example.test/payments:v1.8.2", "1001", [
    component("2.14.1", true),
  ]),
  image("registry.example.test/payments:v1.8.3", "1001", [component("2.17.1")]),
  image("registry.example.test/payments:v1.8.4", "1001", [component("2.17.1")]),
  image("registry.example.test/private/payments:v1.8.2", "1001", [
    component("2.14.1", true),
  ]),
  image("registry.example.test/private/payments:v1.8.3", "1001", [
    component("2.17.1"),
  ]),
  image("registry.example.test/ledger:v1"),
  image("registry.example.test/owned:arbitrary-uid"),
  image("registry.example.test/owned:root", "0"),
  image("registry.example.test/vendor:fixed-uid", "100"),
  image("quay.io/argoproj/argocd:v3.5.4"),
  // Authored operator assessments; these are game assets, not live vendor scan results.
  ...["ghcr.io/tektoncd/pipeline/controller:v1.9.0", "ghcr.io/tektoncd/triggers/controller:v0.35.1", "quay.io/compliance-operator/compliance-operator:1.8.2", "registry.redhat.io/openshift-sandboxed-containers/osc-rhel9-operator:1.11.0", "ghcr.io/external-secrets/external-secrets:v0.18.0", "registry.k8s.io/csi-secrets-store/driver:v1.5.3"].map(ref=>image(ref)),
];
export function getImage(ref: string): ImageAsset {
  const found = imageAssets.find(
    (a) =>
      a.ref === ref ||
      a.ref.split(":").slice(0, -1).join(":") + "@" + a.digest === ref ||
      a.ref + "@" + a.digest === ref,
  );
  if (!found)
    throw new Error(
      `simulation: no authored image scan for ${ref}; see rhacs/images/catalog.json`,
    );
  return structuredClone(found);
}
export function imageSbom(asset: ImageAsset) {
  return {
    spdxVersion: "SPDX-2.3",
    dataLicense: "CC0-1.0",
    SPDXID: "SPDXRef-DOCUMENT",
    name: asset.ref,
    documentNamespace: `https://training.example.test/sbom/${asset.digest.replace(":", "/")}`,
    creationInfo: { created: asset.scanned, creators: ["Tool: roxctl-4.11.3"] },
    packages: asset.components.map((c, i) => ({
      SPDXID: `SPDXRef-Package-${i}`,
      name: c.name,
      versionInfo: c.version,
      downloadLocation: "NOASSERTION",
      filesAnalyzed: false,
      licenseConcluded: "NOASSERTION",
      licenseDeclared: "NOASSERTION",
      copyrightText: "NOASSERTION",
      externalRefs: [
        {
          referenceCategory: "PACKAGE-MANAGER",
          referenceType: "purl",
          referenceLocator: c.purl,
        },
      ],
    })),
    relationships: asset.components.map((_, i) => ({
      spdxElementId: "SPDXRef-DOCUMENT",
      relationshipType: "DESCRIBES",
      relatedSpdxElement: `SPDXRef-Package-${i}`,
    })),
  };
}
/** Match package identities, not SBOM names or image tags. Unknown versions must not look clean. */
export function scanSbom(document: any): ImageAsset {
  if (document?.spdxVersion !== "SPDX-2.3")
    throw new Error("auto detecting media type: unsupported SBOM version");
  if (!Array.isArray(document.packages))
    throw new Error("invalid or unsupported SBOM: packages array required");
  const seen = new Set<string>();
  const components: Component[] = [];
  for (const p of document.packages) {
    if (!p || typeof p.name !== "string" || typeof p.versionInfo !== "string")
      throw new Error(
        "invalid or unsupported SBOM: package name and versionInfo required",
      );
    const purl = p.externalRefs?.find(
      (r: any) => r.referenceType === "purl",
    )?.referenceLocator;
    const known = imageAssets
      .flatMap((a) => a.components)
      .find(
        (c) =>
          c.name === p.name &&
          c.version === p.versionInfo &&
          (!purl || c.purl === purl),
      );
    if (!known)
      throw new Error(
        `simulation: no authored component scan for ${p.name}@${p.versionInfo}; no clean result can be inferred`,
      );
    const key = known.purl;
    if (!seen.has(key)) {
      components.push(structuredClone(known));
      seen.add(key);
    }
  }
  return {
    ...getImage("registry.example.test/payments:v1.8.3"),
    ref: document.name ?? "SBOM",
    components,
  };
}
