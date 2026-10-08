import { completePath } from "../simulation/filesystem.js";

/** Complete a filename at the cursor without changing earlier arguments or the suffix. */
export function pathCompletions(
  input: string,
  cursor = input.length,
): string[] | null {
  const before = input.slice(0, cursor);
  const match = before.match(/(?:^|\s)(["']?)([^\s"']*)$/);
  if (!match) return null;
  const quote = match[1];
  const fragment = match[2];
  const start = cursor - fragment.length - quote.length;
  const head = input.slice(0, start);
  const command = before.trimStart().split(/\s+/)[0];
  const words = head.trim().split(/\s+/);
  const enabled =
    ["cd", "cat", "ls", "head", "tail"].includes(command) ||
    (command === "oc" && ["-f", "--filename"].includes(words.at(-1) ?? ""));
  if (!enabled || !head.trim()) return null;
  const suffix = input.slice(cursor);
  return completePath(fragment, command === "cd").map((path) => {
    const quoted = quote
      ? quote + path + quote
      : path.replace(/([\s"'\\])/g, "\\$1");
    const ending = path.endsWith("/") || suffix.startsWith(" ") ? "" : " ";
    const remaining =
      quote && suffix.startsWith(quote) ? suffix.slice(1) : suffix;
    return head + quoted + ending + remaining;
  });
}
