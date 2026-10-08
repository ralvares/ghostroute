import { parseAllDocuments, stringify } from "yaml";
import { S } from "../simulation/state.js";
import type { Resource, Scc } from "../simulation/cluster-model.js";
import {
  resourceTypes,
  resolveResource,
  getResources,
  applyResource,
  deleteResource,
  grantScc,
  restartDeployment,
  auditRequest,
} from "../simulation/cluster-api.js";
import { authorized, forbidden, roleAllows } from "../security/rbac.js";
import {
  readVirtualFile,
  workspacePath,
  changeDirectory,
  listDirectory,
  makeDirectory,
  writeVirtualFile,
} from "../simulation/filesystem.js";
import { policyFiles } from "../simulation/resources.js";
import { tokenize } from "./lexer.js";
import { runQuery } from "./query-tools.js";
import { validOcCommand } from "./syntax.js";

interface Result {
  stdout: string;
  error?: boolean;
  legacyCommand?: string;
}
const result = (stdout: string, error = false): Result => ({
  stdout: stdout && !stdout.endsWith("\n") ? stdout + "\n" : stdout,
  error,
});

function options(words: string[]) {
  const args: string[] = [],
    flags: Record<string, string[]> = {};
  for (let i = 0; i < words.length; i++) {
    const token = words[i];
    if (!token.startsWith("-")) {
      args.push(token);
      continue;
    }
    const equals = token.indexOf("=");
    const key = equals < 0 ? token : token.slice(0, equals);
    const boolean = ["-A", "--all-namespaces"].includes(key);
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

function field(value: unknown, path: string): unknown {
  return path
    .replace(/^\./, "")
    .split(".")
    .reduce<unknown>(
      (entry, key) =>
        entry && typeof entry === "object"
          ? (entry as Record<string, unknown>)[key]
          : undefined,
      value,
    );
}

async function oc(words: string[], raw: string): Promise<Result | null> {
  if (words.length === 1 || words[1] === "--help")
    return result(
      `OpenShift 4.22 OFFLINE cluster simulator\nResource operations: get, describe, create, apply, delete, patch, scale, run\nContext: project, new-project, whoami, login\nSecurity: auth can-i, adm policy add-scc-to-user/remove-scc-from-user\nInvestigation: -o json/yaml/go-template, jq, grep, sort, head, tail, wc\nFiles: cat lab.txt; ls workloads; ls scc; echo '<JSON>' > workloads/custom.json\nDiscovery: oc api-resources\nNot every oc subcommand/API field is implemented. Such cases report a simulator limitation; RBAC/admission errors are reserved for evaluated requests.`,
    );
  const { args, flags, flag } = options(words.slice(1));
  const namespace = flag("-n") ?? flag("--namespace") ?? S.cluster.namespace;
  const manifest = flag("-f") ?? flag("--filename");
  const canonical = manifest ? workspacePath(manifest) : undefined;
  if (
    args[0] === "apply" &&
    canonical &&
    Object.hasOwn(policyFiles, canonical)
  ) {
    if (
      Object.keys(flags).some((key) => !["-f", "--filename"].includes(key)) ||
      args.length !== 1
    )
      throw new Error(
        "simulation: incident policies use oc apply -f <file> without additional options",
      );
    return { stdout: "", legacyCommand: `oc apply -f ${canonical}` };
  }
  const verb = args[0];
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
  if (verb === "api-resources")
    return result(
      "NAME  APIVERSION  NAMESPACED  KIND\n" +
        Object.entries(resourceTypes)
          .map(
            ([name, definition]) =>
              `${name}  ${definition.apiVersion}  ${definition.namespaced}  ${definition.kind}`,
          )
          .join("\n"),
    );
  if (verb === "auth" && args[1] === "can-i") {
    rejectFlags(flags, ["-n", "--namespace", "--as"]);
    const [resource, resourceName] = (args[3] ?? "").split("/");
    const type = resolveResource(resource);
    if (!type || !args[2])
      throw new Error("error: specify a verb and a known resource");
    const identity = flag("--as");
    if (identity && S.cluster.user !== "platform-admin")
      throw new Error(
        `Error from server (Forbidden): users "${identity}" is forbidden: User "${S.cluster.user}" cannot impersonate resource "users" in API group "" at the cluster scope`,
      );
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
      args[2] !== "master-01" ||
      !["kube-apiserver/audit.log", "openshift-apiserver/audit.log"].includes(
        flag("--path") ?? "",
      )
    )
      throw new Error(
        "simulation: use master-01 --path=kube-apiserver/audit.log",
      );
    return result(auditText());
  }
  // Retain the episode's exact command responses and side effects when its
  // original operator/context is used. New output formats use the resource API.
  const original =
    validOcCommand(raw) &&
    ((verb === "apply" &&
      Object.hasOwn(policyFiles, flag("-f")?.replace(/^\.\//, "") ?? "")) ||
      (S.cluster.user === "operator" && S.cluster.namespace === "default") ||
      (namespace === "payments" &&
        (raw.includes("payment-api") ||
          raw.includes("networkpolic") ||
          raw.includes("netpol") ||
          raw.includes("policies/"))));
  if (
    original &&
    !["nodes", "node", "ns", "namespaces"].includes(args[1]) &&
    !["auth", "whoami"].includes(verb) &&
    !flag("-o")?.includes("json") &&
    !flag("-o")?.includes("template")
  )
    return null;

  if (verb === "get" || verb === "describe") {
    rejectFlags(flags, [
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
    ]);
    const [resourceName, embeddedName] = (args[1] ?? "").split("/");
    const type = resolveResource(resourceName);
    if (!type)
      throw new Error(
        `simulation: resource ${resourceName || "(missing)"} is not implemented`,
      );
    const name = args[2] ?? embeddedName;
    let items = getResources(
      type,
      resourceTypes[type].namespaced && !flag("-A") && !flag("--all-namespaces")
        ? namespace
        : undefined,
      name,
    );
    const selector = flag("-l") ?? flag("--selector");
    if (selector)
      items = items.filter((item) =>
        selector.split(",").every((part) => {
          const [key, value] = part.split("=");
          return value !== undefined && item.metadata.labels?.[key] === value;
        }),
      );
    const sort = flag("--sort-by");
    if (sort)
      items.sort((a, b) =>
        String(field(a, sort) ?? "").localeCompare(
          String(field(b, sort) ?? ""),
        ),
      );
    const object = name ? items[0] : { apiVersion: "v1", kind: "List", items };
    const output = flag("-o") ?? flag("--output");
    if (output === "json") return result(JSON.stringify(object, null, 2));
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
      return result(`No resources found in ${namespace} namespace.`);
    if (type === "events")
      return result(
        "TYPE  REASON  MESSAGE\n" +
          items
            .map((item) => `${item.type}  ${item.reason}  ${item.message}`)
            .join("\n"),
      );
    if (type === "deployments")
      return result(
        "NAME  READY  AVAILABLE\n" +
          items
            .map(
              (item) =>
                `${item.metadata.name}  ${item.status?.readyReplicas ?? 0}/${item.spec?.replicas ?? 1}  ${item.status?.availableReplicas ?? item.status?.readyReplicas ?? 0}`,
            )
            .join("\n"),
      );
    if (type === "pods")
      return result(
        "NAME  STATUS  SCC\n" +
          items
            .map((item) => {
              const statuses = item.status?.containerStatuses as
                { state?: { waiting?: { reason?: string } } }[] | undefined;
              return `${item.metadata.name}  ${statuses?.[0]?.state?.waiting?.reason ?? item.status?.phase ?? "Pending"}  ${item.metadata.annotations?.["openshift.io/scc"] ?? "<none>"}`;
            })
            .join("\n"),
      );
    return result(
      "NAME\n" + items.map((item) => item.metadata.name).join("\n"),
    );
  }
  if (verb === "create" || verb === "apply" || verb === "new-project") {
    rejectFlags(flags, [
      "-n",
      "--namespace",
      "-f",
      "--filename",
      "--image",
      "--from-literal",
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
        messages.push(applyResource(object, namespace, verb === "create"));
      }
      return result(messages.join("\n"));
    }
    const type =
      verb === "new-project" ? "namespaces" : resolveResource(args[1] ?? "");
    const name = verb === "new-project" ? args[1] : args[2];
    if (!type || !name)
      throw new Error("error: specify a resource and a name, or -f manifest");
    const definition = resourceTypes[type];
    const object: Resource = {
      apiVersion: definition.apiVersion,
      kind: definition.kind,
      metadata: { name },
    };
    if (type === "deployments") {
      if (!flag("--image")) throw new Error("error: --image is required");
      object.spec = {
        replicas: 1,
        template: { spec: { containers: [{ name, image: flag("--image")! }] } },
      };
    } else if (type === "configmaps") {
      const data: Record<string, string> = {};
      for (const literal of flags["--from-literal"] ?? []) {
        const equals = literal.indexOf("=");
        if (equals < 1)
          throw new Error("error: --from-literal expects key=value");
        data[literal.slice(0, equals)] = literal.slice(equals + 1);
      }
      object.data = data;
    } else if (!["namespaces", "serviceaccounts"].includes(type))
      throw new Error("simulation: use -f for this resource kind");
    const message = applyResource(object, namespace, true);
    if (verb === "new-project") S.cluster.namespace = name;
    return result(message);
  }
  if (verb === "run") {
    rejectFlags(flags, ["-n", "--namespace", "--image", "--overrides"]);
    if (!args[1] || !flag("--image"))
      throw new Error("error: specify a name and --image");
    let object: Resource = {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: args[1] },
      spec: { containers: [{ name: args[1], image: flag("--image")! }] },
    };
    if (flag("--overrides"))
      object = merge(object, JSON.parse(flag("--overrides")!)) as Resource;
    return result(applyResource(object, namespace, true));
  }
  if (["delete", "patch", "scale", "rollout", "set"].includes(verb)) {
    rejectFlags(flags, [
      "-n",
      "--namespace",
      "-p",
      "--patch",
      "--type",
      "--replicas",
    ]);
    const resourceToken =
      verb === "rollout" || verb === "set" ? args[2] : args[1];
    const [alias, embeddedName] = (resourceToken ?? "").split("/");
    const type = resolveResource(alias),
      name = embeddedName ?? args[verb === "rollout" || verb === "set" ? 3 : 2];
    if (!type || !name) throw new Error("error: specify a known resource/name");
    if (
      namespace === "payments" &&
      (name === "payment-api" || name.startsWith("payment-api-"))
    ) {
      if (validOcCommand(raw)) return null;
      throw new Error(
        "simulation: original payment-api mutations are implemented through oc set env and its two policy manifests",
      );
    }
    if (verb === "delete") return result(deleteResource(type, name, namespace));
    if (verb === "rollout" && args[1] === "restart" && type === "deployments")
      return result(restartDeployment(name, namespace));
    const object = getResources(
      type,
      resourceTypes[type].namespaced ? namespace : undefined,
      name,
    )[0];
    if (verb === "rollout" && args[1] === "status") {
      const ready = object.status?.readyReplicas ?? 0;
      return result(
        ready === (object.spec?.replicas ?? 1)
          ? `deployment "${name}" successfully rolled out`
          : `Waiting for deployment "${name}" rollout to finish: ${ready} of ${object.spec?.replicas ?? 1} updated replicas are available...\nInspect oc describe deployment ${name} and oc get events.`,
        ready !== (object.spec?.replicas ?? 1),
      );
    }
    let updated: Resource;
    if (verb === "patch") {
      if (flag("--type") && flag("--type") !== "merge")
        throw new Error("simulation: patch currently supports --type=merge");
      const patch = flag("-p") ?? flag("--patch");
      if (!patch) throw new Error("error: patch needs -p JSON");
      updated = merge(object, JSON.parse(patch)) as Resource;
    } else if (verb === "scale" && type === "deployments") {
      const replicas = Number(flag("--replicas"));
      if (!Number.isInteger(replicas) || replicas < 0 || replicas > 10)
        throw new Error("simulation: replicas must be 0–10");
      updated = merge(object, { spec: { replicas } }) as Resource;
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
    return result(applyResource(updated, namespace));
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

function merge(base: unknown, patch: unknown): unknown {
  if (!patch || typeof patch !== "object" || Array.isArray(patch))
    return structuredClone(patch);
  const output: Record<string, unknown> =
    base && typeof base === "object" && !Array.isArray(base)
      ? (structuredClone(base) as Record<string, unknown>)
      : {};
  for (const [key, value] of Object.entries(patch)) {
    if (["__proto__", "constructor", "prototype"].includes(key))
      throw new Error("error: invalid object key");
    if (value === null) delete output[key];
    else output[key] = merge(output[key], value);
  }
  return output;
}

/** Returns null only when the preserved episode interpreter owns the command. */
export async function clusterCommand(raw: string): Promise<Result | null> {
  const tokens = tokenize(raw);
  if (!tokens.length) return null;
  const redirect = tokens.findIndex((token) => token.kind === "redirect");
  if (redirect >= 0) {
    if (
      tokens[0].value !== "echo" ||
      redirect !== 2 ||
      tokens.length !== 4 ||
      tokens[1].kind !== "word" ||
      tokens[3].kind !== "word"
    )
      throw new Error("simulation: file writes use echo 'content' > path");
    writeVirtualFile(tokens[3].value, tokens[1].value + "\n");
    return result("");
  }
  const stages: string[][] = [[]];
  for (const token of tokens) {
    if (token.kind === "pipe") stages.push([]);
    else stages.at(-1)!.push(token.value);
  }
  if (stages.some((stage) => !stage.length))
    throw new Error("shell: missing pipeline command");
  const first = stages[0];
  let response: Result | null;
  if (first[0] === "oc") response = await oc(first, raw);
  else if (first[0] === "cat" && first.length >= 2)
    response = result(first.slice(1).map(readFile).join(""));
  else if (first[0] === "pwd" && first.length === 1)
    response = result(S.cluster.cwd);
  else if (first[0] === "cd" && first.length <= 2) {
    if (stages.length > 1)
      throw new Error("simulation: cd does not support pipelines");
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
    const parents = first[1] === "-p";
    const path = first[parents ? 2 : 1];
    if (!path || first.length !== (parents ? 3 : 2))
      throw new Error("simulation: mkdir [-p] <directory>");
    makeDirectory(path, parents);
    response = result("");
  } else return null;
  if (!response) {
    if (stages.length > 1)
      throw new Error(
        "simulation: this legacy command has no structured pipeline output; use oc get ... -o json",
      );
    return null;
  }
  if (response.error) return response;
  for (const stage of stages.slice(1)) {
    if (stage[0] === "jq") {
      const query = stage.at(-1)!;
      const flags = stage.slice(1, -1);
      if (
        !query ||
        stage.length < 2 ||
        flags.some(
          (flag) =>
            ![
              "-r",
              "-c",
              "-s",
              "-e",
              "-M",
              "--raw-output",
              "--compact-output",
              "--slurp",
            ].includes(flag),
        )
      )
        throw new Error(
          "simulation: jq needs a quoted query and optional -r/-c/-s/-e/-M flags",
        );
      const filtered = await runQuery("jq", response.stdout, query, flags);
      response = result(
        filtered.exitCode ? filtered.stderr : filtered.stdout,
        filtered.exitCode !== 0,
      );
    } else if (stage[0] === "grep") {
      const { args, flags } = options(stage.slice(1));
      rejectFlags(flags, []);
      if (args.length !== 1)
        throw new Error("simulation: grep expects one quoted literal pattern");
      response = result(
        response.stdout
          .split("\n")
          .filter((line) => line.includes(args[0]))
          .join("\n"),
      );
    } else if (["head", "tail"].includes(stage[0])) {
      const count = stage[1] === "-n" ? Number(stage[2]) : 10;
      if (!Number.isInteger(count) || count < 0 || count > 10000)
        throw new Error("error: invalid line count");
      const lines = response.stdout.trimEnd().split("\n");
      response = result(
        (stage[0] === "head"
          ? lines.slice(0, count)
          : count
            ? lines.slice(-count)
            : []
        ).join("\n"),
      );
    } else if (stage[0] === "sort" && stage.length === 1)
      response = result(
        response.stdout.trimEnd().split("\n").sort().join("\n"),
      );
    else if (stage[0] === "wc" && stage[1] === "-l" && stage.length === 2)
      response = result(String(response.stdout.match(/\n/g)?.length ?? 0));
    else
      throw new Error(
        `simulation: pipeline tool ${stage[0]} is not implemented`,
      );
    if (response.error) return response;
  }
  return response;
}
