// StackRox 4.11.3 defaults, Apache-2.0. See tools/roxformat/UPSTREAM.md.
import type { Policy } from "./types.js";
export const defaultPolicies: Policy[] = [
  {
    id: "da4e0776-159b-42a3-90a9-18cdd9b485ba",
    name: "OpenShift: Central Admin Secret Accessed",
    description: "Alert when the Central secret is accessed.",
    rationale:
      "The Central secret can be used to login to the Central user interface as the admin user. This secret is generally salted and hashed by default in the data.htpasswd field, but may contain a base64 encoded password in the field data.password (if deployed with an Operator). This field may be safely removed. This secret should only be accessed for break glass troubleshooting and initial configuration. An update or access of this secret may indicate that it will be used to administer and configure security controls.",
    remediation:
      "Ensure that the Central admin secret was accessed for valid buiness purposes.",
    categories: ["Anomalous Activity", "Kubernetes Events"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "AUDIT_LOG_EVENT",
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Kubernetes Resource",
            values: [
              {
                value: "SECRETS",
              },
            ],
          },
          {
            fieldName: "Kubernetes API Verb",
            values: [
              {
                value: "GET",
              },
              {
                value: "PATCH",
              },
              {
                value: "UPDATE",
              },
            ],
          },
          {
            fieldName: "Kubernetes Resource Name",
            values: [
              {
                value: "central-htpasswd",
              },
            ],
          },
          {
            fieldName: "Kubernetes User Name",
            negate: true,
            values: [
              {
                value:
                  "system:serviceaccount:openshift-authentication-operator:rhacs-operator-controller-manager",
              },
              {
                value:
                  "system:serviceaccount:rhacs-operator:rhacs-operator-controller-manager",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0006",
        techniques: ["T1552.007"],
      },
      {
        tactic: "TA0007",
        techniques: ["T1613"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "18cbcb62-7d18-4a6c-b2ca-dd1242746943",
    name: "OpenShift: Kubeadmin Secret Accessed",
    description: "Alert when the kubeadmin secret is accessed",
    rationale:
      "Kubeadmin is the default administrative user for OpenShift and can be used to obtain full administrative access to the cluster. Investigating if this was accessed for valid business purposes can help organizations to control the use of administrative privileges",
    remediation:
      "Audit the access carefully to ensure that this secret is only accessed for valid business purposes.",
    categories: ["Anomalous Activity", "Kubernetes Events"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "AUDIT_LOG_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Kubernetes Resource",
            values: [
              {
                value: "SECRETS",
              },
            ],
          },
          {
            fieldName: "Kubernetes API Verb",
            values: [
              {
                value: "GET",
              },
            ],
          },
          {
            fieldName: "Kubernetes Resource Name",
            values: [
              {
                value: "kubeadmin",
              },
            ],
          },
          {
            fieldName: "Kubernetes User Name",
            negate: true,
            values: [
              {
                value:
                  "system:serviceaccount:openshift-authentication-operator:authentication-operator",
              },
              {
                value: "system:apiserver",
              },
              {
                value:
                  "system:serviceaccount:openshift-authentication:oauth-openshift",
              },
              {
                value:
                  "system:serviceaccount:openshift-compliance:api-resource-collector",
              },
              {
                value:
                  "system:serviceaccount:openshift-oauth-apiserver:oauth-apiserver-sa",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0006",
        techniques: ["T1552.007"],
      },
      {
        tactic: "TA0007",
        techniques: ["T1613"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "80267b36-2182-4fb3-8b53-e80c031f4ad8",
    name: "ADD Command used instead of COPY",
    description: "Alert on deployments using an ADD command",
    rationale:
      "ADD incorporates a broader set of capabilities than COPY, including the ability to specify URLs as the source argument and automatic unpacking of compressed files onto the local filesystem. The effects of ADD can be unpredictable and can lead to larger images. Unless ADD's additional capabilities are required, COPY is recommended.",
    remediation:
      "Replace ADD with COPY when adding new files to the image. Per https://docs.docker.com/develop/develop-images/dockerfile_best-practices, it is better to use RUN curl instead of ADD if you need to access a URL.",
    disabled: true,
    categories: ["DevOps Best Practices", "Docker CIS"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Dockerfile Line",
            values: [
              {
                value: "ADD=.*",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "3a98be1e-d427-41ba-ad60-994e848a5554",
    name: "Emergency Deployment Annotation",
    description:
      'Alert on deployments that use the emergency annotation (e.g. "admission.stackrox.io/break-glass": "ticket-1234") to circumvent StackRox Admission Controller checks',
    rationale:
      'Ideally, all deployments should be validated before they are launched into the cluster; however, in case of emergency, annotations in the form of { "admission.stackrox.io/break-glass": "ticket-1234"} can be used to avoid those checks.',
    remediation: "Redeploy your service and unset the emergency annotation.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Disallowed Annotation",
            values: [
              {
                value: "admission.stackrox.io/break-glass=",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0005",
        techniques: ["T1610"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "a5248b33-5027-4aaf-a6b6-896f73fc6d28",
    name: "Alpine Linux Package Manager (apk) in Image",
    description:
      "Alert on deployments with the Alpine Linux package manager (apk) present",
    rationale:
      "Package managers make it easier for attackers to use compromised containers, since they can easily add software.",
    remediation:
      "Run `apk --purge del apk-tools` in the image build for production containers.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on the master-etcd deployment",
        deployment: {
          name: "master-etcd-openshift-master-.*",
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on the token-refresher deployment in namespace openshift-monitoring",
        deployment: {
          name: "token-refresher",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment csi-azuredisk-node-win in kube-system namespace",
        deployment: {
          name: "csi-azuredisk-node-win",
          scope: {
            namespace: "kube-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Component",
            values: [
              {
                value: "apk-tools=",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "74cfb824-2e65-46b7-b1b4-ba897e53af1f",
    name: "Ubuntu Package Manager in Image",
    description:
      "Alert on deployments with components of the Debian/Ubuntu package management system in the image.",
    rationale:
      "Package managers make it easier for attackers to use compromised containers, since they can easily add software.",
    remediation:
      "Run `dpkg -r --force-all apt apt-get && dpkg -r --force-all debconf dpkg` in the image build for production containers.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment csi-azurefile-node-win in kube-system namespace",
        deployment: {
          name: "csi-azurefile-node-win",
          scope: {
            namespace: "kube-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Component",
            values: [
              {
                value: "apt|dpkg=",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "fb8f8732-c31d-496b-8fb1-d5abe6056e27",
    name: "Pod Service Account Token Automatically Mounted",
    description:
      "Protect pod default service account tokens from compromise by minimizing the mounting of the default service account token to only those pods whose application requires interaction with the Kubernetes API.",
    rationale:
      "By default, Kubernetes automatically provisions a service account for each pod and mounts the secret at runtime. This service account is not typically used. If this pod is compromised and the compromised user has access to the service account, the service account could be used to escalate privileges within the cluster. To reduce the likelihood of privilege escalation this service account should not be mounted by default unless the pod requires direct access to the Kubernetes API as part of the pods functionality.",
    remediation:
      "Add `automountServiceAccountToken: false` or a value distinct from 'default' for the `serviceAccountName` key to the deployment's Pod configuration.",
    categories: ["Security Best Practices", "Privileges"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-master-2.c.acs-team-temp-dev.internal in namespace openshift-config-machine-operator",
        deployment: {
          name: "kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-master-2.c.acs-team-temp-dev.internal",
          scope: {
            namespace: "openshift-config-machine-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-master-1.c.acs-team-temp-dev.internal in namespace openshift-config-machine-operator",
        deployment: {
          name: "kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-master-1.c.acs-team-temp-dev.internal",
          scope: {
            namespace: "openshift-config-machine-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-master-0.c.acs-team-temp-dev.internal in namespace openshift-config-machine-operator",
        deployment: {
          name: "kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-master-0.c.acs-team-temp-dev.internal",
          scope: {
            namespace: "openshift-config-machine-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-worker-c-cfh9c in namespace openshift-config-machine-operator",
        deployment: {
          name: "kube-rbac-proxy-crio-bm-ocp-shift-left-vxhch-worker-c-cfh9c",
          scope: {
            namespace: "openshift-config-machine-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment haproxy-* in namespace openshift-vsphere-infra",
        deployment: {
          name: "haproxy-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment keepalived in namespace openshift-vsphere-infra",
        deployment: {
          name: "keepalived-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment coredns-* in namespace openshift-vsphere-infra",
        deployment: {
          name: "coredns-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment apiserver-watcher-* in namespace openshift-kube-apiserver",
        deployment: {
          name: "apiserver-watcher-.*",
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-apiserver-* in namespace openshift-kube-apiserver",
        deployment: {
          name: "kube-apiserver-.*",
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-apiserver-guard-* in namespace openshift-kube-apiserver",
        deployment: {
          name: "kube-apiserver-guard-.*",
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on deployment openshift-kube-scheduler-* in namespace openshift-kube-scheduler",
        deployment: {
          name: "openshift-kube-scheduler-.*",
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on deployment openshift-kube-scheduler-guard-* in namespace openshift-kube-scheduler",
        deployment: {
          name: "openshift-kube-scheduler-guard-.*",
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on deployment etcd-* in namespace openshift-etcd",
        deployment: {
          name: "etcd-.*",
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on deployment etcd-guard-* in namespace openshift-etcd",
        deployment: {
          name: "etcd-guard-.*",
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-controller-manager-* in namespace openshift-kube-controller-manager",
        deployment: {
          name: "kube-controller-manager-.*",
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-controller-manager-guard* in namespace openshift-kube-controller-manager",
        deployment: {
          name: "kube-controller-manager-guard.*",
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on deployment splunkforwarder-ds in openshift-security namespace",
        deployment: {
          name: "splunkforwarder-ds",
          scope: {
            namespace: "openshift-security",
          },
        },
      },
      {
        name: "Don't alert on namespace openshift-kube-apiserver",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on namespace openshift-kube-scheduler",
        deployment: {
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on namespace openshift-etcd",
        deployment: {
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on namespace openshift-kube-controller-manager",
        deployment: {
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on deployment blackbox-exporter in  openshift-route-monitor-operator namespace",
        deployment: {
          name: "blackbox-exporter",
          scope: {
            namespace: "openshift-route-monitor-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment token-refresher in openshift-monitoring namespace",
        deployment: {
          name: "token-refresher",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment downloads in openshift-console namespace",
        deployment: {
          name: "downloads",
          scope: {
            namespace: "openshift-console",
          },
        },
      },
      {
        name: "Don't alert on deployment csi-snapshot-webhook in openshift-cluster-storage-operator namepsace",
        deployment: {
          name: "csi-snapshot-webhook",
          scope: {
            namespace: "openshift-cluster-storage-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment network-operator in openshift-network-operator namespace",
        deployment: {
          name: "network-operator",
          scope: {
            namespace: "openshift-network-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment network-check-target in openshift-network-diagnostics Namespace",
        deployment: {
          name: "network-check-target",
          scope: {
            namespace: "openshift-network-diagnostics",
          },
        },
      },
      {
        name: "Don't alert on deployment machine-config-operator in openshift-machine-config-operator Namespace",
        deployment: {
          name: "machine-config-operator",
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment ingress-canary in openshift-ingress-canary Namespace",
        deployment: {
          name: "ingress-canary",
          scope: {
            namespace: "openshift-ingress-canary",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-service-proxy in namespace open-cluster-management-agent-addon ",
        deployment: {
          name: "cluster-proxy-service-proxy",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment multus in namespace openshift-multus",
        deployment: {
          name: "multus",
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on deployment validation-webhook in namespace openshift-validation-webhook",
        deployment: {
          name: "validation-webhook",
          scope: {
            namespace: "openshift-validation-webhook",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Automount Service Account Token",
            values: [
              {
                value: "true",
              },
            ],
          },
          {
            fieldName: "Service Account",
            values: [
              {
                value: "default",
              },
            ],
          },
          {
            fieldName: "Namespace",
            negate: true,
            values: [
              {
                value: "kube-system",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "89cae2e6-0cb7-4329-8692-c2c3717c1237",
    name: "Unauthorized Process Execution",
    description:
      "This policy generates a violation for any process execution that is not explicitly allowed by a locked process baseline for a given container specification within a Kubernetes deployment.",
    rationale:
      "A locked process baseline communicates high confidence that execution of a process not included in the baseline positively indicates malicious activity.",
    remediation:
      "Evaluate this process execution for malicious intent, examine other accessible resources for abnormal activity, then kill the pod in which this process executed.",
    categories: ["Anomalous Activity"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Unexpected Process Executed",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "30e8cb50-d93f-42a1-b022-ec7de7ab7b65",
    name: "CAP_SYS_ADMIN capability added",
    description:
      "Alert on deployments with containers escalating with CAP_SYS_ADMIN",
    rationale:
      "CAP_SYS_ADMIN grants an elevated level of privilege to a container that may not be necessary. https://lwn.net/Articles/486306/ explains what CAP_SYS_ADMIN does and points to possible alternatives.",
    remediation:
      "Ensure that the container really needs the CAP_SYS_ADMIN capability or use a userspace derivative.",
    categories: ["Privileges"],
    lifecycleStages: ["DEPLOY"],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Add Capabilities",
            values: [
              {
                value: "SYS_ADMIN",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "3bf3cec3-d3e8-4512-86ca-b306697d4b75",
    name: "Secure Shell (ssh) Port Exposed",
    description:
      "Alert on deployments exposing port 22, commonly reserved for SSH access.",
    rationale:
      "Port 22 is reserved for SSH access. SSH should not typically be used within containers.",
    remediation:
      "Ensure that non-SSH services are not using port 22. Ensure that any actual SSH servers have been vetted.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Exposed Port",
            values: [
              {
                value: "22",
              },
            ],
          },
          {
            fieldName: "Exposed Port Protocol",
            values: [
              {
                value: "tcp",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "1913283f-ce3c-4134-84ef-195c4cd687ae",
    name: "Curl in Image",
    description: "Alert on deployments with curl present",
    rationale:
      "Leaving download tools like curl in an image makes it easier for attackers to use compromised containers, since they can easily download software.",
    remediation:
      'Use your package manager\'s "remove", "purge" or "erase" command to remove curl from the image build for production containers. Ensure that any configuration files are also removed.',
    disabled: true,
    categories: ["Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on StackRox collector",
        deployment: {
          name: "collector",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on StackRox central",
        deployment: {
          name: "central",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on StackRox sensor",
        deployment: {
          name: "sensor",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on StackRox admission controller",
        deployment: {
          name: "admission-control",
          scope: {
            namespace: "stackrox",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Component",
            values: [
              {
                value: "curl=",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "93f4b2dd-ef5a-419e-8371-38aed480fb36",
    name: "Fixable CVSS >= 6 and Privileged",
    description:
      "Alert on deployments running in privileged mode with fixable vulnerabilities with a CVSS of at least 6",
    rationale:
      "Known vulnerabilities make it easier for adversaries to exploit your application, and highly privileged containers pose greater risk. You can fix these high-severity vulnerabilities by updating to a newer version of the affected component(s).",
    remediation:
      "Use your package manager to update to a fixed version in future builds, run your container with lower privileges, or speak with your security team to mitigate the vulnerabilities.",
    disabled: true,
    categories: ["Vulnerability Management", "Privileges"],
    lifecycleStages: ["DEPLOY"],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Privileged Container",
            values: [
              {
                value: "true",
              },
            ],
          },
          {
            fieldName: "Fixed By",
            values: [
              {
                value: ".*",
              },
            ],
          },
          {
            fieldName: "CVSS",
            values: [
              {
                value: ">= 6.000000",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "f09f8da1-6111-4ca0-8f49-294a76c65115",
    name: "Fixable CVSS >= 7",
    description:
      "Alert on deployments with fixable vulnerabilities with a CVSS of at least 7",
    rationale:
      "Known vulnerabilities make it easier for adversaries to exploit your application. You can fix these high-severity vulnerabilities by updating to a newer version of the affected component(s).",
    remediation:
      "Use your package manager to update to a fixed version in future builds or speak with your security team to mitigate the vulnerabilities.",
    disabled: true,
    categories: ["Vulnerability Management"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "HIGH_SEVERITY",
    enforcementActions: ["FAIL_BUILD_ENFORCEMENT"],
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Fixed By",
            values: [
              {
                value: ".*",
              },
            ],
          },
          {
            fieldName: "CVSS",
            values: [
              {
                value: ">= 7.000000",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "dae95df3-ce8e-435c-8e16-c5197943db6e",
    name: "Deployments should have at least one egress Network Policy",
    description: "Alerts if deployments are missing an egress Network Policy",
    rationale:
      "Pods that lack egress Network Policies have unrestricted network access and may exfiltrate data or communicate with untrusted endpoints",
    remediation:
      "Create and apply an appropriate Network Policy of type egress to all Deployments. See https://kubernetes.io/docs/concepts/services-networking/network-policies/ for details",
    disabled: true,
    categories: ["Security Best Practices", "Zero Trust"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-scheduler namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-controller-manager namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
      {
        name: "Don't alert on openshift-network-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-network-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-multus namespace",
        deployment: {
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-version namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-version",
          },
        },
      },
      {
        name: "Don't alert on node-ca DaemonSet in the openshift-image-registry namespace",
        deployment: {
          name: "node-ca",
          scope: {
            namespace: "openshift-image-registry",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-etcd namespace",
        deployment: {
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-machine-config-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-monitoring namespace",
        deployment: {
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-machine-api namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-api",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-cluster-node-tuning-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Alert on missing egress Network Policy",
        policyGroups: [
          {
            fieldName: "Has Egress Network Policy",
            values: [
              {
                value: "false",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "38bf79e7-48bf-4ab1-b72f-38e8ad8b4ec3",
    name: "Deployments should have at least one ingress Network Policy",
    description: "Alerts if deployments are missing an ingress Network Policy",
    rationale:
      "Pods that lack ingress Network Policies have unrestricted reachability on the network and may be exposed to attacks",
    remediation:
      "Create and apply an appropriate Network Policy of type ingress to all Deployments. See https://kubernetes.io/docs/concepts/services-networking/network-policies/ for details",
    disabled: true,
    categories: ["Security Best Practices", "Zero Trust"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-scheduler namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-controller-manager namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
      {
        name: "Don't alert on openshift-network-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-network-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-multus namespace",
        deployment: {
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-version namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-version",
          },
        },
      },
      {
        name: "Don't alert on node-ca DaemonSet in the openshift-image-registry namespace",
        deployment: {
          name: "node-ca",
          scope: {
            namespace: "openshift-image-registry",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-etcd namespace",
        deployment: {
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-machine-config-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-monitoring namespace",
        deployment: {
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-machine-api namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-api",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-cluster-node-tuning-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Alert on missing ingres Network Policy",
        policyGroups: [
          {
            fieldName: "Has Ingress Network Policy",
            values: [
              {
                value: "false",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "f95ff08d-130a-465a-a27e-32ed1fb05555",
    name: "Red Hat Package Manager in Image",
    description:
      "Alert on deployments with components of the Red Hat/Fedora/CentOS package management system.",
    rationale:
      "Package managers make it easier for attackers to use compromised containers, since they can easily add software.",
    remediation:
      "Run `rpm -e --nodeps $(rpm -qa '*rpm*' '*dnf*' '*libsolv*' '*hawkey*' 'yum*')` in the image build for production containers.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment collector in namespace stackrox",
        deployment: {
          name: "collector",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on deployment sensor in namespace stackrox",
        deployment: {
          name: "sensor",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on deployment central in namespace stackrox",
        deployment: {
          name: "central",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on deployment admission-control in namespace stackrox",
        deployment: {
          name: "admission-control",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on StackRox scanner",
        deployment: {
          name: "scanner",
          scope: {
            label: {
              key: "app.kubernetes.io/name",
              value: "stackrox",
            },
          },
        },
      },
      {
        name: "Don't alert on RHACS operator controller",
        deployment: {
          name: "rhacs-operator-controller-manager",
          scope: {
            label: {
              key: "app",
              value: "rhacs-operator",
            },
          },
        },
      },
      {
        name: "Don't alert on system namespaces",
        deployment: {
          scope: {
            namespace: "^kube.*|^openshift.*|^redhat.*|^istio-system$",
          },
        },
      },
      {
        name: "Don't alert on deployment application-manager in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "application-manager",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment automation-controller-operator-controller-manager in namespace aap",
        deployment: {
          name: "automation-controller-operator-controller-manager",
          scope: {
            namespace: "aap",
          },
        },
      },
      {
        name: "Don't alert on deployment automation-hub-operator-controller-manager in namespace aap",
        deployment: {
          name: "automation-hub-operator-controller-manager",
          scope: {
            namespace: "aap",
          },
        },
      },
      {
        name: "Don't alert on deployment cert-policy-controller in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "cert-policy-controller",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-curator-controller in namespace multicluster-engine",
        deployment: {
          name: "cluster-curator-controller",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-image-set-controller in namespace multicluster-engine",
        deployment: {
          name: "cluster-image-set-controller",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager in namespace multicluster-engine",
        deployment: {
          name: "cluster-manager",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-placement-controller in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-placement-controller",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-registration-controller in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-registration-controller",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-registration-webhook in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-registration-webhook",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-work-webhook in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-work-webhook",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy in namespace multicluster-engine",
        deployment: {
          name: "cluster-proxy",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-addon-manager in namespace multicluster-engine",
        deployment: {
          name: "cluster-proxy-addon-manager",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-addon-user in namespace multicluster-engine",
        deployment: {
          name: "cluster-proxy-addon-user",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-proxy-agent in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "cluster-proxy-proxy-agent",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-service-proxy in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "cluster-proxy-service-proxy",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment clusterclaims-controller in namespace multicluster-engine",
        deployment: {
          name: "clusterclaims-controller",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment clusterlifecycle-state-metrics-v2 in namespace multicluster-engine",
        deployment: {
          name: "clusterlifecycle-state-metrics-v2",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment config-policy-controller in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "config-policy-controller",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment console-chart-console-v2 in namespace open-cluster-management",
        deployment: {
          name: "console-chart-console-v2",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment console-mce-console in namespace multicluster-engine",
        deployment: {
          name: "console-mce-console",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment discovery-operator in namespace multicluster-engine",
        deployment: {
          name: "discovery-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment governance-policy-framework in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "governance-policy-framework",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment grc-policy-addon-controller in namespace open-cluster-management",
        deployment: {
          name: "grc-policy-addon-controller",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment grc-policy-propagator in namespace open-cluster-management",
        deployment: {
          name: "grc-policy-propagator",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-clustersync in namespace hive",
        deployment: {
          name: "hive-clustersync",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-controllers in namespace hive",
        deployment: {
          name: "hive-controllers",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-operator in namespace multicluster-engine",
        deployment: {
          name: "hive-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment hiveadmission in namespace hive",
        deployment: {
          name: "hiveadmission",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment iam-policy-controller in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "iam-policy-controller",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment infrastructure-operator in namespace multicluster-engine",
        deployment: {
          name: "infrastructure-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment insights-client in namespace open-cluster-management",
        deployment: {
          name: "insights-client",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment insights-metrics in namespace open-cluster-management",
        deployment: {
          name: "insights-metrics",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet in namespace open-cluster-management-agent",
        deployment: {
          name: "klusterlet",
          scope: {
            namespace: "open-cluster-management-agent",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-addon-controller-v2 in namespace open-cluster-management",
        deployment: {
          name: "klusterlet-addon-controller-v2",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-addon-search in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "klusterlet-addon-search",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-addon-workmgr in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "klusterlet-addon-workmgr",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-registration-agent in namespace open-cluster-management-agent",
        deployment: {
          name: "klusterlet-registration-agent",
          scope: {
            namespace: "open-cluster-management-agent",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-work-agent in namespace open-cluster-management-agent",
        deployment: {
          name: "klusterlet-work-agent",
          scope: {
            namespace: "open-cluster-management-agent",
          },
        },
      },
      {
        name: "Don't alert on deployment managedcluster-import-controller-v2 in namespace multicluster-engine",
        deployment: {
          name: "managedcluster-import-controller-v2",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment multicluster-engine-operator in namespace multicluster-engine",
        deployment: {
          name: "multicluster-engine-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment multicluster-observability-operator in namespace open-cluster-management",
        deployment: {
          name: "multicluster-observability-operator",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment multicluster-operators-application in namespace open-cluster-management",
        deployment: {
          name: "multicluster-operators-application",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment multicluster-operators-channel in namespace open-cluster-management",
        deployment: {
          name: "multicluster-operators-channel",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment multicluster-operators-hub-subscription in namespace open-cluster-management",
        deployment: {
          name: "multicluster-operators-hub-subscription",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment multicluster-operators-standalone-subscription in namespace open-cluster-management",
        deployment: {
          name: "multicluster-operators-standalone-subscription",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment multicluster-operators-subscription-report in namespace open-cluster-management",
        deployment: {
          name: "multicluster-operators-subscription-report",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment multiclusterhub-operator in namespace open-cluster-management",
        deployment: {
          name: "multiclusterhub-operator",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment ocm-controller in namespace multicluster-engine",
        deployment: {
          name: "ocm-controller",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment ocm-proxyserver in namespace multicluster-engine",
        deployment: {
          name: "ocm-proxyserver",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment ocm-webhook in namespace multicluster-engine",
        deployment: {
          name: "ocm-webhook",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment provider-credential-controller in namespace multicluster-engine",
        deployment: {
          name: "provider-credential-controller",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment resource-operator-controller-manager in namespace aap",
        deployment: {
          name: "resource-operator-controller-manager",
          scope: {
            namespace: "aap",
          },
        },
      },
      {
        name: "Don't alert on deployment search-api in namespace open-cluster-management",
        deployment: {
          name: "search-api",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment search-collector in namespace open-cluster-management",
        deployment: {
          name: "search-collector",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment search-indexer in namespace open-cluster-management",
        deployment: {
          name: "search-indexer",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment search-postgres in namespace open-cluster-management",
        deployment: {
          name: "search-postgres",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment search-v2-operator-controller-manager in namespace open-cluster-management",
        deployment: {
          name: "search-v2-operator-controller-manager",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment submariner-addon in namespace open-cluster-management",
        deployment: {
          name: "submariner-addon",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment volsync-addon-controller in namespace open-cluster-management",
        deployment: {
          name: "volsync-addon-controller",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Component",
            values: [
              {
                value: "rpm|microdnf|dnf|yum=",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "ccd66f67-0b69-4081-9d01-da692f7db3b4",
    name: "Mount Container Runtime Socket",
    description:
      "Alert on deployments with a volume mount on the container runtime socket",
    rationale:
      "Mounting the container runtime socket implies container access to the runtime daemon. With direct access to the runtime daemon, a user can schedule containers and collect information about the running containers. This can be used as a method of discovery or persistence in an attack. Depending on the container runtime configuration, this may also be used as a method of privilege escalation to the host operating system. Since this can be used as an attack, deployments that mount the container runtime socket should be minimized to those absolutely necessary.",
    remediation:
      "Investigate if this deployment is being deployed for legitimate business purposes, and if so, that mounting the container runtime socket is required. Perform one of the following actions based on this investigation: 1. Exclude the deployment in this policy because it is being deployed for legitimate use cases. 2. Do not mount the container runtime socket in the deployment and redeploy. 3. Launch an investigation into why a deployment with this insecure configuration useful to attackers was deployed.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on StackRox collector",
        deployment: {
          name: "collector",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on ucp-agent",
        deployment: {
          name: "ucp-agent",
        },
      },
      {
        name: "Don't alert on ucp-agent-s390x",
        deployment: {
          name: "ucp-agent-s390x",
        },
      },
      {
        name: "Don't alert on StackRox compliance",
        deployment: {
          scope: {
            namespace: "stackrox",
            label: {
              key: "app",
              value: "stackrox-compliance",
            },
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Volume Source",
            values: [
              {
                value: "/var/run/docker.sock",
              },
              {
                value: "/var/run/crio/crio.sock",
              },
              {
                value: "/run/crio/crio.sock",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "dd478ad6-b9c9-4abf-92e0-847408aecb8d",
    name: "Drop All Capabilities",
    description: "Alert when a deployment does not drop all capabilities.",
    rationale:
      "Because capabilities permit privileged operations, it is a recommended best practice to drop all capabilities that a deployment can have, and then add only the capabilities that the deployment needs.",
    remediation:
      "Ensure that the deployment manifest has `drop: ALL` in the securityContext section of the container manifest.",
    disabled: true,
    categories: ["DevOps Best Practices"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on stackrox namespace",
        deployment: {
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Drop Capabilities",
            values: [
              {
                value: "ALL",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "014a03c6-9053-49b5-88ea-c1efcf19804f",
    name: "Required Annotation: Email",
    description: "Alert on deployments missing the 'email' annotation",
    rationale:
      "The 'email' annotation should always be specified so that issues with the deployment can quickly be routed to the proper party.",
    remediation:
      "Redeploy your service and set the 'email' annotation as your email or your team's email.",
    disabled: true,
    categories: [
      "DevOps Best Practices",
      "Security Best Practices",
      "Supply Chain Security",
    ],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Required Annotation",
            values: [
              {
                value: "email=[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "a05e063b-f37f-4d36-99f3-7ff0cb2b3ba8",
    name: "Linux Group Add Execution",
    description:
      "Detects when the 'addgroup' or 'groupadd' binary is executed, which can be used to add a new linux group.",
    rationale:
      "Groups added in run time can be used to take ownership of files and processes",
    remediation:
      'Consider using a base image that doesn\'t have a shell such as SCRATCH or gcr.io/distroless. If not, modify your Dockerfile to use the exec form of CMD/ENTRYPOINT (["using braces"]) instead of the shell form (no braces)',
    categories: ["System Modification", "Privileges"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "addgroup|groupadd",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1098", "T1136"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "32081d8e-84cd-4d67-b016-fe481c55b93a",
    name: "Linux User Add Execution",
    description:
      "Detects when the 'useradd', 'adduser' or 'usermod' binary is executed, which can be used to add a new linux user.",
    rationale:
      "Users or groups added in run time can be used to take ownership of files and processes.",
    remediation:
      'Consider using a base image that doesn\'t have a shell such as SCRATCH or gcr.io/distroless. If not, modify your Dockerfile to use the exec form of CMD/ENTRYPOINT (["using braces"]) instead of the shell form (no braces)',
    categories: ["System Modification", "Privileges"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on deployment machine-config-daemon in openshift-machine-config-operator namespace",
        deployment: {
          name: "machine-config-daemon",
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "useradd|adduser|usermod",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1098", "T1136"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "d63564bd-c184-40bc-9f30-39711e010b82",
    name: "Alpine Linux Package Manager Execution",
    description:
      "Alert when the Alpine Linux package manager (apk) is executed at runtime",
    rationale:
      "Use of package managers at runtime indicates that new software may be being introduced into containers while they are running.",
    remediation:
      "Run `apk --purge del apk-tools` in the image build for production containers. Change applications to no longer use package managers at runtime, if applicable.",
    categories: ["Package Management"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "apk",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0011",
        techniques: ["T1105"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "d7a275e1-1bba-47e7-92a1-42340c759883",
    name: "Ubuntu Package Manager Execution",
    description:
      "Alert when Debian/Ubuntu package manager programs are executed at runtime",
    rationale:
      "Use of package managers at runtime indicates that new software may be being introduced into containers while they are running.",
    remediation:
      "Run `dpkg -r --force-all apt && dpkg -r --force-all debconf dpkg` in the image build for production containers. Change applications to no longer use package managers at runtime, if applicable.",
    categories: ["Package Management"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "apt-get|apt|dpkg",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0011",
        techniques: ["T1105"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "0a2ee697-cb88-4e13-8e62-c6a2a887e0cc",
    name: "chkconfig Execution",
    description:
      "Detected usage of the chkconfig service manager; typically this is not used within a container",
    rationale:
      "chkconfig can be used to activate and deactivate services, and should generally not be run within a container",
    remediation:
      "Consider removing the chkconfig utility, or using a base container image that doesn't have this utility in it",
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "chkconfig",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1543.002"],
      },
      {
        tactic: "TA0004",
        techniques: ["T1543.002"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "28f833df-eb14-4265-a4fe-4e5e8ce9d959",
    name: "crontab Execution",
    description: "Detects the usage of the crontab scheduled jobs editor",
    rationale:
      "Crontab running in a container with access to a shell makes it easier to 'clandestinely' schedule processes to run in order to better evade detection",
    remediation:
      "In Kubernetes, consider replacing your crontab with an orchestrator-native CronJob as part of Kube workload",
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "anacron|cron|crond|crontab",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1053.003"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "ddb7af9c-5ec1-45e1-a0cf-c36e3ef2b2ce",
    name: "Red Hat Package Manager Execution",
    description:
      "Alert when Red Hat/Fedora/CentOS package manager programs are executed at runtime.",
    rationale:
      "Use of package managers at runtime indicates that new software may be being introduced into containers while they are running.",
    remediation:
      "Run `rpm -e --nodeps $(rpm -qa '*rpm*' '*dnf*' '*libsolv*' '*hawkey*' 'yum*')` in the image build for production containers. Change applications to no longer use package managers at runtime, if applicable.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on StackRox scanner",
        deployment: {
          name: "scanner",
          scope: {
            label: {
              key: "app.kubernetes.io/name",
              value: "stackrox",
            },
          },
        },
      },
      {
        name: "Don't alert on StackRox collector",
        deployment: {
          name: "collector",
          scope: {
            label: {
              key: "app.kubernetes.io/name",
              value: "stackrox",
            },
          },
        },
      },
      {
        name: "Don't alert on openshift-compliance namespace",
        deployment: {
          scope: {
            namespace: "openshift-compliance",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "rpm|microdnf|dnf|yum",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0011",
        techniques: ["T1105"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "ed8c7957-14de-40bc-aeab-d27ceeecfa7b",
    name: "Iptables or nftables Executed in Privileged Container",
    description: "Alert on privileged pods that execute iptables or nftables",
    rationale:
      "Processes that are running with UID 0 run as the root user. iptables and nftables can be used in privileged containers to modify the node's network routing.",
    remediation:
      "Specify the USER instruction in the Docker image or the runAsUser field within the Pod Security Context",
    categories: ["Network Tools", "Security Best Practices"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on deployment haproxy-control-plane-* in namespace openshift-kni-infra",
        deployment: {
          name: "haproxy-control-plane-*",
          scope: {
            namespace: "openshift-kni-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment keepalived-control-plane-* in namespace openshift-kni-infra",
        deployment: {
          name: "keepalived-control-plane-*",
          scope: {
            namespace: "openshift-kni-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment keepalived-worker-* in namespace openshift-kni-infra",
        deployment: {
          name: "keepalived-worker-*",
          scope: {
            namespace: "openshift-kni-infra",
          },
        },
      },
      {
        name: "Don't alert on haproxy-* deployment in openshift-vsphere-infra namespace",
        deployment: {
          name: "haproxy-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on keepalived-* deployment in openshift-vsphere-infra namespace",
        deployment: {
          name: "keepalived-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on coredns-* deployment in openshift-vsphere-infra namespace",
        deployment: {
          name: "coredns-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on ovnkube-node deployment in openshift-ovn-kubernetes Namespace",
        deployment: {
          name: "ovnkube-node",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on Kube System Namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
    ],
    severity: "CRITICAL_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Privileged Container",
            values: [
              {
                value: "true",
              },
            ],
          },
          {
            fieldName: "Process Name",
            values: [
              {
                value: "iptables",
              },
              {
                value: "nft",
              },
            ],
          },
          {
            fieldName: "Process UID",
            values: [
              {
                value: "0",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0004",
        techniques: ["T1611"],
      },
      {
        tactic: "TA0005",
        techniques: ["T1562.004"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "880fd131-46f0-43d2-82c9-547f5aa7e043",
    name: "iptables Execution",
    description:
      "Detects execution of iptables; iptables is a deprecated way of managing network state in containers",
    rationale:
      "iptables is a deprecated way of managing network state in containers",
    remediation:
      "Check for any processes that may be modifying iptables rules. Check for open ports that may be allowing code injection to modify iptables rules",
    categories: ["Network Tools"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on haproxy-* deployment in openshift-vsphere-infra namespace",
        deployment: {
          name: "haproxy-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on keepalived-* deployment in openshift-vsphere-infra namespace",
        deployment: {
          name: "keepalived-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on ovnkube-node deployment in openshift-ovn-kubernetes Namespace",
        deployment: {
          name: "ovnkube-node",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "iptables",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0005",
        techniques: ["T1562.004"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "0501ac8b-5869-4e1e-b360-84dbf01f2c6c",
    name: "Shell Spawned by Java Application",
    description:
      "Detects execution of shell (bash/csh/sh/zsh) as a subprocess of a java application",
    rationale:
      "Java application launching a shell can be an indicator of remote code execution",
    remediation:
      "Determine whether this is intended behavior of the application or an indication of malicious activity",
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "(/[s]*bin/){0,1}(ba|c|z){0,1}sh",
              },
            ],
          },
          {
            fieldName: "Process Ancestor",
            values: [
              {
                value: ".*java",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0002",
        techniques: ["T1059.004"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "101952d3-ec69-4ebe-bfa3-ff26b6e4c29d",
    name: "Compiler Tool Execution",
    description:
      "Alert when binaries used to compile software are executed at runtime",
    rationale:
      "Use of compilation tools during runtime indicates that new software may be being introduced into containers while they are running.",
    remediation:
      "Compile all necessary application code during the image build process. Avoid packaging software build tools in container images. Use your distribution's package manager to remove compilers and other build tools from images.",
    categories: ["Package Management"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "make|gcc|llc|llvm-.*",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0008",
        techniques: ["T1570"],
      },
      {
        tactic: "TA0011",
        techniques: ["T1105"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "e9635b83-4ec5-4e7a-9be1-1bcdd6d82bb7",
    name: "Cryptocurrency Mining Process Execution",
    description: "Cryptocurrency mining process spawned",
    rationale:
      "Cryptocurrency mining binaries are often evidence of malicious activity or a hijacked cluster.",
    remediation:
      "Ensure that the base image used to create the Dockerfile doesn't have cryptocurrency mining software packaged with it. Check for open ports that may allow for remote code execution",
    categories: ["Cryptocurrency Mining"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value:
                  ".*sgminer|.*cgminer|.*cpuminer|.*minerd|.*geth|.*ethminer|.*xmr-stak.*|.*xmrminer|.*cpuminer-multi|.*xmrig",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0040",
        techniques: ["T1496"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "2361bb4c-4cf6-4997-bae6-825da6cf932e",
    name: "Network Management Execution",
    description:
      "Detects execution of binaries that can be used to manipulate network configuration and management.",
    rationale:
      "Network management tools can be used for a variety of tasks, including mapping out your network, overwriting iptables rules, or ssh tunneling to name a few.",
    remediation:
      "Remove unncessary network managment tools from the container image.",
    categories: ["Network Tools"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on openshift namespaces",
        deployment: {
          scope: {
            namespace: "openshift-.*",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value:
                  "ip|ifrename|ethtool|ifconfig|arp|ipmaddr|iptunnel|route|nameif|mii-tool",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0007",
        techniques: ["T1016"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "6abf0df8-736b-4530-8849-6a1344cf17fe",
    name: "Netcat Execution Detected",
    description: "Detects execution of netcat in a container",
    rationale: "netcat is a known malicious process",
    remediation:
      "Consider removing package managers during the build process that could be used to download such software. Check that exposed ports don't allow for remote code execution",
    categories: ["Network Tools"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "nc",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0007",
        techniques: ["T1046"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "f0bacecd-87be-4f51-89a5-8f86ad523620",
    name: "nmap Execution",
    description:
      "Alerts when the nmap process launches in a container during run time",
    rationale:
      "Nmap can be used to probe a running container's network to enumerate open ports and perform other actions such as OS version detection and launching over-the-network scripted attacks",
    remediation:
      "Consider removing package managers during the build process that could be used to download such software. Check that exposed ports don't allow for remote code execution",
    categories: ["Network Tools"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "nmap",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0007",
        techniques: ["T1046"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "3e546913-de60-445c-a6d5-e70ac4ed4e98",
    name: "Remote File Copy Binary Execution",
    description: "Alert on deployments that execute a remote file copy tool",
    rationale:
      "Remote copy tools can be used to exfiltrate data from a container",
    remediation:
      "Remove tools like scp, sshfs, ssh-copy-id, etc. from your image and redeploy it",
    categories: ["Network Tools"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on the insights-operator deployment in namespace openshift-insights",
        deployment: {
          name: "insights-operator",
          scope: {
            namespace: "openshift-insights",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "scp|sshfs|ssh-copy-id|rsync",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0008",
        techniques: ["T1570"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "618e65ca-737b-4fec-bb42-57a04e7dfc28",
    name: "Secure Shell Server (sshd) Execution",
    description: "Detects container running the SSH daemon",
    rationale:
      "The secure shell server allows shell access to a container, which can be dangerous.",
    remediation:
      "If ssh is absolutely required, ensure that it is not using default authentication. Otherwise, consider removing it from the container altogether.",
    categories: ["Network Tools", "Docker CIS"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "sshd",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0001",
        techniques: ["T1078"],
      },
      {
        tactic: "TA0002",
        techniques: ["T1059.004"],
      },
      {
        tactic: "TA0008",
        techniques: ["T1021.004"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "f2183906-4577-47de-9bf4-270d09e0a93c",
    name: "systemctl Execution",
    description: "Detected usage of the systemctl service manager",
    rationale:
      "The systemctl service manager is generally not used in containers, and its use could indicate suspicious activity",
    remediation:
      "Remove systemctl from the image before deploying, or consider using a base image that doesn't bundle systemctl",
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on StackRox namespace",
        deployment: {
          scope: {
            namespace: "stackrox",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "systemctl",
              },
            ],
          },
          {
            fieldName: "Process Arguments",
            negate: true,
            values: [
              {
                value: "--version",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1543.002"],
      },
      {
        tactic: "TA0004",
        techniques: ["T1543.002"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "b3335ee3-6f1e-4c3a-a0ad-7c249c25c750",
    name: "systemd Execution",
    description: "Detected usage of the systemd service manager",
    rationale:
      "The systemd service manager is generally not used in containers, and its use could indicate suspicious activity",
    remediation:
      "Remove systemd from the image before deploying, or consider using a base image that doesn't bundle systemd",
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "systemd",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1543.002"],
      },
      {
        tactic: "TA0004",
        techniques: ["T1543.002"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "86804b96-e87e-4eae-b56e-1718a8a55763",
    name: "Process Targeting Cluster Kubelet Endpoint",
    description: "Detects misuse of the healthz/kubelet API/heapster endpoint",
    rationale:
      "A pod communicating to a Kubernetes API from via command line is highly irregular",
    remediation:
      "Look for open ports that may allow remote execution. Remove network utilities like curl and wget that allow these connections. Consider a firewall deny ingress firewall rule to the node serving the API",
    categories: ["Kubernetes"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Arguments",
            values: [
              {
                value:
                  "(https?://)?(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\:(10250|10248|10255)|heapster\\.kube\\-system/metrics|KUBERNETES_PORT_443_TCP_ADDR|KUBERNETES_SERVICE_HOST).*",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0007",
        techniques: ["T1613"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "3ebdc07d-7c01-4508-9f81-3f3673fce536",
    name: "Process Targeting Cluster Kubernetes Docker Stats Endpoint",
    description: "Detects misuse of the Kubernetes docker stats endpoint",
    rationale:
      "A pod communicating to a Kubernetes API from via command line is highly irregular",
    remediation:
      "Look for open ports that may allow remote execution. Remove network utilities like curl and wget that allow these connections. Consider a firewall deny ingress firewall rule to the node serving the API",
    categories: ["Kubernetes"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Arguments",
            values: [
              {
                value:
                  "(http?://)?\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\:4194/*",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0007",
        techniques: ["T1613"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "251136ca-c92c-4474-a2c7-4949c71b745f",
    name: "Process Targeting Kubernetes Service Endpoint",
    description: "Detects misuse of the Kubernetes Service API endpoint",
    rationale:
      "A pod communicating to a Kubernetes API from via command line is highly irregular",
    remediation:
      "Look for open ports that may allow remote execution. Remove network utilities like curl and wget that allow these connections. Consider a firewall deny ingress firewall rule to the node serving the API",
    categories: ["Kubernetes"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Arguments",
            values: [
              {
                value:
                  "https://(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|\\$.?KUBERNETES_(PORT_443_TCP_ADDR|SERVICE_HOST).?)(:443)?/apis?/(v1(beta.)?/)?(.*\\.k8s\\.io|clusterrole.*|role.*|networkpolicies|cronjobs|certificate.*|podsecurity.*|secrets.*)",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0007",
        techniques: ["T1613"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "78cd366c-4e06-4d9a-9b78-e547f18e7f0b",
    name: "Deployments with externally exposed endpoints",
    description:
      "Deployments with externally exposed endpoints represent a higher risk",
    rationale:
      "Deployments with services exposed outside the cluster are at a higher risk of attempted intrusions because they are reachable outside of the cluster.",
    remediation:
      "Verify that service exposure outside of the cluster is required. If the service is only needed for intra-cluster communication, use service type ClusterIP.",
    disabled: true,
    categories: ["DevOps Best Practices", "Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Policy Section 1",
        policyGroups: [
          {
            fieldName: "Port Exposure Method",
            values: [
              {
                value: "ROUTE",
              },
              {
                value: "EXTERNAL",
              },
              {
                value: "NODE",
              },
              {
                value: "HOST",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "08a06f5c-eed0-4fb8-a09e-16cc975e7beb",
    name: "Docker CIS 4.4: Ensure images are scanned and rebuilt to include security patches",
    description:
      "Images should be scanned frequently for any vulnerabilities. You should rebuild all images to include these patches and then instantiate new containers from them.",
    rationale:
      "Vulnerabilities are loopholes or bugs that can be exploited by hackers or malicious users, and security patches are updates to resolve these vulnerabilities. Image vulnerability scanning tools can be use to find vulnerabilities in images and then check for available patches to mitigate these. Patches update the system to a more recent code base which does not contain these problems, and being on a supported version of the code base is very important, as vendors do not tend to supply patches for older versions which have gone out of support. Security patches should be evaluated before applying and patching should be implemented in line with the organization's IT Security Policy. Care should be taken with the results returned by vulnerability assessment tools, as some will simply return results based on software banners, and these may not be entirely accurate.",
    remediation:
      "Images should be re-built ensuring that the latest version of the base images are used, to keep the operating system patch level at an appropriate level. Once the images have been re-built, containers should be re-started making use of the updated images.",
    disabled: true,
    categories: ["Docker CIS"],
    lifecycleStages: ["BUILD"],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Fixed By",
            values: [
              {
                value: ".*",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "47cb9e0a-879a-417b-9a8f-de644d7c8a77",
    name: "Docker CIS 5.16: Ensure that the host's IPC namespace is not shared",
    description:
      "IPC (POSIX/SysV IPC) namespace provides separation of named shared memory segments, semaphores and message queues. The IPC namespace on the host should therefore not be shared with containers and should remain isolated.",
    rationale:
      "The IPC namespace provides separation of IPC between the host and containers. If the host's IPC namespace is shared with the container, it would allow processes within the container to see all of IPC communications on the host system. This would remove the benefit of IPC level isolation between host and containers. An attacker with access to a container could get access to the host at this level with major consequences. The IPC namespace should therefore not be shared between the host and its containers.",
    remediation: "You should not create a deployment with `hostIPC: true`",
    categories: ["Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment tuned in openshift-cluster-node-tuning-operator namespace",
        deployment: {
          name: "tuned",
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Section 1",
        policyGroups: [
          {
            fieldName: "Host IPC",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "6226d4ad-7619-4a0b-a160-46373cfcee66",
    name: "Docker CIS 5.9 and 5.20: Ensure that the host's network namespace is not shared",
    description:
      "When HostNetwork is enabled the container is not placed inside a separate network stack. The container's networking is not containerized when this option is applied. The consequence of this is that the container has full access to the host's network interfaces. It also enables a shared UTS namespace. The UTS namespace provides isolation between two system identifiers: the hostname and the NIS domain name. It is used to set the hostname and the domain which are visible to running processes in that namespace. Processes running within containers do not typically require to know either the hostname or the domain name. The UTS namespace should therefore not be shared with the host.",
    rationale:
      "Selecting this option is potentially dangerous. It allows the container process to open reserved low numbered ports in the way that any other root process can. It also allows the container to access network services such as D-bus on a Docker host. A container process could potentially carry out undesired actions, such as shutting down the host. The container will also share the network namespace with the host, providing full permission for each container to change the hostname of the host. This is not in line with good security practice and should not be permitted.",
    remediation: "You should not create a deployment with `hostNetwork: true`",
    categories: ["Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment gcp-cloud-controller-manager in openshift-cloud-controller-manager namespace",
        deployment: {
          name: "gcp-cloud-controller-manager",
          scope: {
            namespace: "openshift-cloud-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on deployment gcp-pd-csi-driver-controller in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "gcp-pd-csi-driver-controller",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on deployment gcp-pd-csi-driver-node in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "gcp-pd-csi-driver-node",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on deployment machine-approver in namespace openshift-cluster-machine-approver",
        deployment: {
          name: "machine-approver",
          scope: {
            namespace: "openshift-cluster-machine-approver",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-master in namespace openshift-ovn-kubernetes",
        deployment: {
          name: "ovnkube-master",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-node in namespace openshift-ovn-kubernetes",
        deployment: {
          name: "ovnkube-node",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-cloud-controller-manager-operator in namespace openshift-cloud-controller-manager-operator",
        deployment: {
          name: "cluster-cloud-controller-manager-operator",
          scope: {
            namespace: "openshift-cloud-controller-manager-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment node-resolver in namespace openshift-dns",
        deployment: {
          name: "node-resolver",
          scope: {
            namespace: "openshift-dns",
          },
        },
      },
      {
        name: "Don't alert on deployment aws-ebs-csi-driver-controller in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "aws-ebs-csi-driver-controller",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on deployment aws-ebs-csi-driver-node in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "aws-ebs-csi-driver-node",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on deployment azure-disk-csi-driver-controller in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "azure-disk-csi-driver-controller",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on deployment azure-disk-csi-driver-node in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "azure-disk-csi-driver-node",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-scheduler namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-controller-manager namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
      {
        name: "Don't alert on openshift-network-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-network-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-multus namespace",
        deployment: {
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-version namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-version",
          },
        },
      },
      {
        name: "Don't alert on node-ca DaemonSet in the openshift-image-registry namespace",
        deployment: {
          name: "node-ca",
          scope: {
            namespace: "openshift-image-registry",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-etcd namespace",
        deployment: {
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-machine-config-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-monitoring namespace",
        deployment: {
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-machine-api namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-api",
          },
        },
      },
      {
        name: "Don't alert on host network usage within the openshift-cluster-node-tuning-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment coredns-ci-ln-*-master-\\d+ in namespace openshift-vsphere-infra",
        deployment: {
          name: "coredns-ci-ln-.*-master-\\d+",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment haproxy-ci-ln-*-master-\\d+ in namespace openshift-vsphere-infra",
        deployment: {
          name: "haproxy-ci-ln-.*-master-\\d+",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment keepalived-ci-ln-*-master-\\d+ in namespace openshift-vsphere-infra",
        deployment: {
          name: "keepalived-ci-ln-.*-master-\\d+",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployments coredns-ci-ln-*-worker-* in namespace openshift-vsphere-infra",
        deployment: {
          name: "coredns-ci-ln-.*-worker-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployments keepalived-ci-ln-*-worker-* in namespace openshift-vsphere-infra",
        deployment: {
          name: "keepalived-ci-ln-.*-worker-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment router-default in namespace openshift-ingress",
        deployment: {
          name: "router-default",
          scope: {
            namespace: "openshift-ingress",
          },
        },
      },
      {
        name: "Don't alert on deployment vmware-vsphere-csi-driver-controller in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "vmware-vsphere-csi-driver-controller",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on deployment vmware-vsphere-csi-driver-node in namespace openshift-cluster-csi-drivers",
        deployment: {
          name: "vmware-vsphere-csi-driver-node",
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on deployment network-node-identity in namespace openshift-network-node-identity",
        deployment: {
          name: "network-node-identity",
          scope: {
            namespace: "openshift-network-node-identity",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-control-plane in namespace openshift-ovn-kubernetes",
        deployment: {
          name: "ovnkube-control-plane",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment aws-cloud-controller-manager in namespace openshift-cloud-controller-manager",
        deployment: {
          name: "aws-cloud-controller-manager",
          scope: {
            namespace: "openshift-cloud-controller-manager",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Section 1",
        policyGroups: [
          {
            fieldName: "Host Network",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "436811e7-892f-4da6-a0f5-8cc459f1b954",
    name: "Docker CIS 5.15: Ensure that the host's process namespace is not shared",
    description:
      "The Process ID (PID) namespace isolates the process ID space, meaning that processes in different PID namespaces can have the same PID. This creates process level isolation between the containers and the host.",
    rationale:
      "PID namespace provides separation between processes. It prevents system processes from being visible, and allows process ids to be reused including PID 1. If the host's PID namespace is shared with containers, it would basically allow these to see all of the processes on the host system. This reduces the benefit of process level isolation between the host and the containers. Under these circumstances a malicious user who has access to a container could get access to processes on the host itself, manipulate them, and even be able to kill them. This could allow for the host itself being shut down, which could be extremely serious, particularly in a multi-tenanted environment. You should not share the host's process namespace with the containers running on it.",
    remediation: "You should not create a deployment with `hostPID: true`",
    categories: ["Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment apiserver-watcher-* in kube-system namespace",
        deployment: {
          name: "apiserver-watcher-.*",
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on deployment in openshift-kube-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on deployment tuned in openshift-cluster-node-tuning-operator namespace",
        deployment: {
          name: "tuned",
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-node in openshift-ovn-kubernetes namespace",
        deployment: {
          name: "ovnkube-node",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment machine-config-daemon in openshift-machine-config-operator namespace",
        deployment: {
          name: "machine-config-daemon",
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on the openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
      {
        name: "Don't alert on deployment node-exporter in namespace openshift-monitoring",
        deployment: {
          name: "node-exporter",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment multus in namespace openshift-multus",
        deployment: {
          name: "multus",
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Section 1",
        policyGroups: [
          {
            fieldName: "Host PID",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "2db9a279-2aec-4618-a85d-7f1bdf4911b1",
    name: "90-Day Image Age",
    description:
      "Alert on deployments with images that haven't been updated in 90 days",
    rationale:
      "Base images are updated frequently with bug fixes and vulnerability patches. Image age exceeding 90 days may indicate a higher risk of vulnerabilities existing in the image.",
    remediation:
      "Rebuild your image, push a new minor version (with a new immutable tag), and update your service to use it.",
    categories: [
      "DevOps Best Practices",
      "Security Best Practices",
      "Supply Chain Security",
    ],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Age",
            values: [
              {
                value: "90",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "629f847d-72b1-4009-8891-cbe479ab10ab",
    name: "Secure Shell (ssh) Port Exposed in Image",
    description:
      "Alert on deployments exposing port 22, commonly reserved for SSH access.",
    rationale:
      "Port 22 is reserved for SSH access. SSH should not typically be used within containers.",
    remediation:
      "Ensure that non-SSH services are not using port 22. Ensure that any actual SSH servers have been vetted.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Dockerfile Line",
            values: [
              {
                value: "EXPOSE=(22/tcp|\\s+22/tcp)",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "7b71fba0-2afb-4e4e-abf3-0f461cd76acc",
    name: "OpenShift: Kubernetes Secret Accessed by an Impersonated User",
    description:
      "Alert when user impersonation is used to access a secret within the cluster.",
    rationale:
      "Users with impersonation access allows users to invoke any command as a different user, typically for troubleshooting purposes (i.e using the oc --as command). This may be used to bypass existing security controls such as RBAC.",
    remediation:
      "Audit usage of impersonation when accessing secrets to ensure this access is used for valid business purposes.",
    categories: ["Anomalous Activity", "Kubernetes Events"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "AUDIT_LOG_EVENT",
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Kubernetes Resource",
            values: [
              {
                value: "SECRETS",
              },
            ],
          },
          {
            fieldName: "Kubernetes API Verb",
            values: [
              {
                value: "GET",
              },
            ],
          },
          {
            fieldName: "Is Impersonated User",
            values: [
              {
                value: "true",
              },
            ],
          },
          {
            fieldName: "Kubernetes User Name",
            negate: true,
            values: [
              {
                value: "system:serviceaccount:openshift-insights:operator",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0004",
        techniques: ["T1134.001"],
      },
      {
        tactic: "TA0006",
        techniques: ["T1552.007"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "657f4d37-55ab-42f2-bdce-9a4b74a67328",
    name: "Insecure specified in CMD",
    description: "Alert on deployments using 'insecure' in the command",
    rationale:
      "Using insecure in a command implies accessing or providing data from a server on an unencrypted connection.",
    remediation:
      "Use a certificate manager and certificate rotation routinely to ensure secure service-to-service communication.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Dockerfile Line",
            values: [
              {
                value: "CMD=.*insecure.*",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "0ac267ae-9128-42c7-b15e-0e926844aa2f",
    name: "Kubernetes Dashboard Deployed",
    description: "Alert on the presence of the Kubernetes dashboard service",
    rationale:
      "The Kubernetes dashboard can be used to gain external access to a cluster, or to obtain additional access once inside.",
    remediation:
      "Modify your cluster configuration to disable the Kubernetes dashboard service if it is not in use. In Google Kubernetes Engine (GKE), you can execute: gcloud container clusters update --update-addons=KubernetesDashboard=DISABLED [cluster-name]",
    categories: ["Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Remote",
            values: [
              {
                value: "r/.*kubernetesui/dashboard.*",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "2e90874a-3521-44de-85c6-5720f519a701",
    name: "Latest tag",
    description: "Alert on deployments with images using tag 'latest'",
    rationale:
      "Using latest tag can result in running heterogeneous versions of code. Many Docker hosts cache the Docker images, which means newer versions of the latest tag will not be picked up. See https://docs.docker.com/develop/dev-best-practices for more best practices.",
    remediation:
      "Consider moving to semantic versioning based on code releases (semver.org) or using the first 12 characters of the source control SHA. This will allow you to tie the Docker image to the code.",
    categories: ["DevOps Best Practices", "Supply Chain Security"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment sre-pod-network-connectivity-check-pruner in namespace openshift-network-diagnostics",
        deployment: {
          name: "sre-pod-network-connectivity-check-pruner",
          scope: {
            namespace: "openshift-network-diagnostics",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-delete-ownerrefs-serviceaccounts in namespace openshift-sre-pruning",
        deployment: {
          name: "osd-delete-ownerrefs-serviceaccounts",
          scope: {
            namespace: "openshift-sre-pruning",
          },
        },
      },
      {
        name: "Don't alert on deployment sre-build-test in namespace openshift-build-test",
        deployment: {
          name: "sre-build-test",
          scope: {
            namespace: "openshift-build-test",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-delete-backplane-script-resources in namespace openshift-backplane-managed-scripts",
        deployment: {
          name: "osd-delete-backplane-script-resources",
          scope: {
            namespace: "openshift-backplane-managed-scripts",
          },
        },
      },
      {
        name: "Don't alert on deployment sre-ebs-iops-reporter in namespace openshift-monitoring",
        deployment: {
          name: "sre-ebs-iops-reporter",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment sre-stuck-ebs-vols in namespace openshift-monitoring",
        deployment: {
          name: "sre-stuck-ebs-vols",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-delete-backplane-serviceaccounts in namespace openshift-backplane",
        deployment: {
          name: "osd-delete-backplane-serviceaccounts",
          scope: {
            namespace: "openshift-backplane",
          },
        },
      },
      {
        name: "Don't alert on deployment deployments-pruner in namespace openshift-sre-pruning",
        deployment: {
          name: "deployments-pruner",
          scope: {
            namespace: "openshift-sre-pruning",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-patch-subscription-source in namespace openshift-marketplace",
        deployment: {
          name: "osd-patch-subscription-source",
          scope: {
            namespace: "openshift-marketplace",
          },
        },
      },
      {
        name: "Don't alert on deployment sre-dns-latency-exporter in namespace openshift-monitoring",
        deployment: {
          name: "sre-dns-latency-exporter",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-rebalance-infra-nodes in namespace openshift-monitoring",
        deployment: {
          name: "osd-rebalance-infra-nodes",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-rebalance-infra-node in namespace openshift-monitoring",
        deployment: {
          name: "osd-rebalance-infra-node",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Tag",
            values: [
              {
                value: "latest",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "cf80fb33-c7d0-4490-b6f4-e56e1f27b4e4",
    name: "Log4Shell: log4j Remote Code Execution vulnerability",
    description:
      "Alert on deployments with images containing the Log4Shell vulnerabilities (CVE-2021-44228 and CVE-2021-45046). There are flaws in the Java logging library Apache Log4j in versions from 2.0-beta9 to 2.15.0, excluding 2.12.2.",
    rationale:
      "These vulnerabilities allows a remote attacker to execute code on the server if the system logs an attacker-controlled string value with the attacker's JNDI LDAP server lookup.",
    remediation:
      "Update the log4j libary to version 2.16.0 (for Java 8 or later), 2.12.2 (for Java 7) or later. If not possible to upgrade, then remove the JndiLookup class from the classpath: zip -q -d log4j-core-*.jar org/apache/logging/log4j/core/lookup/JndiLookup.class",
    categories: ["Vulnerability Management"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "CRITICAL_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "CVE",
            values: [
              {
                value: "CVE-2021-44228",
              },
              {
                value: "CVE-2021-45046",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "1c4e2cab-ce24-4e2a-9a66-f61028e79931",
    name: "Login Binaries",
    description: "Processes that indicate login attempts",
    rationale: "Login processes at runtime are unusual in a container",
    remediation:
      "Ensure that the base image used to create the Dockerfile doesn't have login binaries packaged with it.",
    disabled: true,
    categories: ["Security Best Practices"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value:
                  "login|systemd|systemd|systemd-logind|gosu|su|nologin|faillog|lastlog|newgrp|sg",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0004",
        techniques: ["T1548"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "32d770b9-c6ba-4398-b48a-0c3e807644ed",
    name: "Docker CIS 5.19: Ensure mount propagation mode is not enabled",
    description:
      "Mount propagation mode allows mounting container volumes in Bidirectional, Host to Container, and None modes. Do not use Bidirectional mount propagation mode unless explicitly needed.",
    rationale:
      "A Bidirectional mount is replicated at all mounts and changes made at any mount point are propagated to all other mount points. Mounting a volume in Bidirectional mode does not restrict any other container from mounting and making changes to that volume. As this is likely not a desirable option from a security standpoint, this feature should not be used unless explicitly required",
    remediation: "Do not mount volumes in Bidirectional propagation mode.",
    categories: ["Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment csi-azuredisk-node in kube-system namespace",
        deployment: {
          name: "csi-azuredisk-node",
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on deployment csi-azurefile-node in kube-system namespace",
        deployment: {
          name: "csi-azurefile-node",
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-csi-drivers namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on a pdcsi-node deployment",
        deployment: {
          name: "pdcsi-node",
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    lastUpdated: "2021-01-19T22:26:36.455422100Z",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Section 1",
        policyGroups: [
          {
            fieldName: "Mount Propagation",
            values: [
              {
                value: "BIDIRECTIONAL",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "1b74ffdd-8e67-444c-9814-1c23863c8ccb",
    name: "Unauthorized Network Flow",
    description:
      "This policy generates a violation for the network flows that fall outside baselines for which 'alert on anomalous violations' is set.",
    rationale:
      "The network baseline is a list of flows that are allowed, and once it is frozen, any flow outside that is a concern.",
    remediation:
      "Evaluate this network flow. If deemed to be okay, add it to the baseline. If not, investigate further as required.",
    categories: ["Anomalous Activity", "Zero Trust"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Unauthorized Network Flow",
        policyGroups: [
          {
            fieldName: "Unexpected Network Flow Detected",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "7448b475-8e80-4ece-bc9b-b9845c003a6f",
    name: "Docker CIS 5.1 Ensure that, if applicable, an AppArmor Profile is enabled",
    description:
      "AppArmor is an effective and easy-to-use Linux application security system. It is available on some Linux distributions by default, for example, on Debian and Ubuntu.",
    rationale:
      "AppArmor protects the Linux OS and applications from various threats by enforcing a security policy which is also known as an AppArmor profile. You can create your own AppArmor profile for containers or use Docker's default profile. Enabling this feature enforces security policies on containers as defined in the profile.",
    remediation:
      "If AppArmor is applicable for your Linux OS, you should enable it.  Verify AppArmor is installed, create or import an AppArmor profile for your containers, enable enforcement of the policy, and add the appropriate AppArmor annotations to your deployment.",
    categories: ["Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Section 1",
        policyGroups: [
          {
            fieldName: "AppArmor Profile",
            values: [
              {
                value: "unconfined",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "886c3c94-3a6a-4f2b-82fc-d6bf5a310840",
    name: "No CPU request or memory limit specified",
    description:
      "Alert on deployments that have containers without CPU request or memory limit",
    rationale:
      "A container without a specified CPU request may be starved for CPU time, while a container without a specified memory limit may cause the host to become over-provisioned.",
    remediation: "Specify CPU request and memory limit for your deployment.",
    categories: ["DevOps Best Practices", "Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on system namespaces",
        deployment: {
          scope: {
            namespace: "^kube.*|^openshift.*|^redhat.*|^istio-system$",
          },
        },
      },
      {
        name: "Don't alert on management-infra namespace",
        deployment: {
          scope: {
            namespace: "management-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment application-manager in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "application-manager",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment cert-policy-controller in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "cert-policy-controller",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager in namespace multicluster-engine",
        deployment: {
          name: "cluster-manager",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-placement-controller in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-placement-controller",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-registration-controller in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-registration-controller",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-registration-webhook in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-registration-webhook",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-manager-work-webhook in namespace open-cluster-management-hub",
        deployment: {
          name: "cluster-manager-work-webhook",
          scope: {
            namespace: "open-cluster-management-hub",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy in namespace multicluster-engine",
        deployment: {
          name: "cluster-proxy",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-addon-manager in namespace multicluster-engine",
        deployment: {
          name: "cluster-proxy-addon-manager",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-addon-user in namespace multicluster-engine",
        deployment: {
          name: "cluster-proxy-addon-user",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-proxy-agent in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "cluster-proxy-proxy-agent",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-proxy-service-proxy in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "cluster-proxy-service-proxy",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment config-policy-controller in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "config-policy-controller",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment console-chart-console-v2 in namespace open-cluster-management",
        deployment: {
          name: "console-chart-console-v2",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment console-mce-console in namespace multicluster-engine",
        deployment: {
          name: "console-mce-console",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment governance-policy-framework in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "governance-policy-framework",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment grc-policy-addon-controller in namespace open-cluster-management",
        deployment: {
          name: "grc-policy-addon-controller",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment grc-policy-propagator in namespace open-cluster-management",
        deployment: {
          name: "grc-policy-propagator",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-clustersync in namespace hive",
        deployment: {
          name: "hive-clustersync",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-controllers in namespace hive",
        deployment: {
          name: "hive-controllers",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-operator in namespace multicluster-engine",
        deployment: {
          name: "hive-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment hiveadmission in namespace hive",
        deployment: {
          name: "hiveadmission",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment iam-policy-controller in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "iam-policy-controller",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment infrastructure-operator in namespace multicluster-engine",
        deployment: {
          name: "infrastructure-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment insights-client in namespace open-cluster-management",
        deployment: {
          name: "insights-client",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment insights-metrics in namespace open-cluster-management",
        deployment: {
          name: "insights-metrics",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-addon-search in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "klusterlet-addon-search",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-addon-workmgr in namespace open-cluster-management-agent-addon",
        deployment: {
          name: "klusterlet-addon-workmgr",
          scope: {
            namespace: "open-cluster-management-agent-addon",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-registration-agent in namespace open-cluster-management-agent",
        deployment: {
          name: "klusterlet-registration-agent",
          scope: {
            namespace: "open-cluster-management-agent",
          },
        },
      },
      {
        name: "Don't alert on deployment klusterlet-work-agent in namespace open-cluster-management-agent",
        deployment: {
          name: "klusterlet-work-agent",
          scope: {
            namespace: "open-cluster-management-agent",
          },
        },
      },
      {
        name: "Don't alert on deployment ocm-controller in namespace multicluster-engine",
        deployment: {
          name: "ocm-controller",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment ocm-proxyserver in namespace multicluster-engine",
        deployment: {
          name: "ocm-proxyserver",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment ocm-webhook in namespace multicluster-engine",
        deployment: {
          name: "ocm-webhook",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment search-api in namespace open-cluster-management",
        deployment: {
          name: "search-api",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment search-collector in namespace open-cluster-management",
        deployment: {
          name: "search-collector",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment search-indexer in namespace open-cluster-management",
        deployment: {
          name: "search-indexer",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment search-postgres in namespace open-cluster-management",
        deployment: {
          name: "search-postgres",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment submariner-addon in namespace open-cluster-management",
        deployment: {
          name: "submariner-addon",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on deployment volsync-addon-controller in namespace open-cluster-management",
        deployment: {
          name: "volsync-addon-controller",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Container CPU Request",
            values: [
              {
                value: "0.000000",
              },
            ],
          },
        ],
      },
      {
        policyGroups: [
          {
            fieldName: "Container Memory Limit",
            values: [
              {
                value: "0.000000",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "13b4eddc-2619-4953-b1ee-4c762144ca1e",
    name: "Images with no scans",
    description: "Alert on deployments with images that have not been scanned",
    rationale:
      "Without a scan, there will be no vulnerability information for this image",
    remediation:
      "Configure the appropriate registry and scanner integrations so that StackRox can obtain scans for your images.",
    disabled: true,
    categories: ["Vulnerability Management", "Supply Chain Security"],
    lifecycleStages: ["DEPLOY"],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Unscanned Image",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "41e5153f-98d1-4830-9f80-983afcbe73c1",
    name: "Docker CIS 5.21: Ensure the default seccomp profile is not disabled",
    description:
      "Seccomp filtering provides a means to filter incoming system calls. The default seccomp profile uses an allow list to permit a large number of common system calls, and block all others.",
    rationale:
      "A large number of system calls are exposed to every userland process with many of them going unused for the entire lifetime of the process. Most of applications do not need all these system calls and would therefore benefit from having a reduced set of available system calls. Having a reduced set of system calls reduces the total kernel surface exposed to the application and thus improvises application security.",
    remediation:
      "By default, seccomp profiles are enabled. You do not need to do anything unless you want to modify and use a modified seccomp profile.",
    disabled: true,
    categories: ["Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Section 1",
        policyGroups: [
          {
            fieldName: "Seccomp Profile Type",
            values: [
              {
                value: "UNCONFINED",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "1a498d97-0cc2-45f5-b32e-1f3cca6a3113",
    name: "Required Annotation: Owner/Team",
    description:
      "Alert on deployments missing the 'owner' or 'team' annotation",
    rationale:
      "The 'owner' or 'team' annotation should always be specified so that the deployment can quickly be associated with a specific user or team.",
    remediation:
      "Redeploy your service and set the 'owner' or 'team' annotation to yourself or your team respectively per organizational standards.",
    disabled: true,
    categories: [
      "DevOps Best Practices",
      "Security Best Practices",
      "Supply Chain Security",
    ],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Required Annotation",
            values: [
              {
                value: "owner|team=.+",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "550081a1-ad3a-4eab-a874-8eb68fab2bbd",
    name: "Required Label: Owner/Team",
    description: "Alert on deployments missing the 'owner' or 'team' label",
    rationale:
      "The 'owner' or 'team' label should always be specified so that the deployment can quickly be associated with a specific user or team.",
    remediation:
      "Redeploy your service and set the 'owner' or 'team' label to yourself or your team respectively per organizational standards.",
    disabled: true,
    categories: [
      "DevOps Best Practices",
      "Security Best Practices",
      "Supply Chain Security",
    ],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Required Label",
            values: [
              {
                value: "owner|team=.+",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "1c224010-9e0b-41a8-be9a-a17c7040ce98",
    name: "Password Binaries",
    description: "Processes that indicate attempts to change passwd",
    rationale:
      "Attempts to change password during runtime in containers is unusual",
    remediation:
      "Ensure that the base image used to create the Dockerfile doesn't have passwd binaries packaged with it.",
    disabled: true,
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on deployment machine-config-daemon in openshift-machine-config-operator namespace",
        deployment: {
          name: "machine-config-daemon",
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value:
                  "shadowconfig|grpck|pwunconv|grpconv|pwck|groupmod|vipw|pwconv|useradd|newusers|cppw|chpasswd|usermod|groupadd|groupdel|grpunconv|chgpasswd|userdel|chage|chsh|gpasswd|chfn|expiry|passwd|vigr|cpgr",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1098"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "fe59d982-a155-4aac-bf36-a74aa29ea565",
    name: "Kubernetes Actions: Attach to Pod",
    description:
      "Alerts when Kubernetes API receives request to attach to a container",
    rationale:
      "'pods/attach' is non-standard approach for interacting with containers. Attackers with permissions could execute malicious code and compromise resources within a cluster",
    remediation:
      "Restrict RBAC access to the 'pods/attach' resource according to the Principle of Least Privilege. Limit such usage only to development, testing or debugging (non-production) activities",
    categories: ["Kubernetes Events"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Kubernetes Resource",
            values: [
              {
                value: "PODS_ATTACH",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0002",
        techniques: ["T1609"],
      },
      {
        tactic: "TA0002",
        techniques: ["T1059.004"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "8ab0f199-4904-4808-9461-3501da1d1b77",
    name: "Kubernetes Actions: Exec into Pod",
    description:
      "Alerts when Kubernetes API receives request to execute command in container",
    rationale:
      "'pods/exec' is non-standard approach for interacting with containers. Attackers with permissions could execute malicious code and compromise resources within a cluster",
    remediation:
      "Restrict RBAC access to the 'pods/exec' resource according to the Principle of Least Privilege. Limit such usage only to development, testing or debugging (non-production) activities",
    categories: ["Kubernetes Events"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on deployment thanos-querier in namespace openshift-monitoring",
        deployment: {
          name: "thanos-querier",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment prometheus-k8s in namespace openshift-monitoring",
        deployment: {
          name: "prometheus-k8s",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-node in namespace openshift-ovn-kubernetes",
        deployment: {
          name: "ovnkube-node",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment etcd-ci-ln-*-master-\\d+ in namespace openshift-etcd",
        deployment: {
          name: "etcd-ci-ln-.*-master-\\d+",
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Kubernetes Resource",
            values: [
              {
                value: "PODS_EXEC",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0002",
        techniques: ["T1609"],
      },
      {
        tactic: "TA0002",
        techniques: ["T1059.004"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "742e0361-bddd-4a2d-8758-f2af6197f61d",
    name: "Kubernetes Actions: Port Forward to Pod",
    description: "Alerts when Kubernetes API receives port forward request",
    rationale:
      "'pods/portforward' is non-standard way to access applications running on Kubernetes. Attackers with permissions could gain access to application and compromise it",
    remediation:
      "Restrict RBAC access to the 'pods/portforward' resource according to the Principle of Least Privilege. Limit exposing application through port forwarding only development, testing or debugging (non-production) activities. For external traffic, expose application through a LoadBalancer/NodePort service or Ingress Controller",
    categories: ["Kubernetes Events"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on deployment alertmanager-main in openshift-monitoring namespace",
        deployment: {
          name: "alertmanager-main",
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Kubernetes Resource",
            values: [
              {
                value: "PODS_PORTFORWARD",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0002",
        techniques: ["T1609"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "16c95922-08c4-41b6-a721-dc4b2a806632",
    name: "Container with privilege escalation allowed",
    description:
      "Alerts if a deployment has containers with allowPrivilegeEscalation set to true in its security context.",
    rationale:
      "A container process can run with more privileges than its parent process if the container's security context has the boolean setting allowPrivilegeEscalation enabled. In Kubernetes pods, this setting is true by default. Set the value to false if the pod is to run as a non-root user.",
    remediation:
      "Verify that privileged escalation is required and cannot be provided with a subset of other controls. Disable privilege escalation by setting allowPrivilegeEscalation to false.",
    categories: ["Security Best Practices", "Privileges"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment router-default in namespace openshift-ingress",
        deployment: {
          name: "router-default",
          scope: {
            namespace: "openshift-ingress",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName: "Policy Section 1",
        policyGroups: [
          {
            fieldName: "Allow Privilege Escalation",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "fe9de18b-86db-44d5-a7c4-74173ccffe2e",
    name: "Privileged Container",
    description:
      "Alert on deployments with containers running in privileged mode",
    rationale:
      "Containers running as privileged represent greater post-exploitation risk by allowing an attacker to access all host devices, run a daemon in the container, etc.",
    remediation:
      "Verify that privileged capabilities are required and cannot be provided with a subset of other controls.",
    categories: ["Privileges", "Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment splunkforwarder-ds in namespace openshift-security",
        deployment: {
          name: "splunkforwarder-ds",
          scope: {
            namespace: "openshift-security",
          },
        },
      },
      {
        name: "Don't alert on deployment mdsd in namespace openshift-azure-logging",
        deployment: {
          name: "mdsd",
          scope: {
            namespace: "openshift-azure-logging",
          },
        },
      },
      {
        name: "Don't alert on deployment audit-exporter in namespace openshift-security",
        deployment: {
          name: "audit-exporter",
          scope: {
            namespace: "openshift-security",
          },
        },
      },
      {
        name: "Don't alert on deployment apiserver in namespace openshift-oauth-apiserver",
        deployment: {
          name: "apiserver",
          scope: {
            namespace: "openshift-oauth-apiserver",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-node in namespace openshift-ovn-kubernetes",
        deployment: {
          name: "ovnkube-node",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment oauth-openshift in namespace openshift-authentication",
        deployment: {
          name: "oauth-openshift",
          scope: {
            namespace: "openshift-authentication",
          },
        },
      },
      {
        name: "Don't alert on deployment multus-additional-cni-plugins in namespace openshift-multus",
        deployment: {
          name: "multus-additional-cni-plugins",
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on deployment multus in namespace openshift-multus",
        deployment: {
          name: "multus",
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on deployment node-ca in namespace openshift-image-registry",
        deployment: {
          name: "node-ca",
          scope: {
            namespace: "openshift-image-registry",
          },
        },
      },
      {
        name: "Don't alert on the stackrox namespace",
        deployment: {
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-node namespace",
        deployment: {
          scope: {
            namespace: "openshift-node",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-etcd namespace",
        deployment: {
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on openshift-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-dns namespace",
        deployment: {
          scope: {
            namespace: "openshift-dns",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-node-tuning-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-csi-drivers namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on openshift-machine-config-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment coredns-ci-ln-*-master-\\d+ in namespace openshift-vsphere-infra",
        deployment: {
          name: "coredns-ci-ln-.*-master-\\d+",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment haproxy-ci-ln-*-master-\\d+ in namespace openshift-vsphere-infra",
        deployment: {
          name: "haproxy-ci-ln-.*-master-\\d+",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment keepalived-ci-ln-*-master-\\d+ in namespace openshift-vsphere-infra",
        deployment: {
          name: "keepalived-ci-ln-.*-master-\\d+",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployments coredns-ci-ln-*-worker-* in namespace openshift-vsphere-infra",
        deployment: {
          name: "coredns-ci-ln-.*-worker-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployments keepalived-ci-ln-*-worker-* in namespace openshift-vsphere-infra",
        deployment: {
          name: "keepalived-ci-ln-.*-worker-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Privileged Container",
            values: [
              {
                value: "true",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "7760a5f3-bca4-4ca8-94a7-ad89edbc0e2c",
    name: "Process with UID 0",
    description:
      "Alert on deployments that contain processes running with UID 0",
    rationale:
      "Processes that are running with UID 0 run as the root user. This can allow for unintended privilege escalation if a container mounts host directories that are owned by the host's root user",
    remediation:
      "Specify the USER instruction in the Docker image or the runAsUser field within the Pod Security Context",
    disabled: true,
    categories: ["DevOps Best Practices", "Security Best Practices"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
      {
        name: "Don't alert on StackRox Namespace",
        deployment: {
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
      {
        name: "Don't alert on deployment aide-worker-fileintegrity in namespace openshift-file-integrity",
        deployment: {
          name: "aide-worker-fileintegrity",
          scope: {
            namespace: "openshift-file-integrity",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process UID",
            values: [
              {
                value: "0",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "db79755e-6e03-40f5-b914-b0bee9e1c20b",
    name: "Rapid Reset: Denial of Service Vulnerability in HTTP/2 Protocol",
    description:
      "Alert on deployments with images containing components that are susceptible to a Denial of Service (DoS) vulnerability for HTTP/2 servers.",
    rationale:
      "This is a flaw in the handling of multiplexed streams in http/2. A client can rapidly create a request and immediately reset them, which creates extra work for the server while avoiding hitting any server-side limits, resulting in a denial of service attack.",
    remediation:
      "Upgrade vulnerable components or images to the latest version.",
    disabled: true,
    categories: ["Vulnerability Management"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "CVE",
            values: [
              {
                value: "CVE-2023-44487",
              },
              {
                value: "CVE-2023-39325",
              },
            ],
          },
          {
            fieldName: "Severity",
            values: [
              {
                value: ">=IMPORTANT",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "8ac93556-4ad4-4220-a275-3f518db0ceb9",
    name: "Container using read-write root filesystem",
    description:
      "Alert on deployments with containers with read-write root filesystem",
    rationale:
      "Containers running with read-write root filesystem represent greater post-exploitation risk by allowing an attacker to modify important files in the container.",
    remediation:
      "Use a read-only root filesystem, and use volume mounts to allow writes to specific sub-directories depending on your application's needs.",
    disabled: true,
    categories: ["Privileges", "Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-node namespace",
        deployment: {
          scope: {
            namespace: "openshift-node",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Read-Only Root Filesystem",
            values: [
              {
                value: "false",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "c6fd7cb3-de34-4918-be4c-370006330357",
    name: "Red Hat images must be signed by a Red Hat release key",
    description:
      "Alert when Red Hat images are not digitally signed by Red Hat",
    rationale:
      "Red Hat images should be signed using Red Hat's Cosign product signing keys (https://access.redhat.com/security/team/key). Older OpenShift images that predate the introduction of Cosign signatures may not be signed.",
    remediation:
      "Confirm the authenticity of the image by reaching out to Red Hat support.",
    disabled: true,
    categories: ["Supply Chain Security"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Do not alert on the openshift-marketplace namespace because catalog images are not yet signed",
        deployment: {
          scope: {
            namespace: "openshift-marketplace",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        sectionName:
          "All images in certain Red Hat registries must be signed by Red Hat",
        policyGroups: [
          {
            fieldName: "Image Registry",
            values: [
              {
                value: "registry.access.redhat.com",
              },
              {
                value: "registry.redhat.io",
              },
            ],
          },
          {
            fieldName: "Image Signature Verified By",
            values: [
              {
                value:
                  "io.stackrox.signatureintegration.12a37a37-760e-4388-9e79-d62726c075b2",
              },
            ],
          },
        ],
      },
      {
        sectionName:
          "All images in selected Red Hat owned quay.io remotes must be signed by Red Hat",
        policyGroups: [
          {
            fieldName: "Image Registry",
            values: [
              {
                value: "quay.io",
              },
            ],
          },
          {
            fieldName: "Image Remote",
            values: [
              {
                value: "openshift-release-dev/ocp-release",
              },
              {
                value: "openshift-release-dev/ocp-v4.0-art-dev",
              },
            ],
          },
          {
            fieldName: "Image Signature Verified By",
            values: [
              {
                value:
                  "io.stackrox.signatureintegration.12a37a37-760e-4388-9e79-d62726c075b2",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0001",
        techniques: ["T1195.002"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "d3e480c1-c6de-4cd2-9006-9a3eb3ad36b6",
    name: "Required Image Label",
    description:
      "Alert on deployments with images missing the specified label.",
    rationale:
      "Only images with the specified label should be deployed to ensure all deployments contain approved images.",
    remediation:
      "Request that the maintainer add the required label to the image.",
    disabled: true,
    categories: ["DevOps Best Practices", "Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Required Image Label",
            values: [
              {
                value: "required-label.*=required-value.*",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "6abcaa13-9ed6-4109-a1a7-be2e8280e49e",
    name: "Docker CIS 5.7: Ensure privileged ports are not mapped within containers",
    description:
      "The TCP/IP port numbers below 1024 are considered privileged ports. Normal users and processes are not allowed to use them for various security reasons. Containers are, however, allowed to map their ports to privileged ports.",
    rationale:
      "By default, if the user does not specifically declare a container port to host port mapping, the containers ports will be mapped to available non-privileged host ports. Containers are, however, allow to map their ports to a privileged ports on the host if the user explicitly declares it. In Docker this is because containers are executed with NET_BIND_SERVICE Linux kernel capability which does not restrict privileged port mapping. The privileged ports receive and transmit various pieces of data which are security sensitive and allowing containers to use them is not in line with good security practice.",
    remediation:
      "You should not map container ports to privileged host ports when starting a container. You should also, ensure that there is no such container to host privileged port mapping declarations in the Dockerfile.",
    categories: ["Docker CIS"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on the router-default deployment in namespace openshift-ingress",
        deployment: {
          name: "router-default",
          scope: {
            namespace: "openshift-ingress",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Exposed Node Port",
            booleanOperator: "AND",
            values: [
              {
                value: "<= 1024",
              },
              {
                value: "> 0",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "dce17697-1b72-49d2-b18a-05d893cd9368",
    name: "Docker CIS 4.1: Ensure That a User for the Container Has Been Created",
    description: "Containers should run as a non-root user",
    rationale:
      "It is good practice to run the container as a non-root user, where possible. This can be done via the USER directive in the Dockerfile. You can exclude this policy from OpenShift clusters because they run containers using an arbitrarily assigned user ID by default.",
    remediation:
      "Ensure that the Dockerfile for each container switches from the root user",
    categories: ["Docker CIS"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment gcp-cloud-controller-manager in openshift-cloud-controller-manager namespace",
        deployment: {
          name: "gcp-cloud-controller-manager",
          scope: {
            namespace: "openshift-cloud-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on deployment haproxy-* in openshift-vsphere-infra namespace",
        deployment: {
          name: "haproxy-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment keepalived-* in openshift-vsphere-infra namespace",
        deployment: {
          name: "keepalived-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment coredns-* in openshift-vsphere-infra namespace",
        deployment: {
          name: "coredns-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment splunk-forwarder-operator in openshift-splunk-forwarder-operator namespace",
        deployment: {
          name: "splunk-forwarder-operator",
          scope: {
            namespace: "openshift-splunk-forwarder-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment openshift-controller-manager-operator in openshift-controller-manager-operator namespace",
        deployment: {
          name: "openshift-controller-manager-operator",
          scope: {
            namespace: "openshift-controller-manager-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-backplane namespace",
        deployment: {
          scope: {
            namespace: "openshift-backplane",
          },
        },
      },
      {
        name: "Don't alert on openshift-multus namespace",
        deployment: {
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on openshift-ovn-kubernetes namespace",
        deployment: {
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on openshift-image-registry namespace",
        deployment: {
          scope: {
            namespace: "openshift-image-registry",
          },
        },
      },
      {
        name: "Don't alert on openshift-controller-manager namespace",
        deployment: {
          scope: {
            namespace: "openshift-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on openshift-machine-api namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-api",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-storage-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-storage-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-monitoring namespace",
        deployment: {
          scope: {
            namespace: "openshift-monitoring",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-scheduler namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-controller-manager namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on deployment migrator in namespace openshift-kube-storage-version-migrator",
        deployment: {
          name: "migrator",
          scope: {
            namespace: "openshift-kube-storage-version-migrator",
          },
        },
      },
      {
        name: "Don't alert on deployment insights-operator in namespace openshift-insights",
        deployment: {
          name: "insights-operator",
          scope: {
            namespace: "openshift-insights",
          },
        },
      },
      {
        name: "Don't alert on deployment oauth-openshift in namespace openshift-authentication",
        deployment: {
          name: "oauth-openshift",
          scope: {
            namespace: "openshift-authentication",
          },
        },
      },
      {
        name: "Don't alert on deployment authentication-operator in namespace openshift-authentication-operator",
        deployment: {
          name: "authentication-operator",
          scope: {
            namespace: "openshift-authentication-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment downloads in namespace openshift-console",
        deployment: {
          name: "downloads",
          scope: {
            namespace: "openshift-console",
          },
        },
      },
      {
        name: "Don't alert on deployment cloud-credential-operator in namespace openshift-cloud-credential-operator",
        deployment: {
          name: "cloud-credential-operator",
          scope: {
            namespace: "openshift-cloud-credential-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment pod-identity-webhook in namespace openshift-cloud-credential-operator",
        deployment: {
          name: "pod-identity-webhook",
          scope: {
            namespace: "openshift-cloud-credential-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment network-operator in namespace openshift-network-operator",
        deployment: {
          name: "network-operator",
          scope: {
            namespace: "openshift-network-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment network-check-target in namespace openshift-network-diagnostics",
        deployment: {
          name: "network-check-target",
          scope: {
            namespace: "openshift-network-diagnostics",
          },
        },
      },
      {
        name: "Don't alert on deployment network-check-source in namespace openshift-network-diagnostics",
        deployment: {
          name: "network-check-source",
          scope: {
            namespace: "openshift-network-diagnostics",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-version-operator in namespace openshift-cluster-version",
        deployment: {
          name: "cluster-version-operator",
          scope: {
            namespace: "openshift-cluster-version",
          },
        },
      },
      {
        name: "Don't alert on deployment machine-approver in namespace openshift-cluster-machine-approver",
        deployment: {
          name: "machine-approver",
          scope: {
            namespace: "openshift-cluster-machine-approver",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-apiserver-operator in namespace openshift-kube-apiserver-operator",
        deployment: {
          name: "kube-apiserver-operator",
          scope: {
            namespace: "openshift-kube-apiserver-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment ingress-canary in namespace openshift-ingress-canary",
        deployment: {
          name: "ingress-canary",
          scope: {
            namespace: "openshift-ingress-canary",
          },
        },
      },
      {
        name: "Don't alert on deployment ingress-operator in namespace openshift-ingress-operator",
        deployment: {
          name: "ingress-operator",
          scope: {
            namespace: "openshift-ingress-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-cloud-controller-manager-operator in namespace openshift-cloud-controller-manager-operator",
        deployment: {
          name: "cluster-cloud-controller-manager-operator",
          scope: {
            namespace: "openshift-cloud-controller-manager-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment blackbox-exporter in namespace openshift-route-monitor-operator",
        deployment: {
          name: "blackbox-exporter",
          scope: {
            namespace: "openshift-route-monitor-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment thanos-ruler-user-workload in namespace openshift-user-workload-monitoring",
        deployment: {
          name: "thanos-ruler-user-workload",
          scope: {
            namespace: "openshift-user-workload-monitoring",
          },
        },
      },
      {
        name: "Don't alert on deployment openshift-apiserver-operator in namespace openshift-apiserver-operator",
        deployment: {
          name: "openshift-apiserver-operator",
          scope: {
            namespace: "openshift-apiserver-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment etcd-operator in namespace openshift-etcd-operator",
        deployment: {
          name: "etcd-operator",
          scope: {
            namespace: "openshift-etcd-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment openshift-config-operator in namespace openshift-config-operator",
        deployment: {
          name: "openshift-config-operator",
          scope: {
            namespace: "openshift-config-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-storage-version-migrator-operator in namespace openshift-kube-storage-version-migrator-operator",
        deployment: {
          name: "kube-storage-version-migrator-operator",
          scope: {
            namespace: "openshift-kube-storage-version-migrator-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment apiserver in namespace openshift-oauth-apiserver",
        deployment: {
          name: "apiserver",
          scope: {
            namespace: "openshift-oauth-apiserver",
          },
        },
      },
      {
        name: "Don't alert on deployment cloud-network-config-controller in namespace openshift-cloud-network-config-controller",
        deployment: {
          name: "cloud-network-config-controller",
          scope: {
            namespace: "openshift-cloud-network-config-controller",
          },
        },
      },
      {
        name: "Don't alert on deployment service-ca in namespace openshift-service-ca",
        deployment: {
          name: "service-ca",
          scope: {
            namespace: "openshift-service-ca",
          },
        },
      },
      {
        name: "Don't alert on deployment service-ca-operator in namespace openshift-service-ca-operator",
        deployment: {
          name: "service-ca-operator",
          scope: {
            namespace: "openshift-service-ca-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment audit-exporter in namespace openshift-security",
        deployment: {
          name: "audit-exporter",
          scope: {
            namespace: "openshift-security",
          },
        },
      },
      {
        name: "Don't alert on deployment route-controller-manager in namespace openshift-route-controller-manager",
        deployment: {
          name: "route-controller-manager",
          scope: {
            namespace: "openshift-route-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on StackRox namespace",
        deployment: {
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-etcd namespace",
        deployment: {
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on openshift-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-dns namespace",
        deployment: {
          scope: {
            namespace: "openshift-dns",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-node-tuning-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-csi-drivers namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on openshift-machine-config-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-image-set-controller in namespace multicluster-engine",
        deployment: {
          name: "cluster-image-set-controller",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment discovery-operator in namespace multicluster-engine",
        deployment: {
          name: "discovery-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-clustersync in namespace hive",
        deployment: {
          name: "hive-clustersync",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-controllers in namespace hive",
        deployment: {
          name: "hive-controllers",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment hive-operator in namespace multicluster-engine",
        deployment: {
          name: "hive-operator",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
      {
        name: "Don't alert on deployment hiveadmission in namespace hive",
        deployment: {
          name: "hiveadmission",
          scope: {
            namespace: "hive",
          },
        },
      },
      {
        name: "Don't alert on deployment kube-controller-manager-operator in namespace openshift-kube-controller-manager-operator",
        deployment: {
          name: "kube-controller-manager-operator",
          scope: {
            namespace: "openshift-kube-controller-manager-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment openshift-kube-scheduler-operator in namespace openshift-kube-scheduler-operator",
        deployment: {
          name: "openshift-kube-scheduler-operator",
          scope: {
            namespace: "openshift-kube-scheduler-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-logging namespace",
        deployment: {
          scope: {
            namespace: "openshift-logging",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-patch-subscription-source in namespace openshift-marketplace",
        deployment: {
          name: "osd-patch-subscription-source",
          scope: {
            namespace: "openshift-marketplace",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-delete-ownerrefs-serviceaccounts in namespace openshift-backplane-srep",
        deployment: {
          name: "osd-delete-ownerrefs-serviceaccounts",
          scope: {
            namespace: "openshift-backplane-srep",
          },
        },
      },
      {
        name: "Don't alert on deployment builds-pruner in namespace openshift-sre-pruning",
        deployment: {
          name: "builds-pruner",
          scope: {
            namespace: "openshift-sre-pruning",
          },
        },
      },
      {
        name: "Don't alert on deployment deployments-pruner in namespace openshift-sre-pruning",
        deployment: {
          name: "deployments-pruner",
          scope: {
            namespace: "openshift-sre-pruning",
          },
        },
      },
      {
        name: "Don't alert on deployment osd-delete-backplane-script-resources in namespace openshift-backplane-managed-scripts",
        deployment: {
          name: "osd-delete-backplane-script-resources",
          scope: {
            namespace: "openshift-backplane-managed-scripts",
          },
        },
      },
      {
        name: "Don't alert on deployment network-node-identity in namespace openshift-network-node-identity",
        deployment: {
          name: "network-node-identity",
          scope: {
            namespace: "openshift-network-node-identity",
          },
        },
      },
      {
        name: "Don't alert on deployment aws-cloud-controller-manager in namespace openshift-cloud-controller-manager",
        deployment: {
          name: "aws-cloud-controller-manager",
          scope: {
            namespace: "openshift-cloud-controller-manager",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image User",
            values: [
              {
                value: "0",
              },
              {
                value: "root",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "e971db42-e8d4-4a1d-a30c-41142ba54d71",
    name: "Improper Usage of Orchestrator Secrets Volume",
    description:
      "Alert on deployments that use a Dockerfile with 'VOLUME /run/secrets'",
    rationale:
      "/run/secrets is a path for secrets that gets populated by the orchestrator. Volumes should not be used for secrets, and data mounts should have a separate mount path.",
    remediation:
      "Mount the volume to a different path. If secrets are stored in the volume, utilize the orchestrator secrets or your security team's secret management solution instead.",
    categories: ["DevOps Best Practices"],
    lifecycleStages: ["DEPLOY"],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Dockerfile Line",
            values: [
              {
                value:
                  "VOLUME=(?:(?:[,\\[\\s]?)|(?:.*[,\\s]+))/run/secrets(?:$|[,\\]\\s]).*",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "a3eb6dbe-e9ca-451a-919b-216cf7ee11f5",
    name: "30-Day Scan Age",
    description:
      "Alert on deployments with images that haven't been scanned in 30 days",
    rationale: "Out-of-date scans may not identify the most recent CVEs.",
    remediation:
      "Integrate a scanner with the StackRox Kubernetes Security Platform to trigger scans automatically.",
    categories: ["Security Best Practices", "Supply Chain Security"],
    lifecycleStages: ["DEPLOY"],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Scan Age",
            values: [
              {
                value: "30",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "f4996314-c3d7-4553-803b-b24ce7febe48",
    name: "Environment Variable Contains Secret",
    description:
      "Alert on deployments with environment variables that contain 'SECRET'",
    rationale:
      "Using secrets in environment variables may allow inspection into your secrets from the host or even through the orchestrator UI.",
    remediation:
      "Migrate your secrets from environment variables to orchestrator secrets or your security team's secret management solution.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment noobaa-core in namespace openshift-storage",
        deployment: {
          name: "noobaa-core",
          scope: {
            namespace: "openshift-storage",
          },
        },
      },
      {
        name: "Don't alert on deployment noobaa-endpoint in namespace openshift-storage",
        deployment: {
          name: "noobaa-endpoint",
          scope: {
            namespace: "openshift-storage",
          },
        },
      },
      {
        name: "Don't alert on deployment ocs-operator in namespace openshift-storage",
        deployment: {
          name: "ocs-operator",
          scope: {
            namespace: "openshift-storage",
          },
        },
      },
      {
        name: "Don't alert on deployment ocm-agent in openshift-ocm-agent-operator namespace",
        deployment: {
          name: "ocm-agent",
          scope: {
            namespace: "openshift-ocm-agent-operator",
          },
        },
      },
      {
        name: "Don't alert on router-default in openshift-ingress namespace",
        deployment: {
          name: "router-default",
          scope: {
            namespace: "openshift-ingress",
          },
        },
      },
      {
        name: "Don't alert on image-registry in openshift-image-registry namespace",
        deployment: {
          name: "image-registry",
          scope: {
            namespace: "openshift-image-registry",
          },
        },
      },
      {
        name: "Don't alert on thanos-ruler-user-workload in openshift-user-workload-monitoring namespace",
        deployment: {
          name: "thanos-ruler-user-workload",
          scope: {
            namespace: "openshift-user-workload-monitoring",
          },
        },
      },
      {
        name: "Don't alert on klusterlet-addon-controller-v2 in namespace open-cluster-management",
        deployment: {
          name: "klusterlet-addon-controller-v2",
          scope: {
            namespace: "open-cluster-management",
          },
        },
      },
      {
        name: "Don't alert on managedcluster-import-controller-v2 in namespace multicluster-engine",
        deployment: {
          name: "managedcluster-import-controller-v2",
          scope: {
            namespace: "multicluster-engine",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Environment Variable",
            values: [
              {
                value: "RAW=.*SECRET.*|.*PASSWORD.*=",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "a788556c-9268-4f30-a114-d456f2380818",
    name: "Secret Mounted as Environment Variable",
    description:
      "Alert on deployments with Kubernetes secret mounted as environment variable",
    rationale:
      "Using secrets in environment variables may allow inspection into your secrets from the host.",
    remediation:
      "Migrate your secrets from environment variables to your security team's secret management solution.",
    disabled: true,
    categories: ["Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Environment Variable",
            values: [
              {
                value: "SECRET_KEY==",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "a9b9ecf7-9707-4e32-8b62-d03018ed454f",
    name: "Mounting Sensitive Host Directories",
    description: "Alert on deployments mounting sensitive host directories",
    rationale:
      "Mounting system directories from host implies container access to sensitive files on the host. This expands the attack surface of the container and gives an intruder an opportunity to break containment if the host is not properly secured.",
    remediation:
      "Ensure that deployments do not mount sensitive host directories, or exclude this deployment if host mount is required.",
    categories: ["Security Best Practices"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on deployment gcp-cloud-controller-manager in openshift-cloud-controller-manager namespace",
        deployment: {
          name: "gcp-cloud-controller-manager",
          scope: {
            namespace: "openshift-cloud-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on deployment haproxy-* in openshift-vsphere-infra namespace",
        deployment: {
          name: "haproxy-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment keepalived-.* in openshift-vsphere-infra namespace",
        deployment: {
          name: "keepalived-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment coredns-* in openshift-vsphere-infra namespace",
        deployment: {
          name: "coredns-.*",
          scope: {
            namespace: "openshift-vsphere-infra",
          },
        },
      },
      {
        name: "Don't alert on deployment splunkforwarder-ds in openshift-security namespace",
        deployment: {
          name: "splunkforwarder-ds",
          scope: {
            namespace: "openshift-security",
          },
        },
      },
      {
        name: "Don't alert on deployment oauth-openshift in openshift-authentication namespace",
        deployment: {
          name: "oauth-openshift",
          scope: {
            namespace: "openshift-authentication",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-cloud-controller-manager-operator in openshift-cloud-controller-manager-operator namespace",
        deployment: {
          name: "cluster-cloud-controller-manager-operator",
          scope: {
            namespace: "openshift-cloud-controller-manager-operator",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-master in  openshift-ovn-kubernetes namespace",
        deployment: {
          name: "ovnkube-master",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment ovnkube-node in openshift-ovn-kubernetes namespace",
        deployment: {
          name: "ovnkube-node",
          scope: {
            namespace: "openshift-ovn-kubernetes",
          },
        },
      },
      {
        name: "Don't alert on deployment cluster-version-operator in openshift-cluster-version namespace",
        deployment: {
          name: "cluster-version-operator",
          scope: {
            namespace: "openshift-cluster-version",
          },
        },
      },
      {
        name: "Don't alert on deployment audit-exporter in openshift-security namespace",
        deployment: {
          name: "audit-exporter",
          scope: {
            namespace: "openshift-security",
          },
        },
      },
      {
        name: "Don't alert on deployment mdsd in openshift-azure-logging namespace",
        deployment: {
          name: "mdsd",
          scope: {
            namespace: "openshift-azure-logging",
          },
        },
      },
      {
        name: "Don't alert on StackRox collector",
        deployment: {
          name: "collector",
          scope: {
            namespace: "stackrox",
          },
        },
      },
      {
        name: "Don't alert on StackRox compliance",
        deployment: {
          scope: {
            namespace: "stackrox",
            label: {
              key: "app",
              value: "stackrox-compliance",
            },
          },
        },
      },
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
      {
        name: "Don't alert on istio-system namespace",
        deployment: {
          scope: {
            namespace: "istio-system",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-scheduler namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-scheduler",
          },
        },
      },
      {
        name: "Don't alert on openshift-etcd namespace",
        deployment: {
          scope: {
            namespace: "openshift-etcd",
          },
        },
      },
      {
        name: "Don't alert on openshift-kube-controller-manager namespace",
        deployment: {
          scope: {
            namespace: "openshift-kube-controller-manager",
          },
        },
      },
      {
        name: "Don't alert on openshift-oauth-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-oauth-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-apiserver namespace",
        deployment: {
          scope: {
            namespace: "openshift-apiserver",
          },
        },
      },
      {
        name: "Don't alert on openshift-network-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-network-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-machine-api namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-api",
          },
        },
      },
      {
        name: "Don't alert on openshift-dns namespace",
        deployment: {
          scope: {
            namespace: "openshift-dns",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-csi-drivers namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-csi-drivers",
          },
        },
      },
      {
        name: "Don't alert on openshift-cluster-node-tuning-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-cluster-node-tuning-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-multus namespace",
        deployment: {
          scope: {
            namespace: "openshift-multus",
          },
        },
      },
      {
        name: "Don't alert on node-ca dameonset in the openshift-image-registry namespace",
        deployment: {
          name: "node-ca",
          scope: {
            namespace: "openshift-image-registry",
          },
        },
      },
      {
        name: "Don't alert on openshift-sdn namespace",
        deployment: {
          scope: {
            namespace: "openshift-sdn",
          },
        },
      },
      {
        name: "Don't alert on openshift-machine-config-operator namespace",
        deployment: {
          scope: {
            namespace: "openshift-machine-config-operator",
          },
        },
      },
      {
        name: "Don't alert on openshift-logging namespace",
        deployment: {
          scope: {
            namespace: "openshift-logging",
          },
        },
      },
      {
        name: "Don't alert on deployment aws-cloud-controller-manager in namespace openshift-cloud-controller-manager",
        deployment: {
          name: "aws-cloud-controller-manager",
          scope: {
            namespace: "openshift-cloud-controller-manager",
          },
        },
      },
    ],
    severity: "MEDIUM_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Volume Source",
            values: [
              {
                value: "(/etc/.*|/sys/.*|/dev/.*|/proc/.*|/var/.*)",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "98c8396e-3541-48b9-a30a-371c86a8f0ef",
    name: "SetUID Processes",
    description: "Processes that are known to use setuid binaries",
    rationale:
      "setuid permits users to run certain programs with escalated privileges",
    remediation:
      "Ensure that the base image used to create the Dockerfile doesn't have setuid software packaged with it.",
    disabled: true,
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value:
                  "sshd|dbus-daemon-lau|ping|ping6|critical-stack-|pmmcli|filemng|PassengerAgent|bwrap|osdetect|nginxmng|sw-engine-fpm|start-stop-daem",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0004",
        techniques: ["T1548.001"],
      },
      {
        tactic: "TA0005",
        techniques: ["T1548.001"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "b1df1abb-e5a5-4ff7-98fe-1d28a22b55d8",
    name: "Privileged Containers with Important and Critical Fixable CVEs",
    description:
      "Alert on containers running in privileged mode with important or critical fixable vulnerabilities",
    rationale:
      "Known vulnerabilities make it easier for adversaries to exploit your application, and highly-privileged containers pose greater risk. You can fix these high-severity vulnerabilities by updating to a newer version of the affected component(s).",
    remediation:
      "Use your package manager to update to a fixed version in future builds, run your container with lower privileges, or speak with your security team to mitigate the vulnerabilities.",
    categories: ["Vulnerability Management", "Privileges"],
    lifecycleStages: ["DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on kube-system namespace",
        deployment: {
          scope: {
            namespace: "kube-system",
          },
        },
      },
    ],
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Privileged Container",
            values: [
              {
                value: "true",
              },
            ],
          },
          {
            fieldName: "Fixed By",
            values: [
              {
                value: ".*",
              },
            ],
          },
          {
            fieldName: "Severity",
            values: [
              {
                value: ">= IMPORTANT",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "a919ccaf-6b43-4160-ac5d-a405e1440a41",
    name: "Fixable Severity at least Important",
    description:
      "Alert on deployments with fixable vulnerabilities with a Severity Rating at least Important",
    rationale:
      "Known vulnerabilities make it easier for adversaries to exploit your application. You can fix these high-severity vulnerabilities by updating to a newer version of the affected component(s).",
    remediation:
      "Use your package manager to update to a fixed version in future builds or speak with your security team to mitigate the vulnerabilities.",
    categories: ["Vulnerability Management"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "HIGH_SEVERITY",
    enforcementActions: ["FAIL_BUILD_ENFORCEMENT"],
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Fixed By",
            values: [
              {
                value: ".*",
              },
            ],
          },
          {
            fieldName: "Severity",
            values: [
              {
                value: ">= IMPORTANT",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "6e0239e1-f4ca-43d0-ad3f-79ec683db811",
    name: "Shadow File Modification",
    description: "Processes that indicate attempts to modify shadow files",
    rationale:
      "Attempts to change shadow file during runtime in containers is unusual",
    remediation:
      "Ensure that the base image used to create the Dockerfile doesn't have shadow utils packaged with it.",
    disabled: true,
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "HIGH_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value:
                  "chage|gpasswd|lastlog|newgrp|sg|adduser|deluser|chpasswd|groupadd|groupdel|addgroup|delgroup|groupmems|groupmod|grpck|grpconv|grpunconv|newusers|pwck|pwconv|pwunconv|useradd|userdel|usermod|vigr|vipw|unix_chkpwd",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0003",
        techniques: ["T1098"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "1037940a-fc22-4f64-8784-b8f5bd1cc93f",
    name: "Shell Management",
    description: "Commands that are used to add/remove a shell",
    rationale: "Shell management is not usually done at runtime",
    remediation:
      "Ensure that the base image used to create the Dockerfile doesn't have shell binaries packaged with it.",
    disabled: true,
    categories: ["System Modification"],
    lifecycleStages: ["RUNTIME"],
    eventSource: "DEPLOYMENT_EVENT",
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Process Name",
            values: [
              {
                value: "add-shell|remove-shell",
              },
            ],
          },
        ],
      },
    ],
    mitreAttackVectors: [
      {
        tactic: "TA0002",
        techniques: ["T1059.004"],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "d03e0723-ef09-44da-bf29-fdd9e576fbf9",
    name: "Spring4Shell (Spring Framework Remote Code Execution) and Spring Cloud Function vulnerabilities",
    description:
      "Alert on deployments with images containing Spring4Shell vulnerability CVE-2022-22965 which affects the Spring MVC component and vulnerability CVE-2022-22963 which affects the Spring Cloud component. There are flaws in Spring Cloud Function (versions 3.1.6, 3.2.2 and older unsupported versions) and in Spring Framework (5.3.0 to 5.3.17, 5.2.0 to 5.2.19 and older unsupported versions).",
    rationale:
      "In Spring Cloud Function, when using routing functionality, a user can provide a specially crafted SpEL as a routing-expression that may result in remote code execution (RCE) and access to local resources. For Spring Framework, a Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to RCE via data binding.",
    remediation:
      "Upgrade Spring Cloud Function to version 3.1.7 or 3.2.3. Upgrade Spring Framework to version 5.3.18+ (if currently on 5.3.x) or 5.2.20+ (if currently on 5.2.x). If not possible to upgrade Spring Framework, then apply an appropriate workaround from the suggested workarounds on https://spring.io/blog/2022/03/31/spring-framework-rce-early-announcement",
    categories: ["Vulnerability Management"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "CRITICAL_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "CVE",
            values: [
              {
                value: "CVE-2022-22963",
              },
              {
                value: "CVE-2022-22965",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "900990b5-60ef-44e5-b7f6-4a1f22215d7f",
    name: "Apache Struts: CVE-2017-5638",
    description:
      "Alert on deployments with images containing Apache Struts vulnerability CVE-2017-5638",
    rationale:
      "CVE-2017-5638 is a serious and easily-exploitable vulnerability in Apache Struts.",
    remediation:
      "Rebuild your container with an updated version of Apache Struts.",
    categories: ["Vulnerability Management"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "CRITICAL_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "CVE",
            values: [
              {
                value: "CVE-2017-5638",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "9a91b4de-d52e-4d4d-a65e-1e785c3501b1",
    name: "Docker CIS 4.7: Alert on Update Instruction",
    description:
      "Ensure update instructions are not used alone in the Dockerfile",
    rationale:
      "Adding update instructions in a single line on the Dockerfile will cause the update layer to be cached. When you then build any image later using the same instruction, this will cause the previously cached update layer to be used, potentially preventing any fresh updates from being applied to later builds.",
    remediation:
      "Use update instructions together with install instructions and version pinning for packages while installing them. This prevents caching and forces the extraction of the required versions.",
    categories: ["Docker CIS"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    exclusions: [
      {
        name: "Don't alert on StackRox services",
        deployment: {
          scope: {
            namespace: "stackrox",
          },
        },
      },
    ],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Dockerfile Line",
            values: [
              {
                value: "RUN=(/bin/sh -c)?\\s*apk update\\s*",
              },
              {
                value: "RUN=(/bin/sh -c)?\\s*apt update\\s*",
              },
              {
                value: "RUN=(/bin/sh -c)?\\s*apt-get update\\s*",
              },
              {
                value: "RUN=(/bin/sh -c)?\\s*yum update\\s*",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
  {
    id: "842feb9f-ecb1-4e3c-a4bf-8a1dcb63948a",
    name: "Wget in Image",
    description: "Alert on deployments with wget present",
    rationale:
      "Leaving download tools like wget in an image makes it easier for attackers to use compromised containers, since they can easily download software.",
    remediation:
      'Use your package manager\'s "remove" command to remove wget from the image build for production containers.',
    disabled: true,
    categories: ["Security Best Practices"],
    lifecycleStages: ["BUILD", "DEPLOY"],
    severity: "LOW_SEVERITY",
    policyVersion: "1.1",
    policySections: [
      {
        policyGroups: [
          {
            fieldName: "Image Component",
            values: [
              {
                value: "wget=",
              },
            ],
          },
        ],
      },
    ],
    criteriaLocked: true,
    mitreVectorsLocked: true,
    isDefault: true,
  },
];
