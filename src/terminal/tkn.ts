import { printResourceTable } from "./table-printer.js";
import { nativeReference } from "./native-reference.js";
import { stringify } from "yaml";
import { S } from "../simulation/state.js";
import { kubeRequest, apiBody } from "../simulation/kube-api.js";
import type { Resource } from "../simulation/cluster-model.js";
import type { ToolResult } from "./text-tools.js";
import { printResourceJson } from "./json-printer.js";
export async function tknCommand(words: string[]): Promise<ToolResult> {
  const reference = await nativeReference(words);
  if (reference) return reference;
  let ns = S.cluster.namespace,
    output = "",
    last = false,
    prefix = true;
  const args: string[] = [];
  for (let i = 1; i < words.length; i++) {
    const arg = words[i];
    if (["-n", "--namespace"].includes(arg)) ns = words[++i];
    else if (["-o", "--output"].includes(arg)) output = words[++i];
    else if (["-L", "--last"].includes(arg)) last = true;
    else if (arg === "--prefix=false") prefix = false;
    else if (["-C", "--no-color", "-a", "--all"].includes(arg)) {
    } else if (arg.startsWith("-"))
      throw new Error(`simulation: tkn option ${arg} is not implemented`);
    else args.push(arg);
  }
  const out = (stdout: string): ToolResult => ({
    stdout: stdout && !stdout.endsWith("\n") ? stdout + "\n" : stdout,
  });
  if (args[0] === "version" && args.length === 1)
    return out("Client version: 0.46.1");
  if (!["pipelinerun", "pr", "taskrun", "tr"].includes(args[0]))
    throw new Error(
      "simulation: tkn supports pipelinerun/taskrun list, describe -o json/yaml/name, and logs; start a run with oc create -f run.yaml",
    );
  const kind = ["pipelinerun", "pr"].includes(args[0])
    ? "pipelineruns"
    : "taskruns";
  const response = apiBody(
    kubeRequest({
      method: "GET",
      path: `/apis/tekton.dev/v1/namespaces/${ns}/${kind}`,
    }),
  ) as { items: Resource[] };
  const list = [...response.items].sort(
    (a, b) =>
      Date.parse(String(b.status?.startTime ?? b.metadata.creationTimestamp)) -
      Date.parse(String(a.status?.startTime ?? a.metadata.creationTimestamp)),
  );
  if (args[1] === "list" || args[1] === "ls") {
    if (args.length !== 2)
      throw new Error("simulation: tkn list arguments are not implemented");
    if (output === "json")
      return out(printResourceJson(response as unknown as Resource));
    if (output === "yaml") return out(stringify(response));
    if (output)
      throw new Error("simulation: tkn list output supports json/yaml");
    if (!list.length)
      return out(
        `No ${kind === "pipelineruns" ? "PipelineRuns" : "TaskRuns"} found`,
      );
    return {
      stdout: table(
        ["NAME", "STARTED", "DURATION", "STATUS"],
        list.map((r) => [
          r.metadata.name,
          ago(r.status?.startTime),
          duration(r),
          runStatus(r),
        ]),
      ),
    };
  }
  const r = last ? list[0] : list.find((r) => r.metadata.name === args[2]);
  if (!r)
    throw new Error(
      `Error from server (NotFound): ${kind} "${args[2] ?? ""}" not found`,
    );
  if (["describe", "desc"].includes(args[1])) {
    if (output === "json") return out(printResourceJson(r));
    if (output === "yaml") return out(stringify(r));
    if (output === "name")
      return out(
        `${kind === "pipelineruns" ? "pipelinerun" : "taskrun"}.tekton.dev/${r.metadata.name}`,
      );
    if (output)
      throw new Error("simulation: tkn describe supports json/yaml/name");
    if (kind !== "pipelineruns")
      throw new Error(
        "simulation: TaskRun description requires -o json/yaml/name",
      );
    const trs = apiBody(
      kubeRequest({
        method: "GET",
        path: `/apis/tekton.dev/v1/namespaces/${ns}/taskruns?labelSelector=tekton.dev%2FpipelineRun%3D${r.metadata.name}`,
      }),
    ) as { items: Resource[] };
    const failed = trs.items
      .filter((t) => runStatus(t) === "Failed")
      .map((t) => t.metadata.name);
    const message = (r.status?.conditions as any[])?.[0]?.message;
    let text =
      `Name:              ${r.metadata.name}\nNamespace:         ${ns}\nPipeline Ref:      ${r.spec?.pipelineRef?.name}\nService Account:   ${r.spec?.taskRunTemplate?.serviceAccountName ?? "default"}\n\nStatus\n\n` +
      table(
        ["STARTED", "DURATION", "STATUS"],
        [[ago(r.status?.startTime), duration(r), runStatus(r)]],
      );
    if (message)
      text +=
        "\nMessage\n\n" +
        message +
        "\n" +
        (failed.length
          ? "TaskRun(s) cancelled: " + failed.join(", ") + "\n"
          : "");
    if (r.spec?.params?.length)
      text +=
        "\nParams\n\n" +
        indentedTable(
          ["NAME", "VALUE"],
          r.spec.params.map((p: any) => [p.name, p.value]),
        );
    if (r.spec?.workspaces?.length)
      text +=
        "\nWorkspaces\n\n" +
        indentedTable(
          ["NAME", "SUB PATH", "WORKSPACE BINDING"],
          r.spec.workspaces.map((w: any) => [
            w.name,
            w.subPath ?? "---",
            w.volumeClaimTemplate
              ? "VolumeClaimTemplate"
              : (w.persistentVolumeClaim?.claimName ?? "EmptyDir"),
          ]),
        );
    if ((r.status?.results as any[])?.length)
      text +=
        "\nResults\n\n" +
        indentedTable(
          ["NAME", "VALUE"],
          (r.status!.results as any[]).map((p) => [p.name, p.value]),
        );
    if (trs.items.length)
      text +=
        "\nTaskruns\n\n" +
        indentedTable(
          ["NAME", "TASK NAME", "STARTED", "DURATION", "STATUS"],
          trs.items
            .sort(
              (a, b) =>
                Date.parse(String(b.status?.startTime)) -
                Date.parse(String(a.status?.startTime)),
            )
            .map((t) => [
              t.metadata.name,
              t.metadata.labels?.["tekton.dev/pipelineTask"] ?? "",
              ago(t.status?.startTime),
              duration(t),
              runStatus(t),
            ]),
        );
    if ((r.status?.skippedTasks as any[])?.length)
      text +=
        "\nSkipped Tasks\n\n" +
        indentedTable(
          ["NAME"],
          (r.status!.skippedTasks as any[]).map((t) => [t.name]),
        );
    return out(text);
  }
  if (args[1] === "logs") {
    if (output)
      throw new Error("simulation: logs do not accept an output format");
    const children =
      kind === "taskruns"
        ? [
            {
              name: r.metadata.name,
              pipelineTaskName:
                r.metadata.labels?.["tekton.dev/pipelineTask"] ??
                r.metadata.name,
            },
          ]
        : ((r.status?.childReferences as {
            name: string;
            pipelineTaskName: string;
          }[]) ?? []);
    let text = "";
    for (const child of children) {
      const tr = apiBody(
        kubeRequest({
          method: "GET",
          path: `/apis/tekton.dev/v1/namespaces/${ns}/taskruns/${child.name}`,
        }),
      ) as Resource;
      const steps =
        (tr.status?.steps as { name: string; container: string }[]) ?? [];
      for (const step of steps) {
        const logs = apiBody(
          kubeRequest({
            method: "GET",
            path: `/api/v1/namespaces/${ns}/pods/${tr.status?.podName}/log?container=${step.container}`,
          }),
        ) as string;
        text +=
          logs
            .trimEnd()
            .split("\n")
            .map((l) =>
              prefix
                ? kind === "taskruns"
                  ? `[${step.name}] ${l}`
                  : `[${child.pipelineTaskName} : ${step.name}] ${l}`
                : l,
            )
            .join("\n") + "\n\n";
      }
    }
    return out(text);
  }
  throw new Error(
    `simulation: tkn ${args.slice(0, 2).join(" ")} is not implemented`,
  );
}

