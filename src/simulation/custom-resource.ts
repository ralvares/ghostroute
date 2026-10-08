import type { Resource } from "./cluster-model.js";
/** Bounded structural schema admission for user-installed training CRDs. */
export function validateCustomSchema(schema: any) {
  const unsupported = [
    "oneOf",
    "anyOf",
    "allOf",
    "not",
    "x-kubernetes-validations",
    "$ref",
    "dependencies",
    "patternProperties",
  ];
  if (
    !schema ||
    !["object", "array", "string", "integer", "number", "boolean"].includes(
      schema.type,
    )
  )
    throw new Error(
      "simulation: custom CRD schemas require explicit supported structural types",
    );
  for (const keyword of unsupported)
    if (keyword in schema)
      throw new Error(
        `simulation: custom CRD schema keyword ${keyword} is not implemented`,
      );
  for (const child of Object.values(schema.properties ?? {}))
    validateCustomSchema(child);
  if (schema.items) validateCustomSchema(schema.items);
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  )
    validateCustomSchema(schema.additionalProperties);
}
export function validateCustomResource(resource: Resource, schema: any) {
  const invalid = (path: string, message: string): never => {
    throw new Error(
      `Error from server (Invalid): ${resource.kind} "${resource.metadata.name}" is invalid: ${path}: ${message}`,
    );
  };
  function visit(value: any, rule: any, path: string): any {
    if (value === null && rule.nullable) return value;
    const type = Array.isArray(value)
      ? "array"
      : value === null
        ? "null"
        : typeof value;
    if (
      rule.type === "integer"
        ? !Number.isInteger(value)
        : rule.type === "number"
          ? typeof value !== "number"
          : rule.type !== type
    )
      invalid(path, `expected ${rule.type}`);
    if (
      rule.enum &&
      !rule.enum.some(
        (v: unknown) => JSON.stringify(v) === JSON.stringify(value),
      )
    )
      invalid(path, "unsupported value");
    if (typeof value === "number") {
      if (
        rule.minimum !== undefined &&
        (value < rule.minimum ||
          (rule.exclusiveMinimum && value === rule.minimum))
      )
        invalid(path, "below minimum");
      if (
        rule.maximum !== undefined &&
        (value > rule.maximum ||
          (rule.exclusiveMaximum && value === rule.maximum))
      )
        invalid(path, "above maximum");
    }
    if (typeof value === "string") {
      if (rule.pattern && !new RegExp(rule.pattern).test(value))
        invalid(path, "does not match pattern");
      if (rule.minLength !== undefined && [...value].length < rule.minLength)
        invalid(path, "too short");
      if (rule.maxLength !== undefined && [...value].length > rule.maxLength)
        invalid(path, "too long");
    }
    if (Array.isArray(value)) {
      if (rule.minItems !== undefined && value.length < rule.minItems)
        invalid(path, "too few items");
      if (rule.maxItems !== undefined && value.length > rule.maxItems)
        invalid(path, "too many items");
      return value.map((v, i) =>
        rule.items ? visit(v, rule.items, `${path}[${i}]`) : v,
      );
    }
    if (value && typeof value === "object") {
      for (const key of rule.required ?? [])
        if (!(key in value)) invalid(`${path}.${key}`, "Required value");
      const output: Record<string, unknown> = {};
      for (const [key, child] of Object.entries<any>(rule.properties ?? {}))
        if (!(key in value) && child.default !== undefined)
          output[key] = structuredClone(child.default);
      for (const [key, v] of Object.entries(value)) {
        if (!path && ["apiVersion", "kind", "metadata"].includes(key)) {
          output[key] = v;
          continue;
        }
        const child =
          rule.properties?.[key] ??
          (typeof rule.additionalProperties === "object"
            ? rule.additionalProperties
            : undefined);
        if (child) output[key] = visit(v, child, path ? `${path}.${key}` : key);
        else if (
          rule["x-kubernetes-preserve-unknown-fields"] ||
          rule.additionalProperties === true
        )
          output[key] = v;
      }
      return output;
    }
    return value;
  }
  const admitted = visit(resource, schema, "");
  for (const key of Object.keys(resource)) delete resource[key];
  Object.assign(resource, admitted);
}
