/** Native client reference. Documentation is independent of implemented behavior. */
import { referencePath } from "./native-reference.js";
import type { ToolResult } from "./text-tools.js";
let pages: Promise<Record<string, string>> | undefined;
export function nativeOcHelpPages(): Promise<Record<string, string>> {
  return (pages ??= import("./oc-help-data.json", {
    with: { type: "json" },
  }).then((module) => module.default));
}

/** Only client help before `--` is handled; container arguments remain untouched. */
export async function ocReference(
  words: string[],
): Promise<ToolResult | undefined> {
  const separator = words.indexOf("--");
  const client = separator < 0 ? words : words.slice(0, separator);
  const helpIndex = client.findIndex(
    (word) => word === "--help" || word === "-h",
  );
  const requested = client[1] === "help";
  if (client[1] === "timemachine") return undefined;
  if (
    words.length !== 1 &&
    helpIndex < 0 &&
    !requested &&
    client[1] !== "options"
  )
    return undefined;
  const reference = await nativeOcHelpPages();
  const key = referencePath(client, reference);
  const streams = (
    await import("./oc-help-streams.json", { with: { type: "json" } })
  ).default as Record<string, { stdout: string; stderr: string }>;
  return {
    ...(streams[key] ?? { stdout: reference[key] }),
    stderrIsHelp: true,
  };
}
