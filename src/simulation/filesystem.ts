import { demoAudit } from "../forensics/demo-audit.js";
import { repairedDeployment } from "../gitops/manifests-source.js";
import { sourceFiles, repairedPom } from "../release/source-fixture.js";
import { encodeSecret } from "./secrets.js";
import { rhacsFiles } from "../security/rhacs/files.js";
import { S } from "./state.js";
import { labFiles } from "./lab-files.js";
import { policyFiles } from "./resources.js";
import { incidentRecordFiles } from "../missions/incident-records.js";

export const HOME = "/home/operator";
const documents: Record<string, string> = {
  "forensics/reference-audit.log": demoAudit,
  "forensics/README.md":
    "Historical reference archive from ralvares/security-demos use_cases/auditing, commit 6954a942a4d1a19b172f510e10e5838fa7ede6ad. These selected unmodified 2025 demo events are separate from prod-east. Use jq to correlate caller, sourceIPs and request bodies. oc timemachine is a port of the custom plugin, not a native oc subcommand. Examples: oc timemachine --auditlog-file ~/forensics/reference-audit.log get deployments -n frontend --time 2025-12-10T06:31:00Z -o json. Only retained successful writes with object bodies can reconstruct state; absence is not proof of nonexistence. History mode currently lists direct object events; recursive ownership lineage and noisy-user filtering are not implemented.\n",
  "notes.txt":
    "Incident response tip: compare observed network paths with deployment configuration. RHACS anomalies are not convictions.\n",
  "workloads/Dockerfile.secure":
    '# Illustrative owned-app rebuild, not executed by this simulator.\nFROM registry.access.redhat.com/ubi9/ubi-minimal\nWORKDIR /opt/app\nCOPY app /opt/app/app\nRUN mkdir -p /var/lib/app/data && chgrp -R 0 /var/lib/app/data && chmod -R g=u /var/lib/app/data\nUSER 1001\nEXPOSE 8080\nCMD ["/opt/app/app"]\n',
  "workloads/vendor-README.md":
    "Vendor application: fixed UID 100, listening on port 8080.\nIts source/image cannot be rebuilt in this exercise.\nUse the dedicated vendor ServiceAccount and compare anyuid with vendor-fixed-uid.\nSCC exceptions should have an owner, justification and expiry.\n",
};

export function registerDocuments(files: Record<string, string>) {
  Object.assign(documents, files);
}
export function resolvePath(path: string, cwd = S.cluster.cwd) {
  if (path === "~" || path === "$HOME") path = HOME;
  if (path.startsWith("~/")) path = HOME + path.slice(1);
  if (path.startsWith("$HOME/")) path = HOME + path.slice(5);
  const parts: string[] = [];
  for (const part of (path.startsWith("/") ? path : cwd + "/" + path).split(
    "/",
  )) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else {
      if (part.includes("\0")) throw new Error("shell: invalid path");
      parts.push(part);
    }
  }
  return "/" + parts.join("/");
}
export function workspacePath(path: string) {
  const absolute = resolvePath(path);
  return absolute.startsWith(HOME + "/")
    ? absolute.slice(HOME.length + 1)
    : undefined;
}
function allFiles(): Record<string, string> {
  return {
    ...documents,
    ...Object.fromEntries(
      Object.entries(sourceFiles).map(([k, v]) => [
        "source/payment-api/" + k,
        v,
      ]),
    ),
    "source/fixes/pom.xml": repairedPom,
    "source/fixes/payment-api.yaml": repairedDeployment,
    ...rhacsFiles(),
    ...labFiles,
    ...policyFiles,
    ...S.cluster.files,
    ...incidentRecordFiles,
    ".config/containers/auth.json":
      JSON.stringify(
        {
          auths: Object.fromEntries(
            Object.entries(S.cluster.registry.sessions).map(([host, s]) => [
              host,
              { auth: encodeSecret(s.username + ":" + s.token) },
            ]),
          ),
        },
        null,
        2,
      ) + "\n",
    "rhacs/alerts.json":
      JSON.stringify({ alerts: S.cluster.rhacs.runtime.alerts }, null, 2) +
      "\n",
    "rhacs/processes.json":
      JSON.stringify(
        { processes: S.cluster.rhacs.runtime.processes },
        null,
        2,
      ) + "\n",
    "rhacs/baselines.json":
      JSON.stringify(
        { baselines: S.cluster.rhacs.runtime.baselines },
        null,
        2,
      ) + "\n",
    "gitops/controller.log": S.cluster.gitops.logs.join("\n") + "\n",
    "audit/kube-apiserver.log":
      S.cluster.audit.map((event) => JSON.stringify(event)).join("\n") + "\n",
  };
}
export function directories() {
  const paths = new Set(["/", "/home", HOME, ...S.cluster.directories]);
  for (const file of Object.keys(allFiles())) {
    const parts = (HOME + "/" + file).split("/");
    parts.pop();
    while (parts.length > 1) {
      paths.add(parts.join("/"));
      parts.pop();
    }
  }
  return paths;
}

