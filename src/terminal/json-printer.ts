import { typedFieldOrders } from "../simulation/typed-field-orders.js";
import { typedJsonRules } from "../simulation/typed-json-rules.js";
/** JSONPrinter formatting for unstructured objects: sorted keys, four spaces and Go escaping. */
export function printResourceJson(value: unknown): string {
  function sorted(object: any): any {
    if (Array.isArray(object)) return object.map(sorted);
    if (object && typeof object === "object")
      return Object.fromEntries(
        Object.keys(object)
          .sort()
          .map((key) => [key, sorted(object[key])]),
      );
    return object;
  }
  return (
    JSON.stringify(sorted(value), null, 4).replace(
      /[<>&\u2028\u2029]/g,
      (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"),
    ) + "\n"
  );
}

/** Native imperative commands return typed API objects; Go encodes struct fields in declaration order. */
export function printTypedResourceJson(value: any): string {
  const order = typedFieldOrders[value.kind];
  const rules = typedJsonRules[value.kind];
  function ordered(object: any, path: string): any {
    if (rules?.[path]?.time && typeof object === "string")
      return object.replace(/\.\d+(?=Z$)/, "");
    if (Array.isArray(object)) return object.map(item=>ordered(item,path));
    if (object && typeof object === "object") {
      const fields=order?.[path];
      if (!fields) return Object.fromEntries(Object.keys(object).sort().map(key=>[key,ordered(object[key],path+"."+key)]));
      const entries: [string,any][] = [];
      for (const key of fields) {
        const rule=rules?.[path+"."+key];
        let entry=object[key];
        if (entry === undefined && rule?.fill) entry=structuredClone(rule.default ?? null);
        if (entry === undefined) continue;
        const empty=entry === null || (!rule?.pointer && (entry === "" || entry === false || entry === 0 || (rule?.collection && typeof entry === "object" && Object.keys(entry).length === 0)));
        if ((rule?.omitEmpty || rule?.omitZero) && empty) continue;
        entries.push([key,ordered(entry,path+"."+key)]);
      }
      return Object.fromEntries(entries);
    }
    return object;
  }
  return JSON.stringify(ordered(value,""),null,4).replace(/[<>&\u2028\u2029]/g,c=>"\\u"+c.charCodeAt(0).toString(16).padStart(4,"0"))+"\n";
}
