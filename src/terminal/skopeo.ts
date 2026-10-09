import { S } from "../simulation/state.js";
import { getImage, imageAssets } from "../security/rhacs/images.js";
import { registryAuthorized } from "../security/registry.js";
import { readVirtualFile } from "../simulation/filesystem.js";
import { runQuery } from "./query-tools.js";
import { podmanCommand } from "./podman.js";
import type { ToolResult } from "./text-tools.js";

/** Inspect the same authored registry artifacts consumed by workloads and Central. */
export async function skopeoCommand(words: string[], stdin?: string): Promise<ToolResult> {
  try {
    const action = words[1];
    if (!action || words.includes("--help") || words.includes("-h"))
      return {
        stdout:
          "Skopeo — authored offline registry\nskopeo inspect [--config] [--no-tags] [--format TEMPLATE] [--creds USER:TOKEN | --authfile FILE] docker://IMAGE\nskopeo list-tags [--creds USER:TOKEN] docker://REPOSITORY\nskopeo login REGISTRY --username USER --password-stdin\nskopeo logout REGISTRY\nOther transports, raw OCI manifests and copy/signing are not implemented.\n",
        exitCode: 0,
      };
    if (action === "login" || action === "logout")
      return podmanCommand(["podman", ...words.slice(1)], stdin);
    if (!["inspect", "list-tags"].includes(action))
      throw new Error(`simulation: skopeo ${action} is not implemented`);
    let config = false,
      noTags = false,
      noCreds = false,
      format: string | undefined,
      creds: string | undefined,
      authfile: string | undefined;
    const positional: string[] = [];
    for (let i = 2; i < words.length; i++) {
      const [flag, inline] = words[i].split(/=(.*)/s);
      const value = () => {
        const v = inline ?? words[++i];
        if (v === undefined) throw new Error(`flag needs an argument: ${flag}`);
        return v;
      };
      if (flag === "--config") config = true;
      else if (["--no-tags", "-n"].includes(flag)) noTags = true;
      else if (flag === "--no-creds") noCreds = true;
      else if (["--format", "-f"].includes(flag)) format = value();
      else if (flag === "--creds") creds = value();
      else if (flag === "--authfile") authfile = value();
      else if (flag.startsWith("-"))
        throw new Error(
          `simulation: skopeo ${action} option ${flag} is not implemented`,
        );
      else positional.push(words[i]);
    }
    if (positional.length !== 1 || !positional[0].startsWith("docker://"))
      throw new Error(
        "simulation: skopeo requires one authored docker:// registry reference",
      );
    if (action === "list-tags" && (config || format || noTags))
      throw new Error(
        "simulation: inspect options are not supported by skopeo list-tags",
      );
    if (noCreds && (creds || authfile))
      throw new Error("--no-creds cannot be combined with credentials");
    const ref = positional[0].slice(9),
      host = ref.split("/")[0];
    let auth = noCreds ? undefined : S.cluster.registry.sessions[host];
    if (creds) {
      const colon = creds.indexOf(":");
      auth = { username: creds.slice(0, colon), token: creds.slice(colon + 1) };
    }
    if (authfile) {
      const encoded = JSON.parse(readVirtualFile(authfile)).auths?.[host]?.auth;
      if (!encoded) auth = undefined;
      else {
        const raw = new TextDecoder().decode(
            Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)),
          ),
          colon = raw.indexOf(":");
        auth = { username: raw.slice(0, colon), token: raw.slice(colon + 1) };
      }
    }
    if (
      (ref.includes("/private/") || creds || authfile) &&
      (!auth || !registryAuthorized(host, auth.username, auth.token, "pull"))
    )
      throw new Error(
        `Error: reading image ${positional[0]}: unauthorized: authentication required`,
      );
    let result: any;
    if (action === "list-tags") {
      const tags = imageAssets
        .filter((a) => a.ref.slice(0, a.ref.lastIndexOf(":")) === ref)
        .map((a) => a.ref.slice(a.ref.lastIndexOf(":") + 1));
      if (!tags.length)
        throw new Error(`simulation: no authored repository ${ref}`);
      result = { Repository: ref, Tags: tags };
    } else {
      const image = getImage(ref),
        name = image.ref.slice(0, image.ref.lastIndexOf(":"));
      result = config
        ? {
            created: image.created,
            architecture: "amd64",
            os: "linux",
            config: { User: image.user, Labels: image.labels },
            rootfs: { type: "layers", diff_ids: [] },
          }
        : {
            Name: name,
            Digest: image.digest,
            RepoTags: noTags
              ? []
              : imageAssets
                  .filter(
                    (a) => a.ref.slice(0, a.ref.lastIndexOf(":")) === name,
                  )
                  .map((a) => a.ref.slice(a.ref.lastIndexOf(":") + 1)),
            Created: image.created,
            DockerVersion: "",
            Labels: image.labels,
            Architecture: "amd64",
            Os: "linux",
            Layers: [],
            LayersData: [],
            Env: [],
          };
    }
    if (format)
      return await runQuery("template", JSON.stringify(result), format);
    return { stdout: JSON.stringify(result, null, 4) + "\n", exitCode: 0 };
  } catch (e) {
    return {
      stdout: "",
      stderr: (e as Error).message + "\n",
      exitCode: 1,
      error: true,
    };
  }
}
