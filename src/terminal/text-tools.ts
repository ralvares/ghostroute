import { readVirtualFile } from "../simulation/filesystem.js";
import { runQuery } from "./query-tools.js";

export interface ToolResult {
  stdout: string;
  error?: boolean;
  stderr?: string;
  exitCode?: number;
  pager?: "more" | "less";
}
export const textTools = [
  "cat",
  "jq",
  "grep",
  "head",
  "tail",
  "sort",
  "uniq",
  "wc",
  "cut",
  "more",
  "less",
  "echo",
  "printf",
];
const lines = (input: string) =>
  input ? input.replace(/\n$/, "").split("\n") : [];
const output = (rows: string[]) => (rows.length ? rows.join("\n") + "\n" : "");

export const toolHelp: Record<string, string> = {
  jq: "jq [OPTIONS] 'FILTER' [FILE ...]\nReal jq 1.8.2 in WebAssembly. Reads JSON/JSONL files or piped input.\n-r raw strings; -c compact; -s slurp; -e status; -n null input; -R raw input; --arg NAME VALUE; --argjson NAME JSON.\nExample: jq 'select(.verb == \"patch\") | {user: .user.username, request: .requestObject}' audit/kube-apiserver.log",
  grep: "grep [-iInvFcE] [-e PATTERN] PATTERN [FILE ...]\nFilter lines; -i ignore case, -n line numbers, -v invert, -F literal, -c count.\nBasic/extended regular expressions supported. Shell recursion and Perl expressions are not implemented.",
  head: "head [-n COUNT] [FILE ...] · first 10 lines by default",
  tail: "tail [-n COUNT] [FILE ...] · last 10 lines by default; live -f is not implemented",
  sort: "sort [-nru] [FILE ...] · numeric, reverse and unique lines",
  uniq: "uniq [-c] [FILE] · collapse adjacent duplicate lines; -c counts them",
  wc: "wc [-lwc] [FILE ...] · newline, word and UTF-8 byte counts",
  cut: "cut -d DELIMITER -f FIELDS [FILE ...] · fields such as 1,3-5; tab delimiter by default",
  cat: "cat [-n] [FILE ...] · concatenate files or piped input",
  more: "more [FILE ...] or COMMAND | more\nSpace/PageDown: next page; b/PageUp: previous; arrows: lines; /: search; n: next match; q: prompt",
  less: "less [-N] [FILE ...] or COMMAND | less\nSpace/PageDown: next page; b/PageUp: previous; arrows: lines; /: search; n: next match; q: prompt",
  echo: "echo [-n] [TEXT ...] · print text; > FILE replaces and >> FILE appends",
  printf:
    "printf '%s' TEXT or printf '%s\\n' TEXT ... · print text with explicit newline handling",
};

function read(path: string) {
  try {
    return readVirtualFile(path);
  } catch (error) {
    throw new Error((error as Error).message.replace(/^cat:/, "shell:"));
  }
}
/** Parse options once for both file reads and pipelines; never evaluate host commands. */
export function jqArguments(args: string[]) {
  const flags: string[] = [],
    positional: string[] = [];
  let end = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!end && arg === "--") {
      end = true;
      continue;
    }
    if (!end && ["--arg", "--argjson"].includes(arg)) {
      if (i + 2 >= args.length)
        throw new Error(`jq: ${arg} requires a name and value`);
      flags.push(arg, args[++i], args[++i]);
    } else if (!end && arg.startsWith("-")) {
      if (
        !/^-[rcseMnRj]+$/.test(arg) &&
        ![
          "--raw-output",
          "--compact-output",
          "--slurp",
          "--exit-status",
          "--monochrome-output",
          "--null-input",
          "--raw-input",
          "--join-output",
          "--tab",
        ].includes(arg)
      )
        throw new Error(
          `simulation: jq option ${arg} is not implemented; type man jq`,
        );
      flags.push(arg);
    } else positional.push(arg);
  }
  return { flags, query: positional[0] ?? ".", files: positional.slice(1) };
}

