import type { Resource } from "../simulation/cluster-model.js";
import type { Chapter, Goal, Probe, Witness } from "./types.js";
import type { SceneId } from "../world/scene-model.js";

const image = "registry.example.test/owned:arbitrary-uid";
const security = {
  allowPrivilegeEscalation: false,
  capabilities: { drop: ["ALL"] },
  seccompProfile: { type: "RuntimeDefault" },
};
export const object = (
  kind: string,
  name: string,
  body: Record<string, unknown> = {},
  apiVersion = "v1",
): Resource => ({ apiVersion, kind, metadata: { name }, ...body });
export const workload = (
  name = "app",
  extra: Record<string, unknown> = {},
  container: Record<string, unknown> = {},
): Resource =>
  object("Pod", name, {
    metadata: { name, labels: { app: name } },
    spec: {
      containers: [{ name, image, securityContext: security, ...container }],
      ...extra,
    },
  });
const cm = (name: string, data: Record<string, string>) =>
  object("ConfigMap", name, { data });
const goal = (
  label: string,
  kind: string,
  name: string,
  path: string,
  value: unknown,
): Goal => ({ label, kind, name, path, value });
const probe = (
  id: string,
  label: string,
  model: string,
  expected = true,
): Probe => ({ id, label, model, expected });
const net = (name: string, spec: Record<string, unknown>) =>
  object("NetworkPolicy", name, { spec }, "networking.k8s.io/v1");
const deny = () =>
  net("isolate", { podSelector: {}, policyTypes: ["Ingress", "Egress"] });
const allow = () =>
  net("service-path", {
    podSelector: { matchLabels: { app: "client" } },
    policyTypes: ["Egress"],
    egress: [
      {
        to: [{ podSelector: { matchLabels: { app: "server" } } }],
        ports: [{ protocol: "TCP", port: 8443 }],
      },
    ],
  });
const inbound = () =>
  net("server-ingress", {
    podSelector: { matchLabels: { app: "server" } },
    policyTypes: ["Ingress"],
    ingress: [
      {
        from: [{ podSelector: { matchLabels: { app: "client" } } }],
        ports: [{ protocol: "TCP", port: 8443 }],
      },
    ],
  });
const role = (name: string, verbs: string[], resources: string[]) =>
  object(
    "Role",
    name,
    { rules: [{ apiGroups: [""], verbs, resources }] },
    "rbac.authorization.k8s.io/v1",
  );
const binding = (name: string, roleName: string) =>
  object(
    "RoleBinding",
    name,
    {
      subjects: [{ kind: "User", name: "case-reader" }],
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "Role",
        name: roleName,
      },
    },
    "rbac.authorization.k8s.io/v1",
  );
