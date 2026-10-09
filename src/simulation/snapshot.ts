import { operatorCrds } from "../operators/crds.js";
import { installedOperatorFixtures } from "../operators/installation.js";
import { secretCrds } from "../security/secret-crds.js";
import { createRuntime } from "../security/rhacs/runtime-state.js";
import { csiInstallationFixtures } from "../security/secret-consumers.js";
import {
  initialApplicationNetwork,
  reconcileServices,
} from "../network/services.js";
import { networkCrds } from "../network/crds.js";
import {
  bootstrapRbac,
  projectAdminBinding,
} from "../security/bootstrap-rbac.js";
import { createGitOpsState } from "../gitops/state.js";
import { gitopsCrds } from "../gitops/crds.js";
import { createTektonState } from "../release/state.js";
import { releaseCrds } from "../release/crds.js";
import { createRepository, validRepository } from "../release/repository.js";
import { getImage } from "../security/rhacs/images.js";
import { validCentral } from "../security/rhacs/types.js";
import { projectIncident } from "./incident-controller.js";
import { buildIncidentResources } from "./incident-resources.js";
import { normalizeSecret } from "./secrets.js";
import { repairDuplicatePodAddresses } from "./pod-addresses.js";
import { defaultSccs } from "./default-sccs.js";
import { makeState, type SimulationState } from "./state.js";
import { isScene } from "../world/scene-model.js";

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
  if (saved.data.cluster) {
    if (!saved.data.cluster.engineRevision) {
      saved.data.cluster.resources.push(...structuredClone(networkCrds));
      saved.data.cluster.engineRevision = 1;
    }
    if (
      !saved.data.cluster.resources?.some(
        (r: any) =>
          r.kind === "ClusterRole" && r.metadata.name === "cluster-admin",
      )
    ) {
      saved.data.cluster.resources.push(...bootstrapRbac());
      for (const namespace of saved.data.cluster.ownedNamespaces ?? [])
        if (
          namespace !== "payments" &&
          saved.data.cluster.resources.some(
            (r: any) => r.kind === "Namespace" && r.metadata.name === namespace,
          )
        )
          saved.data.cluster.resources.push(
            projectAdminBinding(namespace, "operator"),
          );
    }
    if (saved.data.cluster.engineRevision < 2) {
      for (const fixture of initialApplicationNetwork())
        if (
          !saved.data.cluster.resources.some(
            (r: any) =>
              r.kind === fixture.kind &&
              r.metadata.name === fixture.metadata.name &&
              r.metadata.namespace === fixture.metadata.namespace,
          )
        )
          saved.data.cluster.resources.push(fixture);
      reconcileServices(saved.data.cluster.resources);
      saved.data.cluster.engineRevision = 2;
    }
    saved.data.cluster.userNamespaces ??= { sequence: 0, allocations: {} };
    saved.data.cluster.clockOffsetMs ??= 0;
    saved.data.cluster.podRuntime ??= {};
    saved.data.cluster.externalSecrets ??= {};
    if (saved.data.cluster.engineRevision < 3) {
      for (const fixture of csiInstallationFixtures())
        if (
          !saved.data.cluster.resources.some(
            (r: any) =>
              r.kind === fixture.kind &&
              r.metadata.name === fixture.metadata.name,
          )
        )
          saved.data.cluster.resources.push(fixture);
      const capable = saved.data.cluster.resources.find(
        (r: any) => r.kind === "Node" && r.metadata.name === "worker-02",
      );
      if (capable) {
        capable.metadata.labels["feature.node.kubernetes.io/runtime.kata"] =
          "true";
        capable.status.runtimeHandlers = [
          { name: "kata", features: { userNamespaces: false } },
        ];
      }
      saved.data.cluster.engineRevision = 3;
    }
    if (saved.data.cluster.engineRevision < 4) {
      for (const crd of secretCrds)
        if (
          !saved.data.cluster.resources.some(
            (r: any) =>
              r.kind === "CustomResourceDefinition" &&
              r.metadata.name === crd.metadata.name,
          )
        )
          saved.data.cluster.resources.push(structuredClone(crd));
      saved.data.cluster.engineRevision = 4;
    }
    if (saved.data.cluster.engineRevision < 5) {
      for (const fixture of installedOperatorFixtures())
        if (
          !saved.data.cluster.resources.some(
            (r: any) =>
              r.kind === fixture.kind &&
              r.metadata.name === fixture.metadata.name &&
              r.metadata.namespace === fixture.metadata.namespace,
          )
        )
          saved.data.cluster.resources.push(fixture);
      for (const crd of operatorCrds) {
        const existing = saved.data.cluster.resources.find(
          (r: any) =>
            r.kind === "CustomResourceDefinition" &&
            r.metadata.name === crd.metadata.name,
        );
        if (existing)
          Object.assign(existing, structuredClone(crd), {
            metadata: { ...existing.metadata, ...crd.metadata },
          });
      }
      for (const profile of saved.data.cluster.resources.filter(
        (r: any) => r.kind === "TailoredProfile" && !r.spec && r.disableRules,
      )) {
        profile.spec = {
          title: profile.metadata.name,
          description: "Imported tailoring",
          extends: profile.extends,
          disableRules: profile.disableRules.map((r: any) => ({
            ...r,
            name:
              r.name === "usb-storage"
                ? "rhcos4-kernel-module-usb-storage-disabled"
                : r.name === "audit-enabled"
                  ? "rhcos4-service-auditd-enabled"
                  : r.name,
          })),
        };
        delete profile.extends;
        delete profile.disableRules;
      }
      saved.data.cluster.engineRevision = 5;
    }
    saved.data.cluster.incidentStored ??= false;
    saved.data.cluster.rhacs ??= makeState().cluster.rhacs;
    saved.data.cluster.rhacs.runtime ??= createRuntime();
    saved.data.cluster.registry ??= makeState().cluster.registry;
  }
  saved.data.incidentNetwork ??= { dns: true, ledger: true, external: true };
  if (saved.data.deployment) saved.data.deployment.desiredReplicas ??= 2;
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
  const upgrade422Resources =
    saved.data.cluster && !saved.data.cluster.policyRevision;
  if (upgrade422Resources) {
    saved.data.cluster.policyRevision = "4.22-a18571de";
    const defaults = new Set(defaultSccs.map((scc) => scc.metadata.name));
    saved.data.cluster.sccs = [
      ...structuredClone(defaultSccs),
      ...(saved.data.cluster.sccs ?? []).filter(
        (scc: any) => !defaults.has(scc.metadata.name),
      ),
    ];
    // Preserve the authored vendor exception scenario when upgrading the 4.22 policy fixture.
    for (const r of [
      ...(saved.data.cluster.resources ?? []),
      ...saved.data.cluster.sccs,
    ]) {
      if (
        r.kind === "SecurityContextConstraints" &&
        ["rs-vendor", "vendor-fixed-uid"].includes(r.metadata.name) &&
        r.runAsUser?.uid === 1001
      )
        r.runAsUser.uid = 100;
      const containers =
        r.kind === "Pod"
          ? r.spec?.containers
          : r.kind === "Deployment"
            ? r.spec?.template?.spec?.containers
            : [];
      for (const c of containers ?? [])
        if (
          c.image === "registry.example.test/vendor:fixed-uid" &&
          c.securityContext?.runAsUser === 1001
        )
          c.securityContext.runAsUser = 100;
    }
  }
  // Earlier saves retain their journey while acquiring the installed-operator discovery schemas.
  if (upgrade422Resources && saved.data.cluster?.resources)
    for (const fixture of makeState().cluster.resources.filter(
      (r) => r.kind === "CustomResourceDefinition",
    )) {
      if (
        !saved.data.cluster.resources.some(
          (r: any) =>
            r.kind === fixture.kind &&
            r.metadata.name === fixture.metadata.name,
        )
      )
        saved.data.cluster.resources.push(fixture);
    }
  if (saved.data.cluster) {
    const upgradeRelease = !saved.data.cluster.tekton,
      upgradeGitOps = !saved.data.cluster.gitops;
    saved.data.cluster.sourceRepository ??= createRepository();
    saved.data.cluster.tekton ??= createTektonState();
    saved.data.cluster.gitops ??= createGitOpsState();
    for (const crd of [
      ...(upgradeRelease ? releaseCrds : []),
      ...(upgradeGitOps ? gitopsCrds : []),
    ])
      if (
        !saved.data.cluster.resources.some(
          (r: any) => r.metadata?.name === crd.metadata.name,
        )
      )
        saved.data.cluster.resources.push(structuredClone(crd));
    if (!validRepository(saved.data.cluster.sourceRepository))
      throw new Error("Progress file contains invalid source repository data.");
  }
  // Version 1 saves made before filesystem navigation retain their incident.
  if (saved.data.cluster) {
    saved.data.cluster.apiStorage ??= makeState().cluster.apiStorage;
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
  // Upgrade only the previous authored owned-image identity, preserving player files and progress.
  const oldOwnedDigest = "sha256:" + "a".repeat(64);
  const ownedRef = "registry.example.test/owned:arbitrary-uid";
  const ownedDigest = getImage(ownedRef).digest;
  for (const resource of saved.data.cluster.resources ?? []) {
    const pod = resource.spec?.template?.spec ?? resource.spec;
    for (const container of pod?.containers ?? [])
      if (container.image === ownedRef + "@" + oldOwnedDigest)
        container.image = ownedRef + "@" + ownedDigest;
    if (
      resource.kind === "ConfigMap" &&
      resource.metadata.name === "attestation" &&
      resource.data?.issuer === "training-release" &&
      resource.data.digest === oldOwnedDigest
    )
      resource.data.digest = ownedDigest;
    if (
      resource.kind === "PipelineRun" &&
      resource.spec?.pipelineRef?.name === "secure-release"
    ) {
      const ref = resource.spec.params?.find(
        (p: any) => p.name === "image",
      )?.value;
      if (!ref || ref === ownedRef)
        for (const param of resource.spec.params ?? [])
          if (param.name === "digest" && param.value === oldOwnedDigest)
            param.value = ownedDigest;
    }
  }
  for (const [key, text] of Object.entries(saved.data.cluster.files ?? {}))
    if (
      typeof text === "string" &&
      (text.includes(ownedRef) || text.includes("training-release"))
    )
      saved.data.cluster.files[key] = text.replaceAll(
        oldOwnedDigest,
        ownedDigest,
      );
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
      ["maintenance-keycard", "worker-pass", "admin-access-key"].includes(item),
    ) ||
    !data.story.discoveries.every((item) =>
      [
        "keycard",
        "access",
        "audit",
        "release",
        "image",
        "boundary",
        "admin-key",
      ].includes(item),
    ) ||
    !["cluster", "soc"].includes(data.story.mira.scene) ||
    !isScene(data.world.scene) ||
    !data.world.visited.every(isScene) ||
    data.cluster.version !== "4.22" ||
    !validCentral(data.cluster.rhacs) ||
    !Object.values(data.cluster.registry.sessions).every(
      (s) => s && typeof s.username === "string" && typeof s.token === "string",
    ) ||
    ![...data.cluster.registry.pulled, ...data.cluster.registry.pushed].every(
      (s) => typeof s === "string",
    ) ||
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
  if (!state.cluster.incidentStored) {
    for (const seed of buildIncidentResources(state))
      if (
        !state.cluster.resources.some(
          (r) =>
            r.kind === seed.kind &&
            r.metadata.name === seed.metadata.name &&
            r.metadata.namespace === seed.metadata.namespace,
        )
      )
        state.cluster.resources.push(seed);
    state.cluster.incidentStored = true;
  }
  state.cluster.resources.forEach(normalizeSecret);
  repairDuplicatePodAddresses(state.cluster.resources);
  projectIncident(state, false);
  return state;
}