function argumentsFor(args: string[], valueFlags: string[] = []) {
  const flags = new Set<string>(),
    values: Record<string, string> = {},
    files: string[] = [];
  let end = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!end && arg === "--") {
      end = true;
      continue;
    }
    if (!end && arg.startsWith("-") && arg !== "-") {
      const name = arg.slice(0, 2);
      if (valueFlags.includes(name)) {
        const value = arg.length > 2 ? arg.slice(2) : args[++i];
        if (value === undefined)
          throw new Error(`shell: ${name} requires an argument`);
        values[name] = value;
      } else {
        if (arg.startsWith("--"))
          throw new Error(`simulation: option ${arg} is not implemented`);
        for (const flag of arg.slice(1)) flags.add(flag);
      }
    } else files.push(arg);
  }
  return { flags, values, files };
}
function validate(flags: Set<string>, allowed: string, tool: string) {
  for (const flag of flags)
    if (!allowed.includes(flag))
      throw new Error(
        `simulation: ${tool} option -${flag} is not implemented; type man ${tool}`,
      );
}
function inputFor(files: string[], stdin: string | undefined, tool: string) {
  if (!files.length && stdin === undefined)
    throw new Error(`${tool}: supply a file or pipe input; type man ${tool}`);
  return files.length
    ? files.map((file) => (file === "-" ? (stdin ?? "") : read(file))).join("")
    : stdin!;
}

