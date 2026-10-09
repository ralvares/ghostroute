import type { Resource } from "./cluster-model.js";
import type { DomainEvent } from "./events.js";
import { parse } from "yaml";
import { policyFiles } from "./resources.js";

interface IncidentSeed {
  audit: DomainEvent[];
  podRev: number;
  policies: Set<string>;
  deployment: {env: Record<string,string>; readyReplicas: number};
  pods: {name:string; node:string; ready:boolean}[];
}

/** Seed an incident once. Its resources subsequently belong to the common API store. */
export function buildIncidentResources(state: IncidentSeed): Resource[] {
  const paymentPodCreated =
    [...state.audit].reverse().find(
      (event) =>
        event.type === "pods.replaced" && event.data.revision === state.podRev,
    )?.at ?? "2026-10-08T00:14:00Z";
  return [
    ...[...state.policies].map(
      (name) =>
        parse(
          policyFiles[
            name === "payment-egress"
              ? "policies/payments-egress.yaml"
              : "policies/deny-all.yaml"
          ],
        ) as Resource,
    ),
    {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: "payment-api",
        namespace: "payments",
        generation: state.podRev,
        creationTimestamp: "2026-10-08T00:14:00Z",
        labels: { app: "payment-api" },
      },
      spec: {
        replicas: 2,
        selector: { matchLabels: { app: "payment-api" } },
        template: {
          metadata: { labels: { app: "payment-api" } },
          spec: {
            serviceAccountName: "payment-app",
            hostUsers: false,
            containers: [
              {
                name: "payment-api",
                image: "registry.example.test/payments:v1.8.2",
                env: Object.entries(state.deployment.env).map(([name, value]) => ({
                  name,
                  value,
                })),
              },
            ],
          },
        },
      },
      status: {
        replicas: 2,
        updatedReplicas: 2,
        readyReplicas: state.deployment.readyReplicas,
        availableReplicas: state.deployment.readyReplicas,
      },
    },
    ...state.pods.map((pod) => ({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: pod.name,
        namespace: "payments",
        creationTimestamp: paymentPodCreated,
        labels: { app: "payment-api" },
        annotations: { "openshift.io/scc": "restricted-v3" },
      },
      spec: {
        hostUsers: false,
        nodeName: pod.node,
        serviceAccountName: "payment-app",
        containers: [
          {
            name: "payment-api",
            image: "registry.example.test/payments:v1.8.2",
            env: Object.entries(state.deployment.env).map(([name, value]) => ({
              name,
              value,
            })),
          },
        ],
      },
      status: {
        phase: "Running",
        podIP: pod.node === "worker-01" ? "10.128.0.21" : "10.129.0.22",
        podIPs: [
          { ip: pod.node === "worker-01" ? "10.128.0.21" : "10.129.0.22" },
        ],
        conditions: [{ type: "Ready", status: pod.ready ? "True" : "False" }],
        containerStatuses: [
          {
            name: "payment-api",
            ready: pod.ready,
            restartCount: 0,
            state: { running: { startedAt: paymentPodCreated } },
          },
        ],
      },
    })),
    {
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "ledger-86bbb-zyx12",
        namespace: "payments",
        creationTimestamp: "2026-10-08T00:14:00Z",
        labels: { app: "ledger" },
        annotations: { "openshift.io/scc": "restricted-v3" },
      },
      spec: {
        nodeName: "worker-02",
        containers: [
          { name: "ledger", image: "registry.example.test/ledger:v1" },
        ],
      },
      status: {
        phase: "Running",
        podIP: "10.129.0.23",
        podIPs: [{ ip: "10.129.0.23" }],
        conditions: [{ type: "Ready", status: "True" }],
        containerStatuses: [
          {
            name: "ledger",
            ready: true,
            restartCount: 0,
            state: { running: { startedAt: "2026-10-08T00:14:00Z" } },
          },
        ],
      },
    },
  ];
}
