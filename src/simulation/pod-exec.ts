import {serviceBackends} from "../network/services.js";
import {consumerEnvironment, consumerFile} from "../security/secret-consumers.js";
import {networkPolicyDirection} from "../security/network-policy.js";
import {userNamespaceRange} from "./user-namespaces.js";
import { podNetworkDomain } from "./pod-addresses.js";
import { coreResources } from "./cluster-api.js";
import { S } from "./state.js";
import type { Resource } from "./cluster-model.js";
import { flow } from "../simulation/engine.js";

export interface PodExecOptions {
  command: string[];
  container?: string;
}
export interface PodExecResult {
  stdout: string;
  stderr?: string;
  exitCode: number;
  error?: boolean;
}
const failure = (stderr: string, exitCode = 1): PodExecResult => ({
  stdout: "",
  stderr,
  exitCode,
  error: true,
});

/** Diagnostics in the authored workload images; no process or network is launched. */
export function executePodFixture(
  pod: Resource,
  options: PodExecOptions,
): PodExecResult {
  const containers = pod.spec?.containers ?? [];
  const container = options.container
    ? containers.find((c) => c.name === options.container)
    : containers[0];
  if (!container)
    throw new Error(
      `Error from server (BadRequest): container ${options.container} is not valid for pod ${pod.metadata.name}`,
    );
  const status = (pod.status?.containerStatuses as any[])?.find(
    (c) => c.name === container.name,
  );
  if (!status?.ready)
    throw new Error(
      `Error from server (BadRequest): container ${container.name} is waiting to start: ${status?.state?.waiting?.reason ?? "container is not running"}`,
    );
  const words = options.command;
  if (words[0] === "env" && words.length === 1) return {stdout: Object.entries(consumerEnvironment(pod, container.name)).map(([key, value]) => key + "=" + value).join("\n") + "\n", exitCode: 0};
  if (words[0] === "cat" && words.length === 2) {
    const value = consumerFile(pod, container.name, words[1]);
    if (value !== undefined) return {stdout: value, exitCode: 0};
  }
  if(words.length===1&&["/bin/sh","sh"].includes(words[0]))return {stdout:"",exitCode:0};
  if (
    words.length === 1 &&
    words[0] === "id" &&
    container.securityContext?.runAsUser !== undefined
  )
    return {
      stdout: `uid=${container.securityContext?.runAsUser ?? 1000} gid=0(root) groups=0(root)\n`,
      exitCode: 0,
    };
  if(words[0]==="id"&&words.length===2&&words[1]==="-u") return {stdout:String(container.securityContext?.runAsUser??1000)+"\n",exitCode:0};
  if(words[0]==="cat"&&words.length===2&&["/proc/self/uid_map","/proc/self/gid_map"].includes(words[1])) {
    const isolated=pod.spec?.hostUsers===false;
    const hostBase=isolated?userNamespaceRange(pod):0;
    return {stdout:[0,hostBase,isolated?65536:4294967295].map(n=>String(n).padStart(10)).join(" ")+"\n",exitCode:0};
  }
  let host: string,
    port: number,
    head = false,
    curl = false;
  if (words[0] === "curl") {
    const args = words.slice(1);
    head = args[0] === "-I" || args[0] === "--head";
    if (head) args.shift();
    if (args.length !== 1)
      return failure(
        "simulation: Pod curl supports one HTTP URL and -I/--head",
        2,
      );
    let url: URL;
    try {
      url = new URL(args[0]);
    } catch {
      return failure("curl: (3) URL rejected: Malformed input", 3);
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return failure("simulation: this Pod curl URL is not supported", 2);
    if (!["/", "/health", "/healthz", "/upload"].includes(url.pathname))
      return failure(
        "simulation: this HTTP path is absent from the recorded workload",
        2,
      );
    host = url.hostname;
    port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
    curl = true;
  } else if (words[0] === "nc" && words[1] === "-zv" && words.length === 4) {
    host = words[2];
    port = Number(words[3]);
  } else
    return failure(
      `simulation: command ${words[0] ?? "(missing)"} is not implemented in this workload image; supported diagnostics: id, curl [-I] URL, nc -zv IP PORT`,
      127,
    );
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    return failure("error: invalid destination port", 2);
  const namespace=pod.metadata.namespace!;
  let backend: {pod:Resource;port:number}|undefined;
  const service=S.cluster.resources.find(r=>r.kind==='Service'&&(r.spec?.clusterIP===host||[r.metadata.name+(r.metadata.namespace===namespace?'':'.'+r.metadata.namespace),r.metadata.name+'.'+r.metadata.namespace,r.metadata.name+'.'+r.metadata.namespace+'.svc',r.metadata.name+'.'+r.metadata.namespace+'.svc.cluster.local'].includes(host)));
  if(service) {
    if(!/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      const dns:Resource={apiVersion:'v1',kind:'Pod',metadata:{name:'dns-endpoint',namespace:'openshift-dns',labels:{'dns.operator.openshift.io/daemonset-dns':'default'}}};
      if(networkPolicyDirection(S.cluster.resources,pod,dns,'egress',53,'UDP')===false)return failure('curl: (6) Could not resolve host: '+host,6);
    }
    if(service.spec?.type==='ExternalName')return failure('simulation: ExternalName DNS recursion is not implemented',2);
    const servicePort=service.spec?.ports?.find((p:any)=>p.port===port&&(p.protocol??'TCP')==='TCP');
    backend=servicePort?serviceBackends(service,S.cluster.resources,servicePort).find(b=>podNetworkDomain(b.pod)===podNetworkDomain(pod)):undefined;
    if(!backend)return failure(curl?`curl: (7) Failed to connect to ${host} port ${port}`:`nc: connect to ${host} port ${port} failed: Connection refused`,curl?7:1);
    port=backend.port;
  }
  const external = host === "203.0.113.77";
  if (!external && !service && !/^\d+\.\d+\.\d+\.\d+$/.test(host))
    return failure(
      "simulation: these tenant diagnostics use Pod IPs from oc get pods -o wide; service DNS resolution is not implemented here",
      2,
    );
  const addressMatches = [...S.cluster.resources, ...coreResources()].filter(
    (r) => r.kind === "Pod" && r.status?.podIP === host,
  );
  const target = external
    ? undefined
    : backend?.pod ?? (addressMatches.find(
        (r) => podNetworkDomain(r) === podNetworkDomain(pod),
      ) ?? addressMatches[0]);
  if (!external && !target)
    return failure(
      curl
        ? `curl: (7) Failed to connect to ${host} port ${port}`
        : `nc: connect to ${host} port ${port} failed: Connection refused`,
      curl ? 7 : 1,
    );
  if (
    !flow(
      namespace,
      pod.metadata.name,
      target?.metadata.name ?? "external",
      target?.metadata.namespace ?? namespace,
      external,
      port,
    )
  )
    return failure(
      curl
        ? `curl: (28) Failed to connect to ${host} port ${port}: Connection timed out`
        : `nc: connect to ${host} port ${port} failed: Connection timed out`,
      curl ? 28 : 1,
    );
  const targetContainer = target?.spec?.containers?.[0];
  const listenPort = Number(
    targetContainer?.env?.find((e) => e.name === "APP_PORT")?.value ??
      (target?.metadata.labels?.app === "ledger" ? 8443 : 8080),
  );
  if ((external && port !== 443) || (!external && port !== listenPort))
    return failure(
      curl
        ? `curl: (7) Failed to connect to ${host} port ${port}: Connection refused`
        : `nc: connect to ${host} port ${port} failed: Connection refused`,
      curl ? 7 : 1,
    );
  return {
    stdout: curl
      ? `HTTP/1.1 ${external ? "202 Accepted" : "200 OK"}\ncontent-type: application/json\n${head ? "" : '\n{"status":"healthy"}\n'}`
      : `Connection to ${host} ${port} port [tcp/*] succeeded!\n`,
    exitCode: 0,
  };
}