export async function textCommand(
  words: string[],
  stdin?: string,
): Promise<ToolResult | null> {
  const [tool, ...args] = words;
  if (!textTools.includes(tool)) return null;
  if (args.length === 1 && ["--help", "-h"].includes(args[0]))
    return { stdout: toolHelp[tool] + "\n" };
  if (tool === "jq") {
    if (args.length === 1 && args[0] === "--version") {
      const version = await runQuery("jq", "", ".", ["--version"]);
      return { ...version, error: version.exitCode !== 0 };
    }
    if (!args.length && stdin === undefined)
      return { stdout: toolHelp.jq + "\n" };
    const { flags, query, files } = jqArguments(args);
    const nullInput = flags.some(
      (flag) => flag === "--null-input" || /^-[rcseMnRj]*n/.test(flag),
    );
    const input =
      files.length || stdin !== undefined
        ? inputFor(files, stdin, tool)
        : nullInput
          ? ""
          : undefined;
    if (input === undefined)
      throw new Error(
        "jq: supply a JSON file or pipe input (or use -n); type man jq",
      );
    const result = await runQuery("jq", input, query, flags);
    return { ...result, error: result.exitCode !== 0 };
  }
  if (tool === "echo") {
    const noNewline = args[0] === "-n";
    if (args[0]?.startsWith("-") && !noNewline)
      throw new Error(
        "simulation: echo supports -n; use printf for explicit formatting",
      );
    return {
      stdout:
        (noNewline ? args.slice(1) : args).join(" ") + (noNewline ? "" : "\n"),
    };
  }
  if (tool === "printf") {
    if (!["%s", "%s\\n"].includes(args[0]))
      throw new Error("simulation: printf supports '%s' and '%s\\n' formats");
    return {
      stdout: (args.slice(1).length ? args.slice(1) : [""])
        .map((arg) => arg + (args[0] === "%s\\n" ? "\n" : ""))
        .join(""),
    };
  }
  const { flags, values, files } = argumentsFor(
    args,
    tool === "grep"
      ? ["-e"]
      : ["head", "tail"].includes(tool)
        ? ["-n"]
        : tool === "cut"
          ? ["-d", "-f"]
          : [],
  );
  if (tool === "grep") {
    validate(flags, "InvFicE", tool);
    const pattern = values["-e"] ?? files.shift();
    if (pattern === undefined)
      throw new Error("grep: missing pattern; type man grep");
    // POSIX basic expressions use escaped +, ?, |, (, ); default grep treats their unescaped forms literally.
    let source = pattern;
    if (!flags.has("E") && !flags.has("F"))
      source = pattern.replace(
        /\\([+?|(){}])|([+?|(){}])/g,
        (_, escaped, literal) => escaped ?? "\\" + literal,
      );
    let regex: RegExp;
    try {
      regex = new RegExp(
        flags.has("F")
          ? pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          : source,
        flags.has("i") ? "i" : "",
      );
    } catch {
      throw new Error("grep: invalid regular expression");
    }
    const input = inputFor(files, stdin, tool);
    const sources = files.length
      ? files.map((file) => ({
          name: file,
          text: file === "-" ? (stdin ?? "") : read(file),
        }))
      : [{ name: "", text: input }];
    let count = 0;
    const results = sources.flatMap((source) => {
      const matches = lines(source.text)
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => regex.test(line) !== flags.has("v"));
      count += matches.length;
      const prefix = sources.length > 1 ? source.name + ":" : "";
      return flags.has("c")
        ? [prefix + matches.length]
        : matches.map(
            ({ line, index }) =>
              prefix + (flags.has("n") ? `${index + 1}:` : "") + line,
          );
    });
    return { stdout: output(results), exitCode: count ? 0 : 1, error: !count };
  }
  const allowed: Record<string, string> = {
    cat: "n",
    more: "",
    less: "N",
    head: "",
    tail: "",
    sort: "nru",
    uniq: "c",
    wc: "lwc",
    cut: "s",
  };
  validate(flags, allowed[tool] ?? "", tool);
  if (tool === "uniq" && files.length > 1)
    throw new Error("uniq: accepts one file or piped input");
  const input = inputFor(files, stdin, tool),
    rows = lines(input);
  if (["more", "less"].includes(tool))
    return {
      stdout: flags.has("N")
        ? output(
            rows.map(
              (line, index) => `${String(index + 1).padStart(5)} ${line}`,
            ),
          )
        : input,
      pager: tool as "more" | "less",
    };
  if (tool === "cat")
    return {
      stdout: flags.has("n")
        ? output(
            rows.map(
              (line, index) => `${String(index + 1).padStart(6)}\t${line}`,
            ),
          )
        : input,
    };
  if (["head", "tail"].includes(tool)) {
    const count = Number(values["-n"] ?? 10);
    if (!Number.isInteger(count) || count < 0 || count > 100000)
      throw new Error(`${tool}: invalid line count`);
    const select = (content: string) => {
      const source = lines(content),
        selected =
          tool === "head"
            ? source.slice(0, count)
            : count
              ? source.slice(-count)
              : [];
      let text = output(selected);
      if (
        !content.endsWith("\n") &&
        selected.length &&
        (tool === "tail" || count >= source.length)
      )
        text = text.slice(0, -1);
      return text;
    };
    return {
      stdout:
        files.length > 1
          ? files
              .map(
                (file) =>
                  `==> ${file} <==\n` +
                  select(file === "-" ? (stdin ?? "") : read(file)),
              )
              .join("\n")
          : select(input),
    };
  }
  if (tool === "sort") {
    rows.sort(
      flags.has("n")
        ? (a, b) =>
            (parseFloat(a) || 0) - (parseFloat(b) || 0) ||
            (a < b ? -1 : a > b ? 1 : 0)
        : (a, b) => (a < b ? -1 : a > b ? 1 : 0),
    );
    if (flags.has("r")) rows.reverse();
    return { stdout: output(flags.has("u") ? [...new Set(rows)] : rows) };
  }
  if (tool === "uniq") {
    const groups: { line: string; count: number }[] = [];
    for (const line of rows) {
      const last = groups.at(-1);
      if (last?.line === line) last.count++;
      else groups.push({ line, count: 1 });
    }
    return {
      stdout: output(
        groups.map(({ line, count }) =>
          flags.has("c") ? `${String(count).padStart(7)} ${line}` : line,
        ),
      ),
    };
  }
  if (tool === "wc") {
    const counts = (text: string) => [
      text.match(/\n/g)?.length ?? 0,
      text.match(/\S+/g)?.length ?? 0,
      new TextEncoder().encode(text).length,
    ];
    const row = (text: string, name = "") =>
      counts(text)
        .filter((_, index) => !flags.size || flags.has("lwc"[index]))
        .join(" ") + (name ? " " + name : "");
    return {
      stdout: files.length
        ? output([
            ...files.map((file) =>
              row(file === "-" ? (stdin ?? "") : read(file), file),
            ),
            ...(files.length > 1 ? [row(input, "total")] : []),
          ])
        : row(input) + "\n",
    };
  }
  if (tool === "cut") {
    const delimiter = values["-d"] ?? "\t",
      fields = values["-f"];
    if (
      delimiter.length !== 1 ||
      !fields ||
      !/^\d+(?:-\d*)?(?:,\d+(?:-\d*)?)*$/.test(fields)
    )
      throw new Error("cut: use -d DELIMITER -f FIELDS (for example 1,3-5)");
    const ranges = fields.split(",").map((field) => {
      const [start, end] = field.split("-");
      return [
        Number(start),
        field.includes("-") ? (end ? Number(end) : Infinity) : Number(start),
      ];
    });
    if (ranges.some(([a, b]) => a < 1 || b < a))
      throw new Error("cut: invalid field range");
    return {
      stdout: output(
        rows
          .filter((line) => !flags.has("s") || line.includes(delimiter))
          .map((line) =>
            line.includes(delimiter)
              ? line
                  .split(delimiter)
                  .filter((_, index) =>
                    ranges.some(([a, b]) => index + 1 >= a && index + 1 <= b),
                  )
                  .join(delimiter)
              : line,
          ),
      ),
    };
  }
  return null;
}
