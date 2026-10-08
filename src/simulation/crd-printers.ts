import type { PrinterColumn } from "./resource-table.js";
/** Pinned upstream installed-operator schemas; source links are part of the registry. */
export const crdPrinters: Record<
  string,
  { source: string; apiVersion: string; columns: PrinterColumn[] }
> = {
  ComplianceRemediation: {
    source:
      "https://raw.githubusercontent.com/ComplianceAsCode/compliance-operator/d06f232a69f87eee42f808ddb4edb9804d8cdf9a/config/crd/bases/compliance.openshift.io_complianceremediations.yaml",
    apiVersion: "compliance.openshift.io/v1alpha1",
    columns: [
      {
        jsonPath: ".status.applicationState",
        name: "State",
        type: "string",
      },
    ],
  },
  ComplianceScan: {
    source:
      "https://raw.githubusercontent.com/ComplianceAsCode/compliance-operator/d06f232a69f87eee42f808ddb4edb9804d8cdf9a/config/crd/bases/compliance.openshift.io_compliancescans.yaml",
    apiVersion: "compliance.openshift.io/v1alpha1",
    columns: [
      {
        jsonPath: ".status.phase",
        name: "Phase",
        type: "string",
      },
      {
        jsonPath: ".status.result",
        name: "Result",
        type: "string",
      },
    ],
  },
  TailoredProfile: {
    source:
      "https://raw.githubusercontent.com/ComplianceAsCode/compliance-operator/d06f232a69f87eee42f808ddb4edb9804d8cdf9a/config/crd/bases/compliance.openshift.io_tailoredprofiles.yaml",
    apiVersion: "compliance.openshift.io/v1alpha1",
    columns: [
      {
        description: "State of the tailored profile",
        jsonPath: ".status.state",
        name: "State",
        type: "string",
      },
    ],
  },
  EgressIP: {
    source:
      "https://raw.githubusercontent.com/ovn-kubernetes/ovn-kubernetes/da2e96ff31b96bcdd551b4d6e8b691e7c48b68da/helm/ovn-kubernetes/crds/k8s.ovn.org_egressips.yaml",
    apiVersion: "k8s.ovn.org/v1",
    columns: [
      {
        jsonPath: ".spec.egressIPs[*]",
        name: "EgressIPs",
        type: "string",
      },
      {
        jsonPath: ".status.items[*].node",
        name: "Assigned Node",
        type: "string",
      },
      {
        jsonPath: ".status.items[*].egressIP",
        name: "Assigned EgressIPs",
        type: "string",
      },
    ],
  },
  UserDefinedNetwork: {
    source:
      "https://raw.githubusercontent.com/ovn-kubernetes/ovn-kubernetes/da2e96ff31b96bcdd551b4d6e8b691e7c48b68da/helm/ovn-kubernetes/crds/k8s.ovn.org_userdefinednetworks.yaml",
    apiVersion: "k8s.ovn.org/v1",
    columns: [],
  },
  Pipeline: {
    source:
      "https://raw.githubusercontent.com/tektoncd/pipeline/d1aa60f88c86a8b966c6fa059d460b5394bff594/config/300-crds/300-pipeline.yaml",
    apiVersion: "tekton.dev/v1",
    columns: [],
  },
  PipelineRun: {
    source:
      "https://raw.githubusercontent.com/tektoncd/pipeline/d1aa60f88c86a8b966c6fa059d460b5394bff594/config/300-crds/300-pipelinerun.yaml",
    apiVersion: "tekton.dev/v1",
    columns: [
      {
        name: "Succeeded",
        type: "string",
        jsonPath: '.status.conditions[?(@.type=="Succeeded")].status',
      },
      {
        name: "Reason",
        type: "string",
        jsonPath: '.status.conditions[?(@.type=="Succeeded")].reason',
      },
      {
        name: "StartTime",
        type: "date",
        jsonPath: ".status.startTime",
      },
      {
        name: "CompletionTime",
        type: "date",
        jsonPath: ".status.completionTime",
      },
    ],
  },
  ExternalSecret: {
    source:
      "https://raw.githubusercontent.com/external-secrets/external-secrets/088f9e5ff057d35bd9f68779893b691abb948b33/config/crds/bases/external-secrets.io_externalsecrets.yaml",
    apiVersion: "external-secrets.io/v1",
    columns: [
      {
        jsonPath: ".spec.secretStoreRef.kind",
        name: "StoreType",
        type: "string",
      },
      {
        jsonPath: ".spec.secretStoreRef.name",
        name: "Store",
        type: "string",
      },
      {
        jsonPath: ".spec.refreshInterval",
        name: "Refresh Interval",
        type: "string",
      },
      {
        jsonPath: '.status.conditions[?(@.type=="Ready")].reason',
        name: "Status",
        type: "string",
      },
      {
        jsonPath: '.status.conditions[?(@.type=="Ready")].status',
        name: "Ready",
        type: "string",
      },
      {
        jsonPath: ".status.refreshTime",
        name: "Last Sync",
        type: "date",
      },
    ],
  },
  SecretStore: {
    source:
      "https://raw.githubusercontent.com/external-secrets/external-secrets/088f9e5ff057d35bd9f68779893b691abb948b33/config/crds/bases/external-secrets.io_secretstores.yaml",
    apiVersion: "external-secrets.io/v1",
    columns: [
      {
        jsonPath: ".metadata.creationTimestamp",
        name: "AGE",
        type: "date",
      },
      {
        jsonPath: '.status.conditions[?(@.type=="Ready")].reason',
        name: "Status",
        type: "string",
      },
      {
        jsonPath: ".status.capabilities",
        name: "Capabilities",
        type: "string",
      },
      {
        jsonPath: '.status.conditions[?(@.type=="Ready")].status',
        name: "Ready",
        type: "string",
      },
    ],
  },
  SecretProviderClass: {
    source:
      "https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/f36b3e36fa4e6900cdb4503dd00f37b465728d4f/config/crd/bases/secrets-store.csi.x-k8s.io_secretproviderclasses.yaml",
    apiVersion: "secrets-store.csi.x-k8s.io/v1",
    columns: [],
  },
  SeccompProfile: {
    source:
      "https://raw.githubusercontent.com/kubernetes-sigs/security-profiles-operator/17e2bbd9f9e33e805f7eac853d6b405f0899a577/deploy/base-crds/crds/seccompprofile.yaml",
    apiVersion: "security-profiles-operator.x-k8s.io/v1",
    columns: [
      {
        jsonPath: ".status.status",
        name: "Status",
        type: "string",
      },
      {
        jsonPath: ".metadata.creationTimestamp",
        name: "Age",
        type: "date",
      },
      {
        jsonPath: ".status.localhostProfile",
        name: "LocalhostProfile",
        priority: 10,
        type: "string",
      },
    ],
  },
  PrometheusRule: {
    source:
      "https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/0428fa4a637b4d3f06c3698bb394a07d5a1d0ba7/example/prometheus-operator-crd/monitoring.coreos.com_prometheusrules.yaml",
    apiVersion: "monitoring.coreos.com/v1",
    columns: [],
  },
};