function runStatus(r: Resource) {
  const c = (r.status?.conditions as any[])?.find(
    (c) => c.type === "Succeeded",
  );
  return c?.status === "True"
    ? "Succeeded"
    : c?.status === "False"
      ? "Failed"
      : "Running";
}
function duration(r: Resource) {
  const seconds =
    (Date.parse(String(r.status?.completionTime)) -
      Date.parse(String(r.status?.startTime))) /
    1000;
  return Number.isFinite(seconds) ? seconds + "s" : "---";
}
function ago(value: unknown) {
  if (!value) return "---";
  const sec = Math.max(0, (Date.now() - Date.parse(String(value))) / 1000);
  if (sec < 1) return "now";
  if (sec < 2) return "1 second ago";
  if (sec < 60) return Math.floor(sec) + " seconds ago";
  if (sec < 120) return "1 minute ago";
  if (sec < 3600) return Math.floor(sec / 60) + " minutes ago";
  if (sec < 7200) return "1 hour ago";
  if (sec < 86400) return Math.floor(sec / 3600) + " hours ago";
  if (sec < 172800) return "1 day ago";
  return Math.floor(sec / 86400) + " days ago";
}
function table(headers: string[], rows: unknown[][]) {
  return printResourceTable({
    apiVersion: "meta.k8s.io/v1",
    kind: "Table",
    metadata: {},
    columnDefinitions: headers.map((name) => ({
      name,
      type: "string",
      description: "",
    })),
    rows: rows.map((cells) => ({
      cells,
      object: { apiVersion: "v1", kind: "TableRow", metadata: { name: "" } },
    })),
  });
}
function indentedTable(headers: string[], rows: unknown[][]) {
  return (
    table(headers, rows)
      .trimEnd()
      .split("\n")
      .map((l) => " " + l)
      .join("\n") + "\n"
  );
}
