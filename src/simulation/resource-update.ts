import {primaryLabel} from "../network/user-defined.js";
import type { Resource } from "./cluster-model.js";

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>;
  return Object.keys(left).length === Object.keys(right).length && Object.keys(left).every(key => Object.hasOwn(right, key) && same(left[key], right[key]));
}
/** Evaluate immutable fields before admission/storage; errors leave the existing object intact. */
export function validateResourceUpdate(old: Resource, next: Resource) {
  const invalid = (field: string, message = "field is immutable"): never => {
    throw new Error(`Error from server (Invalid): ${next.kind} "${next.metadata.name}" is invalid: ${field}: ${message}`);
  };
  if(old.kind === "Namespace" && (Object.hasOwn(old.metadata.labels??{},primaryLabel)!==Object.hasOwn(next.metadata.labels??{},primaryLabel)||old.metadata.labels?.[primaryLabel]!==next.metadata.labels?.[primaryLabel])) invalid("metadata.labels["+primaryLabel+"]");
  if(["UserDefinedNetwork","ClusterUserDefinedNetwork"].includes(old.kind) && !same(old.kind==="ClusterUserDefinedNetwork"?old.spec?.network:old.spec,old.kind==="ClusterUserDefinedNetwork"?next.spec?.network:next.spec)) invalid("spec","network spec is immutable");
  if (["PipelineRun", "TaskRun"].includes(old.kind) && !same(old.spec,next.spec)) invalid("spec", "run spec is immutable; create a new run");
  if (["RoleBinding","ClusterRoleBinding"].includes(old.kind) && !same(old.roleRef, next.roleRef)) invalid("roleRef", "cannot change roleRef");
  if (old.kind === "Deployment" && !same(old.spec?.selector, next.spec?.selector)) invalid("spec.selector");
  if (old.kind === "Service" && next.spec?.clusterIP !== undefined && !same(old.spec?.clusterIP, next.spec.clusterIP)) invalid("spec.clusterIP");
  if (["ConfigMap", "Secret"].includes(old.kind) && old.immutable === true) {
    if (next.immutable !== true) invalid("immutable");
    if (!same(old.data ?? {}, next.data ?? {})) invalid("data", "Forbidden: field is immutable when immutable is set");
    if (!same(old.binaryData ?? {}, next.binaryData ?? {})) invalid("binaryData", "Forbidden: field is immutable when immutable is set");
  }
  if (old.kind === "Pod") {
    const previous = structuredClone(old.spec ?? {}), current = structuredClone(next.spec ?? {});
    for (const spec of [previous, current]) {
      for (const container of spec.containers ?? []) delete (container as { image?: string }).image;
      for (const container of spec.initContainers ?? []) delete (container as {image?:string}).image;
      delete spec.activeDeadlineSeconds;
      delete spec.tolerations;
      delete spec.schedulingGates;
    }
    if (!same(previous, current)) invalid("spec", "Forbidden: pod updates may not change fields other than spec.containers[*].image, spec.initContainers[*].image, spec.activeDeadlineSeconds, spec.tolerations (only additions to existing tolerations), spec.terminationGracePeriodSeconds (allow it to be set to 1 if it was previously negative)");
    const oldTolerations: unknown[] = old.spec?.tolerations ?? [];
    const newTolerations: unknown[] = next.spec?.tolerations ?? [];
    if (oldTolerations.some(t => !newTolerations.some(n => same(t, n)))) invalid("spec.tolerations", "existing tolerations can not be modified except its tolerationSeconds");
  }
}
