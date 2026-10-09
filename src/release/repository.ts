import {
  sourceFiles,
  repairedPom,
  seedRevision,
  seedTimestamp,
  repositoryUrl,
  seedTree,
} from "./source-fixture.js";
export interface SourceCommit {
  sha: string;
  tree: string;
  parent?: string;
  message: string;
  timestamp: number;
  files: Record<string, string>;
}
export function createRepository() {
  return {
    url: repositoryUrl,
    root: "",
    branch: "main",
    head: seedRevision,
    remoteHead: seedRevision,
    index: {} as Record<string, string>,
    commits: {
      [seedRevision]: {
        sha: seedRevision,
        tree: seedTree,
        message: "Release payment-api 1.8.2",
        timestamp: seedTimestamp,
        files: structuredClone(sourceFiles),
      },
    } as Record<string, SourceCommit>,
    sequence: 0,
  };
}
export type SourceRepository = ReturnType<typeof createRepository>;
export function sourceArtifact(commit: SourceCommit) {
  for (const name of [
    "Containerfile",
    "src/main/java/training/PaymentApi.java",
  ])
    if (commit.files[name] !== sourceFiles[name])
      throw new Error(
        "simulation: changed source or Containerfile has no authored build/scan asset",
      );
  const pom = commit.files["pom.xml"] ?? "";
  if (
    (pom !== sourceFiles["pom.xml"] && pom !== repairedPom) ||
    Object.keys(commit.files).some(
      (k) => !(k in sourceFiles) && !/^deploy\/[^/]+\.ya?ml$/.test(k),
    )
  )
    throw new Error("simulation: revision has no authored build/scan asset");
  const version = pom.match(/<log4j.version>([^<]+)<\/log4j.version>/)?.[1];
  const release = pom.match(
    /<artifactId>payment-api<\/artifactId><version>([^<]+)<\/version>/,
  )?.[1];
  if (
    (version === "2.14.1" && release === "1.8.2") ||
    (version === "2.17.1" && release === "1.8.3")
  )
    return "registry.example.test/payments:v" + release;
  throw new Error(
    "simulation: source revision does not match an authored build/scan asset; no successful build or clean scan can be inferred",
  );
}
export function resolveRemote(
  repo: SourceRepository,
  revision: string,
): SourceCommit {
  const requested = revision === "main" ? repo.remoteHead : revision;
  let sha: string | undefined = repo.remoteHead;
  while (sha) {
    const commit: SourceCommit = repo.commits[sha];
    if (sha === requested) return commit;
    sha = commit.parent;
  }
  throw new Error(`fatal: couldn't find remote ref ${revision}`);
}
export function validRepository(repo: SourceRepository) {
  return (
    !!repo &&
    repo.url === repositoryUrl &&
    typeof repo.root === "string" &&
    repo.branch === "main" &&
    Number.isInteger(repo.sequence) &&
    repo.index &&
    typeof repo.index === "object" &&
    Object.values(repo.index).every((v) => typeof v === "string") &&
    Object.values(repo.commits ?? {}).every(
      (c) =>
        c &&
        /^[0-9a-f]{40}$/.test(c.sha) &&
        /^[0-9a-f]{40}$/.test(c.tree) &&
        typeof c.message === "string" &&
        Number.isInteger(c.timestamp) &&
        c.files &&
        Object.values(c.files).every((v) => typeof v === "string"),
    ) &&
    !!repo.commits[repo.head] &&
    !!repo.commits[repo.remoteHead]
  );
}
