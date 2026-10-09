import { S } from "../simulation/state.js";
import { getImage } from "../security/rhacs/images.js";
import { registryAuthorized } from "../security/registry.js";
import type { ToolResult } from "./text-tools.js";
export function podmanCommand(words: string[], stdin?: string): ToolResult {
  try {
    const action = words[1];
    if (!action || words.includes("--help"))
      return {
        stdout:
          "Podman CLI — authored offline registry operations\npodman login REGISTRY --username USER --password-stdin\npodman logout REGISTRY\npodman pull IMAGE\npodman push IMAGE\nBuild/process/container operations are not implemented. Catalog: rhacs/images/catalog.json\n",
        exitCode: 0,
      };
    if (action === "login") {
      let username: string | undefined,
        password: string | undefined,
        passwordStdin = false;
      const hosts: string[] = [];
      for (let i = 2; i < words.length; i++) {
        const w = words[i];
        if (["-u", "--username"].includes(w)) username = words[++i];
        else if (["-p", "--password"].includes(w)) password = words[++i];
        else if (w === "--password-stdin") passwordStdin = true;
        else if (w.startsWith("-"))
          throw new Error(
            `simulation: podman login option ${w} is not implemented`,
          );
        else hosts.push(w);
      }
      if (
        hosts.length !== 1 ||
        !username ||
        (passwordStdin && password !== undefined)
      )
        throw new Error(
          "simulation: use podman login REGISTRY --username USER --password-stdin",
        );
      if (passwordStdin) {
        if (stdin === undefined)
          throw new Error(
            "Must provide --username with --password-stdin and piped input",
          );
        password = stdin.replace(/\r?\n$/, "");
      }
      if (!registryAuthorized(hosts[0], username, password ?? "", "pull"))
        throw new Error(
          `Error: authenticating creds for "https://${hosts[0]}/v2/": unauthorized: authentication required`,
        );
      S.cluster.registry.sessions[hosts[0]] = { username, token: password! };
      return { stdout: "Login Succeeded\n", exitCode: 0 };
    }
    if (action === "logout" && words.length === 3) {
      delete S.cluster.registry.sessions[words[2]];
      return {
        stdout: `Removed login credentials for ${words[2]}\n`,
        exitCode: 0,
      };
    }
    if (["pull", "push"].includes(action) && words.length === 3) {
      const ref = words[2],
        host = ref.split("/")[0],
        auth = S.cluster.registry.sessions[host];
      const image = getImage(ref);
      if (
        (action === "push" || ref.includes("/private/")) &&
        (!auth ||
          !registryAuthorized(
            host,
            auth.username,
            auth.token,
            action as "pull" | "push",
          ))
      )
        throw new Error(
          action === "pull"
            ? "Error: initializing source: unauthorized: authentication required"
            : "denied: requested access to the resource is denied",
        );
      const list =
        action === "pull"
          ? S.cluster.registry.pulled
          : S.cluster.registry.pushed;
      if (!list.includes(ref)) list.push(ref);
      return {
        stdout:
          action === "pull"
            ? `Trying to pull ${ref}...\nGetting image source signatures\nWriting manifest to image destination\n${image.digest.slice(7)}\n`
            : "Getting image source signatures\nWriting manifest to image destination\n",
        exitCode: 0,
      };
    }
    throw new Error(`simulation: podman ${action} is not implemented`);
  } catch (e) {
    return {
      stdout: "",
      stderr: (e as Error).message + "\n",
      error: true,
      exitCode: 1,
    };
  }
}
