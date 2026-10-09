import { stringify } from "yaml";
import { imageAssets, imageSbom } from "./images.js";
import { centralPolicies } from "./policies.js";
import { S } from "../../simulation/state.js";
const manifest = (version: string, secure: boolean) => ({
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: { name: "payment-api", namespace: "payments" },
  spec: {
    replicas: 2,
    selector: { matchLabels: { app: "payment-api" } },
    template: {
      metadata: { labels: { app: "payment-api" } },
      spec: {
        serviceAccountName: "payment-app",
        containers: [
          {
            name: "payment-api",
            image: `registry.example.test/payments:${version}`,
            ports: [{ containerPort: 8080 }],
            resources: {
              requests: { cpu: "100m" },
              limits: { memory: "128Mi" },
            },
            securityContext: {
              runAsNonRoot: true,
              allowPrivilegeEscalation: !secure,
              readOnlyRootFilesystem: secure,
              capabilities: { drop: ["ALL"] },
              seccompProfile: { type: "RuntimeDefault" },
            },
          },
        ],
      },
    },
  },
});
export function rhacsFiles(): Record<string, string> {
  return {
    "rhacs/images/catalog.json":
      JSON.stringify(
        {
          provenance:
            "Authored offline game image contents; not production scan evidence.",
          images: imageAssets,
        },
        null,
        2,
      ) + "\n",
    "rhacs/policies/active.json":
      JSON.stringify(centralPolicies(), null, 2) + "\n",
    "rhacs/receipts.json":
      JSON.stringify(S.cluster.rhacs.receipts, null, 2) + "\n",
    "rhacs/attestation-v2.yaml": stringify({
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: { name: "attestation", namespace: "rs-18" },
      data: { digest: imageAssets[1].digest, scanHigh: "0", signed: "true" },
    }),
    "rhacs/pipeline-v1.yaml": stringify({
      apiVersion: "tekton.dev/v1",
      kind: "PipelineRun",
      metadata: { name: "vulnerable-release", namespace: "rs-18" },
      spec: {
        pipelineRef: { name: "secure-release" },
        params: [
          { name: "image", value: imageAssets[0].ref },
          { name: "digest", value: imageAssets[0].digest },
        ],
      },
    }),
    "rhacs/pipeline-v2.yaml": stringify({
      apiVersion: "tekton.dev/v1",
      kind: "PipelineRun",
      metadata: { name: "repaired-release", namespace: "rs-18" },
      spec: {
        pipelineRef: { name: "secure-release" },
        params: [
          { name: "image", value: imageAssets[1].ref },
          { name: "digest", value: imageAssets[1].digest },
        ],
      },
    }),
    "rhacs/payments-v1.yaml": stringify(manifest("v1.8.2", false)),
    "rhacs/payments-v2.yaml": stringify(manifest("v1.8.3", true)),
    "rhacs/sboms/payments-v1.spdx.json":
      JSON.stringify(imageSbom(imageAssets[0]), null, 2) + "\n",
    "rhacs/sboms/payments-v2.spdx.json":
      JSON.stringify(imageSbom(imageAssets[1]), null, 2) + "\n",
    "rhacs/README.md": `Offline Central — roxctl 4.11.3\n\nKai: A signature cannot rescue vulnerable dependencies. Inspect the first release, repair its dependency, then validate its manifest before promotion.\n\nroxctl image scan --image registry.example.test/payments:v1.8.2 --output table\nroxctl image check --image registry.example.test/payments:v1.8.2 --output json\nroxctl image sbom --image registry.example.test/payments:v1.8.2 > payments.spdx.json\nroxctl sbom scan --file payments.spdx.json --output json --fail\nroxctl image check --image registry.example.test/payments:v1.8.3\nroxctl deployment check --file rhacs/payments-v2.yaml --output json\n\nImage tags/digests and package versions come from images/catalog.json. Unknown inputs report a simulation limit. Default Central policies come from StackRox 4.11.3. Stage 18 adds Release workload hardening; warning-only policies do not block a gate. BUILD enforcement and DEPLOY enforcement are independent. The pipeline evaluates these same assets and policies. During Chapter 18, apply pipeline-v1.yaml and inspect its status.scanExitCode (1). Then apply attestation-v2.yaml and pipeline-v2.yaml: the repaired release signs. Restore the chapter attestation.yaml before verifying the original release handover.\n\nThe images and CVE associations are authored teaching assets. No registries or remote services are contacted. Native command syntax is retained; real environments need their own endpoint, credentials and permissions.\n`,
  };
}
