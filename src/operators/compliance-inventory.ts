import type { Resource } from "../simulation/cluster-model.js";
export const apiVersion = "compliance.openshift.io/v1alpha1";
export const ruleIds = {
  "rhcos4-service-auditd-enabled":
    "xccdf_org.ssgproject.content_rule_service_auditd_enabled",
  "rhcos4-kernel-module-usb-storage-disabled":
    "xccdf_org.ssgproject.content_rule_kernel_module_usb-storage_disabled",
};
export function complianceInventory(namespace: string): Resource[] {
  const metadata = (name: string) => ({
    name,
    namespace,
    labels: { "compliance.openshift.io/profile-bundle": "rhcos4" },
  });
  return [
    {
      apiVersion,
      kind: "ProfileBundle",
      metadata: metadata("rhcos4"),
      spec: {
        contentImage:
          "registry.redhat.io/compliance/openshift-compliance-content-rhel8:latest",
        contentFile: "ssg-rhcos4-ds.xml",
      },
      status: {
        dataStreamStatus: "VALID",
        conditions: [{ type: "Ready", status: "True", reason: "Valid" }],
      },
    },
    {
      apiVersion,
      kind: "Profile",
      metadata: metadata("rhcos4-moderate"),
      id: "xccdf_org.ssgproject.content_profile_moderate",
      title: "Moderate baseline",
      description: "Recorded audit and USB posture checks",
      rules: Object.keys(ruleIds),
    },
    ...Object.entries(ruleIds).map(([name, id]) => ({
      apiVersion,
      kind: "Rule",
      metadata: metadata(name),
      id,
      title: name,
      description: "Recorded posture check",
      severity: "medium",
      checkType: "Node",
    })),
    {
      apiVersion,
      kind: "ScanSetting",
      metadata: { name: "default", namespace },
      roles: ["worker"],
      rawResultStorage: { enabled: false },
      schedule: "0 1 * * *",
    },
    {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: { name: "node-posture", namespace },
      data: { audit: "disabled", usb: "absent" },
    },
  ];
}
