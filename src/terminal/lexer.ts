export type ShellToken = { kind: "word" | "pipe" | "redirect"; value: string };
/** Quotes and escapes are parsed, never evaluated as host-shell code. */
export function tokenize(input: string): ShellToken[] {
  const result: ShellToken[] = [];
  let buffer = "",
    quote = "",
    started = false;
  const flush = () => {
    if (started) result.push({ kind: "word", value: buffer });
    buffer = "";
    started = false;
  };
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quote) {
      if (char === quote) quote = "";
      else if (
        char === "\\" &&
        quote === '"' &&
        ['"', "\\"].includes(input[i + 1])
      )
        buffer += input[++i];
      else buffer += char;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      started = true;
    } else if (char === "\\") {
      if (++i >= input.length) throw new Error("shell: trailing escape");
      buffer += input[i];
      started = true;
    } else if (/\s/.test(char)) flush();
    else if (char === "|" || char === ">") {
      flush();
      const value = char === ">" && input[i + 1] === ">" ? (i++, ">>") : char;
      result.push({ kind: char === "|" ? "pipe" : "redirect", value });
    } else if (char === ";" || char === "&" || char === "`")
      throw new Error(
        "shell: control operators and command substitution are not implemented",
      );
    else {
      buffer += char;
      started = true;
    }
  }
  if (quote) throw new Error("shell: unmatched quote");
  flush();
  return result;
}
