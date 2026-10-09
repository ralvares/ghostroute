import { strategicSchemas } from "./strategic-schemas.js";
import { mergePatch } from "./api-patch.js";

const fail = (message: string): never => { throw new Error("Error from server (BadRequest): " + message); };

/** Merge using the actual patch strategies/keys extracted from upstream API struct tags. */
export function strategicPatch(kind: string, original: unknown, patch: unknown): any {
  const schema = strategicSchemas[kind];
  if (!schema) throw new Error("Error from server (UnsupportedMediaType): strategic merge patch format is not supported for custom resources");
  function identity(value: any, key?: string): unknown {
    if (!key) return value;
    if (!value || typeof value !== "object" || !Object.hasOwn(value, key)) return fail(`map: ${JSON.stringify(value)} does not contain declared merge key: ${key}`);
    return value[key];
  }
  function ordered(merged: any[], patchOrder: any[], serverOrder: any[], key?: string) {
    const patchIds = patchOrder.map(v => identity(v, key));
    const oldIds = serverOrder.map(v => identity(v, key));
    const updates = merged.filter(v => patchIds.includes(identity(v, key))).sort((a, b) => patchIds.indexOf(identity(a, key)) - patchIds.indexOf(identity(b, key)));
    const others = merged.filter(v => !patchIds.includes(identity(v, key))).sort((a, b) => oldIds.indexOf(identity(a, key)) - oldIds.indexOf(identity(b, key)));
    const result = [];
    while (updates.length && others.length) {
      const oldLeft = oldIds.indexOf(identity(others[0], key));
      const oldRight = oldIds.indexOf(identity(updates[0], key));
      result.push(oldLeft >= 0 && oldRight >= 0 && oldLeft < oldRight ? others.shift() : updates.shift());
    }
    return [...result, ...updates, ...others];
  }
  function visit(base: any, change: any, path: string): any {
    const rule = schema[path];
    if (Array.isArray(change)) {
      if (!rule?.strategies.includes("merge")) return structuredClone(change);
      let current: any[] = Array.isArray(base) ? structuredClone(base) : [];
      const replace = change.some(v => v?.$patch === "replace");
      const entries = change.filter(v => !v?.$patch);
      if (replace) return structuredClone(entries);
      if (!rule.key) {
        for (const value of change) if (!current.includes(value)) current.push(structuredClone(value));
        return ordered(current, change, Array.isArray(base) ? base : []);
      }
      for (const entry of change) {
        const id = identity(entry, rule.key);
        if (entry.$patch === "delete") {
          current = current.filter(v => identity(v, rule.key) !== id); continue;
        }
        if (entry.$patch) return fail("unknown list patch directive: " + entry.$patch);
        const index = current.findIndex(v => identity(v, rule.key) === id);
        if (index < 0) current.push(visit({}, entry, path));
        else current[index] = visit(current[index], entry, path);
      }
      return ordered(current, entries, Array.isArray(base) ? base : [], rule.key);
    }
    if (!change || typeof change !== "object") return structuredClone(change);
    if (change.$patch === "replace") {
      const copy = structuredClone(change); delete copy.$patch; return copy;
    }
    if (change.$patch && change.$patch !== "merge" && change.$patch !== "delete") return fail("unknown map patch directive: " + change.$patch);
    if (change.$patch === "delete") return {};
    const result: Record<string, any> = base && typeof base === "object" && !Array.isArray(base) ? structuredClone(base) : {};
    if (change.$retainKeys) {
      if (!Array.isArray(change.$retainKeys)) return fail("$retainKeys must be an array");
      if (Object.keys(change).some(key => !key.startsWith("$") && !change.$retainKeys.includes(key))) return fail("patch fields must be included in $retainKeys");
      for (const key of Object.keys(result)) if (!change.$retainKeys.includes(key)) delete result[key];
    }
    for (const [key, value] of Object.entries(change)) {
      if (key.startsWith("$")) continue;
      if (value === null) delete result[key];
      else Object.defineProperty(result, key, { value: visit(Object.hasOwn(result, key) ? result[key] : undefined, value, path + "." + key), writable: true, enumerable: true, configurable: true });
    }
    for (const [directive, value] of Object.entries(change)) {
      if (directive.startsWith("$deleteFromPrimitiveList/")) {
        const key = directive.slice("$deleteFromPrimitiveList/".length);
        if (!Array.isArray(value) || !Array.isArray(result[key])) return fail("invalid primitive list deletion");
        result[key] = result[key].filter((v: unknown) => !value.includes(v));
      } else if (directive.startsWith("$setElementOrder/")) {
        const key = directive.slice("$setElementOrder/".length), mergeKey = schema[path + "." + key]?.key;
        if (!Array.isArray(value) || !Array.isArray(result[key])) return fail("invalid element order directive");
        const orderIds = value.map(v => identity(v, mergeKey));
        const entries: any[] = (change[key] ?? []).filter((v: any) => v?.$patch !== "delete");
        let previous = -1;
        for (const entry of entries) {
          const index = orderIds.indexOf(identity(entry, mergeKey));
          if (index <= previous) return fail("the order in patch list does not match $setElementOrder list");
          previous = index;
        }
        result[key] = ordered(result[key], value, base?.[key] ?? [], mergeKey);
      } else if (directive.startsWith("$") && !["$patch", "$retainKeys"].includes(directive)) return fail("unknown strategic patch directive: " + directive);
    }
    return result;
  }
  // The strategic format requires an object rather than a JSON Patch operation array.
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return fail("strategic merge patch must be an object");
  return visit(original, patch, "");
}
