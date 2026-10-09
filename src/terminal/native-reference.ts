import type { ToolResult } from "./text-tools.js";
interface Page {
  stdout: string;
  stderr: string;
}
interface Reference {
  pages: Record<string, Page>;
  aliases: Record<string, string>;
}
const references: Partial<Record<"roxctl" | "tkn", Promise<Reference>>> = {};

function load(cli: "roxctl" | "tkn"): Promise<Reference> {
  return (references[cli] ??=
    cli === "roxctl"
      ? import("./roxctl-help-data.json", { with: { type: "json" } }).then(
          (m) => m.default,
        )
      : import("./tkn-help-data.json", { with: { type: "json" } }).then(
          (m) => m.default,
        ));
}

/** Discover native value flags without treating their values as command names. */
export function referenceValueFlags(text: string): Set<string> {
  const values = new Set<string>();
  for (const line of text.split("\n")) {
    const match = line.match(
      /^\s+(?:(-[A-Za-z]),\s+)?(--[a-z][a-z0-9-]*)([^\n]*)/,
    );
    if (!match) continue;
    const value = match[3];
    const takesValue =
      !/^=(?:true|false)(?::|\s|$)/.test(value) &&
      (/^[=:]/.test(value) ||
        /^\s+(?:string(?:Array|Slice)?|int(?:32|64)?|uint(?:32|64)?|float(?:32|64)?|duration)\s/.test(
          value,
        ));
    if (takesValue) {
      values.add(match[2]);
      if (match[1]) values.add(match[1]);
    }
  }
  return values;
}

export function referencePath(
  words: string[],
  pages: Record<string, string>,
  aliases: Record<string, string> = {},
): string {
  const valueFlags = referenceValueFlags(Object.values(pages).join("\n"));
  let key = "";
  for (let i = words[1] === "help" ? 2 : 1; i < words.length; i++) {
    const word = words[i];
    if (word === "--") break;
    if (word.startsWith("-")) {
      if (
        !word.includes("=") &&
        (referenceValueFlags(pages[key] ?? "").has(word) ||
          valueFlags.has(word))
      )
        i++;
      continue;
    }
    const next = key ? `${key} ${word}` : word;
    const canonical = aliases[next] ?? next;
    if (!Object.hasOwn(pages, canonical)) {
      if (!key)
        throw new Error(`error: unknown command "${word}" for "${words[0]}"`);
      break;
    }
    key = canonical;
  }
  return key;
}

export async function nativeReference(
  words: string[],
): Promise<ToolResult | undefined> {
  const cli = words[0] as "roxctl" | "tkn";
  const end = words.indexOf("--");
  const client = end < 0 ? words : words.slice(0, end);
  const explicit =
    client.includes("--help") || client.includes("-h") || client[1] === "help";
  if (!explicit && client.length > 3) return undefined;
  const reference = await load(cli);
  const texts = Object.fromEntries(
    Object.entries(reference.pages).map(([key, page]) => [
      key,
      page.stdout + page.stderr,
    ]),
  );
  const key = referencePath(client, texts, reference.aliases);
  if (
    !explicit &&
    words.length > 1 &&
    !Object.keys(texts).some((path) => path.startsWith(key + " "))
  )
    return undefined;
  return { ...reference.pages[key], exitCode: 0, stderrIsHelp: true };
}
