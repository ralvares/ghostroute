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
