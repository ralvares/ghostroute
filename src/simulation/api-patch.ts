/** JSON Merge Patch (RFC 7396): null deletes map fields, arrays replace atomically. */
export function mergePatch(base: unknown, patch: unknown): any {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return structuredClone(patch);
  const output: Record<string, unknown> = base && typeof base === "object" && !Array.isArray(base)
    ? structuredClone(base) as Record<string, unknown> : {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete output[key];
    else Object.defineProperty(output, key, {
      value: mergePatch(Object.hasOwn(output, key) ? output[key] : undefined, value),
      configurable: true, enumerable: true, writable: true,
    });
  }
  return output;
}

function pointer(path: unknown): string[] {
  if (typeof path !== "string" || (path !== "" && !path.startsWith("/")))
    throw new Error("Error from server (BadRequest): invalid JSON patch path");
  if (path === "") return [];
  return path.slice(1).split("/").map((part) => {
    if (/~(?:[^01]|$)/.test(part)) throw new Error("Error from server (BadRequest): invalid JSON pointer escape");
    return part.replace(/~1/g, "/").replace(/~0/g, "~");
  });
}
const invalid = (message: string): never => { throw new Error("Error from server (Invalid): " + message); };
function child(value: any, key: string): any {
  if (!value || typeof value !== "object" || !Object.hasOwn(value, key))
    return invalid("JSON patch path does not exist");
  return value[key];
}
function index(array: unknown[], key: string, add: boolean) {
  if (add && key === "-") return array.length;
  if (!/^(0|[1-9][0-9]*)$/.test(key)) return invalid("invalid JSON patch array index");
  const n = Number(key);
  if (!Number.isSafeInteger(n) || n >= array.length + (add ? 1 : 0))
    return invalid("JSON patch array index out of bounds");
  return n;
}
function equal(left: any, right: any): boolean {
  if (left === right) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object" || Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) => Object.hasOwn(right, key) && equal(left[key], right[key]));
}

/** JSON Patch (RFC 6902), applied to a detached copy; any failed operation aborts the whole patch. */
export function jsonPatch(base: unknown, patch: unknown): any {
  if (!Array.isArray(patch)) throw new Error("Error from server (BadRequest): JSON patch must be an array");
  let result: any = structuredClone(base);
  const read = (parts: string[]) => parts.reduce((value, key) => child(value, key), result);
  const write = (parts: string[], value: unknown, operation: "add" | "replace" | "remove") => {
    if (!parts.length) { result = operation === "remove" ? null : structuredClone(value); return; }
    const key = parts.at(-1)!;
    const parent = read(parts.slice(0, -1));
    if (!parent || typeof parent !== "object") return invalid("JSON patch parent is not an object");
    if (Array.isArray(parent)) {
      const n = index(parent, key, operation === "add");
      if (operation === "add") parent.splice(n, 0, structuredClone(value));
      else if (operation === "remove") parent.splice(n, 1);
      else parent[n] = structuredClone(value);
    } else {
      if (operation !== "add" && !Object.hasOwn(parent, key)) return invalid("JSON patch path does not exist");
      if (operation === "remove") delete parent[key];
      else Object.defineProperty(parent, key, { value: structuredClone(value), writable: true, enumerable: true, configurable: true });
    }
  };
  for (const op of patch) {
    if (!op || typeof op !== "object") return invalid("invalid JSON patch operation");
    const path = pointer(op.path);
    switch (op.op) {
      case "test":
        if (!Object.hasOwn(op, "value") || !equal(read(path), op.value)) return invalid("JSON patch test operation failed");
        break;
      case "add": case "replace":
        if (!Object.hasOwn(op, "value")) return invalid("JSON patch operation requires value");
        write(path, op.value, op.op); break;
      case "remove": write(path, undefined, "remove"); break;
      case "copy": case "move": {
        const from = pointer(op.from);
        if (op.op === "move" && path.length > from.length && from.every((key, i) => path[i] === key))
          return invalid("JSON patch cannot move a value into its own child");
        const value = structuredClone(read(from));
        if (op.op === "move") write(from, undefined, "remove");
        write(path, value, "add"); break;
      }
      default: return invalid("unknown JSON patch operation: " + op.op);
    }
  }
  return result;
}
