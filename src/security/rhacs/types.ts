import {createRuntime} from "./runtime-state.js";
import type {ProcessBaseline,ProcessIndicator,RuntimeAlert} from "./runtime.js";
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
  runtime: {sequence:number;baselines:ProcessBaseline[];processes:ProcessIndicator[];alerts:RuntimeAlert[]};
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
  runtime: createRuntime(),
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
    Number.isInteger(value.runtime.sequence)&&value.runtime.sequence>=0&&value.runtime.alerts.length<=100&&value.runtime.processes.length<=500&&
    value.runtime.baselines.every(b=>b&&typeof b.id==="string"&&b.key&&typeof b.key.deploymentId==="string"&&Array.isArray(b.elements)&&b.elements.every(e=>e&&typeof e.element?.processName==="string"))&&
    value.runtime.alerts.every(a=>a&&typeof a.id==="string"&&policy(a.policy)&&["ACTIVE","RESOLVED"].includes(a.state)&&Array.isArray(a.violations)&&a.violations.length<=40)&&
    value.runtime.processes.every(p=>p&&typeof p.id==="string"&&typeof p.podUid==="string"&&p.signal&&typeof p.signal.name==="string"&&Array.isArray(p.signal.lineageInfo))&&
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
