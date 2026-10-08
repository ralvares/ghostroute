import { makeState, type SimulationState } from "./state.js";
import { isScene } from "../world/scene-model.js";
import { evaluateFindings } from "../security/findings.js";

const derived = new Set(["env", "podRev", "policy", "findings"]);
const clues = new Set(["rhacs", "trace", "logs", "env", "policy"]);
const setKeys = ["policies", "evidence", "checked", "verified"] as const;

/** Portable, versioned checkpoint. Computed values are rebuilt from source state. */
export function encodeProgress(state: SimulationState) {
  const data: Record<string, unknown> = Object.fromEntries(
    Object.entries(state).filter(([key]) => !derived.has(key)),
  );
  for (const key of setKeys) data[key] = [...state[key]];
  data.cluster = {
    ...state.cluster,
    ownedNamespaces: [...state.cluster.ownedNamespaces],
  };
  return JSON.stringify({ format: "roadshow-progress", version: 1, data });
}

function sameType(expected: unknown, value: unknown, path = ""): boolean {
  if (path === "deployment.env")
    return (
      !!value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.values(value).every((entry) => typeof entry === "string")
    );
  if (expected instanceof Set)
    return (
      value instanceof Set &&
      [...value].every((item) => typeof item === "string")
    );
  if (Array.isArray(expected)) return Array.isArray(value);
  if (expected && typeof expected === "object")
    return (
      !!value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.entries(expected).every(([key, entry]) =>
        sameType(
          entry,
          (value as Record<string, unknown>)[key],
          `${path}.${key}`,
        ),
      )
    );
  if (typeof expected === "number")
    return typeof value === "number" && Number.isFinite(value);
  return typeof value === typeof expected;
}

