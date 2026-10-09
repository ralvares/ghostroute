import { readVirtualFile } from "../simulation/filesystem.js";
import { encodeSecret } from "../simulation/secrets.js";
import type { ToolResult } from "./text-tools.js";
/** GNU-compatible text forms used by the bastion; never executes on the host. */
export function base64Command(args: string[], stdin?: string): ToolResult {
  let decode = false,
    ignore = false,
    width = 76;
  const files: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (["-d", "--decode"].includes(a)) decode = true;
    else if (["-i", "--ignore-garbage"].includes(a)) ignore = true;
    else if (a === "-w" || a === "--wrap") {
      const n = args[++i];
      if (n === undefined || !/^\d+$/.test(n))
        throw new Error("base64: invalid wrap size");
      width = Number(n);
    } else if (/^(-w\d+|--wrap=\d+)$/.test(a))
      width = Number(a.replace(/^-w|^--wrap=/, ""));
    else if (a === "--help")
      return {
        stdout:
          "base64 [-d|--decode] [-i|--ignore-garbage] [-w COLS|--wrap=COLS] [FILE]\nGNU-compatible UTF-8 text encoding; default wrap 76, -w0 disables wrap.\n",
      };
    else if (a.startsWith("-") && a !== "-")
      throw new Error(`base64: unrecognized option '${a}'`);
    else files.push(a);
  }
  if (files.length > 1) throw new Error(`base64: extra operand '${files[1]}'`);
  const input =
    files.length && files[0] !== "-" ? readVirtualFile(files[0]) : stdin;
  if (input === undefined)
    throw new Error(
      "simulation: base64 requires a file or piped input; interactive stdin is not implemented",
    );
  if (!decode) {
    const encoded = encodeSecret(input);
    if (!encoded) return { stdout: "", exitCode: 0 };
    return {
      stdout: width
        ? encoded
            .match(new RegExp(`.{1,${Math.min(width, 1000000)}}`, "g"))
            ?.join("\n") + "\n" || ""
        : encoded,
      exitCode: 0,
    };
  }
  let cleaned = input.replace(/[\n\r\t ]/g, "");
  if (ignore) cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, "");
  try {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 !== 0)
      throw new Error();
    return {
      stdout: new TextDecoder().decode(
        Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0)),
      ),
      exitCode: 0,
    };
  } catch {
    return {
      stdout: "",
      stderr: "base64: invalid input\n",
      error: true,
      exitCode: 1,
    };
  }
}
