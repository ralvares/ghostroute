import type { Resource } from "./cluster-model.js";
/** Kubernetes label-selector requirements, including absence semantics for != and notin. */
export function labelPredicate(
  selector: string,
): (resource: Resource) => boolean {
  const terms = selector.split(/,(?![^()]*\))/).map((s) => s.trim());
  const requirements = terms.map((term) => {
    let m: RegExpMatchArray | null;
    if ((m = term.match(/^([^\s!=(),]+)\s+(in|notin)\s*\(([^()]*)\)$/))) {
      const [, key, op, values] = m,
        allowed = values.split(",").map((v) => v.trim());
      return (labels: Record<string, string>) =>
        op === "in"
          ? key in labels && allowed.includes(labels[key])
          : !(key in labels) || !allowed.includes(labels[key]);
    }
    if ((m = term.match(/^([^\s!=(),]+)\s*(==|=|!=)\s*([^\s,()]*)$/))) {
      const [, key, op, value] = m;
      return (labels: Record<string, string>) =>
        op === "!="
          ? labels[key] !== value
          : key in labels && labels[key] === value;
    }
    if ((m = term.match(/^(!?)([^\s!=(),]+)$/))) {
      const [, negate, key] = m;
      return (labels: Record<string, string>) =>
        negate ? !(key in labels) : key in labels;
    }
    throw new Error(
      `Error from server (BadRequest): invalid label selector: ${selector}`,
    );
  });
  return (resource) =>
    requirements.every((check) => check(resource.metadata.labels ?? {}));
}
export function fieldPredicate(
  selector: string,
  kind: string,
): (resource: Resource) => boolean {
  const allowed = [
    "metadata.name",
    "metadata.namespace",
    ...(kind === "Pod"
      ? [
          "spec.nodeName",
          "spec.serviceAccountName",
          "status.phase",
          "status.podIP",
        ]
      : []),
  ];
  const requirements = selector.split(",").map((term) => {
    const match = term.match(/^([^!=]+)(==|=|!=)(.*)$/);
    if (!match || !allowed.includes(match[1]))
      throw new Error(
        `Error from server (BadRequest): ${kind} does not support this field selector: ${term}`,
      );
    const [, path, op, expected] = match;
    return (r: Resource) => {
      const actual = path.split(".").reduce<any>((v, k) => v?.[k], r) ?? "";
      return op === "!="
        ? String(actual) !== expected
        : String(actual) === expected;
    };
  });
  return (r) => requirements.every((check) => check(r));
}