const cr = (
  kind: string,
  name: string,
  apiVersion: string,
  spec: Record<string, unknown>,
) => object(kind, name, { spec }, apiVersion);
const witnessScene: Record<Witness, SceneId> = {
  rhea: "soc",
  mira: "cluster",
  kai: "operations",
  vale: "archive",
};
interface Draft {
  title: string;
  act: string;
  district: string;
  sources: string[];
  hook: string;
  reveal: string;
  voices: [Witness, string, Witness, string];
  artifact: string;
  files: Record<string, Resource | string>;
  seed?: Resource[];
  goals: Goal[];
  probes: Probe[];
  conclusion: string;
  risk: string;
}
function chapter(d: Draft, index: number): Chapter {
  const namespace = "rs-" + String(index + 1).padStart(2, "0");
  return {
    id: String(index + 1).padStart(2, "0"),
    title: d.title,
    act: d.act,
    district: d.district,
    namespace,
    hook: d.hook,
    reveal: d.reveal,
    outcome: d.reveal,
    sources: d.sources,
    witnesses: [
      { who: d.voices[0], scene: witnessScene[d.voices[0]], text: d.voices[1] },
      { who: d.voices[2], scene: witnessScene[d.voices[2]], text: d.voices[3] },
    ],
    artifact: { scene: "archive", title: d.artifact, text: d.reveal },
    files: d.files,
    seed: d.seed ?? [],
    goals: d.goals,
    probes: d.probes,
    conclusion: d.conclusion,
    risk: d.risk,
  };
}
const accessRole = role("handover", ["get", "list"], ["configmaps"]);
const secureRoute = cr("Route", "front-door", "route.openshift.io/v1", {
  to: { kind: "Service", name: "app" },
  tls: { termination: "edge", insecureEdgeTerminationPolicy: "Redirect" },
});
const budget = object("ResourceQuota", "budget", {
  spec: {
    hard: { pods: "2", "requests.cpu": "500m", "limits.memory": "512Mi" },
  },
});
const limits = object("LimitRange", "defaults", {
  spec: {
    limits: [
      {
        type: "Container",
        default: { cpu: "250m", memory: "128Mi" },
        defaultRequest: { cpu: "100m", memory: "64Mi" },
        max: { cpu: "500m", memory: "256Mi" },
      },
    ],
  },
});
const sec = object("Secret", "database", {
  type: "Opaque",
  stringData: { password: "training-v2" },
});
const secretPod = workload(
  "app",
  { volumes: [{ name: "database", secret: { secretName: "database" } }] },
  {
    env: [
      {
        name: "DB_PASSWORD",
        valueFrom: { secretKeyRef: { name: "database", key: "password" } },
      },
    ],
    volumeMounts: [
      { name: "database", mountPath: "/run/secrets", readOnly: true },
    ],
  },
);
const anp = cr(
  "AdminNetworkPolicy",
  "rs-external-guard",
  "policy.networking.k8s.io/v1alpha1",
  {
    priority: 10,
    subject: { namespaces: { matchLabels: { "roadshow.zone": "regulated" } } },
    egress: [{ action: "Deny", to: [{ networks: ["203.0.113.0/24"] }] }],
  },
);
const banp = cr(
  "BaselineAdminNetworkPolicy",
  "default",
  "policy.networking.k8s.io/v1alpha1",
  {
    subject: { namespaces: { matchLabels: { "roadshow.zone": "regulated" } } },
    egress: [{ action: "Deny", to: [{ networks: ["0.0.0.0/0"] }] }],
  },
);
const fixedScc = object(
  "SecurityContextConstraints",
  "rs-vendor",
  {
    allowHostDirVolumePlugin: false,
    allowHostNetwork: false,
    allowHostPID: false,
    allowHostIPC: false,
    allowPrivilegedContainer: false,
    allowPrivilegeEscalation: false,
    runAsUser: { type: "MustRunAs", uid: 1001 },
    requiredDropCapabilities: ["ALL"],
    allowedCapabilities: [],
    userNamespaceLevel: "RequirePodLevel",
    seccompProfiles: ["runtime/default"],
  },
  "security.openshift.io/v1",
);
const vendor = object(
  "Deployment",
  "vendor",
  {
    spec: {
      replicas: 1,
      template: {
        spec: {
          serviceAccountName: "vendor",
          containers: [
            {
              name: "vendor",
              image: "registry.example.test/vendor:fixed-uid",
              securityContext: { ...security, runAsUser: 1001 },
            },
          ],
        },
      },
    },
  },
  "apps/v1",
);
const signature = cm("attestation", {
  digest: "sha256:" + "a".repeat(64),
  issuer: "training-release",
  scanHigh: "0",
  signed: "true",
});
const drafts: Draft[] = [
  {
    title: "The Borrowed Image",
    act: "I · The district wakes",
    district: "Foundry",
    sources: ["labs/basic/b1.adoc", "labs/basic/b9.adoc"],
    hook: "Kai's emergency replacement starts on his laptop and dies in the workshop. The shipping clock is running. Someone suggests giving it root.",
    reveal:
      "The image expects ownership it does not have. Rebuilding for an arbitrary UID solves the application problem without weakening the platform.",
    voices: [
      "kai",
      "I own this image. Before you ask Mira for an exception, read its permissions and the secure Dockerfile.",
      "mira",
      "A green deployment request is not a running application. Inspect the Pod, its SCC and its logs.",
    ],
    artifact: "Rejected workshop release",
    files: {
      "app.yaml": workload(),
      "root.yaml": workload(
        "unsafe",
        {},
        { securityContext: { runAsUser: 0 } },
      ),
      "build-note.txt":
        "The owned source is available. Writable directory must use group 0 permissions; serve on 8080. The supplied rebuilt fixture supports arbitrary UIDs.",
    },
    goals: [
      goal(
        "Run the rebuilt app under restricted-v3",
        "Pod",
        "app",
        "metadata.annotations.openshift.io/scc",
        "restricted-v3",
      ),
    ],
    probes: [
      probe("start", "Application starts without a fixed UID", "owned-ready"),
      probe("root", "UID 0 remains rejected", "root-rejected"),
    ],
    conclusion: "repair-owned",
    risk: "An unnecessary root exception becomes a future entry point.",
  },
  {
    title: "The Door That Opens Twice",
    act: "I · The district wakes",
    district: "Foundry",
    sources: ["labs/basic/b2.adoc", "labs/intermediate/i2.adoc"],
    hook: "A maintenance identity can read its own settings and somebody else's secrets. The stolen build-bot trail leads to a permission handover nobody reviewed.",
    reveal:
      "The handover needs ConfigMap reads, not secret access, writes or cluster administration.",
    voices: [
      "vale",
      "The subject named case-reader is a training identity. Test the actual binding, not the job title.",
      "mira",
      "Use a Role scoped to this tenant. An admin credential may create the binding, but it is not the application identity.",
    ],
    artifact: "Unsigned access handover",
    files: {
      "role.yaml": accessRole,
      "binding.yaml": binding("handover", "handover"),
      "settings.yaml": cm("settings", { mode: "production" }),
    },
    goals: [
      goal(
        "Create the bounded read Role",
        "Role",
        "handover",
        "rules",
        accessRole.rules,
      ),
      goal(
        "Bind only the intended subject",
        "RoleBinding",
        "handover",
        "subjects",
        [{ kind: "User", name: "case-reader" }],
      ),
    ],
    probes: [
      probe("read", "ConfigMap read is allowed", "reader-allowed"),
      probe("secret", "Secret read remains denied", "reader-secret-denied"),
    ],
    conclusion: "least-privilege",
    risk: "A title is not an authorization boundary.",
  },
  {
    title: "Permission Denied",
    act: "I · The district wakes",
    district: "Foundry",
    sources: ["labs/basic/b3.adoc", "labs/basic/b9.adoc"],
    hook: "An operator removed UID 0 and called the application secure. Admission succeeds; the process still cannot write. Kai needs evidence before changing another setting.",
    reveal:
      "Admission checks the requested security context. The process also needs a compatible image and filesystem permissions.",
    voices: [
      "kai",
      "The root-oriented image can be admitted with an allocated UID and still crash. Read logs before blaming the SCC.",
      "rhea",
      "Find the difference between rejected admission and an admitted process that fails. They leave different evidence.",
    ],
    artifact: "Two different failures",
    files: {
      "broken.yaml": workload(
        "broken",
        {},
        { image: "registry.example.test/owned:root" },
      ),
      "app.yaml": workload(),
      "diagnosis.txt":
        "Compare: oc describe pod broken; oc logs broken. Runtime permissions fail after successful SCC admission. Keep the platform defaults.",
    },
    seed: [
      workload("broken", {}, { image: "registry.example.test/owned:root" }),
    ],
    goals: [
      goal(
        "Deploy the compatible replacement",
        "Pod",
        "app",
        "spec.containers.0.image",
        image,
      ),
    ],
    probes: [
      probe(
        "diagnose",
        "Retain evidence of runtime failure",
        "runtime-distinction",
      ),
      probe("start", "Replacement starts", "owned-ready"),
    ],
    conclusion: "runtime-repair",
    risk: "Granting anyuid masks an application defect.",
  },
  {
    title: "The Vendor's Locked Box",
    act: "I · The district wakes",
    district: "Foundry",
    sources: ["labs/basic/b3.adoc", "labs/intermediate/i3.adoc"],
    hook: "A third-party gateway is essential tonight. Its source is unavailable and it requires UID 1001. Mira refuses to turn every tenant into an exception.",
    reveal:
      "A dedicated vendor identity and a fixed-UID custom SCC contain this exception. Its owner and expiry must survive the incident.",
    voices: [
      "mira",
      "Use a dedicated service account. anyuid is broader than this box needs. Never edit the default SCC.",
      "vale",
      "The exception must have a reason, an owner and an expiry. A temporary workaround without a record is permanent.",
    ],
    artifact: "Vendor support contract",
    files: {
      "vendor.yaml": vendor,
      "identity.yaml": object("ServiceAccount", "vendor"),
      "scc.yaml": fixedScc,
      "exception.yaml": cm("exception", {
        owner: "Mira",
        reason: "Immutable vendor UID 1001",
        expires: "2026-10-15",
        scope: "vendor-only",
      }),
    },
    seed: [object("ServiceAccount", "vendor"), vendor],
    goals: [
      goal(
        "Record an expiry and owner",
        "ConfigMap",
        "exception",
        "data.scope",
        "vendor-only",
      ),
      goal(
        "Run vendor with its narrow SCC",
        "Pod",
        "vendor-sim-0",
        "metadata.annotations.openshift.io/scc",
        "rs-vendor",
      ),
    ],
    probes: [
      probe("run", "Vendor runs as UID 1001", "vendor-ready"),
      probe(
        "other",
        "Default identity cannot use the exception",
        "vendor-isolated",
      ),
    ],
    conclusion: "bounded-exception",
    risk: "A cluster-wide exception outlives the incident it was created for.",
  },
  {
    title: "The Hungry Tenant",
    act: "II · What the city consumes",
    district: "Market",
    sources: ["labs/basic/b3a.adoc"],
    hook: "Checkout recovered, but a neighboring tenant is consuming the building's resources. Nobody agreed what a room could request.",
    reveal:
      "LimitRange defaults individual containers; ResourceQuota bounds aggregate namespace consumption. Neither substitutes for SCC.",
    voices: [
      "mira",
      "Default missing requests and limits. Then stop the tenant from exceeding its total budget.",
      "kai",
      "A single container within its limit can still be part of a deployment that exceeds the namespace quota.",
    ],
    artifact: "Capacity allocation ledger",
    files: {
      "limits.yaml": limits,
      "quota.yaml": budget,
      "app.yaml": workload(),
      "oversized.yaml": workload(
        "oversized",
        {},
        {
          resources: {
            requests: { cpu: "900m", memory: "64Mi" },
            limits: { cpu: "1", memory: "1Gi" },
          },
        },
      ),
    },
    goals: [
      goal(
        "Set the aggregate Pod budget",
        "ResourceQuota",
        "budget",
        "spec.hard.pods",
        "2",
      ),
      goal(
        "Default each container request",
        "LimitRange",
        "defaults",
        "spec.limits.0.defaultRequest.cpu",
        "100m",
      ),
      goal(
        "Admit an app with defaulted resources",
        "Pod",
        "app",
        "spec.containers.0.resources.requests.cpu",
        "100m",
      ),
    ],
    probes: [
      probe("fit", "Normal workload fits", "budget-fit"),
      probe("overflow", "Oversized workload is denied", "budget-denied"),
    ],
    conclusion: "bound-consumption",
    risk: "Per-container limits alone leave aggregate consumption uncontrolled.",
  },
  {
    title: "The Password in the Window",
    act: "II · What the city consumes",
    district: "Market",
    sources: ["labs/basic/b5.adoc"],
    hook: "Vale finds a password in a handover screenshot. The credential is already exposed. Moving it to a Secret will not make the old value safe.",
    reveal:
      "The leaked credential is retired. Secret references remove literals; mounted projections can update, while environment variables require a new container start.",
    voices: [
      "vale",
      "The training password is synthetic. Preserve evidence of the leak, but do not copy it into your report.",
      "kai",
      "The running environment is a snapshot. Rotate the Secret and recreate the consumer. A mounted file has different update behavior.",
    ],
    artifact: "Redacted handover screenshot",
    files: {
      "secret.yaml": sec,
      "consumer.yaml": secretPod,
      "rotation.txt":
        "Training v1 is retired. Apply v2, recreate the consumer, and test both consumption and old-credential retirement.",
    },
    seed: [
      object("Secret", "database", { stringData: { password: "training-v1" } }),
    ],
    goals: [
      goal(
        "Rotate the synthetic credential",
        "Secret",
        "database",
        "stringData.password",
        "training-v2",
      ),
      goal(
        "Reference the Secret instead of a literal",
        "Pod",
        "app",
        "spec.containers.0.env.0.valueFrom.secretKeyRef.name",
        "database",
      ),
    ],
    probes: [
      probe("consume", "New consumer sees v2", "secret-current"),
      probe("retire", "Old value is retired", "secret-retired"),
    ],
    conclusion: "rotate-and-restart",
    risk: "Encoding a Secret is not encryption; moving a leaked credential does not rotate it.",
  },
  {
    title: "The Glass Front Door",
    act: "II · What the city consumes",
    district: "Market",
    sources: ["labs/basic/b10.adoc"],
    hook: "Customers reach the recovered application over plain HTTP. Mira spots credentials crossing a boundary the team forgot to draw.",
    reveal:
      "The edge Route redirects HTTP and terminates TLS. Router-to-service encryption is a separate decision; edge termination does not provide it.",
    voices: [
      "mira",
      "Redirect the public HTTP path. Tell me exactly where TLS ends.",
      "rhea",
      "An HTTPS address proves less than people think. Distinguish client-to-router from router-to-Pod protection.",
    ],
    artifact: "Public entry-point diagram",
    files: {
      "route.yaml": secureRoute,
      "service.yaml": object("Service", "app", {
        spec: {
          selector: { app: "app" },
          ports: [{ port: 8080, targetPort: 8080 }],
        },
      }),
      "app.yaml": workload(),
    },
    goals: [
      goal(
        "Redirect HTTP at the edge Route",
        "Route",
        "front-door",
        "spec.tls.insecureEdgeTerminationPolicy",
        "Redirect",
      ),
      goal(
        "Provide a real backend service",
        "Service",
        "app",
        "spec.selector.app",
        "app",
      ),
    ],
    probes: [
      probe("https", "TLS edge reaches the ready backend", "tls-working"),
      probe(
        "http",
        "HTTP redirects instead of serving credentials",
        "http-redirect",
      ),
    ],
    conclusion: "edge-boundary",
    risk: "Edge TLS does not encrypt router-to-Pod traffic.",
  },
  {
    title: "The Familiar Tag",
    act: "II · What the city consumes",
    district: "Market",
    sources: ["labs/basic/b6.adoc"],
    hook: "The gateway tag has the same name it had yesterday. Its content changed. Kai needs a release identity that does not move beneath him.",
    reveal:
      "An approved registry and a pinned digest answer different questions. The campaign uses a recorded training artifact catalog; it does not contact a registry.",
    voices: [
      "kai",
      "A trusted host can still hold a vulnerable artifact. Pin the intended content and inspect its recorded scan.",
      "vale",
      "The catalog binds this digest to the training release. Keep that evidence with the deployment.",
    ],
    artifact: "Recorded artifact digest",
    files: {
      "registry.yaml": cr("Image", "cluster", "config.openshift.io/v1", {
        registrySources: { allowedRegistries: ["registry.example.test"] },
      }),
      "app.yaml": workload(
        "app",
        {},
        { image: image + "@sha256:" + "a".repeat(64) },
      ),
      "attestation.yaml": signature,
    },
    goals: [
      goal(
        "Restrict allowed registry sources",
        "Image",
        "cluster",
        "spec.registrySources.allowedRegistries",
        ["registry.example.test"],
      ),
      goal(
        "Retain the digest catalog",
        "ConfigMap",
        "attestation",
        "data.digest",
        "sha256:" + "a".repeat(64),
      ),
    ],
    probes: [
      probe("approved", "Approved pinned artifact starts", "provenance"),
      probe("untrusted", "Unapproved registry is rejected", "registry-denied"),
    ],
    conclusion: "pin-and-verify",
    risk: "A tag is mutable, and registry reputation is not vulnerability evidence.",
  },
  {
    title: "The Missing Minute",
    act: "III · The record behind the story",
    district: "Records",
    sources: ["labs/basic/b7.adoc", "labs/advanced/audit-logs.md"],
    hook: "The build-bot patch is only one event. Vale has an exec and a port-forward request in the same window. Rhea wants a timeline, not a suspect's name.",
    reveal:
      "API caller, resource, timestamp and response must be correlated. Missing request bodies and a successful API call are limits on what the log proves.",
    voices: [
      "vale",
      "Filter the retained audit, identify the exec and port-forward, and separate successful actions from denied attempts.",
      "rhea",
      "A credential does not identify a person. Read the redacted runtime record before claiming exfiltration.",
    ],
    artifact: "Retained incident timeline",
    files: {
      "timeline.json": JSON.stringify([
        {
          user: "build-bot",
          verb: "patch",
          time: "02:13:40",
          resource: "deployment",
        },
        {
          user: "support-agent",
          verb: "create",
          subresource: "exec",
          time: "02:13:55",
          code: 201,
        },
        {
          user: "support-agent",
          verb: "create",
          subresource: "portforward",
          time: "02:14:02",
          code: 403,
        },
      ]),
      "report.yaml": cm("timeline-report", {
        caller: "support-agent",
        denied: "portforward",
        attribution: "credential-only",
        window: "02:13:40-02:14:02",
      }),
    },
    goals: [
      goal(
        "Record the attribution limit",
        "ConfigMap",
        "timeline-report",
        "data.attribution",
        "credential-only",
      ),
      goal(
        "Distinguish the denied tunnel",
        "ConfigMap",
        "timeline-report",
        "data.denied",
        "portforward",
      ),
    ],
    probes: [
      probe(
        "timeline",
        "Reconstruction preserves the observed window",
        "timeline",
      ),
      probe("limit", "Report does not claim a human culprit", "attribution"),
    ],
    conclusion: "preserve-uncertainty",
    risk: "An audit record may omit request bodies; successful API access is not proof of data exposure.",
  },
  {
    title: "Draw the City Before the Fire",
    act: "III · The record behind the story",
    district: "Records",
    sources: ["labs/intermediate/i1.adoc"],
    hook: "The team can explain one incident and still cannot agree where sensitive data travels. Rhea asks you to map what the ghost route taught you.",
    reveal:
      "The threat model names assets, boundaries, abuse paths and owners before selecting tools. A small prioritized backlog is more useful than a catalogue of fears.",
    voices: [
      "rhea",
      "Start with payment metadata, delivery credentials and the ledger. Name where trust changes.",
      "mira",
      "Give each control an owner. I cannot operate a backlog where every task belongs to everyone.",
    ],
    artifact: "Unfinished trust-boundary sketch",
    files: {
      "model.yaml": cm("threat-model", {
        assets: "payment-metadata,delivery-credential,ledger",
        boundaries: "internet-router,tenant-tenant,pipeline-runtime",
        threats: "spoofing,tampering,disclosure",
        controls: "RBAC,NetworkPolicy,Secret-rotation",
        owner: "platform+application",
        priority: "credential-then-egress",
      }),
    },
    goals: [
      goal(
        "Name the trust boundaries",
        "ConfigMap",
        "threat-model",
        "data.boundaries",
        "internet-router,tenant-tenant,pipeline-runtime",
      ),
      goal(
        "Assign control ownership",
        "ConfigMap",
        "threat-model",
        "data.owner",
        "platform+application",
      ),
    ],
    probes: [
      probe(
        "coverage",
        "Assets have controls and accountable owners",
        "threat-coverage",
      ),
      probe(
        "priority",
        "Priority follows retained incident evidence",
        "threat-priority",
      ),
    ],
    conclusion: "map-before-tools",
    risk: "A diagram without ownership does not change the next incident.",
  },
  {
    title: "Three Watchtowers",
    act: "III · The record behind the story",
    district: "Records",
    sources: ["labs/basic/b8.adoc"],
    hook: "A director asks why three security systems did not stop one setting. Rhea gives you the job of separating their responsibilities.",
    reveal:
      "RHACS observes and applies build/deploy/runtime policies; Compliance Operator evaluates configuration posture; SPO manages workload profiles. None replaces RBAC, SCC or network enforcement.",
    voices: [
      "rhea",
      "A runtime alert is not a node compliance result. Tell the director which evidence each watchtower can provide.",
      "mira",
      "A syscall profile is not a network firewall. Layer the controls without asking one operator to impersonate another.",
    ],
    artifact: "Three incompatible status reports",
    files: {
      "coverage.yaml": cm("layer-map", {
        rhacs: "build-deploy-runtime",
        compliance: "configuration-posture",
        spo: "security-profile-lifecycle",
        native: "RBAC-SCC-network",
      }),
    },
    goals: [
      goal(
        "Keep native enforcement in the defense map",
        "ConfigMap",
        "layer-map",
        "data.native",
        "RBAC-SCC-network",
      ),
    ],
    probes: [
      probe(
        "layers",
        "Assign all three tool responsibilities",
        "layer-coverage",
      ),
      probe(
        "boundary",
        "Avoid a single-tool replacement claim",
        "layer-boundary",
      ),
    ],
    conclusion: "layer-the-defense",
    risk: "A tool's presence does not prove the control is configured or effective.",
  },
  {
    title: "Neighbors Through the Wall",
    act: "III · The record behind the story",
    district: "Records",
    sources: ["labs/basic/b4.adoc"],
    hook: "A tenant can reach the workshop's server without a business reason. Mira finds a wall on the floor plan and no boundary in the dataplane.",
    reveal:
      "Selecting ingress and egress policies must preserve the intended client while denying the unrelated peer.",
    voices: [
      "mira",
      "There are two directions to test. The client needs egress and the server needs ingress.",
      "kai",
      "Allow my client on 8443. An allow-all file would restore the mistake we are investigating.",
    ],
    artifact: "Unapproved peer flow",
    files: {
      "deny.yaml": deny(),
      "client-allow.yaml": allow(),
      "server-allow.yaml": inbound(),
    },
    seed: [workload("client"), workload("server"), workload("stranger")],
    goals: [
      goal(
        "Isolate both directions",
        "NetworkPolicy",
        "isolate",
        "spec.policyTypes",
        ["Ingress", "Egress"],
      ),
    ],
    probes: [
      probe("client", "Intended client reaches server:8443", "client-flow"),
      probe("peer", "Unrelated peer stays blocked", "peer-blocked"),
    ],
    conclusion: "preserve-intended-path",
    risk: "NetworkPolicy allowances are additive; an extra broad allow can reopen the wall.",
  },
  {
    title: "The Rule Above the Rules",
    act: "IV · Borders and identity",
    district: "Harbor",
    sources: ["labs/intermediate/i4b.adoc", "docs/adminnetworkpolicies.adoc"],
    hook: "A developer restores outside access with an allow-all policy. Mira needs a corporate boundary they cannot override.",
    reveal:
      "Admin Deny wins above tenant policy. Pass delegates to NetworkPolicy; BANP applies only when higher tiers do not decide.",
    voices: [
      "mira",
      "The three tiers have different owners. Keep an admin deny on the restricted external range.",
      "rhea",
      "Prove the legitimate internal flow still works and a developer allow-all cannot bypass the admin deny.",
    ],
    artifact: "Conflicting policy ownership map",
    files: {
      "admin.yaml": anp,
      "baseline.yaml": banp,
      "allow.yaml": net("developer-allow", {
        podSelector: {},
        policyTypes: ["Egress"],
        egress: [{}],
      }),
    },
    seed: [workload("client"), workload("server")],
    goals: [
      goal(
        "Install the corporate deny",
        "AdminNetworkPolicy",
        "rs-external-guard",
        "spec.egress.0.action",
        "Deny",
      ),
      goal(
        "Install the lower baseline",
        "BaselineAdminNetworkPolicy",
        "default",
        "spec.egress.0.action",
        "Deny",
      ),
    ],
    probes: [
      probe(
        "inside",
        "Developer policy permits intended internal traffic",
        "client-flow",
      ),
      probe("outside", "Admin deny survives allow-all", "admin-deny"),
    ],
    conclusion: "keep-tier-ownership",
    risk: "Do not treat Pass as Allow or BANP as a higher-priority admin deny.",
  },
  {
    title: "A Name on the Outside",
    act: "IV · Borders and identity",
    district: "Harbor",
    sources: ["labs/intermediate/i4a.adoc"],
    hook: "The partner firewall sees a different source address after every reschedule. A rushed allowlist is growing by the hour.",
    reveal:
      "EgressIP fixes the selected tenant's outbound source identity. It does not grant destination access or encrypt the traffic.",
    voices: [
      "mira",
      "Assign only the reserved documentation address to the labeled tenant. Keep a control tenant.",
      "vale",
      "The partner approved an address, not an unlimited network path. Preserve that distinction in the handover.",
    ],
    artifact: "Partner allowlist agreement",
    files: {
      "egress.yaml": cr("EgressIP", "rs-egress", "k8s.ovn.org/v1", {
        egressIPs: ["192.0.2.25"],
        namespaceSelector: { matchLabels: { "roadshow.egress": "partner" } },
      }),
    },
    goals: [
      goal(
        "Use the reserved outbound address",
        "EgressIP",
        "rs-egress",
        "spec.egressIPs",
        ["192.0.2.25"],
      ),
    ],
    probes: [
      probe(
        "selected",
        "Selected tenant has the recorded source identity",
        "egress-selected",
      ),
      probe("control", "Control tenant is unchanged", "egress-control"),
    ],
    conclusion: "identity-is-not-permission",
    risk: "A source IP allowlist is neither a destination firewall nor workload authentication.",
  },
  {
    title: "Two Cities, One Address Book",
    act: "IV · Borders and identity",
    district: "Harbor",
    sources: ["labs/intermediate/i4c.adoc", "labs/demo/network-flow.adoc"],
    hook: "Two tenants share an address plan and assume a namespace is a private network. The probe reaches farther than either team expected.",
    reveal:
      "Distinct primary UDNs establish separate tenant network domains. Overlapping addresses are meaningful only within their own domain.",
    voices: [
      "mira",
      "A namespace label alone is not a dataplane boundary. Inspect the actual UDN resources.",
      "kai",
      "My local client must still reach its server. Test local success as carefully as cross-tenant failure.",
    ],
    artifact: "Tenant network allocation",
    files: {
      "network.yaml": cr("UserDefinedNetwork", "primary", "k8s.ovn.org/v1", {
        topology: "Layer2",
        layer2: { role: "Primary", subnets: ["10.90.0.0/24"] },
      }),
    },
    seed: [workload("client"), workload("server")],
    goals: [
      goal(
        "Declare the tenant primary network",
        "UserDefinedNetwork",
        "primary",
        "spec.layer2.role",
        "Primary",
      ),
    ],
    probes: [
      probe("local", "Same domain retains service", "udn-local"),
      probe("cross", "Different domains stay isolated", "udn-cross"),
    ],
    conclusion: "separate-domains",
    risk: "UDN isolation is not a replacement for application identity or egress governance.",
  },
  {
    title: "The Cable Behind the Wall",
    act: "IV · Borders and identity",
    district: "Harbor",
    sources: ["labs/intermediate/i4d.adoc", "labs/demo/network-flow.adoc"],
    hook: "A secondary VLAN offers a route around the ordinary tenant network. Someone added an attachment without asking which nodes may carry it.",
    reveal:
      "The NAD references VLAN 200, and only the designated worker has that recorded capability. Scheduling and secondary-network authorization remain distinct.",
    voices: [
      "mira",
      "Worker-02 carries the training VLAN. Constrain the attached workload there.",
      "vale",
      "Secondary interfaces do not automatically inherit primary-network NetworkPolicy. Record the separate boundary.",
    ],
    artifact: "VLAN trunk inventory",
    files: {
      "network.yaml": cr(
        "NetworkAttachmentDefinition",
        "vlan200",
        "k8s.cni.cncf.io/v1",
        {
          config: JSON.stringify({
            cniVersion: "0.3.1",
            type: "vlan",
            master: "eth1",
            vlanId: 200,
            ipam: { type: "host-local", subnet: "192.0.2.0/24" },
          }),
        },
      ),
      "app.yaml": {
        ...workload("app", { nodeName: "worker-02" }),
        metadata: {
          name: "app",
          annotations: { "k8s.v1.cni.cncf.io/networks": "vlan200" },
        },
      },
    },
    goals: [
      goal(
        "Schedule on the VLAN-capable worker",
        "Pod",
        "app",
        "spec.nodeName",
        "worker-02",
      ),
      goal(
        "Attach the intended network",
        "Pod",
        "app",
        "metadata.annotations.k8s.v1.cni.cncf.io/networks",
        "vlan200",
      ),
    ],
    probes: [
      probe(
        "attached",
        "Recorded VLAN capability admits this attachment",
        "vlan-good",
      ),
      probe(
        "wrong-node",
        "Unlabeled worker cannot satisfy the attachment",
        "vlan-wrong",
      ),
    ],
    conclusion: "constrain-the-cable",
    risk: "A secondary network may bypass the protection you tested on the primary one.",
  },
  {
    title: "The Assembly Line",
    act: "V · The release that travels",
    district: "Build yard",
    sources: ["labs/intermediate/i5.adoc"],
    hook: "The original build-bot trail returns to the release line. A signature was present, but nobody checked whether scanning happened before signing.",
    reveal:
      "The training pipeline gates signing on the recorded scan and binds the attestation to the exact artifact digest.",
    voices: [
      "kai",
      "The order matters: build, scan, then sign only if the gate passes. A signed vulnerable artifact is still vulnerable.",
      "rhea",
      "Use the recorded artifact fixtures for the positive and negative tests. This offline scene does not run Tekton, a scanner or cryptographic signing.",
    ],
    artifact: "Out-of-order release attestation",
    files: {
      "pipeline.yaml": cr("Pipeline", "secure-release", "tekton.dev/v1", {
        tasks: [
          { name: "build" },
          { name: "scan", runAfter: ["build"] },
          {
            name: "sign",
            runAfter: ["scan"],
            when: [
              {
                input: "$(tasks.scan.results.high)",
                operator: "in",
                values: ["0"],
              },
            ],
          },
        ],
      }),
      "run.yaml": cr("PipelineRun", "release", "tekton.dev/v1", {
        pipelineRef: { name: "secure-release" },
        params: [{ name: "digest", value: "sha256:" + "a".repeat(64) }],
      }),
      "attestation.yaml": signature,
    },
    goals: [
      goal(
        "Gate signing after scanning",
        "Pipeline",
        "secure-release",
        "spec.tasks.2.runAfter",
        ["scan"],
      ),
      goal(
        "Bind a release run to the pipeline",
        "PipelineRun",
        "release",
        "spec.pipelineRef.name",
        "secure-release",
      ),
    ],
    probes: [
      probe(
        "clean",
        "Recorded clean artifact passes the release gate",
        "pipeline-clean",
      ),
      probe(
        "vulnerable",
        "Recorded high finding blocks signing",
        "pipeline-high",
      ),
    ],
    conclusion: "scan-before-sign",
    risk: "These are retained fixture assessments, not executed builds or cryptographic verification.",
  },
  {
    title: "Borrowed Secrets",
    act: "V · The release that travels",
    district: "Build yard",
    sources: ["labs/intermediate/i6.adoc"],
    hook: "Kai has removed the hardcoded password. The same long-lived copy now exists in every build room. Mira wants to stop distributing the master key.",
    reveal:
      "The CSI mapping requests one external path and mounts its projection. Provider authentication and rotation are separate lifecycle controls.",
    voices: [
      "mira",
      "Scope the provider to the one database path. The provider in this game is a synthetic local fixture.",
      "kai",
      "Use the CSI volume without syncing a Kubernetes Secret. Decide how the app notices a projected update.",
    ],
    artifact: "Secret-provider access request",
    files: {
      "provider.yaml": cr(
        "SecretProviderClass",
        "database",
        "secrets-store.csi.x-k8s.io/v1",
        {
          provider: "vault",
          parameters: {
            roleName: "database-reader",
            objects:
              "- objectName: password\n  secretPath: secret/data/database\n  secretKey: password\n",
          },
        },
      ),
      "app.yaml": workload("app", {
        volumes: [
          {
            name: "external",
            csi: {
              driver: "secrets-store.csi.k8s.io",
              readOnly: true,
              volumeAttributes: { secretProviderClass: "database" },
            },
          },
        ],
      }),
      "provider-record.yaml": cm("provider-record", {
        path: "secret/data/database",
        version: "2",
        auth: "namespace-serviceaccount",
        sync: "false",
      }),
    },
    goals: [
      goal(
        "Select Vault CSI",
        "SecretProviderClass",
        "database",
        "spec.provider",
        "vault",
      ),
      goal(
        "Mount the provider projection",
        "Pod",
        "app",
        "spec.volumes.0.csi.volumeAttributes.secretProviderClass",
        "database",
      ),
    ],
    probes: [
      probe("project", "Exact scoped path can project v2", "csi-project"),
      probe("copies", "No synced static Secret was requested", "csi-nosync"),
    ],
    conclusion: "project-without-copy",
    risk: "CSI does not remove provider authorization or application reload requirements.",
  },
  {
    title: "The Copy That Must Change",
    act: "V · The release that travels",
    district: "Build yard",
    sources: ["labs/intermediate/i6a.adoc"],
    hook: "A legacy consumer needs a Kubernetes Secret. It cannot read the CSI file. Vale asks who will keep this necessary copy from becoming stale.",
    reveal:
      "ESO declaratively maps one remote key to a local Secret. The recorded provider version changes; reconciliation updates the local copy.",
    voices: [
      "kai",
      "This consumer requires a Secret. Use a named store and one mapped key, not a dump of the provider.",
      "vale",
      "A synchronized copy exists in Kubernetes. Include that exposure and the refresh interval in the record.",
    ],
    artifact: "Legacy consumer contract",
    files: {
      "store.yaml": cr("SecretStore", "vault", "external-secrets.io/v1", {
        provider: {
          vault: {
            server: "https://vault.example.test",
            path: "secret",
            version: "v2",
          },
        },
      }),
      "external.yaml": cr(
        "ExternalSecret",
        "database",
        "external-secrets.io/v1",
        {
          refreshInterval: "1m",
          secretStoreRef: { name: "vault", kind: "SecretStore" },
          target: { name: "database" },
          data: [
            {
              secretKey: "password",
              remoteRef: { key: "database", property: "password" },
            },
          ],
        },
      ),
      "provider-record.yaml": cm("provider-record", {
        version: "2",
        value: "training-v2",
      }),
    },
    goals: [
      goal(
        "Map the one external key",
        "ExternalSecret",
        "database",
        "spec.data.0.remoteRef.key",
        "database",
      ),
      goal(
        "Reference the declared store",
        "ExternalSecret",
        "database",
        "spec.secretStoreRef.name",
        "vault",
      ),
    ],
    probes: [
      probe(
        "sync",
        "Recorded provider v2 reaches the local Secret",
        "eso-sync",
      ),
      probe("scope", "Only the intended key is synchronized", "eso-scoped"),
    ],
    conclusion: "rotate-the-copy",
    risk: "ESO creates a Kubernetes Secret; it is not the same storage model as a CSI-only projection.",
  },
  {
    title: "One Event Is Not a Story",
    act: "V · The release that travels",
    district: "Build yard",
    sources: ["labs/intermediate/i7.adoc"],
    hook: "Rhea's alert names an exec. Kai says it was routine support. Vale has enough records to test both stories.",
    reveal:
      "The investigation correlates namespace, Pod, caller, time and runtime behavior. Correlation strengthens a claim without replacing its evidence.",
    voices: [
      "rhea",
      "The exec alone does not prove a malicious command. Read the recorded runtime window.",
      "vale",
      "Do not merge two events just because they happened nearby. Match the Pod and namespace.",
    ],
    artifact: "Cross-source correlation window",
    files: {
      "runtime.json": JSON.stringify({
        namespace: "payments",
        pod: "payment-api-7d9cd-ab12",
        time: "02:13:55",
        behavior: "configuration-read",
        dataExposure: "unconfirmed",
      }),
      "correlation.yaml": cm("correlation", {
        namespace: "payments",
        pod: "payment-api-7d9cd-ab12",
        caller: "support-agent",
        window: "02:13:55",
        exposure: "unconfirmed",
      }),
    },
    goals: [
      goal(
        "Retain the observed runtime behavior without overclaiming",
        "ConfigMap",
        "correlation",
        "data.exposure",
        "unconfirmed",
      ),
    ],
    probes: [
      probe(
        "join",
        "Correlation fields match the recorded sources",
        "correlation",
      ),
      probe("scope", "Unrelated Pod is excluded", "correlation-scope"),
    ],
    conclusion: "correlate-before-claiming",
    risk: "Temporal proximity is not enough to bind two records.",
  },
  {
    title: "The Alarm That Cried Fire",
    act: "VI · Signals and assurance",
    district: "Watch district",
    sources: ["labs/intermediate/i7b.adoc"],
    hook: "An alert fires on every brief CPU spike. The team starts ignoring it. Rhea wants to catch the sustained event without waking everyone for a normal burst.",
    reveal:
      "A duration-aware threshold separates the recorded baseline and sustained spike. Exec correlation adds context, not automatic guilt.",
    voices: [
      "rhea",
      "Use the retained sample windows. A high sample for one second is not the same as a sustained five-minute breach.",
      "mira",
      "Keep a normal-window negative test. An alert that fires on everything eventually protects nothing.",
    ],
    artifact: "Baseline and spike sample windows",
    files: {
      "rule.yaml": cr(
        "PrometheusRule",
        "sustained-spike",
        "monitoring.coreos.com/v1",
        {
          groups: [
            {
              name: "runtime",
              rules: [
                {
                  alert: "SustainedCPU",
                  expr: "rate(container_cpu_usage_seconds_total[5m]) > 0.5",
                  for: "5m",
                },
              ],
            },
          ],
        },
      ),
      "samples.json": JSON.stringify({
        baseline: [0.1, 0.2, 0.1],
        brief: [0.1, 0.9, 0.1],
        sustained: [0.8, 0.9, 0.8],
        fixtureMinutes: 5,
      }),
    },
    goals: [
      goal(
        "Require a sustained window",
        "PrometheusRule",
        "sustained-spike",
        "spec.groups.0.rules.0.for",
        "5m",
      ),
    ],
    probes: [
      probe("spike", "Sustained fixture triggers the rule", "alert-spike"),
      probe("normal", "Normal/brief fixture does not trigger", "alert-normal"),
    ],
    conclusion: "reduce-noise-with-evidence",
    risk: "Recorded samples do not run a real Prometheus server.",
  },
  {
    title: "The Green Report",
    act: "VI · Signals and assurance",
    district: "Watch district",
    sources: [
      "labs/intermediate/i8.adoc",
      "docs/compliance-operator-customization.adoc",
    ],
    hook: "The compliance report turned green because someone excluded the failing rule. Vale asks whether the city became safer or the report became quieter.",
    reveal:
      "A justified tailoring exception can suppress an irrelevant rule; it cannot count a failing applicable control as remediated.",
    voices: [
      "vale",
      "Give the irrelevant USB rule a written reason. Do not exclude the applicable audit control.",
      "mira",
      "Apply the recorded remediation, then run the fixture scan again. State that this does not execute OpenSCAP or reboot a node.",
    ],
    artifact: "Tailoring request with a missing reason",
    files: {
      "profile.yaml": object(
        "TailoredProfile",
        "district",
        {
          extends: "rhcos4-moderate",
          disableRules: [
            {
              name: "usb-storage",
              rationale:
                "No physical USB interface in this recorded environment",
            },
          ],
        },
        "compliance.openshift.io/v1alpha1",
      ),
      "remediation.yaml": cr(
        "ComplianceRemediation",
        "audit-enabled",
        "compliance.openshift.io/v1alpha1",
        {
          apply: true,
          current: { object: cm("node-posture", { audit: "enabled" }) },
        },
      ),
      "scan.yaml": cr(
        "ComplianceScan",
        "district",
        "compliance.openshift.io/v1alpha1",
        { profile: "district", content: "recorded-rhcos-ds.xml" },
      ),
    },
    goals: [
      goal(
        "Keep a justified tailoring rationale",
        "TailoredProfile",
        "district",
        "disableRules.0.name",
        "usb-storage",
      ),
      goal(
        "Request the applicable audit remediation",
        "ComplianceRemediation",
        "audit-enabled",
        "spec.apply",
        true,
      ),
      goal(
        "Re-evaluate the tailored posture",
        "ComplianceScan",
        "district",
        "spec.profile",
        "district",
      ),
    ],
    probes: [
      probe(
        "applicable",
        "Applicable audit control remains checked",
        "compliance-effective",
      ),
      probe(
        "exception",
        "Exception remains visible and justified",
        "compliance-exception",
      ),
    ],
    conclusion: "remediate-not-hide",
    risk: "A compliant fixture result is not a real cluster attestation.",
  },
  {
    title: "A Room Inside a Room",
    act: "VI · Signals and assurance",
    district: "Watch district",
    sources: ["labs/intermediate/i9.adoc"],
    hook: "An untrusted partner workload needs stronger isolation. Somebody claims a sandbox makes every other control optional.",
    reveal:
      "Kata adds a VM boundary. The supported fixture still requires non-root SCC admission and a recorded virtualization-capable node.",
    voices: [
      "mira",
      "Select the kata RuntimeClass and the capable worker. A RuntimeClass name alone is not installed virtualization.",
      "rhea",
      "Try the same unsafe UID request. The extra boundary must not erase SCC.",
    ],
    artifact: "Recorded node capability inventory",
    files: {
      "runtime.yaml": object(
        "RuntimeClass",
        "kata",
        { handler: "kata" },
        "node.k8s.io/v1",
      ),
      "app.yaml": workload("app", {
        runtimeClassName: "kata",
        nodeName: "worker-02",
      }),
    },
    goals: [
      goal(
        "Select the sandbox runtime",
        "Pod",
        "app",
        "spec.runtimeClassName",
        "kata",
      ),
      goal(
        "Declare the runtime handler",
        "RuntimeClass",
        "kata",
        "handler",
        "kata",
      ),
    ],
    probes: [
      probe(
        "sandbox",
        "Recorded runtime/node prerequisites hold",
        "kata-ready",
      ),
      probe("root", "SCC still rejects UID 0", "root-rejected"),
    ],
    conclusion: "add-a-boundary",
    risk: "No VM is started by this browser. RuntimeClass configuration does not replace other controls.",
  },
  {
    title: "The Smallest Set of Moves",
    act: "VI · Signals and assurance",
    district: "Watch district",
    sources: ["labs/intermediate/i9a.adoc", "labs/intermediate/i3.adoc"],
    hook: "The partner workload is isolated, but its process still asks the kernel for operations it never uses. Kai brings a recorded syscall trace.",
    reveal:
      "A workload-specific profile allows the observed normal calls and denies the recorded unshare request. Recording alone does not enforce a profile.",
    voices: [
      "kai",
      "Read the trace before removing calls. The application still has to open, read, write and exit.",
      "mira",
      "The enforcement probe uses the recorded syscall set, not a real kernel. Keep SCC and capability checks too.",
    ],
    artifact: "Recorded syscall trace",
    files: {
      "profile.yaml": cr(
        "SeccompProfile",
        "app",
        "security-profiles-operator.x-k8s.io/v1beta1",
        {
          defaultAction: "SCMP_ACT_ERRNO",
          syscalls: [
            {
              action: "SCMP_ACT_ALLOW",
              names: ["read", "write", "openat", "close", "exit_group"],
            },
          ],
        },
      ),
      "identity.yaml": object("ServiceAccount", "profiled"),
      "scc.yaml": {
        ...fixedScc,
        metadata: { name: "rs-profile" },
        runAsUser: { type: "MustRunAsRange" },
        seccompProfiles: ["runtime/default", "localhost/rs-app.json"],
      },
      "app.yaml": workload(
        "app",
        { serviceAccountName: "profiled" },
        {
          securityContext: {
            ...security,
            seccompProfile: {
              type: "Localhost",
              localhostProfile: "rs-app.json",
            },
          },
        },
      ),
      "recording.json": JSON.stringify({
        normal: ["read", "write", "openat", "close", "exit_group"],
        negative: "unshare",
        file: "rs-app.json",
      }),
    },
    goals: [
      goal(
        "Deny unlisted syscalls in the recorded profile",
        "SeccompProfile",
        "app",
        "spec.defaultAction",
        "SCMP_ACT_ERRNO",
      ),
      goal(
        "Bind the consumer to the recorded profile",
        "Pod",
        "app",
        "spec.containers.0.securityContext.seccompProfile.localhostProfile",
        "rs-app.json",
      ),
    ],
    probes: [
      probe(
        "normal",
        "Recorded normal calls remain permitted",
        "seccomp-normal",
      ),
      probe("unshare", "Recorded unshare call is denied", "seccomp-denied"),
    ],
    conclusion: "record-then-enforce",
    risk: "The syscall probe is a fixture evaluator; no host seccomp or SELinux profile is installed.",
  },
  {
    title: "The Front-Door Covenant",
    act: "VII · What survives the investigator",
    district: "Council",
    sources: ["labs/intermediate/i10.adoc"],
    hook: "Every team promises to follow the handover standard. The next deployment arrives without an owner label. Mira wants a guardrail, not another reminder.",
    reveal:
      "A scoped admission constraint rejects an ownerless Pod and accepts the compliant tenant workload. Exceptions must not become a wildcard bypass.",
    voices: [
      "mira",
      "Apply the constraint only to the declared tenant. Require an accountable owner.",
      "vale",
      "A policy name is not proof of enforcement. Keep the rejected request and a compliant positive test.",
    ],
    artifact: "Unsigned deployment request",
    files: {
      "constraint.yaml": cr(
        "K8sRequiredLabels",
        "rs-owner",
        "constraints.gatekeeper.sh/v1beta1",
        {
          match: {
            namespaces: ["$NAMESPACE"],
            kinds: [{ apiGroups: [""], kinds: ["Pod"] }],
          },
          parameters: { labels: [{ key: "owner" }] },
        },
      ),
      "app.yaml": {
        ...workload(),
        metadata: { name: "app", labels: { app: "app", owner: "Kai" } },
      },
      "missing.yaml": workload("ownerless"),
    },
    goals: [
      goal(
        "Require owner labels in the scoped tenant",
        "K8sRequiredLabels",
        "rs-owner",
        "spec.parameters.labels.0.key",
        "owner",
      ),
      goal(
        "Run a labeled workload",
        "Pod",
        "app",
        "metadata.labels.owner",
        "Kai",
      ),
    ],
    probes: [
      probe("owned", "Owned workload is admitted", "owned-ready"),
      probe("missing", "Ownerless workload is denied", "label-denied"),
    ],
    conclusion: "enforce-with-scope",
    risk: "The fixture assumes the matching constraint template is installed; this is not a complete Gatekeeper engine.",
  },
  {
    title: "The City That Remembers",
    act: "VII · What survives the investigator",
    district: "Council",
    sources: [
      "docs/onboarding.adoc",
      "docs/rhacs-internal-entities.adoc",
      "docs/plan.adoc",
    ],
    hook: "The ghost route is gone. The council wants to know what happens when the next alert arrives in another cluster and you are not there.",
    reveal:
      "The final handover binds evidence, control ownership, exception expiry and fleet scope. Completed cases are a learning record, not live multi-cluster posture.",
    voices: [
      "rhea",
      "RHACS can observe a fleet. The retained fleet records here are evidence fixtures, not new live cluster connections.",
      "vale",
      "Do not promise that every tenant is secure. Tell us what was verified, which exceptions remain, and who reviews them.",
    ],
    artifact: "Council handover seal",
    files: {
      "handover.yaml": cm("handover", {
        scope: "recorded-training-fleet",
        owner: "Mira",
        exceptions: "expiry-review-required",
        evidence: "retained-and-verified",
        claim: "bounded-simulation",
      }),
      "fleet.json": JSON.stringify([
        {
          cluster: "prod-east",
          case: "ghost-route",
          source: "completed-training-case",
        },
        { cluster: "harbor-west", source: "recorded-network-lab" },
        { cluster: "build-yard", source: "recorded-release-lab" },
      ]),
    },
    goals: [
      goal(
        "State the actual fleet scope",
        "ConfigMap",
        "handover",
        "data.scope",
        "recorded-training-fleet",
      ),
      goal(
        "Keep exception review accountable",
        "ConfigMap",
        "handover",
        "data.exceptions",
        "expiry-review-required",
      ),
    ],
    probes: [
      probe(
        "handover",
        "Handover names ownership and retained evidence",
        "handover",
      ),
      probe(
        "history",
        "Every preceding chapter has verified completion",
        "campaign-history",
      ),
    ],
    conclusion: "leave-accountable-controls",
    risk: "A completed campaign is not an assertion about any real cluster's security.",
  },
];
export const chapters: Chapter[] = [
  {
    id: "01",
    title: "The Ghost Route",
    act: "I · The district wakes",
    district: "Payments",
    namespace: "payments",
    hook: "Every successful payment sends a signal nobody approved. Find what changed without switching the district off.",
    reveal:
      "The Deployment environment enabled an unexpected exporter. Preserve checkout while enforcing its intended boundary.",
    outcome: "The district keeps its lights.",
    sources: ["labs/basic/b4.adoc", "labs/basic/b7.adoc"],
    witnesses: [],
    artifact: { scene: "archive", title: "Original incident", text: "" },
    files: {},
    seed: [],
    goals: [],
    probes: [],
    conclusion: "verified-containment",
    risk: "Default-deny alone breaks DNS and ledger.",
  },
  ...drafts.map((draft, index) => chapter(draft, index + 1)),
];
export function materialize<T>(value: T, namespace: string): T {
  return JSON.parse(
    JSON.stringify(value).replaceAll("$NAMESPACE", namespace),
  ) as T;
}
