import { typedFieldOrders } from "../simulation/typed-field-orders.js";
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
  function ordered(object: any, path: string): any {
    if ([".metadata.creationTimestamp", ".metadata.deletionTimestamp"].includes(path) && typeof object === "string")
      return object.replace(/\.\d+(?=Z$)/, "");
    if (Array.isArray(object)) return object.map(item=>ordered(item,path));
    if (object && typeof object === "object") {
      const keys=Object.keys(object), fields=order?.[path];
      const sorted=fields ? [...fields.filter(key=>keys.includes(key)),...keys.filter(key=>!fields.includes(key)).sort()] : keys.sort();
      return Object.fromEntries(sorted.map(key=>[key,ordered(object[key],path+"."+key)]));
    }
    return object;
  }
  return JSON.stringify(ordered(value,""),null,4).replace(/[<>&\u2028\u2029]/g,c=>"\\u"+c.charCodeAt(0).toString(16).padStart(4,"0"))+"\n";
}
