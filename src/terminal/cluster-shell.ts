import {skopeoCommand} from "./skopeo.js";
import {podmanCommand} from "./podman.js";
import {roxctlCommand} from "./roxctl.js";
import {
  readApiResources,
  readApiTable as apiTable,
  kubeRequest,
  apiBody,
  apiResourcePath,
} from "../simulation/kube-api.js";
import { parseAllDocuments, stringify } from "yaml";
import { S } from "../simulation/state.js";
import type { Resource, Scc } from "../simulation/cluster-model.js";
import {
  resourceTypes,
  resolveResource,
  refreshResourceTypes,
  grantScc,
  auditRequest,
  clusterTime,
} from "../simulation/cluster-api.js";
import {
  authorized,
  forbidden,
  roleAllows,
  assertCanImpersonate,
} from "../security/rbac.js";
import {
  readVirtualFile,
  expandFileGlob,
  workspacePath,
  changeDirectory,
  listDirectory,
  makeDirectory,
  writeVirtualFile,
} from "../simulation/filesystem.js";
import { tokenize } from "./lexer.js";
import { runQuery } from "./query-tools.js";
import { validOcCommand } from "./syntax.js";
import { verifyRollout } from "../simulation/operations.js";
import { textCommand, textTools, toolHelp } from "./text-tools.js";
import type { ToolResult } from "./text-tools.js";
import { printResourceJson, printTypedResourceJson } from "./json-printer.js";
import { printResourceTable } from "./table-printer.js";
import { jsonPathValues } from "../simulation/resource-table.js";
import { mergePatch, jsonPatch } from "../simulation/api-patch.js";
import { strategicPatch } from "../simulation/strategic-patch.js";
import { encodeSecret, normalizeSecret } from "../simulation/secrets.js";

interface Result extends ToolResult {
  legacyCommand?: string;
}
export function commandNamespace(words: string[]) {
  const { flags } = options([...words.slice(1)]);
  return (
    flags["-n"]?.at(-1) ?? flags["--namespace"]?.at(-1) ?? S.cluster.namespace
  );
}
const result = (stdout: string, error = false): Result => ({
  stdout: stdout && !stdout.endsWith("\n") ? stdout + "\n" : stdout,
  error,
});

function options(words: string[]) {
  const args: string[] = [],
    flags: Record<string, string[]> = {};
  for (let i = 0; i < words.length; i++) {
    let token = words[i];
    if (/^-[noflL].+/.test(token) && token[2] !== "=") {
      words = [
        ...words.slice(0, i),
        token.slice(0, 2),
        token.slice(2),
        ...words.slice(i + 1),
      ];
      token = words[i];
    }
    if (!token.startsWith("-")) {
      args.push(token);
      continue;
    }
    const equals = token.indexOf("=");
    const key = equals < 0 ? token : token.slice(0, equals);
    const boolean = [
      "-A",
      "--all-namespaces",
      "--no-headers",
      "--show-labels",
      "--namespaced",
      "--help",
      "--overwrite", "--list",
    ].includes(key);
    const value =
      equals < 0 ? (boolean ? "true" : words[++i]) : token.slice(equals + 1);
    if (value === undefined)
      throw new Error(`error: flag needs an argument: ${key}`);
    (flags[key] ??= []).push(value);
  }
  return { args, flags, flag: (key: string) => flags[key]?.at(-1) };
}
function rejectFlags(flags: Record<string, string[]>, allowed: string[]) {
  const invalid = Object.keys(flags).find((key) => !allowed.includes(key));
  if (invalid)
    throw new Error(`simulation: option ${invalid} is not implemented`);
}

function auditText() {
  return S.cluster.audit.map((event) => JSON.stringify(event)).join("\n");
}
const readFile = readVirtualFile;

