import { repositoryUrl, seedRevision } from "./source-fixture.js";
import type { Resource } from "../simulation/cluster-model.js";
const resource = (
  kind: string,
  name: string,
  spec: any,
  apiVersion = "tekton.dev/v1",
): Resource => ({ apiVersion, kind, metadata: { name }, spec });
const param = (name: string, def?: string) => ({
  name,
  type: "string",
  ...(def === undefined ? {} : { default: def }),
});
const workspace = [{ name: "source" }];
export const releasePrerequisites: Resource[] = [
  ...["release-runner", "release-builder", "release-webhook"].map((name) => ({
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: { name },
  })),
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: { name: "release-builder-scc" },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "ClusterRole",
      name: "system:openshift:scc:privileged",
    },
    subjects: [
      { kind: "ServiceAccount", name: "release-builder", namespace: "rs-18" },
    ],
  },
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: { name: "release-webhook" },
    rules: [
      {
        apiGroups: ["tekton.dev"],
        resources: ["pipelineruns"],
        verbs: ["create"],
      },
      {
        apiGroups: ["triggers.tekton.dev"],
        resources: ["triggerbindings", "triggertemplates", "triggers"],
        verbs: ["get", "list", "watch"],
      },
    ],
  },
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: { name: "release-webhook" },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "Role",
      name: "release-webhook",
    },
    subjects: [
      { kind: "ServiceAccount", name: "release-webhook", namespace: "rs-18" },
    ],
  },
  {
    apiVersion: "v1",
    kind: "Secret",
    metadata: { name: "release-registry" },
    type: "kubernetes.io/dockerconfigjson",
    stringData: {
      ".dockerconfigjson": JSON.stringify({
        auths: {
          "registry.example.test": {
            auth: "cmVsZWFzZS1ib3Q6dHJhaW5pbmctcmVnaXN0cnktdjI=",
          },
        },
      }),
    },
  },
  {
    apiVersion: "v1",
    kind: "Secret",
    metadata: { name: "central-access" },
    stringData: {
      endpoint: "central.example.test:443",
      token: "offline-central-token",
    },
  },
  {
    apiVersion: "v1",
    kind: "Secret",
    metadata: { name: "signing-key" },
    stringData: {
      "cosign.key": "OFFLINE-AUTHORED-KEY-NOT-A-CRYPTOGRAPHIC-KEY",
      password: "offline",
    },
  },
];
const sourceParams = [
  param("repo-url", repositoryUrl),
  param("revision", "main"),
];
export const releaseTasks: Resource[] = [
  resource("Task", "release-fetch", {
    params: sourceParams,
    workspaces: workspace,
    results: [{ name: "commit", type: "string" }],
    steps: [
      {
        name: "clone",
        image: "alpine/git:2.49.1",
        env: [
          { name: "REPO", value: "$(params.repo-url)" },
          { name: "REVISION", value: "$(params.revision)" },
        ],
        script: `#!/bin/sh\nset -eu\ncd "$(workspaces.source.path)"\ngit init\ngit remote add origin "$REPO"\ngit fetch origin "$REVISION"\ngit checkout --detach FETCH_HEAD\ngit rev-parse HEAD > "$(results.commit.path)"\n`,
      },
    ],
  }),
  resource("Task", "release-build", {
    params: [param("image-repository", "registry.example.test/payments")],
    workspaces: workspace,
    results: [
      { name: "image", type: "string" },
      { name: "digest", type: "string" },
    ],
    steps: [
      {
        name: "build-push",
        image: "quay.io/podman/stable:v5.4.2",
        securityContext: { privileged: true },
        workingDir: "$(workspaces.source.path)",
        env: [
          { name: "IMAGE_REPOSITORY", value: "$(params.image-repository)" },
        ],
        volumeMounts: [
          { name: "registry-auth", mountPath: "/auth", readOnly: true },
        ],
        script: String.raw`#!/bin/sh
set -eu
VERSION=$(sed -n 's/.*<artifactId>payment-api<\/artifactId><version>\([^<]*\)<\/version>.*/\1/p' pom.xml)
IMAGE="$IMAGE_REPOSITORY:v$VERSION"
podman build -f Containerfile -t "$IMAGE" .
podman push --authfile /auth/.dockerconfigjson --digestfile /tmp/digest "$IMAGE"
printf '%s' "$IMAGE" > "$(results.image.path)"
cat /tmp/digest > "$(results.digest.path)"
`,
      },
    ],
    volumes: [
      { name: "registry-auth", secret: { secretName: "release-registry" } },
    ],
  }),
  resource("Task", "release-scan", {
    params: [param("image")],
    results: [{ name: "check-exit", type: "string" }],
    steps: [
      {
        name: "image-check",
        image:
          "registry.redhat.io/advanced-cluster-security/rhacs-roxctl-rhel8:4.11.3",
        env: [
          { name: "IMAGE", value: "$(params.image)" },
          {
            name: "ROX_CENTRAL_ADDRESS",
            valueFrom: {
              secretKeyRef: { name: "central-access", key: "endpoint" },
            },
          },
          {
            name: "ROX_API_TOKEN",
            valueFrom: {
              secretKeyRef: { name: "central-access", key: "token" },
            },
          },
        ],
        script: `#!/bin/sh\nset +e\nroxctl image check --image "$IMAGE" --output json\nRC=$?\nprintf '%s' "$RC" > "$(results.check-exit.path)"\nexit "$RC"\n`,
      },
    ],
  }),
  resource("Task", "release-sign", {
    params: [param("image"), param("digest")],
    steps: [
      {
        name: "sign",
        image: "ghcr.io/sigstore/cosign/cosign:v2.4.3",
        command: ["cosign"],
        args: [
          "sign",
          "--yes",
          "--key",
          "/keys/cosign.key",
          "$(params.image)@$(params.digest)",
        ],
        env: [
          {
            name: "COSIGN_PASSWORD",
            valueFrom: {
              secretKeyRef: { name: "signing-key", key: "password" },
            },
          },
        ],
        volumeMounts: [
          { name: "signing-key", mountPath: "/keys", readOnly: true },
          { name: "registry-auth", mountPath: "/root/.docker", readOnly: true },
        ],
      },
    ],
    volumes: [
      { name: "signing-key", secret: { secretName: "signing-key" } },
      {
        name: "registry-auth",
        secret: {
          secretName: "release-registry",
          items: [{ key: ".dockerconfigjson", path: "config.json" }],
        },
      },
    ],
  }),
];
export const releasePipeline = resource("Pipeline", "secure-release", {
  params: sourceParams,
  workspaces: workspace,
  results: [
    { name: "commit", value: "$(tasks.fetch.results.commit)" },
    { name: "image", value: "$(tasks.build.results.image)" },
    { name: "digest", value: "$(tasks.build.results.digest)" },
  ],
  tasks: [
    {
      name: "fetch",
      taskRef: { name: "release-fetch" },
      params: [
        { name: "repo-url", value: "$(params.repo-url)" },
        { name: "revision", value: "$(params.revision)" },
      ],
      workspaces: workspace.map((w) => ({ ...w, workspace: "source" })),
    },
    {
      name: "build",
      taskRef: { name: "release-build" },
      runAfter: ["fetch"],
      workspaces: workspace.map((w) => ({ ...w, workspace: "source" })),
    },
    {
      name: "scan",
      taskRef: { name: "release-scan" },
      runAfter: ["build"],
      params: [{ name: "image", value: "$(tasks.build.results.image)" }],
    },
    {
      name: "sign",
      taskRef: { name: "release-sign" },
      runAfter: ["scan"],
      when: [
        {
          input: "$(tasks.scan.results.check-exit)",
          operator: "in",
          values: ["0"],
        },
      ],
      params: [
        { name: "image", value: "$(tasks.build.results.image)" },
        { name: "digest", value: "$(tasks.build.results.digest)" },
      ],
    },
  ],
});
export function releaseRun(
  name: string,
  revision = "main",
  namespace = "rs-18",
): Resource {
  return {
    ...resource("PipelineRun", name, {
      pipelineRef: { name: "secure-release" },
      params: [
        { name: "repo-url", value: repositoryUrl },
        { name: "revision", value: revision },
      ],
      taskRunTemplate: { serviceAccountName: "release-runner" },
      taskRunSpecs: [
        { pipelineTaskName: "build", serviceAccountName: "release-builder" },
      ],
      workspaces: [
        {
          name: "source",
          volumeClaimTemplate: {
            spec: {
              accessModes: ["ReadWriteOnce"],
              resources: { requests: { storage: "1Gi" } },
            },
          },
        },
      ],
    }),
    metadata: { name, namespace },
  };
}
export const releaseTriggers: Resource[] = [
  resource(
    "TriggerBinding",
    "release-push",
    {
      params: [
        { name: "revision", value: "$(body.after)" },
        { name: "repo-url", value: "$(body.repository.clone_url)" },
      ],
    },
    "triggers.tekton.dev/v1beta1",
  ),
  resource(
    "TriggerTemplate",
    "release-push",
    {
      params: [{ name: "revision" }, { name: "repo-url" }],
      resourcetemplates: [
        {
          ...releaseRun("unused"),
          metadata: { generateName: "secure-release-" },
          spec: {
            ...releaseRun("unused").spec,
            params: [
              { name: "repo-url", value: "$(tt.params.repo-url)" },
              { name: "revision", value: "$(tt.params.revision)" },
            ],
          },
        },
      ],
    },
    "triggers.tekton.dev/v1beta1",
  ),
  resource(
    "EventListener",
    "release-push",
    {
      serviceAccountName: "release-webhook",
      triggers: [
        {
          name: "push",
          bindings: [{ ref: "release-push" }],
          template: { ref: "release-push" },
        },
      ],
    },
    "triggers.tekton.dev/v1beta1",
  ),
];
export const initialReleaseRevision = seedRevision;
