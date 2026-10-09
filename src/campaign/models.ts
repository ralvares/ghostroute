import {consumerFile, consumerEnvironment} from "../security/secret-consumers.js";
import {reconcileNetworks} from "../network/user-defined.js";
import {reconcileGitOps} from "../gitops/controller.js";
import {reconcileTekton,succeeded} from "../release/tekton.js";
import {registryAuthorized, registryHost, leakedToken, privatePullFailure} from "../security/registry.js";
import {pipelineGate} from "../security/rhacs/policies.js";
import { networkPolicyDirection } from "../security/network-policy.js";
import { normalizeSecret, secretValue } from "../simulation/secrets.js";
import { podNetworkDomain } from "../simulation/pod-addresses.js";
import { coreResources,reconcileNetworkPods } from "../simulation/cluster-api.js";
import { chapters } from "./catalog.js";
import { projectHealth } from "../simulation/health.js";
import { S } from "../simulation/state.js";
import type { Resource, PodSpec } from "../simulation/cluster-model.js";
import { roleAllows } from "../security/rbac.js";
import { admitPod } from "../security/scc.js";

import {resource, valueAt, quantity, match, nsLabels, ready, registryPullFailure, validateCampaignPod, schedulingFailure, flow, reconcileFixtureControllers} from "../simulation/engine.js";
export {resource, valueAt, quantity, match, nsLabels, ready, registryPullFailure, validateCampaignPod, schedulingFailure, flow, reconcileFixtureControllers} from "../simulation/engine.js";
export function evaluateProbe(
  model: string,
  namespace: string,
): { passed: boolean; detail: string } {
  const get = (kind: string, name: string) => resource(kind, name, namespace);
  const data = (name: string) => get("ConfigMap", name)?.data ?? {};
  const app = get("Pod", "app");
  let passed: unknown = false,
    detail = "";
  switch (model) {
    case "owned-ready":
      passed =
        ready(app) &&
        app?.metadata.annotations?.["openshift.io/scc"] === "restricted-v3";
      detail = "Ready Pod with restricted SCC, no privilege grant required.";
      break;
    case "root-rejected": {
      const test: PodSpec = {
        containers: [
          {
            name: "unsafe",
            image: "registry.example.test/owned:arbitrary-uid",
            securityContext: { runAsUser: 0 },
          },
        ],
      };
      passed = !admitPod(
        test,
        S.cluster.sccs,
        new Set(["restricted-v3", "restricted-v2"]),
        [1000780000, 1000789999],
      ).accepted;
      detail = "Restricted admission evaluated the UID-0 negative request.";
      break;
    }
    case "runtime-distinction": {
      const failed = get("Pod", "broken") ?? S.campaign.diagnostics[namespace];
      passed =
        !!failed &&
        failed.metadata.annotations?.["openshift.io/scc"] === "restricted-v3" &&
        !ready(failed);
      detail = get("Pod", "broken")
        ? "Admitted Pod has a runtime failure; retain this diagnosis, then remove the failed Pod."
        : "Retained runtime diagnosis explains the failure; the failed Pod has been removed.";
      break;
    }
    case "reader-allowed":
      passed = roleAllows("case-reader", "get", "configmaps", namespace);
      detail = "RBAC evaluated get ConfigMaps for case-reader.";
      break;
    case "reader-secret-denied":
      passed =
        !roleAllows("case-reader", "get", "secrets", namespace) &&
        !roleAllows("case-reader", "patch", "configmaps", namespace);
      detail = "Secret reads and mutations remain outside the subject's grant.";
      break;
    case "vendor-ready":
      passed =
        ready(get("Pod", "vendor-sim-0")) &&
        get("Pod", "vendor-sim-0")?.spec?.containers?.[0]?.securityContext
          ?.runAsUser === 100;
      detail = "Vendor controller replica is Ready at its required UID.";
      break;
    case "vendor-isolated":
      passed =
        roleAllows(
          "system:serviceaccount:" + namespace + ":vendor",
          "use",
          "securitycontextconstraints",
          namespace,
          "rs-vendor",
        ) &&
        !roleAllows(
          "system:serviceaccount:" + namespace + ":default",
          "use",
          "securitycontextconstraints",
          namespace,
          "rs-vendor",
        ) &&
        data("exception").owner &&
        data("exception").expires &&
        data("exception").scope === "vendor-only";
      detail = "Dedicated grant and accountable exception record checked.";
      break;
    case "budget-fit":
      passed = ready(app) && !!app?.spec?.containers?.[0]?.resources?.requests;
      detail = "Accepted workload has defaulted resources.";
      break;
    case "budget-denied": {
      const sample: Resource = {
        apiVersion: "v1",
        kind: "Pod",
        metadata: { name: "oversized", namespace },
        spec: {
          containers: [
            {
              name: "oversized",
              image: "registry.example.test/owned:arbitrary-uid",
              resources: {
                requests: { cpu: "900m" },
                limits: { cpu: "1", memory: "1Gi" },
              },
            },
          ],
        },
      };
      try {
        validateCampaignPod(sample);
      } catch (error) {
        passed = (error as Error).message.includes("Forbidden");
      }
      detail =
        "Oversized negative request was evaluated against live quotas and limits.";
      break;
    }
    case "secret-current":
      passed =
        ready(app) &&
        secretValue(get("Secret", "database"), "password") === "training-v2" &&
        app?.metadata.annotations?.["roadshow.secret-version"] ===
          "training-v2";
      detail =
        "Consumer startup snapshot compared with current synthetic Secret.";
      break;
    case "secret-retired":
      passed =
        secretValue(get("Secret", "database"), "password") === "training-v2" &&
        !app?.spec?.containers?.some((c) => c.env?.some((e) => !!e.value));
      detail =
        "Old credential is absent and the consumer has no literal password.";
      break;
    case "tls-working":
      passed =
        ready(app) &&
        !!get("Service", "app") &&
        get("Route", "front-door")?.spec?.tls?.termination === "edge";
      detail =
        "Recorded client-to-router TLS termination and selected backend checked.";
      break;
    case "http-redirect":
      passed =
        get("Route", "front-door")?.spec?.tls?.insecureEdgeTerminationPolicy ===
        "Redirect";
      detail = "HTTP redirect configured; router-to-Pod TLS is not asserted.";
      break;
    case "provenance":
      passed =
        ready(app) &&
        app?.spec?.containers?.[0]?.image?.endsWith(
          "@" + data("attestation").digest,
        ) &&
        data("attestation").signed === "true";
      detail =
        "Pinned artifact matches the recorded training catalog, not a live signature service.";
      break;
    case "registry-credential-current": {
      const deploy=get("Deployment","credential-app");
      const pods=S.cluster.resources.filter(p=>p.kind === "Pod" && p.metadata.namespace===namespace && p.metadata.labels?.app === "credential-app");
      passed=!!deploy && pods.length===1 && pods.every(p=>ready(p) && !privatePullFailure(p.spec?.containers?.[0]?.image??"",p));
      detail="Replacement registry credential authenticates the private release; Podman login and kubelet pull Secrets are separate credentials.";
      break;
    }
    case "registry-credential-revoked":
      passed=!registryAuthorized(registryHost,"release-bot",leakedToken,"pull") && !registryAuthorized(registryHost,"release-bot",leakedToken,"push");
      detail="The leaked token remains revoked for push and pull, independent of Secret names or cached Podman login.";
      break;
    case "registry-denied":
      passed = !!registryPullFailure("untrusted.example.test/app:latest");
      detail =
        "Unapproved image pull blocked by the runtime registry policy; API admission is not asserted.";
      break;
    case "timeline":
      passed =
        data("timeline-report").caller === "support-agent" &&
        data("timeline-report").window === "02:13:40-02:14:02";
      detail = "Reported caller and window match retained timeline.";
      break;
    case "attribution":
      passed =
        data("timeline-report").attribution === "credential-only" &&
        data("timeline-report").denied === "portforward";
      detail = "Denied action and attribution limits preserved.";
      break;
    case "threat-coverage":
      passed =
        data("threat-model").assets?.split(",").length >= 3 &&
        data("threat-model").threats?.split(",").length >= 3 &&
        data("threat-model").controls?.includes("RBAC") &&
        data("threat-model").owner === "platform+application";
      detail =
        "Threat-model record covers assets, threats, controls and owners.";
      break;
    case "threat-priority":
      passed = data("threat-model").priority === "credential-then-egress";
      detail =
        "Backlog prioritization is grounded in the retained credential and flow evidence.";
      break;
    case "layer-coverage":
      passed =
        data("layer-map").rhacs === "build-deploy-runtime" &&
        data("layer-map").compliance === "configuration-posture" &&
        data("layer-map").spo === "security-profile-lifecycle";
      detail = "Three distinct operator responsibilities reviewed.";
      break;
    case "layer-boundary":
      passed = data("layer-map").native === "RBAC-SCC-network";
      detail = "Tool coverage does not erase native enforcement.";
      break;
    case "client-flow":
      passed = flow(namespace, "client", "server");
      detail =
        "TCP/8443 evaluated through both ingress and egress policy decisions.";
      break;
    case "peer-blocked":
      passed = !flow(namespace, "stranger", "server");
      detail = "Unrelated peer evaluated against the same policy union.";
      break;
    case "admin-deny":
      passed = !flow(namespace, "client", "external", namespace, true);
      detail =
        "External documentation range remains denied above developer allowances.";
      break;
    case "egress-selected": {
      const e = resource("EgressIP", "rs-egress");
      passed =
        e?.spec?.egressIPs?.[0] === "192.0.2.25" &&
        match(nsLabels(namespace), e?.spec?.namespaceSelector) &&
        (
          e.status?.items as { node: string; egressIP: string }[] | undefined
        )?.some(
          (item: any) =>
            item.node === "worker-02" && item.egressIP === "192.0.2.25",
        );
      detail =
        "Controller assigned the recorded reservation to an egress-capable node for this tenant; external packets are not observed.";
      break;
    }
    case "egress-control": {
      const e = resource("EgressIP", "rs-egress");
      passed = !!e && !match(nsLabels("default"), e?.spec?.namespaceSelector);
      detail =
        "Control namespace is not selected; no claim about actual packets.";
      break;
    }
    case "udn-local":
      passed =
        !!get("UserDefinedNetwork", "primary") &&
        podNetworkDomain(get("Pod", "client")) === namespace + "_primary" &&
        podNetworkDomain(get("Pod", "server")) === namespace + "_primary" &&
        flow(namespace, "client", "server");
      detail = "Recorded local domain permits intended service.";
      break;
    case "udn-cross":
      passed =
        podNetworkDomain(get("Pod", "client")) === namespace + "_primary" &&
        podNetworkDomain(resource("Pod", "peer", namespace + "-peer")) ===
          namespace + "-peer_primary" &&
        !!get("UserDefinedNetwork", "primary") &&
        !flow(namespace, "client", "peer", namespace + "-peer");
      detail = "Separate primary domains prevent the cross-tenant path.";
      break;
    case "vlan-good":
      passed =
        ready(app) &&
        !schedulingFailure(app!) &&
        !!get("NetworkAttachmentDefinition", "vlan200");
      detail =
        "Recorded attachment and capable node satisfy the requested placement.";
      break;
    case "vlan-wrong":
      passed =
        !!app &&
        !!schedulingFailure({
          ...structuredClone(app),
          spec: { ...app.spec, nodeName: "worker-01" },
        });
      detail =
        "Wrong-node negative request fails the recorded capability requirement.";
      break;
    case "release-scoped": {
      const bot = "system:serviceaccount:payments:build-bot";
      passed =
        roleAllows(bot, "get", "deployments", "payments", "payment-api") &&
        !roleAllows(bot, "patch", "deployments", "payments", "payment-api") &&
        !roleAllows(bot, "get", "deployments", "payments", "other") &&
        !roleAllows(bot, "get", "secrets", "payments");
      detail =
        "Original delivery identity retains only payment-api inspection; patching and unrelated reads are denied.";
      break;
    }
    case "pipeline-clean":
      passed =
        S.cluster.resources.some(r=>r.kind==="PipelineRun" && r.metadata.namespace===namespace && succeeded(r)) && data("attestation").scanHigh === "0" &&
        data("promotion-review").supportEnvImport === "disabled" &&
        data("promotion-review").configurationSource === "versioned-reviewed" &&
        data("promotion-review").owner === "Kai and Mira";
      detail =
        "Recorded clean artifact passes scan-before-sign and digest binding; the original unreviewed support import is disabled.";
      break;
    case "gitops-release": {
      const app=resource("Application","payment-api","openshift-gitops"),deployment=resource("Deployment","payment-api","payments");
      const image=deployment?.spec?.template?.spec.containers.find(c=>c.name==="payment-api")?.image;
      passed=(app?.status?.sync as any)?.status==="Synced" && (app?.status?.health as any)?.status==="Healthy" && image==="registry.example.test/payments:v1.8.3";
      detail="The pushed deployment manifest is synced and the repaired payment-api rollout is healthy. CI success alone does not promote the manifest.";
      break;
    }
    case "pipeline-high": {
      const pipe = get("Pipeline", "secure-release");
      passed =
        !!pipe &&
        pipe.spec?.tasks?.[3]?.runAfter?.includes("scan") &&
        pipe.spec.tasks[3].when?.[0]?.values?.length === 1 &&
        pipe.spec.tasks[3].when[0].values[0] === "0" &&
        pipelineGate("registry.example.test/payments:v1.8.2").exitCode === 1;
      detail =
        "The authored vulnerable image fails the same Central BUILD policy check used by roxctl, blocking signing.";
      break;
    }
    case "csi-project":
      passed =
        ready(app) &&
        app?.spec?.volumes?.some(
          (volume: any) =>
            volume.name === "external" &&
            volume.csi?.driver === "secrets-store.csi.k8s.io" &&
            volume.csi?.volumeAttributes?.secretProviderClass === "database",
        ) &&
        app?.spec?.containers?.some((container: any) =>
          container.volumeMounts?.some(
            (mount: any) =>
              mount.name === "external" &&
              mount.mountPath === "/mnt/secrets-store" &&
              mount.readOnly === true,
          ),
        ) &&
        get(
          "SecretProviderClass",
          "database",
        )?.spec?.parameters?.objects?.includes("secret/data/database") &&
        data("provider-record").version === "2" &&
        data("provider-record").auth === "namespace-serviceaccount" && consumerFile(app!, "app", "/mnt/secrets-store/password") === "training-v2";
      detail =
        "Synthetic provider path, authentication record and mounted projection checked.";
      break;
    case "csi-nosync":
      passed =
        !!get("SecretProviderClass", "database") &&
        !get("SecretProviderClass", "database")?.spec?.secretObjects &&
        !get("Secret", "database");
      detail =
        "CSI-only mapping has no sync request or Kubernetes Secret copy.";
      break;
    case "eso-sync":
      passed = !!get("SecretStore", "vault") && (get("ExternalSecret", "database")?.status?.conditions as any[])?.some(c => c.type === "Ready" && c.status === "True") && secretValue(get("Secret", "database"), "password") === "training-v2";
      detail = "The reconciled Secret contains the scoped provider value; an environment consumer still needs a new container.";
      break;
    case "eso-consumer": {
      const consumer = S.cluster.resources.find(r => r.kind === "Pod" && r.metadata.namespace === namespace && r.metadata.labels?.app === "legacy-consumer");
      passed = !!consumer && ready(consumer) && consumerEnvironment(consumer, "app").DB_PASSWORD === "training-v2" && consumerFile(consumer, "app", "/run/secrets/password") === "training-v2";
      const env = consumer ? consumerEnvironment(consumer, "app").DB_PASSWORD : undefined;
      const file = consumer ? consumerFile(consumer, "app", "/run/secrets/password") : undefined;
      detail = `Startup DB_PASSWORD: ${env ?? "<missing>"}. Mounted /run/secrets/password: ${file ?? "<missing>"}. ` + (passed ? "The restarted consumer sees the current credential." : "Secret updates do not replace a running container's environment. Verify the Secret, then restart deployment/legacy-consumer and repeat this check.");
      break;
    }
    case "eso-scoped":
      passed =
        get("ExternalSecret", "database")?.spec?.data?.length === 1 &&
        get("ExternalSecret", "database")?.spec?.data?.[0]?.remoteRef?.key ===
          "database";
      detail = "Only the declared key is copied.";
      break;
    case "correlation":
      passed =
        data("correlation").namespace === "payments" &&
        data("correlation").pod === "payment-api-7d9cd-ab12" &&
        data("correlation").window === "02:13:55" &&
        data("correlation").caller === "support-agent";
      detail = "Join keys match the retained API and runtime window.";
      break;
    case "correlation-scope":
      passed =
        data("correlation").exposure === "unconfirmed" &&
        data("correlation").pod !== "unrelated";
      detail = "No unsupported data-exposure claim or unrelated Pod join.";
      break;
    case "alert-spike":
      passed =
        get("PrometheusRule", "sustained-spike")?.spec?.groups?.[0]?.rules?.[0]
          ?.expr === "rate(container_cpu_usage_seconds_total[5m]) > 0.5";
      detail =
        "Recorded sustained 0.8-0.9 CPU exceeds the configured 0.5 threshold.";
      break;
    case "alert-normal":
      passed =
        get("PrometheusRule", "sustained-spike")?.spec?.groups?.[0]?.rules?.[0]
          ?.for === "5m";
      detail =
        "Normal and single-sample spike fixtures do not sustain five minutes.";
      break;
    case "compliance-effective":
      passed =
        get("ComplianceScan", "district")?.status?.result === "COMPLIANT" &&
        !get("TailoredProfile", "district")?.spec?.disableRules?.some(
          (r: any) => r.name === "rhcos4-service-auditd-enabled",
        );
      detail =
        "Recorded applicable audit control is remediated rather than excluded.";
      break;
    case "compliance-exception":
      passed =
        get("TailoredProfile", "district")?.spec?.disableRules?.length === 1 &&
        !!get("TailoredProfile", "district")?.spec?.disableRules?.[0]?.rationale;
      detail = "Narrow USB exception remains explicit with a rationale.";
      break;
    case "kata-ready":
      passed =
        ready(app) &&
        app?.spec?.runtimeClassName === "kata" &&
        !schedulingFailure(app!);
      detail =
        "RuntimeClass and recorded capable node checked; no VM was started.";
      break;
    case "seccomp-normal":
      passed =
        ready(app) &&
        app?.spec?.containers?.[0]?.securityContext?.seccompProfile
          ?.localhostProfile === "rs-app.json" &&
        ["read", "write", "openat", "close", "exit_group"].every((name) =>
          get("SeccompProfile", "app")?.spec?.syscalls?.some(
            (s: any) => s.action === "SCMP_ACT_ALLOW" && s.names.includes(name),
          ),
        );
      detail =
        "Consumer selects the recorded profile; its normal syscall trace fits the allow set.";
      break;
    case "seccomp-denied":
      passed =
        get("SeccompProfile", "app")?.spec?.defaultAction ===
          "SCMP_ACT_ERRNO" &&
        !get("SeccompProfile", "app")?.spec?.syscalls?.some(
          (s: any) =>
            s.action === "SCMP_ACT_ALLOW" && s.names.includes("unshare"),
        );
      detail = "Recorded unshare is outside the allow set.";
      break;
    case "label-denied":
      try {
        validateCampaignPod({
          apiVersion: "v1",
          kind: "Pod",
          metadata: { name: "ownerless", namespace },
          spec: {
            containers: [
              {
                name: "bad",
                image: "registry.example.test/owned:arbitrary-uid",
              },
            ],
          },
        });
      } catch (error) {
        passed = (error as Error).message.includes("requires owner");
      }
      detail =
        "Ownerless negative Pod evaluated against the scoped constraint.";
      break;
    case "handover":
      passed =
        data("handover").owner === "Mira" &&
        data("handover").evidence === "retained-and-verified" &&
        data("handover").claim === "bounded-simulation";
      detail = "Handover keeps ownership and the actual evidence boundary.";
      break;
    case "campaign-history": {
      const missing = chapters
        .slice(1, -1)
        .flatMap((ch) => [
          ...ch.goals
            .filter(
              (g) =>
                JSON.stringify(
                  valueAt(
                    resource(g.kind, g.name, g.namespace ?? ch.namespace),
                    g.path,
                  ),
                ) !== JSON.stringify(g.value),
            )
            .map((g) => "Chapter " + ch.id + " · " + g.label),
          ...ch.probes
            .filter((p) => !evaluateProbe(p.model, ch.namespace).passed)
            .map((p) => "Chapter " + ch.id + " · " + p.label),
        ]);
      const initial =
        !S.env &&
        S.policy === "allow" &&
        projectHealth(S).checkout === "HEALTHY" &&
        S.incident.explained;
      passed =
        initial &&
        !missing.length &&
        S.campaign.completed.length ===
          S.campaign.active + (S.campaign.finished ? 1 : 0) &&
        S.campaign.completed.every((n, i) => n === i);
      detail =
        (initial
          ? "Original payment cause and containment remain verified."
          : "Original payment cause/containment requires review.") +
        "\n" +
        (missing.length
          ? "Controls to repair:\n" + missing.join("\n")
          : "Every earlier chapter’s resource goals and fixture probes still hold in prod-east.");
      break;
    }
    default:
      throw new Error("simulation: unknown campaign probe " + model);
  }
  return { passed: !!passed, detail };
}
