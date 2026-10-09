import { S } from "../simulation/state.js";
import {
  HOME,
  workspacePath,
  makeDirectory,
} from "../simulation/filesystem.js";
import { gitObject, gitTree, commitText } from "../release/git-objects.js";
import { repositoryUrl, seedTimestamp } from "../release/source-fixture.js";
import { deliverPush } from "../release/tekton.js";
import type { SourceCommit } from "../release/repository.js";
import type { ToolResult } from "./text-tools.js";
export async function gitCommand(words: string[]): Promise<ToolResult> {
  const repo = S.cluster.sourceRepository,
    cmd = words[1],
    args = words.slice(2);
  const out = (stdout: string): ToolResult => ({
    stdout: stdout ? stdout + "\n" : "",
  });
  if (cmd === "--version") return out("git version 2.50.1");
  if (cmd === "clone") {
    if (args.length < 1 || args.length > 2 || args[0] !== repositoryUrl)
      throw new Error(
        "simulation: only the authored payment-api source repository is available offline",
      );
    if (repo.root)
      throw new Error(
        "simulation: one payment-api checkout is supported; use its existing directory",
      );
    const root = workspacePath(args[1] ?? "payment-api");
    if (!root)
      throw new Error("fatal: destination is outside the virtual workspace");
    if (Object.keys(S.cluster.files).some((k) => k.startsWith(root + "/")))
      throw new Error(
        `fatal: destination path '${args[1]}' already exists and is not an empty directory.`,
      );
    makeDirectory(args[1] ?? "payment-api", true);
    repo.root = root;
    repo.head = repo.remoteHead;
    for (const [name, text] of Object.entries(repo.commits[repo.head].files))
      S.cluster.files[root + "/" + name] = text;
    return {
      stdout: "",
      stderr: `Cloning into '${args[1] ?? "payment-api"}'...\ndone.\n`,
    };
  }
  if (
    !repo.root ||
    !(
      S.cluster.cwd === HOME + "/" + repo.root ||
      S.cluster.cwd.startsWith(HOME + "/" + repo.root + "/")
    )
  )
    throw new Error(
      "fatal: not a git repository (or any of the parent directories): .git",
    );
  const files = Object.fromEntries(
    Object.entries(S.cluster.files)
      .filter(([k]) => k.startsWith(repo.root + "/"))
      .map(([k, v]) => [k.slice(repo.root.length + 1), v]),
  );
  const base = repo.commits[repo.head].files,
    staged = { ...base, ...repo.index };
  const changed = (a: Record<string, string>, b: Record<string, string>) =>
    [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .filter((k) => a[k] !== b[k])
      .sort();
  if (
    cmd === "status" &&
    args.every((a) => ["--short", "-s", "--porcelain"].includes(a))
  ) {
    const names = [
      ...new Set([...changed(base, staged), ...changed(staged, files)]),
    ].sort();
    if (args.length)
      return out(
        names
          .map(
            (k) =>
              `${!(k in base) && !(k in staged) ? "??" : (base[k] !== staged[k] ? (k in base ? "M" : "A") : " ") + (staged[k] !== files[k] ? "M" : " ")} ${k}`,
          )
          .join("\n"),
      );
    return out(
      "On branch main\n" +
        (repo.head === repo.remoteHead
          ? "Your branch is up to date with 'origin/main'.\n"
          : "Your branch is ahead of 'origin/main'.\n  (use \"git push\" to publish your local commits)\n") +
        (names.length
          ? "\n" +
            (changed(base, staged).length
              ? "Changes to be committed:\n" +
                changed(base, staged)
                  .map((k) => "\tmodified:   " + k)
                  .join("\n") +
                "\n"
              : "") +
            (changed(staged, files).length
              ? "\nChanges not staged for commit:\n" +
                changed(staged, files)
                  .map((k) => "\tmodified:   " + k)
                  .join("\n")
              : "")
          : "\nnothing to commit, working tree clean"),
    );
  }
  if (cmd === "add") {
    if (!args.length) throw new Error("Nothing specified, nothing added.");
    for (const arg of args) {
      const path = workspacePath(arg);
      if (!path || !(path === repo.root || path.startsWith(repo.root + "/")))
        throw new Error(`fatal: pathspec '${arg}' did not match any files`);
      const relative =
        path === repo.root ? "" : path.slice(repo.root.length + 1);
      const matches = Object.keys(files).filter(
        (k) => !relative || k === relative || k.startsWith(relative + "/"),
      );
      if (!matches.length)
        throw new Error(`fatal: pathspec '${arg}' did not match any files`);
      for (const k of matches) repo.index[k] = files[k];
    }
    return out("");
  }
  if (cmd === "commit") {
    if (args.length !== 2 || args[0] !== "-m" || !args[1])
      throw new Error("simulation: git commit requires -m MESSAGE");
    const names = changed(base, staged);
    if (!names.length)
      return {
        stdout: "On branch main\nnothing added to commit\n",
        error: true,
        exitCode: 1,
      };
    const tree = await gitTree(staged),
      timestamp = seedTimestamp + 60 * ++repo.sequence,
      text = commitText(tree, repo.head, args[1], timestamp),
      sha = await gitObject("commit", text);
    repo.commits[sha] = {
      sha,
      tree,
      parent: repo.head,
      message: args[1],
      timestamp,
      files: staged,
    };
    repo.head = sha;
    repo.index = {};
    return out(
      `[main ${sha.slice(0, 7)}] ${args[1]}\n ${names.length} file${names.length === 1 ? "" : "s"} changed`,
    );
  }
  if (
    cmd === "push" &&
    (!args.length ||
      (args.length === 2 && args[0] === "origin" && args[1] === "main"))
  ) {
    if (repo.head === repo.remoteHead)
      return { stdout: "", stderr: "Everything up-to-date\n" };
    const previous = repo.remoteHead;
    repo.remoteHead = repo.head;
    deliverPush(repo.head);
    return {
      stdout: "",
      stderr: `To ${repo.url}\n   ${previous.slice(0, 7)}..${repo.head.slice(0, 7)}  main -> main\n`,
    };
  }
  if (
    cmd === "pull" &&
    (!args.length ||
      (args.length === 2 && args[0] === "origin" && args[1] === "main"))
  ) {
    if (repo.head === repo.remoteHead) return out("Already up to date.");
    let sha: string | undefined = repo.head;
    while (sha) {
      if (sha === repo.remoteHead) return out("Already up to date.");
      sha = repo.commits[sha].parent;
    }
    throw new Error(
      "simulation: divergent remote histories are outside this authored repository",
    );
  }
  if (cmd === "remote" && args.length === 1 && args[0] === "-v")
    return out(`origin\t${repo.url} (fetch)\norigin\t${repo.url} (push)`);
  if (
    cmd === "rev-parse" &&
    args.length === 1 &&
    ["HEAD", "origin/main"].includes(args[0])
  )
    return out(args[0] === "HEAD" ? repo.head : repo.remoteHead);
  if (cmd === "log" && args.every((a) => ["--oneline", "-1"].includes(a))) {
    let sha: string | undefined = repo.head;
    const lines: string[] = [];
    while (sha) {
      const c: SourceCommit = repo.commits[sha];
      lines.push(
        args.includes("--oneline")
          ? `${sha.slice(0, 7)} ${c.message}`
          : `commit ${sha}\nAuthor: Kai <kai@training.example.test>\nDate:   ${new Date(c.timestamp * 1000).toUTCString()}\n\n    ${c.message}\n`,
      );
      if (args.includes("-1")) break;
      sha = c.parent;
    }
    return out(lines.join("\n"));
  }
  if (cmd === "show" && args.length === 1 && args[0].includes(":")) {
    const [revision, name] = args[0].split(":");
    const c =
      repo.commits[
        revision === "HEAD"
          ? repo.head
          : revision === "origin/main"
            ? repo.remoteHead
            : revision
      ];
    if (!c || !(name in c.files))
      throw new Error(`fatal: path '${name}' does not exist in '${revision}'`);
    return { stdout: c.files[name] };
  }
  if (
    cmd === "diff" &&
    args.every((a) => ["--cached", "--staged", "--name-only"].includes(a))
  ) {
    const a = args.some((v) => v === "--cached" || v === "--staged")
        ? base
        : staged,
      b = a === base ? staged : files;
    const names = changed(a, b);
    if (args.includes("--name-only")) return out(names.join("\n"));
    return out(
      (
        await Promise.all(
          names.map(
            async (k) =>
              `diff --git a/${k} b/${k}\nindex ${(await gitObject("blob", a[k] ?? "")).slice(0, 7)}..${(await gitObject("blob", b[k] ?? "")).slice(0, 7)} 100644\n--- a/${k}\n+++ b/${k}\n@@ -1${(a[k] ?? "").trimEnd().split("\n").length === 1 ? "" : "," + (a[k] ?? "").trimEnd().split("\n").length} +1${(b[k] ?? "").trimEnd().split("\n").length === 1 ? "" : "," + (b[k] ?? "").trimEnd().split("\n").length} @@\n${(
                a[k] ?? ""
              )
                .trimEnd()
                .split("\n")
                .map((l) => "-" + l)
                .join("\n")}\n${(b[k] ?? "")
                .trimEnd()
                .split("\n")
                .map((l) => "+" + l)
                .join("\n")}`,
          ),
        )
      ).join("\n"),
    );
  }
  throw new Error(
    `simulation: git ${cmd ?? ""} or these options are not implemented`,
  );
}
