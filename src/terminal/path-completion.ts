import { completePath } from "../simulation/filesystem.js";
import { tokenize } from "./lexer.js";

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
  let tokens;
  try {
    tokens = tokenize(head);
  } catch {
    return null;
  }
  let pipe = -1;
  tokens.forEach((token, index) => {
    if (token.kind === "pipe") pipe = index;
  });
  const words = tokens.slice(pipe + 1).map((token) => token.value);
  const command = words[0];
  const enabled =
    [
      "cd",
      "cat",
      "base64",
      "ls",
      "head",
      "tail",
      "less",
      "more",
      "sort",
      "uniq",
      "wc",
    ].includes(command) ||
    (command === "git" && words[1] === "add") ||
    (command === "jq" &&
      words.slice(1).some((word) => !word.startsWith("-"))) ||
    (command === "grep" &&
      words.slice(1).some((word) => !word.startsWith("-"))) ||
    tokens.at(-1)?.kind === "redirect" ||
    (command === "oc" && ["-f", "--filename"].includes(words.at(-1) ?? "")) ||
    (command === "roxctl" && ["--file", "--token-file", "--ca", ...(words.includes("deployment") ? ["-f"] : [])].includes(words.at(-1) ?? ""));
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