async function oc(words: string[], raw: string): Promise<Result | null> {
  if (words.length === 1 || words.includes("--help"))
    return result(
      `OpenShift 4.22 OFFLINE cluster simulator\nResource operations: get, describe, create, apply, replace, delete, patch, scale, run, label, annotate\nPod diagnostics: oc exec POD [-n NAMESPACE] [-c CONTAINER] -- curl -I http://POD-IP:PORT/health; nc -zv POD-IP PORT; id\nExec uses recorded workload endpoints; arbitrary processes, interactive streams, service DNS and TLS verification are not implemented.\nWrite previews: --dry-run=client or --dry-run=server; -o json/yaml/name\nContext: project, new-project, whoami, login\nSecurity: auth can-i, adm policy add-scc-to-user/remove-scc-from-user\nInvestigation: -o json/yaml/go-template, jq, grep, sort, head, tail, wc\nFiles: cat lab.txt; ls workloads; ls scc; echo '<JSON>' > workloads/custom.json\nDiscovery: oc api-resources\nNot every oc subcommand/API field is implemented. Such cases report a simulator limitation; RBAC/admission errors are reserved for evaluated requests.`,
    );
  refreshResourceTypes();
  if (words[1] === "exec") {
    const separator = words.indexOf("--");
    if (separator < 3 || separator === words.length - 1)
      throw new Error(
        "error: use oc exec POD [-n NAMESPACE] [-c CONTAINER] -- COMMAND",
      );
    const { args, flags, flag } = options(words.slice(2, separator));
    rejectFlags(flags, ["-n", "--namespace", "-c", "--container", "--as"]);
    if (args.length !== 1) throw new Error("error: exec requires one Pod");
    const namespace = flag("-n") ?? flag("--namespace") ?? S.cluster.namespace;
    const name = args[0].replace(/^pods?\//, "");
    return apiBody(
      kubeRequest({
        method: "POST",
        path: `/api/v1/namespaces/${encodeURIComponent(namespace)}/pods/${encodeURIComponent(name)}/exec`,
        body: {
          command: words.slice(separator + 1),
          container: flag("-c") ?? flag("--container"),
        },
        impersonateUser: flag("--as"),
      }),
    ) as Result;
  }
  const { args, flags, flag } = options(words.slice(1));
  const namespace = flag("-n") ?? flag("--namespace") ?? S.cluster.namespace;
  const impersonate = flag("--as");
  const identifier = (object: Resource) => object.kind.toLowerCase() + (object.apiVersion.includes("/") ? "." + object.apiVersion.split("/")[0] : "") + "/" + object.metadata.name;
  const writeObject = (object: Resource, method: "POST" | "PATCH" | "PUT", typed = false) => {
    const type = resolveResource(object.kind);
    if (!type) throw new Error(`error: unknown resource kind ${object.kind}`);
    const dryRun = flag("--dry-run") ?? "none";
    if (!["none", "client", "server"].includes(dryRun)) throw new Error('error: --dry-run must be "none", "client", or "server"');
    const output = flag("-o") ?? flag("--output");
    if (output && !["json", "yaml", "name"].includes(output)) throw new Error("simulation: mutation output supports json, yaml, or name");
    const copy = structuredClone(object);
    normalizeSecret(copy);
    if (dryRun === "client" && object.kind === "Secret" && object.type === undefined) delete copy.type;
    const objectNamespace = resourceTypes[type].namespaced ? (copy.metadata.namespace ?? namespace) : undefined;
    if (copy.metadata.namespace && (flag("-n") || flag("--namespace")) && copy.metadata.namespace !== namespace)
      throw new Error(`error: the namespace from the provided object "${copy.metadata.namespace}" does not match the namespace "${namespace}"`);
    if (objectNamespace) copy.metadata.namespace = objectNamespace;
    let body = copy;
    let message = `${identifier(copy)} ${method === "POST" ? "created" : method === "PUT" ? "replaced" : "configured"}`;
    if (dryRun !== "client") {
      const response = kubeRequest({ method, path: apiResourcePath(type, objectNamespace, method === "POST" ? undefined : copy.metadata.name) + (dryRun === "server" ? "?dryRun=All" : ""), body: copy, contentType: method === "PATCH" ? "application/apply-patch+yaml" : "application/json", impersonateUser: impersonate });
      body = apiBody(response) as Resource;
      message = method === "PUT" ? message : response.message!;
    }
    return output === "json" ? (method === "POST" && typed ? printTypedResourceJson(body) : printResourceJson(body)) : output === "yaml" ? stringify(body) : output === "name" ? identifier(body) : message + (dryRun === "none" ? "" : dryRun === "client" ? " (dry run)" : " (server dry run)");
  };
  const getResources = (...params: Parameters<typeof readApiResources>) =>
    readApiResources(params[0], params[1], params[2], params[3], impersonate);
  const readApiTable = (...params: Parameters<typeof apiTable>) =>
    apiTable(params[0], params[1], params[2], params[3], impersonate);
  const verb = args[0];
  if (verb === "get" && flag("--raw")) {
    rejectFlags(flags, ["--raw", "--as"]);
    if (args.length !== 1)
      throw new Error("error: oc get --raw PATH accepts no resource arguments");
    return {
      stdout: JSON.stringify(
        apiBody(
          kubeRequest({
            method: "GET",
            path: flag("--raw")!,
            impersonateUser: impersonate,
          }),
        ),
      ),
      error: false,
    };
  }
  if (verb === "version")
    return result(
      "Client Version: 4.22.0 (simulation)\nServer Version: 4.22.0 (simulation)",
    );
  if (verb === "whoami" && args.length === 1) return result(S.cluster.user);
  if (verb === "login") {
    rejectFlags(flags, ["-u", "-p", "--username", "--password"]);
    const user = flag("-u") ?? flag("--username");
    if (
      !["operator", "platform-admin"].includes(user ?? "") ||
      (flag("-p") ?? flag("--password")) !== "training"
    )
      return result(
        "error: invalid credentials for this local training identity",
        true,
      );
    S.cluster.user = user!;
    return result(`Logged into simulated OpenShift 4.22 as "${user}".`);
  }
  if (verb === "project") {
    rejectFlags(flags, []);
    if (!args[1]) return result(`Using project "${S.cluster.namespace}".`);
    getResources("namespaces", undefined, args[1]);
    S.cluster.namespace = args[1];
    return result(`Now using project "${args[1]}".`);
  }
  if (verb === "api-versions") {
    rejectFlags(flags, []);
    return result(
      [...new Set(Object.values(resourceTypes).map((d) => d.apiVersion))]
        .sort()
        .join("\n"),
    );
  }
  if (verb === "api-resources") {
    rejectFlags(flags, [
      "--no-headers",
      "--api-group",
      "--namespaced",
      "-o",
      "--output",
    ]);
    const output = flag("-o") ?? flag("--output");
    if (output && output !== "name" && output !== "wide")
      throw new Error(
        `simulation: api-resources output ${output} is not implemented`,
      );
    const entries = Object.entries(resourceTypes)
      .filter(
        ([, d]) =>
          (!flag("--api-group") ||
            (d.apiVersion.includes("/") ? d.apiVersion.split("/")[0] : "") ===
              flag("--api-group")) &&
          (flag("--namespaced") === undefined ||
            d.namespaced === (flag("--namespaced") === "true")),
      )
      .sort(([a], [b]) => a.localeCompare(b));
    if (output === "name")
      return result(
        entries
          .map(
            ([name, d]) =>
              name +
              (d.apiVersion.includes("/")
                ? "." + d.apiVersion.split("/")[0]
                : ""),
          )
          .join("\n"),
      );
    return result(
      printResourceTable(
        {
          apiVersion: "meta.k8s.io/v1",
          kind: "Table",
          metadata: {},
          columnDefinitions: [
            "Name",
            "Shortnames",
            "APIVersion",
            "Namespaced",
            "Kind",
            ...(output === "wide" ? ["Verbs", "Categories"] : []),
          ].map((name) => ({ name, type: "string", description: "" })),
          rows: entries.map(([name, d]) => ({
            object: {
              apiVersion: d.apiVersion,
              kind: d.kind,
              metadata: { name },
            },
            cells: [
              name,
              d.aliases
                .filter(
                  (alias) =>
                    alias.length <= 4 &&
                    alias !== name &&
                    alias !== d.kind.toLowerCase(),
                )
                .join(","),
              d.apiVersion,
              d.namespaced,
              d.kind,
              ...(output === "wide"
                ? ["delete,get,list,patch,create", ""]
                : []),
            ],
          })),
        },
        { noHeaders: flag("--no-headers") === "true" },
      ),
    );
  }
  if (verb === "auth" && args[1] === "can-i") {
    rejectFlags(flags, ["-n", "--namespace", "--as"]);
    const [resource, resourceName] = (args[3] ?? "").split("/");
    const type = resolveResource(resource);
    if (!type || !args[2])
      throw new Error("error: specify a verb and a known resource");
    const identity = flag("--as");
    if (identity) assertCanImpersonate(identity);
    if (args[2] === "use" && type === "securitycontextconstraints") {
      const match = identity?.match(/^system:serviceaccount:([^:]+):([^:]+)$/);
      const usable =
        resourceName === "restricted-v3" ||
        resourceName === "restricted-v2" ||
        (match
          ? roleAllows(
              identity!,
              "use",
              "securitycontextconstraints",
              match[1],
              resourceName,
            )
          : S.cluster.user === "platform-admin" ||
            roleAllows(
              S.cluster.user,
              "use",
              "securitycontextconstraints",
              namespace,
              resourceName,
            ));
      return result(usable ? "yes" : "no");
    }
    if (identity)
      return result(
        roleAllows(identity, args[2], type, namespace, resourceName)
          ? "yes"
          : "no",
      );
    return result(
      authorized(
        args[2],
        type,
        resourceTypes[type].namespaced ? namespace : undefined,
      )
        ? "yes"
        : "no",
    );
  }
  if (
    verb === "adm" &&
    args[1] === "policy" &&
    ["add-scc-to-user", "remove-scc-from-user"].includes(args[2])
  ) {
    rejectFlags(flags, ["-n", "--namespace", "-z"]);
    if (!args[3] || !flag("-z"))
      throw new Error("error: specify SCC and -z serviceaccount");
    return result(
      grantScc(
        args[3],
        flag("-z")!,
        namespace,
        args[2] === "remove-scc-from-user",
      ),
    );
  }
  if (verb === "adm" && args[1] === "node-logs") {
    rejectFlags(flags, ["--path"]);
    if (S.cluster.user !== "platform-admin")
      throw new Error(forbidden("get", "nodes/log"));
    if (
      args[2] !== "control-01" ||
      !["kube-apiserver/audit.log", "openshift-apiserver/audit.log"].includes(
        flag("--path") ?? "",
      )
    )
      throw new Error(
        "simulation: use control-01 --path=kube-apiserver/audit.log",
      );
    return result(auditText());
  }
  if (
    verb === "logs" &&
    /^(?:(?:deployment|deploy)\/payment-api|(?:pods?\/)?payment-api-)/.test(
      args[1] ?? "",
    )
  ) {
    rejectFlags(flags, ["-n", "--namespace", "--tail", "-c", "--container"]);
    if (args.length !== 2) throw new Error("error: logs requires one resource");
    if (/^(deployment|deploy)\//.test(args[1]))
      getResources("deployments", namespace, args[1].split("/")[1]);
    else getResources("pods", namespace, args[1].replace(/^pods?\//, ""));
    const container = flag("-c") ?? flag("--container");
    if (container && container !== "payment-api")
      throw new Error(
        `Error from server (BadRequest): container ${container} is not valid for this pod`,
      );
    const tail = flag("--tail");
    if (tail !== undefined && !/^(?:-1|\d+)$/.test(tail))
      throw new Error("error: --tail must be -1 or a non-negative integer");
    return result(
      tail === undefined || tail === "-1"
        ? paymentLogs()
        : Number(tail)
          ? paymentLogs().split("\n").slice(-Number(tail)).join("\n")
          : "",
    );
  }
  if (verb === "rsh" && validOcCommand(raw)) {
    getResources("deployments",namespace,"payment-api");
    if (!getResources("pods",namespace).some(p => p.metadata.labels?.app === "payment-api" && Array.isArray(p.status?.containerStatuses) && p.status.containerStatuses.some((c: any)=>c.ready)))
      throw new Error("Error from server (BadRequest): no running payment-api container is available");
    return null;
  }

  if (verb === "get" || verb === "describe") {
    rejectFlags(flags, [
      "--as",
      "-n",
      "--namespace",
      "-A",
      "--all-namespaces",
      "-o",
      "--output",
      "-l",
      "--selector",
      "--sort-by",
      "--template",
      "--no-headers",
      "--show-labels",
      "-L",
      "--label-columns",
      "--field-selector",
    ]);
    const [resourceName, embeddedName] = (args[1] ?? "").split("/");
    const type = resolveResource(resourceName);
    if (!type)
      throw new Error(
        `simulation: resource ${resourceName || "(missing)"} is not implemented`,
      );
    if (args.length > 3)
      throw new Error(
        "simulation: get/describe of multiple named objects is not implemented",
      );
    const name = args[2] ?? embeddedName;
    const allNamespaces =
      flag("-A") === "true" || flag("--all-namespaces") === "true";
    const resourceNamespace =
      resourceTypes[type].namespaced && !allNamespaces ? namespace : undefined;
    const output = flag("-o") ?? flag("--output");
    const selectors = {
      label: flag("-l") ?? flag("--selector"),
      field: flag("--field-selector"),
    };
    const table =
      verb === "get" && (!output || output === "wide")
        ? readApiTable(type, resourceNamespace, name, selectors)
        : undefined;
    let items = table
      ? table.rows.map((row) => row.object)
      : getResources(type, resourceNamespace, name, selectors);
    const sort = flag("--sort-by");
    if (sort)
      items.sort((a, b) => {
        const left = jsonPathValues(a, sort)[0],
          right = jsonPathValues(b, sort)[0];
        if (left == null || right == null)
          return left == null ? (right == null ? 0 : -1) : 1;
        if (typeof left === "number" && typeof right === "number")
          return left - right;
        if (typeof left === "string" && typeof right === "string")
          return left < right ? -1 : left > right ? 1 : 0;
        throw new Error(
          "error: --sort-by requires a comparable string or numeric field",
        );
      });
    const object = name
      ? items[0]
      : {
          apiVersion: "v1",
          kind: "List",
          items,
          metadata: { resourceVersion: "" },
        };
    if (output === "json") return result(printResourceJson(object));
    if (output === "yaml") return result(stringify(object));
    if (output?.startsWith("go-template")) {
      const template = output.startsWith("go-template=")
        ? output.slice("go-template=".length)
        : flag("--template");
      if (template === undefined)
        throw new Error("error: go-template needs a template expression");
      const response = await runQuery(
        "template",
        JSON.stringify(object),
        template,
      );
      return {
        stdout: response.exitCode ? response.stderr : response.stdout,
        error: response.exitCode !== 0,
      };
    }
    if (
      output?.startsWith("jsonpath=") ||
      output?.startsWith("jsonpath-as-json=")
    ) {
      const response = await runQuery(
        "jsonpath",
        JSON.stringify(object),
        output.slice(output.indexOf("=") + 1),
        output.startsWith("jsonpath-as-json=") ? ["as-json"] : [],
      );
      return {
        stdout: response.exitCode ? response.stderr : response.stdout,
        error: response.exitCode !== 0,
      };
    }
    if (output === "name")
      return result(
        items
          .map(
            (r) =>
              `${resourceTypes[type].kind.toLowerCase()}${resourceTypes[type].apiVersion.includes("/") ? "." + resourceTypes[type].apiVersion.split("/")[0] : ""}/${r.metadata.name}`,
          )
          .join("\n"),
      );
    if (output?.startsWith("custom-columns=")) {
      const expressions = output
        .slice("custom-columns=".length)
        .split(",")
        .map((column) => {
          const i = column.indexOf(":");
          if (i < 1)
            throw new Error(
              "error: custom-columns requires HEADER:JSONPATH pairs",
            );
          return { name: column.slice(0, i), path: column.slice(i + 1) };
        });
      const custom = {
        apiVersion: "meta.k8s.io/v1" as const,
        kind: "Table" as const,
        metadata: {},
        columnDefinitions: expressions.map((e) => ({
          name: e.name,
          type: "string",
          description: "",
        })),
        rows: items.map((r) => ({
          object: r,
          cells: expressions.map(
            (e) =>
              jsonPathValues(r, e.path)
                .map((v) =>
                  typeof v === "object" ? JSON.stringify(v) : String(v),
                )
                .join(",") || "<none>",
          ),
        })),
      };
      return result(
        printResourceTable(custom, {
          noHeaders: flag("--no-headers") === "true",
          preserveHeaders: true,
          minWidth: 0,
        }),
      );
    }
    if (output && output !== "wide")
      throw new Error(`simulation: output format ${output} is not implemented`);
    if (verb === "describe") {
      const described = items
        .map(
          (item) =>
            `Name: ${item.metadata.name}\nNamespace: ${item.metadata.namespace ?? "<cluster>"}\n${stringify(item.spec ?? item)}\nStatus: ${JSON.stringify(item.status ?? {})}\nEvents:\n${S.cluster.events
              .filter(
                (event) =>
                  event.metadata.namespace === item.metadata.namespace &&
                  event.metadata.name.startsWith(item.metadata.name + "."),
              )
              .map((event) => event.message)
              .join("\n")}`,
        )
        .join("\n");
      return result(
        described || `No resources found in ${namespace} namespace.`,
      );
    }
    if (!items.length)
      return result(
        resourceNamespace
          ? `No resources found in ${resourceNamespace} namespace.`
          : "No resources found.",
      );
    table!.rows.sort(
      (a, b) => items.indexOf(a.object) - items.indexOf(b.object),
    );
    return result(
      printResourceTable(table!, {
        wide: output === "wide",
        namespace: allNamespaces && resourceTypes[type].namespaced,
        noHeaders: flag("--no-headers") === "true",
        showLabels: flag("--show-labels") === "true",
        labelColumns: [
          ...(flags["-L"] ?? []),
          ...(flags["--label-columns"] ?? []),
        ].flatMap((value) => value.split(",")),
      }),
    );
  }
  if (verb === "create" || verb === "apply" || verb === "replace" || verb === "new-project") {
    rejectFlags(flags, [
      "-n",
      "--namespace",
      "-f",
      "--filename",
      "--image",
      "--from-literal",
      "--from-file", "--from-env-file",
      "--docker-server", "--docker-username", "--docker-password", "--docker-email",
      "--type",
      "--dry-run", "-o", "--output", "--as",
    ]);
    const file = flag("-f") ?? flag("--filename");
    if (file) {
      const documents = parseAllDocuments(readFile(file));
      const messages: string[] = [];
      for (const document of documents) {
        if (document.errors.length)
          throw new Error(
            "error parsing manifest: " + document.errors[0].message,
          );
        const object = document.toJS() as Resource;
        if (!object || typeof object !== "object")
          throw new Error("error: manifest must be an API object");
        messages.push(writeObject(object, verb === "create" ? "POST" : verb === "replace" ? "PUT" : "PATCH"));
      }
      return result(messages.join("\n"));
    }
    if (verb === "replace") throw new Error("error: must specify -f for replace");
    const type =
      verb === "new-project" ? "namespaces" : resolveResource(args[1] ?? "");
    const name = verb === "new-project" ? args[1] : type === "secrets" && ["generic","docker-registry"].includes(args[2]) ? args[3] : args[2];
    if (!type || !name)
      throw new Error("error: specify a resource and a name, or -f manifest");
    const definition = resourceTypes[type];
    const object: Resource = {
      apiVersion: definition.apiVersion,
      kind: definition.kind,
      metadata: { name },
    };
    if (type === "namespaces") {object.spec={};object.status={};}
    if (type === "deployments") {
      if (!flag("--image")) throw new Error("error: --image is required");
      object.spec = {
        replicas: 1,
        selector: { matchLabels: { app: name } },
        template: { metadata: { labels: { app: name } }, spec: { containers: [{ name, image: flag("--image")! }] } },
      };
    } else if (type === "secrets" && args[2] === "docker-registry") {
      const server=flag("--docker-server")??"https://index.docker.io/v1/", username=flag("--docker-username"), password=flag("--docker-password");
      if(!username || !password)throw new Error("error: either --from-file or the combination of --docker-username, --docker-password and --docker-server is required");
      object.type="kubernetes.io/dockerconfigjson";
      object.data={".dockerconfigjson":encodeSecret(JSON.stringify({auths:{[server]:{username,password,...(flag("--docker-email")?{email:flag("--docker-email")}:{}),auth:encodeSecret(username+":"+password)}}}))};
    } else if (type === "configmaps" || (type === "secrets" && args[2] === "generic")) {
      const data: Record<string, string> = {};
      const add = (key: string, value: string) => {
        if (!/^[-._a-zA-Z0-9]+$/.test(key)) throw new Error(`error: invalid key ${key}`);
        if (Object.hasOwn(data, key)) throw new Error(`error: cannot add key ${key}, another key by that name already exists`);
        Object.defineProperty(data, key, {value, configurable:true, enumerable:true, writable:true});
      };
      for (const literal of flags["--from-literal"] ?? []) {
        const equals = literal.indexOf("=");
        if (equals < 1)
          throw new Error("error: --from-literal expects key=value");
        add(literal.slice(0, equals), literal.slice(equals + 1));
      }
      for (const source of flags["--from-file"] ?? []) {
        const equals = source.indexOf("="), path = equals < 0 ? source : source.slice(equals + 1);
        add(equals < 0 ? path.split("/").at(-1)! : source.slice(0, equals), readFile(path));
      }
      for (const source of flags["--from-env-file"] ?? []) {
        for (const line of readFile(source).split(/\r?\n/)) {
          if (!line.trim() || line.trimStart().startsWith("#")) continue;
          const equals = line.indexOf("=");
          if (equals < 1) throw new Error("simulation: env-file entries must be KEY=value; host environment substitution is unavailable");
          add(line.slice(0, equals).trim(), line.slice(equals + 1));
        }
      }
      if (type === "secrets") {object.stringData=data; if (flag("--type")) object.type=flag("--type");}
      else object.data = data;
    } else if (!["namespaces", "serviceaccounts"].includes(type))
      throw new Error("simulation: use -f for this resource kind");
    const message = writeObject(object, "POST", true);
    if (verb === "new-project" && (!flag("--dry-run") || flag("--dry-run") === "none")) S.cluster.namespace = name;
    return result(message);
  }
  if (verb === "run") {
    rejectFlags(flags, ["-n", "--namespace", "--image", "--overrides", "--dry-run", "-o", "--output", "--as"]);
    if (!args[1] || !flag("--image"))
      throw new Error("error: specify a name and --image");
    let object: Resource = {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: args[1] },
      spec: { containers: [{ name: args[1], image: flag("--image")! }] },
    };
    if (flag("--overrides"))
      object = mergePatch(object, JSON.parse(flag("--overrides")!)) as Resource;
    return result(writeObject(object, "POST", true));
  }
  if (["delete", "patch", "scale", "rollout", "set", "label", "annotate"].includes(verb)) {
    rejectFlags(flags, [
      "-n",
      "--namespace",
      "-p",
      "--patch",
      "--type",
      "--replicas",
      "--dry-run", "-o", "--output", "--as",
      "--overwrite", "--list",
    ]);
    const resourceToken =
      verb === "rollout" || verb === "set" ? args[2] : args[1];
    const [alias, embeddedName] = (resourceToken ?? "").split("/");
    const type = resolveResource(alias),
      name = embeddedName ?? args[verb === "rollout" || verb === "set" ? 3 : 2];
    if (!type || !name) throw new Error("error: specify a known resource/name");
    if (verb === "delete") {
      const dryRun = flag("--dry-run") ?? "none";
      if (!["none", "client", "server"].includes(dryRun)) throw new Error("error: invalid --dry-run value");
      if (flag("-o") || flag("--output")) throw new Error("simulation: delete output formats are not implemented");
      const names = embeddedName
        ? [embeddedName, ...args.slice(2)]
        : args.slice(2);
      if (names.some((item) => item.includes("/")))
        throw new Error(
          "simulation: delete accepts one resource type followed by names",
        );
      const responses: string[] = [];
      let failed = false;
      for (const item of names) {
        try {
          const scope = resourceTypes[type].namespaced ? ` from ${namespace} namespace` : "";
          if (dryRun === "client") {
            getResources(type, resourceTypes[type].namespaced ? namespace : undefined, item);
            const definition=resourceTypes[type];
            const kind=definition.kind.toLowerCase()+(definition.apiVersion.includes("/") ? "."+definition.apiVersion.split("/")[0] : "");
            responses.push(`${kind} "${item}" deleted${scope} (dry run)`);
          } else {
            const response = kubeRequest({ method: "DELETE", path: apiResourcePath(type, resourceTypes[type].namespaced ? namespace : undefined, item) + (dryRun === "server" ? "?dryRun=All" : ""), impersonateUser: impersonate });
            apiBody(response);
            responses.push(response.message! + scope + (dryRun === "server" ? " (server dry run)" : ""));
          }
        } catch (error) {
          failed = true;
          responses.push((error as Error).message);
        }
      }
      return result(responses.join("\n"), failed);
    }
    if (verb === "patch") {
      const patch = flag("-p") ?? flag("--patch");
      if (!patch) throw new Error("error: patch needs -p JSON");
      const patchType = flag("--type") ?? "strategic";
      const contentTypes: Record<string, string> = { merge: "application/merge-patch+json", json: "application/json-patch+json", strategic: "application/strategic-merge-patch+json" };
      if (!contentTypes[patchType]) throw new Error('error: --type must be "json", "merge", or "strategic"');
      const dryRun = flag("--dry-run") ?? "none";
      if (!["none", "client", "server"].includes(dryRun)) throw new Error("error: invalid --dry-run value");
      const output = flag("-o") ?? flag("--output");
      if (output && !["json", "yaml", "name"].includes(output)) throw new Error("simulation: patch output supports json, yaml, or name");
      const original = getResources(type, resourceTypes[type].namespaced ? namespace : undefined, name)[0];
      let patched: Resource;
      if (dryRun === "client") {
        const document = JSON.parse(patch);
        patched = patchType === "merge" ? mergePatch(original, document) : patchType === "json" ? jsonPatch(original, document) : strategicPatch(original.kind, original, document);
      } else {
        const response = kubeRequest({ method: "PATCH", path: apiResourcePath(type, resourceTypes[type].namespaced ? namespace : undefined, name) + (dryRun === "server" ? "?dryRun=All" : ""), body: JSON.parse(patch), contentType: contentTypes[patchType], impersonateUser: impersonate });
        patched = apiBody(response) as Resource;
      }
      const unchanged = printResourceJson(patched) === printResourceJson(original);
      return result(output === "json" ? printResourceJson(patched) : output === "yaml" ? stringify(patched) : `${identifier(patched)}${output === "name" ? "" : " patched" + (unchanged ? " (no change)" : "")}`);
    }
    const object = getResources(
      type,
      resourceTypes[type].namespaced ? namespace : undefined,
      name,
    )[0];
    if (verb === "rollout" && args[1] === "status") {
      const ready = object.status?.readyReplicas ?? 0;
      if (type === "deployments" && name === "payment-api" && namespace === "payments" && ready === (object.spec?.replicas ?? 1)) verifyRollout();
      return result(
        ready === (object.spec?.replicas ?? 1)
          ? `deployment "${name}" successfully rolled out`
          : `Waiting for deployment "${name}" rollout to finish: ${ready} of ${object.spec?.replicas ?? 1} updated replicas are available...\nInspect oc describe deployment ${name} and oc get events.`,
        ready !== (object.spec?.replicas ?? 1),
      );
    }
    let updated: Resource;
    if (verb === "label" || verb === "annotate") {
      const key = verb === "label" ? "labels" : "annotations";
      updated = structuredClone(object);
      updated.metadata[key] ??= {};
      const changes = args.slice(embeddedName ? 2 : 3);
      if (flag("--list") === "true") {
        if (changes.length) throw new Error("error: --list does not accept updates");
        return result(Object.entries(updated.metadata[key]!).map(([k,v])=>`${k}=${v}`).join("\n"));
      }
      if (!changes.length) throw new Error(`error: at least one ${verb} update is required`);
      for (const change of changes) {
        const equals = change.indexOf("=");
        const remove = equals < 0 && change.endsWith("-");
        const name = remove ? change.slice(0,-1) : change.slice(0,equals);
        if (!name || (equals < 0 && !remove)) throw new Error(`error: ${verb} update expects key=value or key-`);
        const previous = updated.metadata[key]![name];
        if (remove) delete updated.metadata[key]![name];
        else {
          const value = change.slice(equals+1);
          if (previous !== undefined && previous !== value && flag("--overwrite") !== "true")
            throw new Error(`error: '${name}' already has a value (${previous}), and --overwrite is false`);
          Object.defineProperty(updated.metadata[key]!,name,{value,writable:true,enumerable:true,configurable:true});
        }
      }
      // Send null for removals so the API removes the field rather than preserving it.
      const delta: Record<string, string | null> = {};
      for (const change of changes) {
        const equals = change.indexOf("="), name = equals < 0 ? change.slice(0,-1) : change.slice(0,equals);
        Object.defineProperty(delta,name,{value: equals < 0 ? null : change.slice(equals+1),enumerable:true});
      }
      const dryRun = flag("--dry-run") ?? "none";
      if (!["none", "client", "server"].includes(dryRun)) throw new Error("error: invalid --dry-run value");
      const output = flag("-o") ?? flag("--output");
      if (output && !["json","yaml","name"].includes(output)) throw new Error("simulation: metadata output supports json, yaml, or name");
      if (dryRun !== "client") updated = apiBody(kubeRequest({method:"PATCH",path:apiResourcePath(type,resourceTypes[type].namespaced ? namespace : undefined,name)+(dryRun === "server" ? "?dryRun=All" : ""),body:{metadata:{[key]:delta}},contentType:"application/merge-patch+json",impersonateUser:impersonate})) as Resource;
      return result(output === "json" ? printResourceJson(updated) : output === "yaml" ? stringify(updated) : identifier(updated)+(output === "name" ? "" : ` ${verb === "label" ? "labeled" : "annotated"}` + (dryRun === "server" ? " (server dry run)" : dryRun === "client" ? " (dry run)" : "")));
    }
    if (verb === "rollout" && args[1] === "restart" && type === "deployments") {
      updated = structuredClone(object);
      updated.spec!.template!.metadata ??= {};
      updated.spec!.template!.metadata.annotations = { ...updated.spec!.template!.metadata.annotations, "kubectl.kubernetes.io/restartedAt": new Date(clusterTime()).toISOString() };
      return result(writeObject(updated, "PATCH").replace(/ configured$/, " restarted"));
    }
    if (verb === "scale" && type === "deployments") {
      const replicas = Number(flag("--replicas"));
      if (!Number.isInteger(replicas) || replicas < 0 || replicas > 10)
        throw new Error("simulation: replicas must be 0–10");
      updated = mergePatch(object, { spec: { replicas } }) as Resource;
    } else if (verb === "set" && args[1] === "env" && type === "deployments") {
      updated = structuredClone(object);
      const assignments = args.slice(embeddedName ? 3 : 4);
      if (!assignments.length) throw new Error("error: set env requires assignments or NAME-");
      for (const container of updated.spec!.template!.spec.containers) {
        for (const assignment of assignments) {
          const equals = assignment.indexOf("=");
          const remove = equals < 0 && assignment.endsWith("-");
          const key = remove ? assignment.slice(0,-1) : assignment.slice(0,equals);
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || (equals < 0 && !remove)) throw new Error("error: invalid environment assignment");
          container.env = (container.env ?? []).filter(e => e.name !== key);
          if (!remove) container.env.push({name:key,value:assignment.slice(equals+1)});
        }
      }
      const dryRun = flag("--dry-run") ?? "none";
      if (!["none","client","server"].includes(dryRun)) throw new Error("error: invalid --dry-run value");
      if (dryRun !== "client") updated = apiBody(kubeRequest({method:"PATCH",path:apiResourcePath(type,namespace,name)+(dryRun === "server" ? "?dryRun=All" : ""),contentType:"application/strategic-merge-patch+json",impersonateUser:impersonate,body:{spec:{template:{spec:{containers:updated.spec!.template!.spec.containers.map(c=>({...c,env:[{$patch:"replace"},...(c.env ?? [])]}))}}}}})) as Resource;
      const output = flag("-o") ?? flag("--output");
      if (output && !["json","yaml","name"].includes(output)) throw new Error("simulation: environment output supports json, yaml, or name");
      return result(output === "json" ? printTypedResourceJson(updated) : output === "yaml" ? stringify(updated) : identifier(updated)+(output === "name" ? "" : " updated"+(dryRun === "server" ? " (server dry run)" : dryRun === "client" ? " (dry run)" : "")));
    } else if (
      verb === "set" &&
      args[1] === "image" &&
      type === "deployments"
    ) {
      updated = structuredClone(object);
      const assignment = args.at(-1)!.split("=");
      const target = updated.spec?.template?.spec.containers.find(
        (container) => container.name === assignment[0],
      );
      if (!target || !assignment[1])
        throw new Error("error: set image needs container=image");
      target.image = assignment[1];
    } else throw new Error(`simulation: ${verb} ${args[1]} is not implemented`);
    return result(writeObject(updated, "PATCH"));
  }
  if (verb === "logs") {
    rejectFlags(flags, ["-n", "--namespace"]);
    const [type, name] = (args[1] ?? "").split("/");
    const pod =
      type === "deployment"
        ? getResources("pods", namespace).find((item) =>
            item.metadata.name.startsWith(name + "-sim-"),
          )
        : getResources("pods", namespace, args[1])[0];
    if (!pod) throw new Error("error: no running Pod found");
    const status = (
      pod.status?.containerStatuses as
        { state?: { waiting?: { reason?: string } } }[] | undefined
    )?.[0];
    if (status?.state?.waiting?.reason === "ImagePullBackOff")
      return result(
        "Error from server (BadRequest): container is waiting to start: trying and failing to pull image",
        true,
      );
    return result(
      status?.state?.waiting
        ? "mkdir: cannot create directory /var/lib/app/data: Permission denied"
        : "INFO application started; listening on unprivileged port 8080",
    );
  }
  if (validOcCommand(raw) && S.cluster.user === "operator") return null;
  if (
    S.cluster.user === "operator" &&
    S.cluster.namespace === "default" &&
    !raw.includes("|")
  )
    return null;
  throw new Error(
    `simulation: oc ${verb} is not implemented; use oc --help or oc api-resources`,
  );
}

/** Returns null only when the preserved episode interpreter owns the command. */
export async function clusterCommand(raw: string): Promise<Result | null> {
  const tokens = tokenize(raw);
  if (!tokens.length) return null;
  const redirect = tokens.findIndex((token) => token.kind === "redirect");
  let destination: string | undefined,
    append = false;
  if (redirect >= 0) {
    if (
      redirect !== tokens.length - 2 ||
      tokens.at(-1)?.kind !== "word" ||
      tokens.slice(0, redirect).some((token) => token.kind === "redirect")
    )
      throw new Error(
        "shell: output redirection must end with > FILE or >> FILE",
      );
    destination = tokens.at(-1)!.value;
    append = tokens[redirect].value === ">>";
    tokens.splice(redirect);
  }
  const stages: string[][] = [[]];
  for (const token of tokens) {
    if (token.kind === "pipe") stages.push([]);
    else
      stages
        .at(-1)!
        .push(...(token.glob ? expandFileGlob(token.value) : [token.value]));
  }
  if (stages.some((stage) => !stage.length))
    throw new Error("shell: missing pipeline command");
  const first = stages[0];
  let response: Result | null;
  if (first[0] === "oc") {
    const source = stages.length === 1 && !destination ? raw : first.join(" ");
    response = await oc(first, source);
    if (!response && first[1] === "logs" && validOcCommand(source)) {
      if (!first.some((word) => word.includes("payment-api")))
        throw new Error(
          "simulation: select the payment-api Deployment for these logs",
        );
      if (!first.includes("payments"))
        throw new Error(
          'Error from server (NotFound): deployments.apps "payment-api" not found in namespace "default"',
        );
      const tail = source.match(/--tail(?:=|\s+)(\d+)/)?.[1];
      response = result(
        tail === undefined
          ? paymentLogs()
          : Number(tail)
            ? paymentLogs().split("\n").slice(-Number(tail)).join("\n")
            : "",
      );
    }
  } else if (first[0] === "roxctl") response = await roxctlCommand(first);
  else if (first[0] === "skopeo") response = await skopeoCommand(first);
  else if (first[0] === "podman") response = podmanCommand(first);
  else if (textTools.includes(first[0])) response = await textCommand(first);
  else if (first[0] === "man" && first.length === 2 && toolHelp[first[1]])
    response = { stdout: toolHelp[first[1]] + "\n", pager: "less" };
  else if (first[0] === "which" && first.length >= 2) {
    const supported = [
      ...textTools,
      "oc",
      "roxctl",
      "podman",
      "skopeo",
      "ls",
      "pwd",
      "mkdir",
      "history",
      "man",
    ];
    response = result(
      first
        .slice(1)
        .map((tool) =>
          supported.includes(tool)
            ? "/usr/bin/" + tool
            : `which: no ${tool} in simulated PATH`,
        )
        .join("\n"),
      first.slice(1).some((tool) => !supported.includes(tool)),
    );
  } else if (first[0] === "history" && first.length === 1)
    response = result(
      S.history
        .map((entry, index) => `${String(index + 1).padStart(5)}  ${entry}`)
        .join("\n"),
    );
  else if (first[0] === "pwd" && first.length === 1)
    response = result(S.cluster.cwd);
  else if (first[0] === "cd" && first.length <= 2) {
    if (stages.length > 1 || destination)
      throw new Error(
        "simulation: cd does not support pipelines or redirection",
      );
    response = result(changeDirectory(first[1]));
  } else if (first[0] === "ls") {
    const flags = first.slice(1).filter((word) => word.startsWith("-"));
    if (flags.some((flag) => !/^-[la]+$/.test(flag)))
      throw new Error("simulation: ls supports -l, -a and -la");
    const paths = first.slice(1).filter((word) => !word.startsWith("-"));
    if (paths.length > 1)
      throw new Error("simulation: ls accepts one directory at a time");
    response = result(
      listDirectory(
        paths[0],
        flags.some((flag) => flag.includes("l")),
        flags.some((flag) => flag.includes("a")),
      ),
    );
  } else if (first[0] === "mkdir") {
    const parents = first[1] === "-p",
      path = first[parents ? 2 : 1];
    if (
      !path ||
      first.length !== (parents ? 3 : 2) ||
      stages.length > 1 ||
      destination
    )
      throw new Error("simulation: mkdir [-p] <directory>");
    makeDirectory(path, parents);
    response = result("");
  } else {
    if (stages.length > 1 || destination)
      throw new Error(`${first[0]}: command not found. Type help.`);
    return null;
  }
  if (!response) {
    if (stages.length > 1 || destination)
      throw new Error(
        "simulation: this command has no pipeline output; use oc get ... -o json",
      );
    return null;
  }
  if (response.legacyCommand && (stages.length > 1 || destination))
    throw new Error(
      "simulation: this incident mutation must run as a standalone command",
    );
  for (const [index, stage] of stages.entries()) {
    if (!index) continue;
    if (!response.stdout && (response.stderr || (response.error && response.exitCode !== 1)))
      return response;
    if (response.pager)
      throw new Error("shell: more/less must be the final pipeline command");
    const filtered: Result | null = stage[0] === "podman" ? podmanCommand(stage, response.stdout) : stage[0] === "skopeo" ? await skopeoCommand(stage, response.stdout) : await textCommand(stage, response.stdout);
    if (!filtered)
      throw new Error(
        `simulation: pipeline tool ${stage[0]} is not implemented`,
      );
    response = {...filtered, stderr: (response.stderr??"")+(filtered.stderr??"")};
  }
  if (destination) {
    if (response.pager)
      throw new Error("shell: redirect the text before opening a pager");
    let previous = "";
    if (append) {
      try {
        previous = readFile(destination);
      } catch (error) {
        if (!(error as Error).message.includes("No such file")) throw error;
      }
    }
    writeVirtualFile(destination, previous + response.stdout);
    return {...response, stdout:""};
  }
  return response;
}

/** Shared source for direct logs and pipelines so cluster health/config changes remain visible. */
export function paymentLogs() {
  return `2026-10-08T02:13:44Z INFO payment-api: ready, listening on :8080\n2026-10-08T02:14:02Z ${S.env ? "WARN telemetry: POST https://203.0.113.77/upload (unexpected configured target)" : "INFO telemetry: external exporter disabled (config updated)"}\n2026-10-08T02:14:11Z ${S.policy === "deny" ? "ERROR ledger request failed: i/o timeout (egress blocked)" : "INFO ledger request completed: 200 OK"}\n2026-10-08T02:14:18Z ${S.policy === "deny" ? "ERROR checkout degraded: cannot resolve dependencies" : "INFO /healthz passed"}`;
}
