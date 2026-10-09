// Generated from pinned upstream Kubernetes 1.35.2 / OpenShift Go API types.
// Regenerate with node tools/record-api-fixtures.mjs.
export const typedFieldOrders: Record<string, Record<string, string[]>> = {
  "ClusterRole": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "rules",
      "aggregationRule"
    ],
    ".aggregationRule": [
      "clusterRoleSelectors"
    ],
    ".aggregationRule.clusterRoleSelectors": [
      "matchLabels",
      "matchExpressions"
    ],
    ".aggregationRule.clusterRoleSelectors.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".rules": [
      "verbs",
      "apiGroups",
      "resources",
      "resourceNames",
      "nonResourceURLs"
    ]
  },
  "ClusterRoleBinding": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "subjects",
      "roleRef"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".roleRef": [
      "apiGroup",
      "kind",
      "name"
    ],
    ".subjects": [
      "kind",
      "apiGroup",
      "name",
      "namespace"
    ]
  },
  "ConfigMap": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "immutable",
      "data",
      "binaryData"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ]
  },
  "Deployment": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec",
      "status"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "replicas",
      "selector",
      "template",
      "strategy",
      "minReadySeconds",
      "revisionHistoryLimit",
      "paused",
      "progressDeadlineSeconds"
    ],
    ".spec.selector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.selector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.strategy": [
      "type",
      "rollingUpdate"
    ],
    ".spec.strategy.rollingUpdate": [
      "maxUnavailable",
      "maxSurge"
    ],
    ".spec.template": [
      "metadata",
      "spec"
    ],
    ".spec.template.metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".spec.template.metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".spec.template.metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec.template.spec": [
      "volumes",
      "initContainers",
      "containers",
      "ephemeralContainers",
      "restartPolicy",
      "terminationGracePeriodSeconds",
      "activeDeadlineSeconds",
      "dnsPolicy",
      "nodeSelector",
      "serviceAccountName",
      "serviceAccount",
      "automountServiceAccountToken",
      "nodeName",
      "hostNetwork",
      "hostPID",
      "hostIPC",
      "shareProcessNamespace",
      "securityContext",
      "imagePullSecrets",
      "hostname",
      "subdomain",
      "affinity",
      "schedulerName",
      "tolerations",
      "hostAliases",
      "priorityClassName",
      "priority",
      "dnsConfig",
      "readinessGates",
      "runtimeClassName",
      "enableServiceLinks",
      "preemptionPolicy",
      "overhead",
      "topologySpreadConstraints",
      "setHostnameAsFQDN",
      "os",
      "hostUsers",
      "schedulingGates",
      "resourceClaims",
      "resources",
      "hostnameOverride",
      "workloadRef"
    ],
    ".spec.template.spec.affinity": [
      "nodeAffinity",
      "podAffinity",
      "podAntiAffinity"
    ],
    ".spec.template.spec.affinity.nodeAffinity": [
      "requiredDuringSchedulingIgnoredDuringExecution",
      "preferredDuringSchedulingIgnoredDuringExecution"
    ],
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution": [
      "weight",
      "preference"
    ],
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference": [
      "matchExpressions",
      "matchFields"
    ],
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution": [
      "nodeSelectorTerms"
    ],
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms": [
      "matchExpressions",
      "matchFields"
    ],
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAffinity": [
      "requiredDuringSchedulingIgnoredDuringExecution",
      "preferredDuringSchedulingIgnoredDuringExecution"
    ],
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution": [
      "weight",
      "podAffinityTerm"
    ],
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAntiAffinity": [
      "requiredDuringSchedulingIgnoredDuringExecution",
      "preferredDuringSchedulingIgnoredDuringExecution"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution": [
      "weight",
      "podAffinityTerm"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.containers": [
      "name",
      "image",
      "command",
      "args",
      "workingDir",
      "ports",
      "envFrom",
      "env",
      "resources",
      "resizePolicy",
      "restartPolicy",
      "restartPolicyRules",
      "volumeMounts",
      "volumeDevices",
      "livenessProbe",
      "readinessProbe",
      "startupProbe",
      "lifecycle",
      "terminationMessagePath",
      "terminationMessagePolicy",
      "imagePullPolicy",
      "securityContext",
      "stdin",
      "stdinOnce",
      "tty"
    ],
    ".spec.template.spec.containers.env": [
      "name",
      "value",
      "valueFrom"
    ],
    ".spec.template.spec.containers.env.valueFrom": [
      "fieldRef",
      "resourceFieldRef",
      "configMapKeyRef",
      "secretKeyRef",
      "fileKeyRef"
    ],
    ".spec.template.spec.containers.env.valueFrom.configMapKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.template.spec.containers.env.valueFrom.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.template.spec.containers.env.valueFrom.fileKeyRef": [
      "volumeName",
      "path",
      "key",
      "optional"
    ],
    ".spec.template.spec.containers.env.valueFrom.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.template.spec.containers.env.valueFrom.secretKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.template.spec.containers.envFrom": [
      "prefix",
      "configMapRef",
      "secretRef"
    ],
    ".spec.template.spec.containers.envFrom.configMapRef": [
      "name",
      "optional"
    ],
    ".spec.template.spec.containers.envFrom.secretRef": [
      "name",
      "optional"
    ],
    ".spec.template.spec.containers.lifecycle": [
      "postStart",
      "preStop",
      "stopSignal"
    ],
    ".spec.template.spec.containers.lifecycle.postStart": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.template.spec.containers.lifecycle.postStart.exec": [
      "command"
    ],
    ".spec.template.spec.containers.lifecycle.postStart.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.containers.lifecycle.postStart.sleep": [
      "seconds"
    ],
    ".spec.template.spec.containers.lifecycle.postStart.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.containers.lifecycle.preStop": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.template.spec.containers.lifecycle.preStop.exec": [
      "command"
    ],
    ".spec.template.spec.containers.lifecycle.preStop.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.containers.lifecycle.preStop.sleep": [
      "seconds"
    ],
    ".spec.template.spec.containers.lifecycle.preStop.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.containers.livenessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.containers.livenessProbe.exec": [
      "command"
    ],
    ".spec.template.spec.containers.livenessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.containers.livenessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.containers.livenessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.containers.livenessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.containers.ports": [
      "name",
      "hostPort",
      "containerPort",
      "protocol",
      "hostIP"
    ],
    ".spec.template.spec.containers.readinessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.containers.readinessProbe.exec": [
      "command"
    ],
    ".spec.template.spec.containers.readinessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.containers.readinessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.containers.readinessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.containers.readinessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.containers.resizePolicy": [
      "resourceName",
      "restartPolicy"
    ],
    ".spec.template.spec.containers.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.template.spec.containers.resources.claims": [
      "name",
      "request"
    ],
    ".spec.template.spec.containers.restartPolicyRules": [
      "action",
      "exitCodes"
    ],
    ".spec.template.spec.containers.restartPolicyRules.exitCodes": [
      "operator",
      "values"
    ],
    ".spec.template.spec.containers.securityContext": [
      "capabilities",
      "privileged",
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "readOnlyRootFilesystem",
      "allowPrivilegeEscalation",
      "procMount",
      "seccompProfile",
      "appArmorProfile"
    ],
    ".spec.template.spec.containers.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.containers.securityContext.capabilities": [
      "add",
      "drop"
    ],
    ".spec.template.spec.containers.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.template.spec.containers.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.containers.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.template.spec.containers.startupProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.containers.startupProbe.exec": [
      "command"
    ],
    ".spec.template.spec.containers.startupProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.containers.startupProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.containers.startupProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.containers.startupProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.containers.volumeDevices": [
      "name",
      "devicePath"
    ],
    ".spec.template.spec.containers.volumeMounts": [
      "name",
      "readOnly",
      "recursiveReadOnly",
      "mountPath",
      "subPath",
      "mountPropagation",
      "subPathExpr"
    ],
    ".spec.template.spec.dnsConfig": [
      "nameservers",
      "searches",
      "options"
    ],
    ".spec.template.spec.dnsConfig.options": [
      "name",
      "value"
    ],
    ".spec.template.spec.ephemeralContainers": [
      "name",
      "image",
      "command",
      "args",
      "workingDir",
      "ports",
      "envFrom",
      "env",
      "resources",
      "resizePolicy",
      "restartPolicy",
      "restartPolicyRules",
      "volumeMounts",
      "volumeDevices",
      "livenessProbe",
      "readinessProbe",
      "startupProbe",
      "lifecycle",
      "terminationMessagePath",
      "terminationMessagePolicy",
      "imagePullPolicy",
      "securityContext",
      "stdin",
      "stdinOnce",
      "tty",
      "targetContainerName"
    ],
    ".spec.template.spec.ephemeralContainers.env": [
      "name",
      "value",
      "valueFrom"
    ],
    ".spec.template.spec.ephemeralContainers.env.valueFrom": [
      "fieldRef",
      "resourceFieldRef",
      "configMapKeyRef",
      "secretKeyRef",
      "fileKeyRef"
    ],
    ".spec.template.spec.ephemeralContainers.env.valueFrom.configMapKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fileKeyRef": [
      "volumeName",
      "path",
      "key",
      "optional"
    ],
    ".spec.template.spec.ephemeralContainers.env.valueFrom.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.template.spec.ephemeralContainers.env.valueFrom.secretKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.template.spec.ephemeralContainers.envFrom": [
      "prefix",
      "configMapRef",
      "secretRef"
    ],
    ".spec.template.spec.ephemeralContainers.envFrom.configMapRef": [
      "name",
      "optional"
    ],
    ".spec.template.spec.ephemeralContainers.envFrom.secretRef": [
      "name",
      "optional"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle": [
      "postStart",
      "preStop",
      "stopSignal"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.exec": [
      "command"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.sleep": [
      "seconds"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.exec": [
      "command"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.sleep": [
      "seconds"
    ],
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.ephemeralContainers.livenessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.ephemeralContainers.livenessProbe.exec": [
      "command"
    ],
    ".spec.template.spec.ephemeralContainers.livenessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.ephemeralContainers.livenessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.ephemeralContainers.ports": [
      "name",
      "hostPort",
      "containerPort",
      "protocol",
      "hostIP"
    ],
    ".spec.template.spec.ephemeralContainers.readinessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.ephemeralContainers.readinessProbe.exec": [
      "command"
    ],
    ".spec.template.spec.ephemeralContainers.readinessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.ephemeralContainers.readinessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.ephemeralContainers.resizePolicy": [
      "resourceName",
      "restartPolicy"
    ],
    ".spec.template.spec.ephemeralContainers.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.template.spec.ephemeralContainers.resources.claims": [
      "name",
      "request"
    ],
    ".spec.template.spec.ephemeralContainers.restartPolicyRules": [
      "action",
      "exitCodes"
    ],
    ".spec.template.spec.ephemeralContainers.restartPolicyRules.exitCodes": [
      "operator",
      "values"
    ],
    ".spec.template.spec.ephemeralContainers.securityContext": [
      "capabilities",
      "privileged",
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "readOnlyRootFilesystem",
      "allowPrivilegeEscalation",
      "procMount",
      "seccompProfile",
      "appArmorProfile"
    ],
    ".spec.template.spec.ephemeralContainers.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.ephemeralContainers.securityContext.capabilities": [
      "add",
      "drop"
    ],
    ".spec.template.spec.ephemeralContainers.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.template.spec.ephemeralContainers.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.ephemeralContainers.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.template.spec.ephemeralContainers.startupProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.ephemeralContainers.startupProbe.exec": [
      "command"
    ],
    ".spec.template.spec.ephemeralContainers.startupProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.ephemeralContainers.startupProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.ephemeralContainers.volumeDevices": [
      "name",
      "devicePath"
    ],
    ".spec.template.spec.ephemeralContainers.volumeMounts": [
      "name",
      "readOnly",
      "recursiveReadOnly",
      "mountPath",
      "subPath",
      "mountPropagation",
      "subPathExpr"
    ],
    ".spec.template.spec.hostAliases": [
      "ip",
      "hostnames"
    ],
    ".spec.template.spec.imagePullSecrets": [
      "name"
    ],
    ".spec.template.spec.initContainers": [
      "name",
      "image",
      "command",
      "args",
      "workingDir",
      "ports",
      "envFrom",
      "env",
      "resources",
      "resizePolicy",
      "restartPolicy",
      "restartPolicyRules",
      "volumeMounts",
      "volumeDevices",
      "livenessProbe",
      "readinessProbe",
      "startupProbe",
      "lifecycle",
      "terminationMessagePath",
      "terminationMessagePolicy",
      "imagePullPolicy",
      "securityContext",
      "stdin",
      "stdinOnce",
      "tty"
    ],
    ".spec.template.spec.initContainers.env": [
      "name",
      "value",
      "valueFrom"
    ],
    ".spec.template.spec.initContainers.env.valueFrom": [
      "fieldRef",
      "resourceFieldRef",
      "configMapKeyRef",
      "secretKeyRef",
      "fileKeyRef"
    ],
    ".spec.template.spec.initContainers.env.valueFrom.configMapKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.template.spec.initContainers.env.valueFrom.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.template.spec.initContainers.env.valueFrom.fileKeyRef": [
      "volumeName",
      "path",
      "key",
      "optional"
    ],
    ".spec.template.spec.initContainers.env.valueFrom.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.template.spec.initContainers.env.valueFrom.secretKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.template.spec.initContainers.envFrom": [
      "prefix",
      "configMapRef",
      "secretRef"
    ],
    ".spec.template.spec.initContainers.envFrom.configMapRef": [
      "name",
      "optional"
    ],
    ".spec.template.spec.initContainers.envFrom.secretRef": [
      "name",
      "optional"
    ],
    ".spec.template.spec.initContainers.lifecycle": [
      "postStart",
      "preStop",
      "stopSignal"
    ],
    ".spec.template.spec.initContainers.lifecycle.postStart": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.template.spec.initContainers.lifecycle.postStart.exec": [
      "command"
    ],
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.initContainers.lifecycle.postStart.sleep": [
      "seconds"
    ],
    ".spec.template.spec.initContainers.lifecycle.postStart.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.initContainers.lifecycle.preStop": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.template.spec.initContainers.lifecycle.preStop.exec": [
      "command"
    ],
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.initContainers.lifecycle.preStop.sleep": [
      "seconds"
    ],
    ".spec.template.spec.initContainers.lifecycle.preStop.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.initContainers.livenessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.initContainers.livenessProbe.exec": [
      "command"
    ],
    ".spec.template.spec.initContainers.livenessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.initContainers.livenessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.initContainers.livenessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.initContainers.livenessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.initContainers.ports": [
      "name",
      "hostPort",
      "containerPort",
      "protocol",
      "hostIP"
    ],
    ".spec.template.spec.initContainers.readinessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.initContainers.readinessProbe.exec": [
      "command"
    ],
    ".spec.template.spec.initContainers.readinessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.initContainers.readinessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.initContainers.readinessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.initContainers.readinessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.initContainers.resizePolicy": [
      "resourceName",
      "restartPolicy"
    ],
    ".spec.template.spec.initContainers.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.template.spec.initContainers.resources.claims": [
      "name",
      "request"
    ],
    ".spec.template.spec.initContainers.restartPolicyRules": [
      "action",
      "exitCodes"
    ],
    ".spec.template.spec.initContainers.restartPolicyRules.exitCodes": [
      "operator",
      "values"
    ],
    ".spec.template.spec.initContainers.securityContext": [
      "capabilities",
      "privileged",
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "readOnlyRootFilesystem",
      "allowPrivilegeEscalation",
      "procMount",
      "seccompProfile",
      "appArmorProfile"
    ],
    ".spec.template.spec.initContainers.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.initContainers.securityContext.capabilities": [
      "add",
      "drop"
    ],
    ".spec.template.spec.initContainers.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.template.spec.initContainers.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.initContainers.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.template.spec.initContainers.startupProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.template.spec.initContainers.startupProbe.exec": [
      "command"
    ],
    ".spec.template.spec.initContainers.startupProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.template.spec.initContainers.startupProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.template.spec.initContainers.startupProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.template.spec.initContainers.startupProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.template.spec.initContainers.volumeDevices": [
      "name",
      "devicePath"
    ],
    ".spec.template.spec.initContainers.volumeMounts": [
      "name",
      "readOnly",
      "recursiveReadOnly",
      "mountPath",
      "subPath",
      "mountPropagation",
      "subPathExpr"
    ],
    ".spec.template.spec.os": [
      "name"
    ],
    ".spec.template.spec.readinessGates": [
      "conditionType"
    ],
    ".spec.template.spec.resourceClaims": [
      "name",
      "resourceClaimName",
      "resourceClaimTemplateName"
    ],
    ".spec.template.spec.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.template.spec.resources.claims": [
      "name",
      "request"
    ],
    ".spec.template.spec.schedulingGates": [
      "name"
    ],
    ".spec.template.spec.securityContext": [
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "supplementalGroups",
      "supplementalGroupsPolicy",
      "fsGroup",
      "sysctls",
      "fsGroupChangePolicy",
      "seccompProfile",
      "appArmorProfile",
      "seLinuxChangePolicy"
    ],
    ".spec.template.spec.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.template.spec.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.template.spec.securityContext.sysctls": [
      "name",
      "value"
    ],
    ".spec.template.spec.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.template.spec.tolerations": [
      "key",
      "operator",
      "value",
      "effect",
      "tolerationSeconds"
    ],
    ".spec.template.spec.topologySpreadConstraints": [
      "maxSkew",
      "topologyKey",
      "whenUnsatisfiable",
      "labelSelector",
      "minDomains",
      "nodeAffinityPolicy",
      "nodeTaintsPolicy",
      "matchLabelKeys"
    ],
    ".spec.template.spec.topologySpreadConstraints.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.topologySpreadConstraints.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.volumes": [
      "name",
      "hostPath",
      "emptyDir",
      "gcePersistentDisk",
      "awsElasticBlockStore",
      "gitRepo",
      "secret",
      "nfs",
      "iscsi",
      "glusterfs",
      "persistentVolumeClaim",
      "rbd",
      "flexVolume",
      "cinder",
      "cephfs",
      "flocker",
      "downwardAPI",
      "fc",
      "azureFile",
      "configMap",
      "vsphereVolume",
      "quobyte",
      "azureDisk",
      "photonPersistentDisk",
      "projected",
      "portworxVolume",
      "scaleIO",
      "storageos",
      "csi",
      "ephemeral",
      "image"
    ],
    ".spec.template.spec.volumes.awsElasticBlockStore": [
      "volumeID",
      "fsType",
      "partition",
      "readOnly"
    ],
    ".spec.template.spec.volumes.azureDisk": [
      "diskName",
      "diskURI",
      "cachingMode",
      "fsType",
      "readOnly",
      "kind"
    ],
    ".spec.template.spec.volumes.azureFile": [
      "secretName",
      "shareName",
      "readOnly"
    ],
    ".spec.template.spec.volumes.cephfs": [
      "monitors",
      "path",
      "user",
      "secretFile",
      "secretRef",
      "readOnly"
    ],
    ".spec.template.spec.volumes.cephfs.secretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.cinder": [
      "volumeID",
      "fsType",
      "readOnly",
      "secretRef"
    ],
    ".spec.template.spec.volumes.cinder.secretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.configMap": [
      "name",
      "items",
      "defaultMode",
      "optional"
    ],
    ".spec.template.spec.volumes.configMap.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.template.spec.volumes.csi": [
      "driver",
      "readOnly",
      "fsType",
      "volumeAttributes",
      "nodePublishSecretRef"
    ],
    ".spec.template.spec.volumes.csi.nodePublishSecretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.downwardAPI": [
      "items",
      "defaultMode"
    ],
    ".spec.template.spec.volumes.downwardAPI.items": [
      "path",
      "fieldRef",
      "resourceFieldRef",
      "mode"
    ],
    ".spec.template.spec.volumes.downwardAPI.items.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.template.spec.volumes.downwardAPI.items.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.template.spec.volumes.emptyDir": [
      "medium",
      "sizeLimit"
    ],
    ".spec.template.spec.volumes.ephemeral": [
      "volumeClaimTemplate"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate": [
      "metadata",
      "spec"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec": [
      "accessModes",
      "selector",
      "resources",
      "volumeName",
      "storageClassName",
      "volumeMode",
      "dataSource",
      "dataSourceRef",
      "volumeAttributesClassName"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource": [
      "apiGroup",
      "kind",
      "name"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef": [
      "apiGroup",
      "kind",
      "name",
      "namespace"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.resources": [
      "limits",
      "requests"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.volumes.fc": [
      "targetWWNs",
      "lun",
      "fsType",
      "readOnly",
      "wwids"
    ],
    ".spec.template.spec.volumes.flexVolume": [
      "driver",
      "fsType",
      "secretRef",
      "readOnly",
      "options"
    ],
    ".spec.template.spec.volumes.flexVolume.secretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.flocker": [
      "datasetName",
      "datasetUUID"
    ],
    ".spec.template.spec.volumes.gcePersistentDisk": [
      "pdName",
      "fsType",
      "partition",
      "readOnly"
    ],
    ".spec.template.spec.volumes.gitRepo": [
      "repository",
      "revision",
      "directory"
    ],
    ".spec.template.spec.volumes.glusterfs": [
      "endpoints",
      "path",
      "readOnly"
    ],
    ".spec.template.spec.volumes.hostPath": [
      "path",
      "type"
    ],
    ".spec.template.spec.volumes.image": [
      "reference",
      "pullPolicy"
    ],
    ".spec.template.spec.volumes.iscsi": [
      "targetPortal",
      "iqn",
      "lun",
      "iscsiInterface",
      "fsType",
      "readOnly",
      "portals",
      "chapAuthDiscovery",
      "chapAuthSession",
      "secretRef",
      "initiatorName"
    ],
    ".spec.template.spec.volumes.iscsi.secretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.nfs": [
      "server",
      "path",
      "readOnly"
    ],
    ".spec.template.spec.volumes.persistentVolumeClaim": [
      "claimName",
      "readOnly"
    ],
    ".spec.template.spec.volumes.photonPersistentDisk": [
      "pdID",
      "fsType"
    ],
    ".spec.template.spec.volumes.portworxVolume": [
      "volumeID",
      "fsType",
      "readOnly"
    ],
    ".spec.template.spec.volumes.projected": [
      "sources",
      "defaultMode"
    ],
    ".spec.template.spec.volumes.projected.sources": [
      "secret",
      "downwardAPI",
      "configMap",
      "serviceAccountToken",
      "clusterTrustBundle",
      "podCertificate"
    ],
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle": [
      "name",
      "signerName",
      "labelSelector",
      "optional",
      "path"
    ],
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.template.spec.volumes.projected.sources.configMap": [
      "name",
      "items",
      "optional"
    ],
    ".spec.template.spec.volumes.projected.sources.configMap.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.template.spec.volumes.projected.sources.downwardAPI": [
      "items"
    ],
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items": [
      "path",
      "fieldRef",
      "resourceFieldRef",
      "mode"
    ],
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.template.spec.volumes.projected.sources.podCertificate": [
      "signerName",
      "keyType",
      "maxExpirationSeconds",
      "credentialBundlePath",
      "keyPath",
      "certificateChainPath",
      "userAnnotations"
    ],
    ".spec.template.spec.volumes.projected.sources.secret": [
      "name",
      "items",
      "optional"
    ],
    ".spec.template.spec.volumes.projected.sources.secret.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.template.spec.volumes.projected.sources.serviceAccountToken": [
      "audience",
      "expirationSeconds",
      "path"
    ],
    ".spec.template.spec.volumes.quobyte": [
      "registry",
      "volume",
      "readOnly",
      "user",
      "group",
      "tenant"
    ],
    ".spec.template.spec.volumes.rbd": [
      "monitors",
      "image",
      "fsType",
      "pool",
      "user",
      "keyring",
      "secretRef",
      "readOnly"
    ],
    ".spec.template.spec.volumes.rbd.secretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.scaleIO": [
      "gateway",
      "system",
      "secretRef",
      "sslEnabled",
      "protectionDomain",
      "storagePool",
      "storageMode",
      "volumeName",
      "fsType",
      "readOnly"
    ],
    ".spec.template.spec.volumes.scaleIO.secretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.secret": [
      "secretName",
      "items",
      "defaultMode",
      "optional"
    ],
    ".spec.template.spec.volumes.secret.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.template.spec.volumes.storageos": [
      "volumeName",
      "volumeNamespace",
      "fsType",
      "readOnly",
      "secretRef"
    ],
    ".spec.template.spec.volumes.storageos.secretRef": [
      "name"
    ],
    ".spec.template.spec.volumes.vsphereVolume": [
      "volumePath",
      "fsType",
      "storagePolicyName",
      "storagePolicyID"
    ],
    ".spec.template.spec.workloadRef": [
      "name",
      "podGroup",
      "podGroupReplicaKey"
    ],
    ".status": [
      "observedGeneration",
      "replicas",
      "updatedReplicas",
      "readyReplicas",
      "availableReplicas",
      "unavailableReplicas",
      "terminatingReplicas",
      "conditions",
      "collisionCount"
    ],
    ".status.conditions": [
      "type",
      "status",
      "lastUpdateTime",
      "lastTransitionTime",
      "reason",
      "message"
    ]
  },
  "Event": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "involvedObject",
      "reason",
      "message",
      "source",
      "firstTimestamp",
      "lastTimestamp",
      "count",
      "type",
      "eventTime",
      "series",
      "action",
      "related",
      "reportingComponent",
      "reportingInstance"
    ],
    ".involvedObject": [
      "kind",
      "namespace",
      "name",
      "uid",
      "apiVersion",
      "resourceVersion",
      "fieldPath"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".related": [
      "kind",
      "namespace",
      "name",
      "uid",
      "apiVersion",
      "resourceVersion",
      "fieldPath"
    ],
    ".series": [
      "count",
      "lastObservedTime"
    ],
    ".source": [
      "component",
      "host"
    ]
  },
  "LimitRange": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "limits"
    ],
    ".spec.limits": [
      "type",
      "max",
      "min",
      "default",
      "defaultRequest",
      "maxLimitRequestRatio"
    ]
  },
  "Namespace": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec",
      "status"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "finalizers"
    ],
    ".status": [
      "phase",
      "conditions"
    ],
    ".status.conditions": [
      "type",
      "status",
      "lastTransitionTime",
      "reason",
      "message"
    ]
  },
  "NetworkPolicy": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "podSelector",
      "ingress",
      "egress",
      "policyTypes"
    ],
    ".spec.egress": [
      "ports",
      "to"
    ],
    ".spec.egress.ports": [
      "protocol",
      "port",
      "endPort"
    ],
    ".spec.egress.to": [
      "podSelector",
      "namespaceSelector",
      "ipBlock"
    ],
    ".spec.egress.to.ipBlock": [
      "cidr",
      "except"
    ],
    ".spec.egress.to.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.egress.to.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.egress.to.podSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.egress.to.podSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.ingress": [
      "ports",
      "from"
    ],
    ".spec.ingress.from": [
      "podSelector",
      "namespaceSelector",
      "ipBlock"
    ],
    ".spec.ingress.from.ipBlock": [
      "cidr",
      "except"
    ],
    ".spec.ingress.from.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.ingress.from.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.ingress.from.podSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.ingress.from.podSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.ingress.ports": [
      "protocol",
      "port",
      "endPort"
    ],
    ".spec.podSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.podSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ]
  },
  "Node": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec",
      "status"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "podCIDR",
      "podCIDRs",
      "providerID",
      "unschedulable",
      "taints",
      "configSource",
      "externalID"
    ],
    ".spec.configSource": [
      "configMap"
    ],
    ".spec.configSource.configMap": [
      "namespace",
      "name",
      "uid",
      "resourceVersion",
      "kubeletConfigKey"
    ],
    ".spec.taints": [
      "key",
      "value",
      "effect",
      "timeAdded"
    ],
    ".status": [
      "capacity",
      "allocatable",
      "phase",
      "conditions",
      "addresses",
      "daemonEndpoints",
      "nodeInfo",
      "images",
      "volumesInUse",
      "volumesAttached",
      "config",
      "runtimeHandlers",
      "features",
      "declaredFeatures"
    ],
    ".status.addresses": [
      "type",
      "address"
    ],
    ".status.conditions": [
      "type",
      "status",
      "lastHeartbeatTime",
      "lastTransitionTime",
      "reason",
      "message"
    ],
    ".status.config": [
      "assigned",
      "active",
      "lastKnownGood",
      "error"
    ],
    ".status.config.active": [
      "configMap"
    ],
    ".status.config.active.configMap": [
      "namespace",
      "name",
      "uid",
      "resourceVersion",
      "kubeletConfigKey"
    ],
    ".status.config.assigned": [
      "configMap"
    ],
    ".status.config.assigned.configMap": [
      "namespace",
      "name",
      "uid",
      "resourceVersion",
      "kubeletConfigKey"
    ],
    ".status.config.lastKnownGood": [
      "configMap"
    ],
    ".status.config.lastKnownGood.configMap": [
      "namespace",
      "name",
      "uid",
      "resourceVersion",
      "kubeletConfigKey"
    ],
    ".status.daemonEndpoints": [
      "kubeletEndpoint"
    ],
    ".status.daemonEndpoints.kubeletEndpoint": [
      "Port"
    ],
    ".status.features": [
      "supplementalGroupsPolicy"
    ],
    ".status.images": [
      "names",
      "sizeBytes"
    ],
    ".status.nodeInfo": [
      "machineID",
      "systemUUID",
      "bootID",
      "kernelVersion",
      "osImage",
      "containerRuntimeVersion",
      "kubeletVersion",
      "kubeProxyVersion",
      "operatingSystem",
      "architecture",
      "swap"
    ],
    ".status.nodeInfo.swap": [
      "capacity"
    ],
    ".status.runtimeHandlers": [
      "name",
      "features"
    ],
    ".status.runtimeHandlers.features": [
      "recursiveReadOnlyMounts",
      "userNamespaces"
    ],
    ".status.volumesAttached": [
      "name",
      "devicePath"
    ]
  },
  "Pod": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec",
      "status"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "volumes",
      "initContainers",
      "containers",
      "ephemeralContainers",
      "restartPolicy",
      "terminationGracePeriodSeconds",
      "activeDeadlineSeconds",
      "dnsPolicy",
      "nodeSelector",
      "serviceAccountName",
      "serviceAccount",
      "automountServiceAccountToken",
      "nodeName",
      "hostNetwork",
      "hostPID",
      "hostIPC",
      "shareProcessNamespace",
      "securityContext",
      "imagePullSecrets",
      "hostname",
      "subdomain",
      "affinity",
      "schedulerName",
      "tolerations",
      "hostAliases",
      "priorityClassName",
      "priority",
      "dnsConfig",
      "readinessGates",
      "runtimeClassName",
      "enableServiceLinks",
      "preemptionPolicy",
      "overhead",
      "topologySpreadConstraints",
      "setHostnameAsFQDN",
      "os",
      "hostUsers",
      "schedulingGates",
      "resourceClaims",
      "resources",
      "hostnameOverride",
      "workloadRef"
    ],
    ".spec.affinity": [
      "nodeAffinity",
      "podAffinity",
      "podAntiAffinity"
    ],
    ".spec.affinity.nodeAffinity": [
      "requiredDuringSchedulingIgnoredDuringExecution",
      "preferredDuringSchedulingIgnoredDuringExecution"
    ],
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution": [
      "weight",
      "preference"
    ],
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference": [
      "matchExpressions",
      "matchFields"
    ],
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution": [
      "nodeSelectorTerms"
    ],
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms": [
      "matchExpressions",
      "matchFields"
    ],
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAffinity": [
      "requiredDuringSchedulingIgnoredDuringExecution",
      "preferredDuringSchedulingIgnoredDuringExecution"
    ],
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution": [
      "weight",
      "podAffinityTerm"
    ],
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAntiAffinity": [
      "requiredDuringSchedulingIgnoredDuringExecution",
      "preferredDuringSchedulingIgnoredDuringExecution"
    ],
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution": [
      "weight",
      "podAffinityTerm"
    ],
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution": [
      "labelSelector",
      "namespaces",
      "topologyKey",
      "namespaceSelector",
      "matchLabelKeys",
      "mismatchLabelKeys"
    ],
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.containers": [
      "name",
      "image",
      "command",
      "args",
      "workingDir",
      "ports",
      "envFrom",
      "env",
      "resources",
      "resizePolicy",
      "restartPolicy",
      "restartPolicyRules",
      "volumeMounts",
      "volumeDevices",
      "livenessProbe",
      "readinessProbe",
      "startupProbe",
      "lifecycle",
      "terminationMessagePath",
      "terminationMessagePolicy",
      "imagePullPolicy",
      "securityContext",
      "stdin",
      "stdinOnce",
      "tty"
    ],
    ".spec.containers.env": [
      "name",
      "value",
      "valueFrom"
    ],
    ".spec.containers.env.valueFrom": [
      "fieldRef",
      "resourceFieldRef",
      "configMapKeyRef",
      "secretKeyRef",
      "fileKeyRef"
    ],
    ".spec.containers.env.valueFrom.configMapKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.containers.env.valueFrom.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.containers.env.valueFrom.fileKeyRef": [
      "volumeName",
      "path",
      "key",
      "optional"
    ],
    ".spec.containers.env.valueFrom.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.containers.env.valueFrom.secretKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.containers.envFrom": [
      "prefix",
      "configMapRef",
      "secretRef"
    ],
    ".spec.containers.envFrom.configMapRef": [
      "name",
      "optional"
    ],
    ".spec.containers.envFrom.secretRef": [
      "name",
      "optional"
    ],
    ".spec.containers.lifecycle": [
      "postStart",
      "preStop",
      "stopSignal"
    ],
    ".spec.containers.lifecycle.postStart": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.containers.lifecycle.postStart.exec": [
      "command"
    ],
    ".spec.containers.lifecycle.postStart.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.containers.lifecycle.postStart.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.containers.lifecycle.postStart.sleep": [
      "seconds"
    ],
    ".spec.containers.lifecycle.postStart.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.containers.lifecycle.preStop": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.containers.lifecycle.preStop.exec": [
      "command"
    ],
    ".spec.containers.lifecycle.preStop.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.containers.lifecycle.preStop.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.containers.lifecycle.preStop.sleep": [
      "seconds"
    ],
    ".spec.containers.lifecycle.preStop.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.containers.livenessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.containers.livenessProbe.exec": [
      "command"
    ],
    ".spec.containers.livenessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.containers.livenessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.containers.livenessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.containers.livenessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.containers.ports": [
      "name",
      "hostPort",
      "containerPort",
      "protocol",
      "hostIP"
    ],
    ".spec.containers.readinessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.containers.readinessProbe.exec": [
      "command"
    ],
    ".spec.containers.readinessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.containers.readinessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.containers.readinessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.containers.readinessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.containers.resizePolicy": [
      "resourceName",
      "restartPolicy"
    ],
    ".spec.containers.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.containers.resources.claims": [
      "name",
      "request"
    ],
    ".spec.containers.restartPolicyRules": [
      "action",
      "exitCodes"
    ],
    ".spec.containers.restartPolicyRules.exitCodes": [
      "operator",
      "values"
    ],
    ".spec.containers.securityContext": [
      "capabilities",
      "privileged",
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "readOnlyRootFilesystem",
      "allowPrivilegeEscalation",
      "procMount",
      "seccompProfile",
      "appArmorProfile"
    ],
    ".spec.containers.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.containers.securityContext.capabilities": [
      "add",
      "drop"
    ],
    ".spec.containers.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.containers.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.containers.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.containers.startupProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.containers.startupProbe.exec": [
      "command"
    ],
    ".spec.containers.startupProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.containers.startupProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.containers.startupProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.containers.startupProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.containers.volumeDevices": [
      "name",
      "devicePath"
    ],
    ".spec.containers.volumeMounts": [
      "name",
      "readOnly",
      "recursiveReadOnly",
      "mountPath",
      "subPath",
      "mountPropagation",
      "subPathExpr"
    ],
    ".spec.dnsConfig": [
      "nameservers",
      "searches",
      "options"
    ],
    ".spec.dnsConfig.options": [
      "name",
      "value"
    ],
    ".spec.ephemeralContainers": [
      "name",
      "image",
      "command",
      "args",
      "workingDir",
      "ports",
      "envFrom",
      "env",
      "resources",
      "resizePolicy",
      "restartPolicy",
      "restartPolicyRules",
      "volumeMounts",
      "volumeDevices",
      "livenessProbe",
      "readinessProbe",
      "startupProbe",
      "lifecycle",
      "terminationMessagePath",
      "terminationMessagePolicy",
      "imagePullPolicy",
      "securityContext",
      "stdin",
      "stdinOnce",
      "tty",
      "targetContainerName"
    ],
    ".spec.ephemeralContainers.env": [
      "name",
      "value",
      "valueFrom"
    ],
    ".spec.ephemeralContainers.env.valueFrom": [
      "fieldRef",
      "resourceFieldRef",
      "configMapKeyRef",
      "secretKeyRef",
      "fileKeyRef"
    ],
    ".spec.ephemeralContainers.env.valueFrom.configMapKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.ephemeralContainers.env.valueFrom.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.ephemeralContainers.env.valueFrom.fileKeyRef": [
      "volumeName",
      "path",
      "key",
      "optional"
    ],
    ".spec.ephemeralContainers.env.valueFrom.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.ephemeralContainers.env.valueFrom.secretKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.ephemeralContainers.envFrom": [
      "prefix",
      "configMapRef",
      "secretRef"
    ],
    ".spec.ephemeralContainers.envFrom.configMapRef": [
      "name",
      "optional"
    ],
    ".spec.ephemeralContainers.envFrom.secretRef": [
      "name",
      "optional"
    ],
    ".spec.ephemeralContainers.lifecycle": [
      "postStart",
      "preStop",
      "stopSignal"
    ],
    ".spec.ephemeralContainers.lifecycle.postStart": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.ephemeralContainers.lifecycle.postStart.exec": [
      "command"
    ],
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.ephemeralContainers.lifecycle.postStart.sleep": [
      "seconds"
    ],
    ".spec.ephemeralContainers.lifecycle.postStart.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.ephemeralContainers.lifecycle.preStop": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.ephemeralContainers.lifecycle.preStop.exec": [
      "command"
    ],
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.ephemeralContainers.lifecycle.preStop.sleep": [
      "seconds"
    ],
    ".spec.ephemeralContainers.lifecycle.preStop.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.ephemeralContainers.livenessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.ephemeralContainers.livenessProbe.exec": [
      "command"
    ],
    ".spec.ephemeralContainers.livenessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.ephemeralContainers.livenessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.ephemeralContainers.livenessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.ephemeralContainers.ports": [
      "name",
      "hostPort",
      "containerPort",
      "protocol",
      "hostIP"
    ],
    ".spec.ephemeralContainers.readinessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.ephemeralContainers.readinessProbe.exec": [
      "command"
    ],
    ".spec.ephemeralContainers.readinessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.ephemeralContainers.readinessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.ephemeralContainers.readinessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.ephemeralContainers.resizePolicy": [
      "resourceName",
      "restartPolicy"
    ],
    ".spec.ephemeralContainers.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.ephemeralContainers.resources.claims": [
      "name",
      "request"
    ],
    ".spec.ephemeralContainers.restartPolicyRules": [
      "action",
      "exitCodes"
    ],
    ".spec.ephemeralContainers.restartPolicyRules.exitCodes": [
      "operator",
      "values"
    ],
    ".spec.ephemeralContainers.securityContext": [
      "capabilities",
      "privileged",
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "readOnlyRootFilesystem",
      "allowPrivilegeEscalation",
      "procMount",
      "seccompProfile",
      "appArmorProfile"
    ],
    ".spec.ephemeralContainers.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.ephemeralContainers.securityContext.capabilities": [
      "add",
      "drop"
    ],
    ".spec.ephemeralContainers.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.ephemeralContainers.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.ephemeralContainers.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.ephemeralContainers.startupProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.ephemeralContainers.startupProbe.exec": [
      "command"
    ],
    ".spec.ephemeralContainers.startupProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.ephemeralContainers.startupProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.ephemeralContainers.startupProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.ephemeralContainers.startupProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.ephemeralContainers.volumeDevices": [
      "name",
      "devicePath"
    ],
    ".spec.ephemeralContainers.volumeMounts": [
      "name",
      "readOnly",
      "recursiveReadOnly",
      "mountPath",
      "subPath",
      "mountPropagation",
      "subPathExpr"
    ],
    ".spec.hostAliases": [
      "ip",
      "hostnames"
    ],
    ".spec.imagePullSecrets": [
      "name"
    ],
    ".spec.initContainers": [
      "name",
      "image",
      "command",
      "args",
      "workingDir",
      "ports",
      "envFrom",
      "env",
      "resources",
      "resizePolicy",
      "restartPolicy",
      "restartPolicyRules",
      "volumeMounts",
      "volumeDevices",
      "livenessProbe",
      "readinessProbe",
      "startupProbe",
      "lifecycle",
      "terminationMessagePath",
      "terminationMessagePolicy",
      "imagePullPolicy",
      "securityContext",
      "stdin",
      "stdinOnce",
      "tty"
    ],
    ".spec.initContainers.env": [
      "name",
      "value",
      "valueFrom"
    ],
    ".spec.initContainers.env.valueFrom": [
      "fieldRef",
      "resourceFieldRef",
      "configMapKeyRef",
      "secretKeyRef",
      "fileKeyRef"
    ],
    ".spec.initContainers.env.valueFrom.configMapKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.initContainers.env.valueFrom.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.initContainers.env.valueFrom.fileKeyRef": [
      "volumeName",
      "path",
      "key",
      "optional"
    ],
    ".spec.initContainers.env.valueFrom.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.initContainers.env.valueFrom.secretKeyRef": [
      "name",
      "key",
      "optional"
    ],
    ".spec.initContainers.envFrom": [
      "prefix",
      "configMapRef",
      "secretRef"
    ],
    ".spec.initContainers.envFrom.configMapRef": [
      "name",
      "optional"
    ],
    ".spec.initContainers.envFrom.secretRef": [
      "name",
      "optional"
    ],
    ".spec.initContainers.lifecycle": [
      "postStart",
      "preStop",
      "stopSignal"
    ],
    ".spec.initContainers.lifecycle.postStart": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.initContainers.lifecycle.postStart.exec": [
      "command"
    ],
    ".spec.initContainers.lifecycle.postStart.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.initContainers.lifecycle.postStart.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.initContainers.lifecycle.postStart.sleep": [
      "seconds"
    ],
    ".spec.initContainers.lifecycle.postStart.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.initContainers.lifecycle.preStop": [
      "exec",
      "httpGet",
      "tcpSocket",
      "sleep"
    ],
    ".spec.initContainers.lifecycle.preStop.exec": [
      "command"
    ],
    ".spec.initContainers.lifecycle.preStop.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.initContainers.lifecycle.preStop.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.initContainers.lifecycle.preStop.sleep": [
      "seconds"
    ],
    ".spec.initContainers.lifecycle.preStop.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.initContainers.livenessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.initContainers.livenessProbe.exec": [
      "command"
    ],
    ".spec.initContainers.livenessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.initContainers.livenessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.initContainers.livenessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.initContainers.livenessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.initContainers.ports": [
      "name",
      "hostPort",
      "containerPort",
      "protocol",
      "hostIP"
    ],
    ".spec.initContainers.readinessProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.initContainers.readinessProbe.exec": [
      "command"
    ],
    ".spec.initContainers.readinessProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.initContainers.readinessProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.initContainers.readinessProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.initContainers.readinessProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.initContainers.resizePolicy": [
      "resourceName",
      "restartPolicy"
    ],
    ".spec.initContainers.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.initContainers.resources.claims": [
      "name",
      "request"
    ],
    ".spec.initContainers.restartPolicyRules": [
      "action",
      "exitCodes"
    ],
    ".spec.initContainers.restartPolicyRules.exitCodes": [
      "operator",
      "values"
    ],
    ".spec.initContainers.securityContext": [
      "capabilities",
      "privileged",
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "readOnlyRootFilesystem",
      "allowPrivilegeEscalation",
      "procMount",
      "seccompProfile",
      "appArmorProfile"
    ],
    ".spec.initContainers.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.initContainers.securityContext.capabilities": [
      "add",
      "drop"
    ],
    ".spec.initContainers.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.initContainers.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.initContainers.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.initContainers.startupProbe": [
      "exec",
      "httpGet",
      "tcpSocket",
      "grpc",
      "initialDelaySeconds",
      "timeoutSeconds",
      "periodSeconds",
      "successThreshold",
      "failureThreshold",
      "terminationGracePeriodSeconds"
    ],
    ".spec.initContainers.startupProbe.exec": [
      "command"
    ],
    ".spec.initContainers.startupProbe.grpc": [
      "port",
      "service"
    ],
    ".spec.initContainers.startupProbe.httpGet": [
      "path",
      "port",
      "host",
      "scheme",
      "httpHeaders"
    ],
    ".spec.initContainers.startupProbe.httpGet.httpHeaders": [
      "name",
      "value"
    ],
    ".spec.initContainers.startupProbe.tcpSocket": [
      "port",
      "host"
    ],
    ".spec.initContainers.volumeDevices": [
      "name",
      "devicePath"
    ],
    ".spec.initContainers.volumeMounts": [
      "name",
      "readOnly",
      "recursiveReadOnly",
      "mountPath",
      "subPath",
      "mountPropagation",
      "subPathExpr"
    ],
    ".spec.os": [
      "name"
    ],
    ".spec.readinessGates": [
      "conditionType"
    ],
    ".spec.resourceClaims": [
      "name",
      "resourceClaimName",
      "resourceClaimTemplateName"
    ],
    ".spec.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".spec.resources.claims": [
      "name",
      "request"
    ],
    ".spec.schedulingGates": [
      "name"
    ],
    ".spec.securityContext": [
      "seLinuxOptions",
      "windowsOptions",
      "runAsUser",
      "runAsGroup",
      "runAsNonRoot",
      "supplementalGroups",
      "supplementalGroupsPolicy",
      "fsGroup",
      "sysctls",
      "fsGroupChangePolicy",
      "seccompProfile",
      "appArmorProfile",
      "seLinuxChangePolicy"
    ],
    ".spec.securityContext.appArmorProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.securityContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".spec.securityContext.seccompProfile": [
      "type",
      "localhostProfile"
    ],
    ".spec.securityContext.sysctls": [
      "name",
      "value"
    ],
    ".spec.securityContext.windowsOptions": [
      "gmsaCredentialSpecName",
      "gmsaCredentialSpec",
      "runAsUserName",
      "hostProcess"
    ],
    ".spec.tolerations": [
      "key",
      "operator",
      "value",
      "effect",
      "tolerationSeconds"
    ],
    ".spec.topologySpreadConstraints": [
      "maxSkew",
      "topologyKey",
      "whenUnsatisfiable",
      "labelSelector",
      "minDomains",
      "nodeAffinityPolicy",
      "nodeTaintsPolicy",
      "matchLabelKeys"
    ],
    ".spec.topologySpreadConstraints.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.topologySpreadConstraints.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.volumes": [
      "name",
      "hostPath",
      "emptyDir",
      "gcePersistentDisk",
      "awsElasticBlockStore",
      "gitRepo",
      "secret",
      "nfs",
      "iscsi",
      "glusterfs",
      "persistentVolumeClaim",
      "rbd",
      "flexVolume",
      "cinder",
      "cephfs",
      "flocker",
      "downwardAPI",
      "fc",
      "azureFile",
      "configMap",
      "vsphereVolume",
      "quobyte",
      "azureDisk",
      "photonPersistentDisk",
      "projected",
      "portworxVolume",
      "scaleIO",
      "storageos",
      "csi",
      "ephemeral",
      "image"
    ],
    ".spec.volumes.awsElasticBlockStore": [
      "volumeID",
      "fsType",
      "partition",
      "readOnly"
    ],
    ".spec.volumes.azureDisk": [
      "diskName",
      "diskURI",
      "cachingMode",
      "fsType",
      "readOnly",
      "kind"
    ],
    ".spec.volumes.azureFile": [
      "secretName",
      "shareName",
      "readOnly"
    ],
    ".spec.volumes.cephfs": [
      "monitors",
      "path",
      "user",
      "secretFile",
      "secretRef",
      "readOnly"
    ],
    ".spec.volumes.cephfs.secretRef": [
      "name"
    ],
    ".spec.volumes.cinder": [
      "volumeID",
      "fsType",
      "readOnly",
      "secretRef"
    ],
    ".spec.volumes.cinder.secretRef": [
      "name"
    ],
    ".spec.volumes.configMap": [
      "name",
      "items",
      "defaultMode",
      "optional"
    ],
    ".spec.volumes.configMap.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.volumes.csi": [
      "driver",
      "readOnly",
      "fsType",
      "volumeAttributes",
      "nodePublishSecretRef"
    ],
    ".spec.volumes.csi.nodePublishSecretRef": [
      "name"
    ],
    ".spec.volumes.downwardAPI": [
      "items",
      "defaultMode"
    ],
    ".spec.volumes.downwardAPI.items": [
      "path",
      "fieldRef",
      "resourceFieldRef",
      "mode"
    ],
    ".spec.volumes.downwardAPI.items.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.volumes.downwardAPI.items.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.volumes.emptyDir": [
      "medium",
      "sizeLimit"
    ],
    ".spec.volumes.ephemeral": [
      "volumeClaimTemplate"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate": [
      "metadata",
      "spec"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec": [
      "accessModes",
      "selector",
      "resources",
      "volumeName",
      "storageClassName",
      "volumeMode",
      "dataSource",
      "dataSourceRef",
      "volumeAttributesClassName"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource": [
      "apiGroup",
      "kind",
      "name"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef": [
      "apiGroup",
      "kind",
      "name",
      "namespace"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.resources": [
      "limits",
      "requests"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.volumes.fc": [
      "targetWWNs",
      "lun",
      "fsType",
      "readOnly",
      "wwids"
    ],
    ".spec.volumes.flexVolume": [
      "driver",
      "fsType",
      "secretRef",
      "readOnly",
      "options"
    ],
    ".spec.volumes.flexVolume.secretRef": [
      "name"
    ],
    ".spec.volumes.flocker": [
      "datasetName",
      "datasetUUID"
    ],
    ".spec.volumes.gcePersistentDisk": [
      "pdName",
      "fsType",
      "partition",
      "readOnly"
    ],
    ".spec.volumes.gitRepo": [
      "repository",
      "revision",
      "directory"
    ],
    ".spec.volumes.glusterfs": [
      "endpoints",
      "path",
      "readOnly"
    ],
    ".spec.volumes.hostPath": [
      "path",
      "type"
    ],
    ".spec.volumes.image": [
      "reference",
      "pullPolicy"
    ],
    ".spec.volumes.iscsi": [
      "targetPortal",
      "iqn",
      "lun",
      "iscsiInterface",
      "fsType",
      "readOnly",
      "portals",
      "chapAuthDiscovery",
      "chapAuthSession",
      "secretRef",
      "initiatorName"
    ],
    ".spec.volumes.iscsi.secretRef": [
      "name"
    ],
    ".spec.volumes.nfs": [
      "server",
      "path",
      "readOnly"
    ],
    ".spec.volumes.persistentVolumeClaim": [
      "claimName",
      "readOnly"
    ],
    ".spec.volumes.photonPersistentDisk": [
      "pdID",
      "fsType"
    ],
    ".spec.volumes.portworxVolume": [
      "volumeID",
      "fsType",
      "readOnly"
    ],
    ".spec.volumes.projected": [
      "sources",
      "defaultMode"
    ],
    ".spec.volumes.projected.sources": [
      "secret",
      "downwardAPI",
      "configMap",
      "serviceAccountToken",
      "clusterTrustBundle",
      "podCertificate"
    ],
    ".spec.volumes.projected.sources.clusterTrustBundle": [
      "name",
      "signerName",
      "labelSelector",
      "optional",
      "path"
    ],
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector": [
      "matchLabels",
      "matchExpressions"
    ],
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions": [
      "key",
      "operator",
      "values"
    ],
    ".spec.volumes.projected.sources.configMap": [
      "name",
      "items",
      "optional"
    ],
    ".spec.volumes.projected.sources.configMap.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.volumes.projected.sources.downwardAPI": [
      "items"
    ],
    ".spec.volumes.projected.sources.downwardAPI.items": [
      "path",
      "fieldRef",
      "resourceFieldRef",
      "mode"
    ],
    ".spec.volumes.projected.sources.downwardAPI.items.fieldRef": [
      "apiVersion",
      "fieldPath"
    ],
    ".spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef": [
      "containerName",
      "resource",
      "divisor"
    ],
    ".spec.volumes.projected.sources.podCertificate": [
      "signerName",
      "keyType",
      "maxExpirationSeconds",
      "credentialBundlePath",
      "keyPath",
      "certificateChainPath",
      "userAnnotations"
    ],
    ".spec.volumes.projected.sources.secret": [
      "name",
      "items",
      "optional"
    ],
    ".spec.volumes.projected.sources.secret.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.volumes.projected.sources.serviceAccountToken": [
      "audience",
      "expirationSeconds",
      "path"
    ],
    ".spec.volumes.quobyte": [
      "registry",
      "volume",
      "readOnly",
      "user",
      "group",
      "tenant"
    ],
    ".spec.volumes.rbd": [
      "monitors",
      "image",
      "fsType",
      "pool",
      "user",
      "keyring",
      "secretRef",
      "readOnly"
    ],
    ".spec.volumes.rbd.secretRef": [
      "name"
    ],
    ".spec.volumes.scaleIO": [
      "gateway",
      "system",
      "secretRef",
      "sslEnabled",
      "protectionDomain",
      "storagePool",
      "storageMode",
      "volumeName",
      "fsType",
      "readOnly"
    ],
    ".spec.volumes.scaleIO.secretRef": [
      "name"
    ],
    ".spec.volumes.secret": [
      "secretName",
      "items",
      "defaultMode",
      "optional"
    ],
    ".spec.volumes.secret.items": [
      "key",
      "path",
      "mode"
    ],
    ".spec.volumes.storageos": [
      "volumeName",
      "volumeNamespace",
      "fsType",
      "readOnly",
      "secretRef"
    ],
    ".spec.volumes.storageos.secretRef": [
      "name"
    ],
    ".spec.volumes.vsphereVolume": [
      "volumePath",
      "fsType",
      "storagePolicyName",
      "storagePolicyID"
    ],
    ".spec.workloadRef": [
      "name",
      "podGroup",
      "podGroupReplicaKey"
    ],
    ".status": [
      "observedGeneration",
      "phase",
      "conditions",
      "message",
      "reason",
      "nominatedNodeName",
      "hostIP",
      "hostIPs",
      "podIP",
      "podIPs",
      "startTime",
      "initContainerStatuses",
      "containerStatuses",
      "qosClass",
      "ephemeralContainerStatuses",
      "resize",
      "resourceClaimStatuses",
      "extendedResourceClaimStatus",
      "allocatedResources",
      "resources"
    ],
    ".status.conditions": [
      "type",
      "observedGeneration",
      "status",
      "lastProbeTime",
      "lastTransitionTime",
      "reason",
      "message"
    ],
    ".status.containerStatuses": [
      "name",
      "state",
      "lastState",
      "ready",
      "restartCount",
      "image",
      "imageID",
      "containerID",
      "started",
      "allocatedResources",
      "resources",
      "volumeMounts",
      "user",
      "allocatedResourcesStatus",
      "stopSignal"
    ],
    ".status.containerStatuses.allocatedResourcesStatus": [
      "name",
      "resources"
    ],
    ".status.containerStatuses.allocatedResourcesStatus.resources": [
      "resourceID",
      "health"
    ],
    ".status.containerStatuses.lastState": [
      "waiting",
      "running",
      "terminated"
    ],
    ".status.containerStatuses.lastState.running": [
      "startedAt"
    ],
    ".status.containerStatuses.lastState.terminated": [
      "exitCode",
      "signal",
      "reason",
      "message",
      "startedAt",
      "finishedAt",
      "containerID"
    ],
    ".status.containerStatuses.lastState.waiting": [
      "reason",
      "message"
    ],
    ".status.containerStatuses.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".status.containerStatuses.resources.claims": [
      "name",
      "request"
    ],
    ".status.containerStatuses.state": [
      "waiting",
      "running",
      "terminated"
    ],
    ".status.containerStatuses.state.running": [
      "startedAt"
    ],
    ".status.containerStatuses.state.terminated": [
      "exitCode",
      "signal",
      "reason",
      "message",
      "startedAt",
      "finishedAt",
      "containerID"
    ],
    ".status.containerStatuses.state.waiting": [
      "reason",
      "message"
    ],
    ".status.containerStatuses.user": [
      "linux"
    ],
    ".status.containerStatuses.user.linux": [
      "uid",
      "gid",
      "supplementalGroups"
    ],
    ".status.containerStatuses.volumeMounts": [
      "name",
      "mountPath",
      "readOnly",
      "recursiveReadOnly"
    ],
    ".status.ephemeralContainerStatuses": [
      "name",
      "state",
      "lastState",
      "ready",
      "restartCount",
      "image",
      "imageID",
      "containerID",
      "started",
      "allocatedResources",
      "resources",
      "volumeMounts",
      "user",
      "allocatedResourcesStatus",
      "stopSignal"
    ],
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus": [
      "name",
      "resources"
    ],
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus.resources": [
      "resourceID",
      "health"
    ],
    ".status.ephemeralContainerStatuses.lastState": [
      "waiting",
      "running",
      "terminated"
    ],
    ".status.ephemeralContainerStatuses.lastState.running": [
      "startedAt"
    ],
    ".status.ephemeralContainerStatuses.lastState.terminated": [
      "exitCode",
      "signal",
      "reason",
      "message",
      "startedAt",
      "finishedAt",
      "containerID"
    ],
    ".status.ephemeralContainerStatuses.lastState.waiting": [
      "reason",
      "message"
    ],
    ".status.ephemeralContainerStatuses.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".status.ephemeralContainerStatuses.resources.claims": [
      "name",
      "request"
    ],
    ".status.ephemeralContainerStatuses.state": [
      "waiting",
      "running",
      "terminated"
    ],
    ".status.ephemeralContainerStatuses.state.running": [
      "startedAt"
    ],
    ".status.ephemeralContainerStatuses.state.terminated": [
      "exitCode",
      "signal",
      "reason",
      "message",
      "startedAt",
      "finishedAt",
      "containerID"
    ],
    ".status.ephemeralContainerStatuses.state.waiting": [
      "reason",
      "message"
    ],
    ".status.ephemeralContainerStatuses.user": [
      "linux"
    ],
    ".status.ephemeralContainerStatuses.user.linux": [
      "uid",
      "gid",
      "supplementalGroups"
    ],
    ".status.ephemeralContainerStatuses.volumeMounts": [
      "name",
      "mountPath",
      "readOnly",
      "recursiveReadOnly"
    ],
    ".status.extendedResourceClaimStatus": [
      "requestMappings",
      "resourceClaimName"
    ],
    ".status.extendedResourceClaimStatus.requestMappings": [
      "containerName",
      "resourceName",
      "requestName"
    ],
    ".status.hostIPs": [
      "ip"
    ],
    ".status.initContainerStatuses": [
      "name",
      "state",
      "lastState",
      "ready",
      "restartCount",
      "image",
      "imageID",
      "containerID",
      "started",
      "allocatedResources",
      "resources",
      "volumeMounts",
      "user",
      "allocatedResourcesStatus",
      "stopSignal"
    ],
    ".status.initContainerStatuses.allocatedResourcesStatus": [
      "name",
      "resources"
    ],
    ".status.initContainerStatuses.allocatedResourcesStatus.resources": [
      "resourceID",
      "health"
    ],
    ".status.initContainerStatuses.lastState": [
      "waiting",
      "running",
      "terminated"
    ],
    ".status.initContainerStatuses.lastState.running": [
      "startedAt"
    ],
    ".status.initContainerStatuses.lastState.terminated": [
      "exitCode",
      "signal",
      "reason",
      "message",
      "startedAt",
      "finishedAt",
      "containerID"
    ],
    ".status.initContainerStatuses.lastState.waiting": [
      "reason",
      "message"
    ],
    ".status.initContainerStatuses.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".status.initContainerStatuses.resources.claims": [
      "name",
      "request"
    ],
    ".status.initContainerStatuses.state": [
      "waiting",
      "running",
      "terminated"
    ],
    ".status.initContainerStatuses.state.running": [
      "startedAt"
    ],
    ".status.initContainerStatuses.state.terminated": [
      "exitCode",
      "signal",
      "reason",
      "message",
      "startedAt",
      "finishedAt",
      "containerID"
    ],
    ".status.initContainerStatuses.state.waiting": [
      "reason",
      "message"
    ],
    ".status.initContainerStatuses.user": [
      "linux"
    ],
    ".status.initContainerStatuses.user.linux": [
      "uid",
      "gid",
      "supplementalGroups"
    ],
    ".status.initContainerStatuses.volumeMounts": [
      "name",
      "mountPath",
      "readOnly",
      "recursiveReadOnly"
    ],
    ".status.podIPs": [
      "ip"
    ],
    ".status.resourceClaimStatuses": [
      "name",
      "resourceClaimName"
    ],
    ".status.resources": [
      "limits",
      "requests",
      "claims"
    ],
    ".status.resources.claims": [
      "name",
      "request"
    ]
  },
  "ResourceQuota": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec",
      "status"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "hard",
      "scopes",
      "scopeSelector"
    ],
    ".spec.scopeSelector": [
      "matchExpressions"
    ],
    ".spec.scopeSelector.matchExpressions": [
      "scopeName",
      "operator",
      "values"
    ],
    ".status": [
      "hard",
      "used"
    ]
  },
  "Role": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "rules"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".rules": [
      "verbs",
      "apiGroups",
      "resources",
      "resourceNames",
      "nonResourceURLs"
    ]
  },
  "RoleBinding": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "subjects",
      "roleRef"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".roleRef": [
      "apiGroup",
      "kind",
      "name"
    ],
    ".subjects": [
      "kind",
      "apiGroup",
      "name",
      "namespace"
    ]
  },
  "Route": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec",
      "status"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "host",
      "subdomain",
      "path",
      "to",
      "alternateBackends",
      "port",
      "tls",
      "wildcardPolicy",
      "httpHeaders"
    ],
    ".spec.alternateBackends": [
      "kind",
      "name",
      "weight"
    ],
    ".spec.httpHeaders": [
      "actions"
    ],
    ".spec.httpHeaders.actions": [
      "response",
      "request"
    ],
    ".spec.httpHeaders.actions.request": [
      "name",
      "action"
    ],
    ".spec.httpHeaders.actions.request.action": [
      "type",
      "set"
    ],
    ".spec.httpHeaders.actions.request.action.set": [
      "value"
    ],
    ".spec.httpHeaders.actions.response": [
      "name",
      "action"
    ],
    ".spec.httpHeaders.actions.response.action": [
      "type",
      "set"
    ],
    ".spec.httpHeaders.actions.response.action.set": [
      "value"
    ],
    ".spec.port": [
      "targetPort"
    ],
    ".spec.tls": [
      "termination",
      "certificate",
      "key",
      "caCertificate",
      "destinationCACertificate",
      "insecureEdgeTerminationPolicy",
      "externalCertificate"
    ],
    ".spec.tls.externalCertificate": [
      "name"
    ],
    ".spec.to": [
      "kind",
      "name",
      "weight"
    ],
    ".status": [
      "ingress"
    ],
    ".status.ingress": [
      "host",
      "routerName",
      "conditions",
      "wildcardPolicy",
      "routerCanonicalHostname"
    ],
    ".status.ingress.conditions": [
      "type",
      "status",
      "reason",
      "message",
      "lastTransitionTime"
    ]
  },
  "Secret": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "immutable",
      "data",
      "stringData",
      "type"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ]
  },
  "SecurityContextConstraints": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "priority",
      "allowPrivilegedContainer",
      "defaultAddCapabilities",
      "requiredDropCapabilities",
      "allowedCapabilities",
      "allowHostDirVolumePlugin",
      "volumes",
      "allowedFlexVolumes",
      "allowHostNetwork",
      "allowHostPorts",
      "allowHostPID",
      "allowHostIPC",
      "userNamespaceLevel",
      "defaultAllowPrivilegeEscalation",
      "allowPrivilegeEscalation",
      "seLinuxContext",
      "runAsUser",
      "supplementalGroups",
      "fsGroup",
      "readOnlyRootFilesystem",
      "users",
      "groups",
      "seccompProfiles",
      "allowedUnsafeSysctls",
      "forbiddenSysctls"
    ],
    ".allowedFlexVolumes": [
      "driver"
    ],
    ".fsGroup": [
      "type",
      "ranges"
    ],
    ".fsGroup.ranges": [
      "min",
      "max"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".runAsUser": [
      "type",
      "uid",
      "uidRangeMin",
      "uidRangeMax"
    ],
    ".seLinuxContext": [
      "type",
      "seLinuxOptions"
    ],
    ".seLinuxContext.seLinuxOptions": [
      "user",
      "role",
      "type",
      "level"
    ],
    ".supplementalGroups": [
      "type",
      "ranges"
    ],
    ".supplementalGroups.ranges": [
      "min",
      "max"
    ]
  },
  "Service": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "spec",
      "status"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".spec": [
      "ports",
      "selector",
      "clusterIP",
      "clusterIPs",
      "type",
      "externalIPs",
      "sessionAffinity",
      "loadBalancerIP",
      "loadBalancerSourceRanges",
      "externalName",
      "externalTrafficPolicy",
      "healthCheckNodePort",
      "publishNotReadyAddresses",
      "sessionAffinityConfig",
      "ipFamilies",
      "ipFamilyPolicy",
      "allocateLoadBalancerNodePorts",
      "loadBalancerClass",
      "internalTrafficPolicy",
      "trafficDistribution"
    ],
    ".spec.ports": [
      "name",
      "protocol",
      "appProtocol",
      "port",
      "targetPort",
      "nodePort"
    ],
    ".spec.sessionAffinityConfig": [
      "clientIP"
    ],
    ".spec.sessionAffinityConfig.clientIP": [
      "timeoutSeconds"
    ],
    ".status": [
      "loadBalancer",
      "conditions"
    ],
    ".status.conditions": [
      "type",
      "status",
      "observedGeneration",
      "lastTransitionTime",
      "reason",
      "message"
    ],
    ".status.loadBalancer": [
      "ingress"
    ],
    ".status.loadBalancer.ingress": [
      "ip",
      "hostname",
      "ipMode",
      "ports"
    ],
    ".status.loadBalancer.ingress.ports": [
      "port",
      "protocol",
      "error"
    ]
  },
  "ServiceAccount": {
    "": [
      "kind",
      "apiVersion",
      "metadata",
      "secrets",
      "imagePullSecrets",
      "automountServiceAccountToken"
    ],
    ".imagePullSecrets": [
      "name"
    ],
    ".metadata": [
      "name",
      "generateName",
      "namespace",
      "selfLink",
      "uid",
      "resourceVersion",
      "generation",
      "creationTimestamp",
      "deletionTimestamp",
      "deletionGracePeriodSeconds",
      "labels",
      "annotations",
      "ownerReferences",
      "finalizers",
      "managedFields"
    ],
    ".metadata.managedFields": [
      "manager",
      "operation",
      "apiVersion",
      "time",
      "fieldsType",
      "fieldsV1",
      "subresource"
    ],
    ".metadata.ownerReferences": [
      "apiVersion",
      "kind",
      "name",
      "uid",
      "controller",
      "blockOwnerDeletion"
    ],
    ".secrets": [
      "kind",
      "namespace",
      "name",
      "uid",
      "apiVersion",
      "resourceVersion",
      "fieldPath"
    ]
  }
};