export function decodeProgress(text: string): SimulationState {
  if (text.length > 20_000_000)
    throw new Error("Progress file is too large (20 MB limit).");
  const saved = JSON.parse(text);
  if (
    !["roadshow-progress", "nexus-progress"].includes(saved?.format) ||
    saved.version !== 1 ||
    !saved.data
  )
    throw new Error("Unsupported progress file. Expected game save version 1.");
  saved.data.story ??= { inventory: [], discoveries: [] };
  saved.data.story.notes ??= "";
  saved.data.story.outageSeen ??= false;
  saved.data.story.mira ??= makeState().story.mira;
  saved.data.world ??= { scene: "district", visited: ["district"] };
  saved.data.campaign ??= makeState().campaign;
  if (!saved.data.campaign.diagnostics) {
    saved.data.campaign.diagnostics = {};
    const broken = saved.data.cluster?.resources?.find(
      (r: any) =>
        r.kind === "Pod" &&
        r.metadata.namespace === "rs-04" &&
        r.metadata.name === "broken",
    );
    if (broken)
      saved.data.campaign.diagnostics["rs-04"] = structuredClone(broken);
  }
  const legacyIncident = !saved.data.incident;
  saved.data.incident ??= makeState().incident;
  if (legacyIncident && saved.data.cluster?.resources)
    for (const fixture of makeState().cluster.resources.filter((r) =>
      ["release-bot", "build-bot"].includes(r.metadata.name),
    )) {
      if (
        !saved.data.cluster.resources.some(
          (r: any) =>
            r.kind === fixture.kind &&
            r.metadata.name === fixture.metadata.name &&
            r.metadata.namespace === fixture.metadata.namespace,
        )
      )
        saved.data.cluster.resources.push(fixture);
    }
  // Version 1 saves made before filesystem navigation retain their incident.
  if (saved.data.cluster) {
    saved.data.cluster.cwd ??= "/home/operator";
    saved.data.cluster.previousCwd ??= "/home/operator";
    saved.data.cluster.directories ??= [];
  }
  for (const [object, key] of [
    ...setKeys.map((key) => [saved.data, key]),
    [saved.data.cluster, "ownedNamespaces"],
  ]) {
    if (
      !object ||
      !Array.isArray(object[key]) ||
      !object[key].every((item: unknown) => typeof item === "string")
    )
      throw new Error("Progress file contains invalid simulation data.");
    object[key] = new Set(object[key]);
  }
  const state = makeState();
  const keys = Object.keys(state).filter((key) => !derived.has(key));
  if (
    !keys.every((key) =>
      sameType(state[key as keyof SimulationState], saved.data[key], key),
    )
  )
    throw new Error("Progress file is incomplete or damaged.");
  const data = saved.data as SimulationState;
  for (const resource of data.cluster.resources) {
    if (resource.kind === "Node" && resource.metadata.name === "master-01")
      resource.metadata.name = "control-01";
    if (resource.kind === "Pod" && resource.spec?.nodeName === "master-01")
      resource.spec.nodeName = "control-01";
  }
  for (const pod of data.pods)
    if (pod.node === "master-01") pod.node = "control-01";
  const campaign = data.campaign;
  if (
    !Number.isInteger(campaign.active) ||
    campaign.active < 0 ||
    campaign.active > 26 ||
    (campaign.active > 0 && !data.done) ||
    !campaign.completed.every((n, i) => n === i && Number.isInteger(n)) ||
    campaign.completed.length < campaign.active ||
    campaign.completed.length > campaign.active + 1 ||
    !campaign.interviews.every((w) =>
      ["rhea", "mira", "kai", "vale"].includes(w),
    ) ||
    !campaign.evidence.every((f) =>
      ["briefing.txt", "evidence.json", "handover.txt"].includes(f),
    ) ||
    !Object.values(campaign.proofs).every(
      (p) =>
        p &&
        typeof p.fingerprint === "string" &&
        typeof p.passed === "boolean" &&
        typeof p.detail === "string",
    ) ||
    !campaign.reports.every(
      (r) =>
        Number.isInteger(r.chapter) &&
        r.chapter > 0 &&
        r.chapter <= campaign.active &&
        typeof r.conclusion === "string" &&
        Number.isFinite(r.commands),
    ) ||
    (campaign.finished &&
      (campaign.active !== 26 || campaign.completed.length !== 27))
  )
    throw new Error("Progress file contains an invalid campaign checkpoint.");
  if (
    data.story.notes.length > 50000 ||
    !data.story.inventory.every((item) =>
      ["maintenance-keycard", "worker-pass"].includes(item),
    ) ||
    !data.story.discoveries.every((item) =>
      ["keycard", "access", "audit", "release", "image", "boundary"].includes(
        item,
      ),
    ) ||
    !["cluster", "soc"].includes(data.story.mira.scene) ||
    !isScene(data.world.scene) ||
    !data.world.visited.every(isScene) ||
    data.cluster.version !== "4.22" ||
    !["operator", "platform-admin"].includes(data.cluster.user) ||
    [...data.evidence].some((item) => !clues.has(item)) ||
    [...data.policies].some(
      (item) => !["default-deny-egress", "payment-egress"].includes(item),
    ) ||
    !Object.values(data.deployment.env).every(
      (value) => typeof value === "string",
    ) ||
    !Object.values(data.cluster.files).every(
      (value) => typeof value === "string",
    ) ||
    !data.cluster.directories.every(
      (item) => typeof item === "string" && item.startsWith("/home/operator/"),
    ) ||
    !data.cluster.cwd.startsWith("/") ||
    !data.cluster.previousCwd.startsWith("/") ||
    !data.history.every((item) => typeof item === "string") ||
    ![
      ...data.cluster.resources,
      ...data.cluster.sccs,
      ...data.cluster.events,
      ...Object.values(data.campaign.diagnostics),
    ].every(
      (item) =>
        item &&
        typeof item.apiVersion === "string" &&
        typeof item.kind === "string" &&
        typeof item.metadata?.name === "string",
    ) ||
    !data.pods.every(
      (item) =>
        typeof item.name === "string" &&
        typeof item.ready === "boolean" &&
        Number.isFinite(item.revision),
    ) ||
    !data.audit.every(
      (item) => typeof item.type === "string" && Number.isFinite(item.sequence),
    ) ||
    !data.cluster.audit.every(
      (item) =>
        item.kind === "Event" &&
        typeof item.user?.username === "string" &&
        Number.isFinite(item.responseStatus?.code),
    )
  )
    throw new Error("Progress file contains invalid simulation data.");
  for (const key of keys)
    Object.defineProperty(state, key, {
      value: data[key as keyof SimulationState],
      writable: true,
      enumerable: true,
      configurable: true,
    });
  state.x = Math.max(55, Math.min(1118, state.x));
  state.y = Math.max(105, Math.min(594, state.y));
  state.findings = evaluateFindings(state.env, state.policy);
  return state;
}
