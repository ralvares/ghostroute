export interface Vulnerability {
  cve: string;
  severity: string;
  cvss: number;
  link: string;
  fixedBy: string;
  snoozed?: boolean;
}
export interface Component {
  name: string;
  version: string;
  purl: string;
  vulns: Vulnerability[];
}
export interface ImageAsset {
  ref: string;
  digest: string;
  user: string;
  created: string;
  scanned: string;
  labels: Record<string, string>;
  dockerfile: { instruction: string; value: string }[];
  components: Component[];
}
export interface Policy {
  id: string;
  name: string;
  description?: string;
  remediation?: string;
  severity: string;
  disabled?: boolean;
  lifecycleStages: string[];
  categories?: string[];
  enforcementActions?: string[];
  policySections?: {
    sectionName?: string;
    policyGroups: {
      fieldName: string;
      booleanOperator?: string;
      negate?: boolean;
      values: { value: string }[];
    }[];
  }[];
  scope?: {
    namespace?: string;
    cluster?: string;
    label?: { key: string; value: string };
  }[];
  exclusions?: any[];
  [key: string]: unknown;
}
export interface CentralState {
  policyOverrides: Record<string, Partial<Policy>>;
  customPolicies: Policy[];
  receipts: {
    operation: string;
    subject: string;
    digest?: string;
    exitCode: number;
    summary: Record<string, number>;
  }[];
}
export const createCentral = (): CentralState => ({
  policyOverrides: {},
  customPolicies: [],
  receipts: [],
});
export interface PolicyViolation {
  name: string;
  severity: string;
  description: string;
  violation: string[];
  remediation: string;
  failingCheck: boolean;
}
export interface PolicyResult {
  results?: {
    metadata: { id: string; additionalInfo: Record<string, string> | null };
    summary: Record<string, number>;
    violatedPolicies: PolicyViolation[];
  }[];
  summary: Record<string, number>;
}

export function validCentral(value: CentralState): boolean {
  const policy = (p: Policy) =>
    !!p &&
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    Array.isArray(p.lifecycleStages) &&
    p.lifecycleStages.every((s) =>
      ["BUILD", "DEPLOY", "RUNTIME"].includes(s),
    ) &&
    typeof p.severity === "string" &&
    (!p.policySections ||
      (Array.isArray(p.policySections) &&
        p.policySections.every(
          (s) =>
            s &&
            Array.isArray(s.policyGroups) &&
            s.policyGroups.every(
              (g) =>
                g &&
                typeof g.fieldName === "string" &&
                Array.isArray(g.values) &&
                g.values.every((v) => v && typeof v.value === "string"),
            ),
        )));
  return (
    Object.values(value.policyOverrides).every(
      (p) =>
        p &&
        typeof p === "object" &&
        !Array.isArray(p) &&
        (p.disabled === undefined || typeof p.disabled === "boolean"),
    ) &&
    value.customPolicies.every(policy) &&
    value.receipts.every(
      (r) =>
        r &&
        typeof r.operation === "string" &&
        typeof r.subject === "string" &&
        Number.isInteger(r.exitCode) &&
        r.summary &&
        typeof r.summary === "object" &&
        Object.values(r.summary).every((n) => Number.isInteger(n) && n >= 0),
    )
  );
}
