import { readVirtualFile } from "../simulation/filesystem.js";
import {
  resolveResource,
  resourceTypes,
} from "../simulation/resource-types.js";
import { labelPredicate } from "../simulation/selectors.js";
import {
  simulationEpoch,
  resourceTable,
} from "../simulation/resource-table.js";
import { printResourceTable } from "./table-printer.js";
import { mergePatch, jsonPatch } from "../simulation/api-patch.js";
import { stringify } from "yaml";
import type { ToolResult } from "./text-tools.js";

const parseObject = (obj: any): any => {
  if (typeof obj === "string") {
    try {
      return parseObject(JSON.parse(obj));
    } catch {
      return undefined;
    }
  }
  return obj && typeof obj === "object" ? obj : undefined;
};
export function timemachineCommand(words: string[]): ToolResult {
  const args: string[] = [],
    flags: Record<string, string> = {};
  const bool = new Set([
    "-A",
    "--all-namespaces",
    "--show-labels",
    "--history",
  ]);
  const aliases: Record<string, string> = {
    "-n": "--namespace",
    "-o": "--output",
    "-l": "--selector",
    "-A": "--all-namespaces",
  };
  for (let i = 2; i < words.length; i++) {
    const token = words[i];
    if (!token.startsWith("-")) {
      args.push(token);
      continue;
    }
    const [key, ...value] = token.split("=");
    const canonical = aliases[key] ?? key;
    if (
      ![
        "--auditlog-file",
        "--time",
        "--namespace",
        "--output",
        "--selector",
        "--all-namespaces",
        "--show-labels",
        "--history",
      ].includes(canonical)
    )
      throw new Error("Error: unrecognized argument " + key);
    flags[canonical] = bool.has(key)
      ? "true"
      : value.length
        ? value.join("=")
        : words[++i];
    if (flags[canonical] === undefined)
      throw new Error("Error: missing argument " + key);
  }
  if (args[0] !== "get" || args.length < 2 || args.length > 3)
    throw new Error(
      "Error: use oc timemachine get RESOURCE [NAME] --auditlog-file FILE [--time ISO8601] [-n NAMESPACE] [-o json|yaml|wide] [--history]",
    );
  const kind = args[1],
    name = args[2],
    type = resolveResource(kind);
  if (!type)
    throw new Error(
      "simulation: timemachine resource " + kind + " is not supported",
    );
  const output = flags["--output"] ?? "table";
  if (!["table", "wide", "json", "yaml"].includes(output))
    throw new Error("Error: unsupported output " + output);
  let cutoff = Infinity;
  if (flags["--time"]) {
    const time = flags["--time"];
    if (
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)$/.test(
        time,
      )
    )
      throw new Error(
        "simulation: use an explicit UTC Z or numeric time zone for reproducible forensic snapshots",
      );
    cutoff = Date.parse(time);
    if (!Number.isFinite(cutoff))
      throw new Error("Error: invalid snapshot time");
  }
  const events = readVirtualFile(flags["--auditlog-file"] ?? "audit.log")
    .split("\n")
    .flatMap((line, index) => {
      try {
        const e = JSON.parse(line),
          time = Date.parse(e.requestReceivedTimestamp);
        return Number.isFinite(time) && time <= cutoff
          ? [{ ...e, _order: index }]
          : [];
      } catch {
        return [];
      }
    })
    .sort(
      (a, b) =>
        Date.parse(a.requestReceivedTimestamp) -
          Date.parse(b.requestReceivedTimestamp) || a._order - b._order,
    );
  const namespace = flags["--namespace"] ?? "default",
    all = flags["--all-namespaces"] === "true";
  const state = new Map<string, any>();
  const history: any[] = [];
  const key = (ref: any) =>
    [ref.resource, ref.namespace ?? "", ref.name].join("/");
  for (const e of events) {
    const ref = e.objectRef ?? {};
    if (
      !["create", "update", "patch", "delete"].includes(e.verb) ||
      e.responseStatus?.code >= 400 ||
      e.responseStatus?.status === "Failure"
    )
      continue;
    if (
      ref.resource !== type ||
      (!all && ref.namespace && ref.namespace !== namespace) ||
      (name && ref.name !== name)
    )
      continue;
    const object =
        parseObject(e.responseObject) ?? parseObject(e.requestObject),
      objectName = ref.name ?? object?.metadata?.name;
    if (!objectName) continue;
    ref.name = objectName;
    if (flags["--history"] === "true")
      history.push({
        timestamp: e.requestReceivedTimestamp,
        verb: e.verb.toUpperCase(),
        object:
          ref.resource +
          "/" +
          objectName +
          (ref.subresource ? "/" + ref.subresource : ""),
        user: e.user?.username ?? "unknown",
        status:
          e.verb === "delete"
            ? "DELETED"
            : String(e.responseStatus?.code ?? ""),
        details: object ? JSON.stringify(object) : "Object body not retained",
      });
    if (
      ["exec", "attach", "portforward", "log", "proxy"].includes(
        ref.subresource,
      )
    )
      continue;
    if (e.verb === "delete") {
      state.delete(key(ref));
      continue;
    }
    // Metadata-only writes cannot establish a historical object state.
    if (!object || object.kind === "Status") continue;
    const old = state.get(key(ref));
    let next = object;
    if (!e.responseObject && e.verb === "patch") {
      if (!old) continue;
      try {
        next = Array.isArray(object)
          ? jsonPatch(old, object)
          : mergePatch(old, object);
      } catch {
        continue;
      }
    }
    if (!next.metadata) continue;
    state.set(key(ref), next);
  }
  if (flags["--history"] === "true") {
    if (!name)
      throw new Error("Error: --history requires a specific object name.");
    if (output === "json")
      return { stdout: JSON.stringify(history, null, 2) + "\n" };
    if (output === "yaml") return { stdout: stringify(history) };
    return {
      stdout:
        "HISTORY · OBSERVED OBJECT EVENTS\n" +
        history
          .map(
            (e) =>
              `${e.timestamp}  ${e.verb}  ${e.object}  ${e.user}  ${e.status}\n  ${e.details}`,
          )
          .join("\n") +
        "\n",
    };
  }
  const matches = flags["--selector"]
    ? labelPredicate(flags["--selector"])
    : () => true;
  const objects = [...state.values()]
    .filter(matches)
    .sort(
      (a, b) =>
        (a.metadata.namespace ?? "").localeCompare(
          b.metadata.namespace ?? "",
        ) || a.metadata.name.localeCompare(b.metadata.name),
    );
  if (!objects.length) return { stdout: "" };
  if (output === "json")
    return {
      stdout: objects.map((o) => JSON.stringify(o, null, 2)).join("\n") + "\n",
    };
  if (output === "yaml")
    return { stdout: objects.map((o) => "---\n" + stringify(o)).join("") };
  // Share native resource columns with oc get; deployments have no IP field.
  const table = resourceTable(
    objects,
    resourceTypes[type].kind,
    Number.isFinite(cutoff) ? cutoff : simulationEpoch,
  );
  if (type === "pods") {
    const ipColumn = table.columnDefinitions.findIndex((c) => c.name === "IP");
    for (const row of table.rows) {
      if (row.cells[ipColumn] !== "<none>") continue;
      // The upstream custom plugin also recovers an address from retained OVN
      // annotations. Decorate the table only: never invent status in JSON/YAML.
      try {
        const network = JSON.parse(
          row.object.metadata.annotations?.["k8s.ovn.org/pod-networks"] ?? "{}",
        ).default;
        const address = network?.ip_addresses?.[0] ?? network?.ip_address;
        if (typeof address === "string" && address)
          row.cells[ipColumn] = address.split("/")[0];
      } catch {
        /* An absent or invalid annotation is not evidence of an address. */
      }
    }
  }
  return {
    stdout: printResourceTable(table, {
      wide: output === "wide",
      namespace: resourceTypes[type].namespaced,
      showLabels: flags["--show-labels"] === "true",
    }),
  };
}
