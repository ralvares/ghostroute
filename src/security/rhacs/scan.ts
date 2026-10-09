import type { ImageAsset } from "./types.js";
export const cveSeverities = ["LOW", "MODERATE", "IMPORTANT", "CRITICAL"];
export function scanImage(
  asset: ImageAsset,
  severities = cveSeverities,
  includeSnoozed = false,
) {
  const summary: Record<string, number> = {
    CRITICAL: 0,
    IMPORTANT: 0,
    LOW: 0,
    MODERATE: 0,
    "TOTAL-COMPONENTS": 0,
    "TOTAL-VULNERABILITIES": 0,
  };
  const seen = new Set<string>();
  const rows = asset.components.flatMap((c) => {
    const matches = c.vulns.filter(
      (v) => severities.includes(v.severity) && (!v.snoozed || includeSnoozed),
    );
    if (matches.length) summary["TOTAL-COMPONENTS"]++;
    return matches.map((v) => {
      if (!seen.has(v.cve)) {
        seen.add(v.cve);
        summary[v.severity]++;
        summary["TOTAL-VULNERABILITIES"]++;
      }
      return {
        cveId: v.cve,
        cveSeverity: v.severity,
        cveCVSS: v.cvss,
        cveInfo: v.link,
        advisoryId: "",
        advisoryInfo: "",
        componentName: c.name,
        componentVersion: c.version,
        componentFixedVersion: v.fixedBy,
      };
    });
  });
  const rank = (s: string) => cveSeverities.indexOf(s);
  const max = (n: string) =>
    Math.max(
      ...rows
        .filter((r) => r.componentName === n)
        .map((r) => rank(r.cveSeverity)),
    );
  rows.sort(
    (a, b) =>
      max(b.componentName) - max(a.componentName) ||
      a.componentName.localeCompare(b.componentName) ||
      rank(b.cveSeverity) - rank(a.cveSeverity) ||
      b.cveCVSS - a.cveCVSS,
  );
  return {
    result: { summary, ...(rows.length ? { vulnerabilities: rows } : {}) },
  };
}
export function rawScan(asset: ImageAsset, includeSnoozed = false) {
  const components = asset.components.map((c) => {
    const vulns = c.vulns
      .filter((v) => includeSnoozed || !v.snoozed)
      .map((v) => ({
        cve: v.cve,
        cvss: v.cvss,
        link: v.link,
        fixedBy: v.fixedBy,
        severity: v.severity + "_VULNERABILITY_SEVERITY",
      }));
    return {
      name: c.name,
      version: c.version,
      ...(vulns.length ? { vulns } : {}),
    };
  });
  return {
    id: asset.digest,
    name: {
      registry: asset.ref.split("/")[0],
      remote: asset.ref.split("/").slice(1).join("/").split(":")[0],
      tag: asset.ref.split(":").at(-1),
      fullName: asset.ref,
    },
    scan: { ...(components.length ? { components } : {}) },
  };
}