/** Shell completion reads the same live filesystem as ls/cat, including user files. */
export function completePath(prefix: string, directoriesOnly = false) {
  const slash = prefix.lastIndexOf("/");
  const parent = slash >= 0 ? prefix.slice(0, slash + 1) : "";
  const fragment = prefix.slice(slash + 1);
  const absolute = resolvePath(parent || ".");
  const base = absolute === "/" ? "/" : absolute + "/";
  const dirs = directories();
  const entries = [
    ...dirs,
    ...Object.keys(allFiles()).map((key) => HOME + "/" + key),
  ];
  return [...new Set(entries)]
    .filter((path) => {
      const tail = path.slice(base.length);
      return (
        path.startsWith(base) &&
        tail &&
        !tail.includes("/") &&
        tail.startsWith(fragment) &&
        (!directoriesOnly || dirs.has(path))
      );
    })
    .map(
      (path) => parent + path.slice(base.length) + (dirs.has(path) ? "/" : ""),
    )
    .sort((a, b) => a.localeCompare(b));
}
export function readVirtualFile(path: string) {
  const absolute = resolvePath(path);
  if (directories().has(absolute))
    throw new Error(`cat: ${path}: Is a directory`);
  const key = workspacePath(path);
  const files = allFiles();
  if (!key || !Object.hasOwn(files, key))
    throw new Error(`cat: ${path}: No such file or directory`);
  return files[key];
}
export function changeDirectory(path = "~") {
  const next = path === "-" ? S.cluster.previousCwd : resolvePath(path);
  if (!directories().has(next))
    throw new Error(`cd: ${path}: No such directory`);
  S.cluster.previousCwd = S.cluster.cwd;
  S.cluster.cwd = next;
  return path === "-" ? next : "";
}
export function listDirectory(path = ".", detailed = false, hidden = false) {
  const absolute = resolvePath(path);
  const dirs = directories();
  const files = allFiles();
  const fileKey = workspacePath(path);
  if (!dirs.has(absolute)) {
    if (fileKey && Object.hasOwn(files, fileKey))
      return absolute.split("/").at(-1)!;
    throw new Error(`ls: cannot access '${path}': No such file or directory`);
  }
  const prefix = absolute === "/" ? "/" : absolute + "/";
  const entries = new Map<string, boolean>();
  if (hidden) {
    entries.set(".", true);
    entries.set("..", true);
  }
  for (const entry of [
    ...dirs,
    ...Object.keys(files).map((key) => HOME + "/" + key),
  ]) {
    if (!entry.startsWith(prefix)) continue;
    const name = entry.slice(prefix.length);
    if (!name || name.includes("/") || (!hidden && name.startsWith(".")))
      continue;
    entries.set(name, dirs.has(entry));
  }
  return [...entries]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, dir]) => {
      if (!detailed) return name + (dir ? "/" : "");
      const key = workspacePath(resolvePath(name, absolute));
      const size = dir
        ? 0
        : new TextEncoder().encode(files[key ?? ""] ?? "").length;
      return `${dir ? "drwxr-xr-x" : "-rw-r--r--"} operator operator ${String(size).padStart(7)} ${name}${dir ? "/" : ""}`;
    })
    .join(detailed ? "\n" : "  ");
}
export function makeDirectory(path: string, parents = false) {
  const absolute = resolvePath(path);
  if (!absolute.startsWith(HOME + "/"))
    throw new Error(
      `mkdir: ${path}: Permission denied in this virtual filesystem`,
    );
  const dirs = directories();
  if (Object.hasOwn(allFiles(), workspacePath(path) ?? ""))
    throw new Error(`mkdir: ${path}: File exists`);
  if (dirs.has(absolute)) {
    if (!parents) throw new Error(`mkdir: ${path}: File exists`);
    return;
  }
  if (!parents && !dirs.has(resolvePath("..", absolute)))
    throw new Error(`mkdir: ${path}: No such file or directory`);
  const parts = absolute.split("/");
  do {
    S.cluster.directories.push(parts.join("/"));
    parts.pop();
  } while (parents && parts.length > 3 && !dirs.has(parts.join("/")));
}
export function writeVirtualFile(path: string, content: string) {
  const absolute = resolvePath(path);
  const key = workspacePath(path);
  if (
    !key ||
    Object.hasOwn(policyFiles, key) ||
    Object.hasOwn(incidentRecordFiles, key) ||
    key === "audit/kube-apiserver.log" ||
    key === "gitops/controller.log" ||
    key.startsWith("source/") ||
    [
      ".config/containers/auth.json",
      "rhacs/images/catalog.json",
      "rhacs/policies/active.json",
      "rhacs/receipts.json",
      "rhacs/alerts.json",
      "rhacs/processes.json",
      "rhacs/baselines.json",
    ].includes(key)
  )
    throw new Error(`shell: ${path}: read-only scenario file or location`);
  if (directories().has(absolute))
    throw new Error(`shell: ${path}: Is a directory`);
  if (!directories().has(resolvePath("..", absolute)))
    throw new Error(`shell: ${path}: No such directory`);
  S.cluster.files[key] = content;
}

/** Flat shell wildcard expansion over the same virtual files and directories; never host paths. */
export function expandFileGlob(pattern: string) {
  const absolute = resolvePath(pattern);
  const expression = new RegExp(
    "^" +
      absolute
        .split("")
        .map((char) =>
          char === "*"
            ? "[^/]*"
            : char === "?"
              ? "[^/]"
              : char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        )
        .join("") +
      "$",
  );
  const entries = [
    ...new Set([
      ...directories(),
      ...Object.keys(allFiles()).map((key) => HOME + "/" + key),
    ]),
  ];
  const matches = entries.filter((path) => expression.test(path)).sort();
  if (!matches.length) return [pattern];
  if (pattern.startsWith("/") || pattern.startsWith("~")) return matches;
  return matches.map((path) =>
    path.startsWith(S.cluster.cwd + "/")
      ? path.slice(S.cluster.cwd.length + 1)
      : path,
  );
}
