// Generated from pinned upstream Kubernetes 1.35.2 / OpenShift Go API types.
// Regenerate with node tools/record-api-fixtures.mjs.
export const typedJsonRules: Record<string, Record<string, {omitEmpty?:boolean; omitZero?:boolean; fill?:boolean; default?:unknown; time?:boolean; pointer?:boolean; collection?:boolean}>> = {
  "ClusterRole": {
    ".aggregationRule": {
      "omitEmpty": true,
      "pointer": true
    },
    ".aggregationRule.clusterRoleSelectors": {
      "omitEmpty": true,
      "collection": true
    },
    ".aggregationRule.clusterRoleSelectors.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".aggregationRule.clusterRoleSelectors.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".aggregationRule.clusterRoleSelectors.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".aggregationRule.clusterRoleSelectors.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".aggregationRule.clusterRoleSelectors.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".rules": {
      "fill": true,
      "collection": true
    },
    ".rules.apiGroups": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.nonResourceURLs": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.resourceNames": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.resources": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.verbs": {
      "fill": true,
      "collection": true
    }
  },
  "ClusterRoleBinding": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".roleRef": {
      "default": {
        "apiGroup": "",
        "kind": "",
        "name": ""
      },
      "fill": true
    },
    ".roleRef.apiGroup": {
      "default": "",
      "fill": true
    },
    ".roleRef.kind": {
      "default": "",
      "fill": true
    },
    ".roleRef.name": {
      "default": "",
      "fill": true
    },
    ".subjects": {
      "omitEmpty": true,
      "collection": true
    },
    ".subjects.apiGroup": {
      "omitEmpty": true
    },
    ".subjects.kind": {
      "default": "",
      "fill": true
    },
    ".subjects.name": {
      "default": "",
      "fill": true
    },
    ".subjects.namespace": {
      "omitEmpty": true
    }
  },
  "ConfigMap": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".binaryData": {
      "omitEmpty": true,
      "collection": true
    },
    ".data": {
      "omitEmpty": true,
      "collection": true
    },
    ".immutable": {
      "omitEmpty": true,
      "pointer": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    }
  },
  "Deployment": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {
        "selector": null,
        "strategy": {},
        "template": {
          "metadata": {},
          "spec": {
            "containers": null
          }
        }
      },
      "fill": true
    },
    ".spec.minReadySeconds": {
      "omitEmpty": true
    },
    ".spec.paused": {
      "omitEmpty": true
    },
    ".spec.progressDeadlineSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.replicas": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.revisionHistoryLimit": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.selector": {
      "fill": true,
      "pointer": true
    },
    ".spec.selector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.selector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.selector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.selector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.selector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.strategy": {
      "default": {},
      "fill": true
    },
    ".spec.strategy.rollingUpdate": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.strategy.rollingUpdate.maxSurge": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.strategy.rollingUpdate.maxUnavailable": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.strategy.type": {
      "omitEmpty": true
    },
    ".spec.template": {
      "default": {
        "metadata": {},
        "spec": {
          "containers": null
        }
      },
      "fill": true
    },
    ".spec.template.metadata": {
      "default": {},
      "fill": true
    },
    ".spec.template.metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".spec.template.metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.metadata.generateName": {
      "omitEmpty": true
    },
    ".spec.template.metadata.generation": {
      "omitEmpty": true
    },
    ".spec.template.metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".spec.template.metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".spec.template.metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".spec.template.metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".spec.template.metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".spec.template.metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.metadata.name": {
      "omitEmpty": true
    },
    ".spec.template.metadata.namespace": {
      "omitEmpty": true
    },
    ".spec.template.metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".spec.template.metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".spec.template.metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".spec.template.metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".spec.template.metadata.selfLink": {
      "omitEmpty": true
    },
    ".spec.template.metadata.uid": {
      "omitEmpty": true
    },
    ".spec.template.spec": {
      "default": {
        "containers": null
      },
      "fill": true
    },
    ".spec.template.spec.activeDeadlineSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.nodeAffinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference": {
      "default": {},
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.weight": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms": {
      "fill": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": {
      "default": {
        "topologyKey": ""
      },
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.weight": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": {
      "default": {
        "topologyKey": ""
      },
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.weight": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.automountServiceAccountToken": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers": {
      "fill": true,
      "collection": true
    },
    ".spec.template.spec.containers.args": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.env": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.env.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.value": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.env.valueFrom": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.configMapKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.configMapKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.configMapKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.env.valueFrom.configMapKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.env.valueFrom.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.fileKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.fileKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.fileKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.fileKeyRef.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.fileKeyRef.volumeName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.env.valueFrom.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.secretKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.env.valueFrom.secretKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.env.valueFrom.secretKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.env.valueFrom.secretKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.envFrom": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.envFrom.configMapRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.envFrom.configMapRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.envFrom.configMapRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.envFrom.prefix": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.envFrom.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.envFrom.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.envFrom.secretRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.image": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.imagePullPolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.postStart": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.postStart.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.preStop": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.lifecycle.preStop.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.lifecycle.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.livenessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.livenessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.livenessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.livenessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.livenessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.livenessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.ports.containerPort": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.ports.hostIP": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.ports.hostPort": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.ports.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.ports.protocol": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.readinessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.readinessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.readinessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.readinessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.readinessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.readinessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.readinessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.readinessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.readinessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.readinessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.resizePolicy": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.resizePolicy.resourceName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.resizePolicy.restartPolicy": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.resources": {
      "default": {},
      "fill": true
    },
    ".spec.template.spec.containers.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.restartPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.restartPolicyRules": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.restartPolicyRules.action": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.restartPolicyRules.exitCodes": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.restartPolicyRules.exitCodes.operator": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.restartPolicyRules.exitCodes.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.allowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.securityContext.capabilities": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.capabilities.add": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.securityContext.capabilities.drop": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.securityContext.privileged": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.procMount": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.readOnlyRootFilesystem": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.startupProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.startupProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.startupProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.startupProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.containers.startupProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.startupProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.stdin": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.stdinOnce": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.terminationMessagePath": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.terminationMessagePolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.tty": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.volumeDevices": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.volumeDevices.devicePath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.volumeDevices.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.containers.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.volumeMounts.mountPropagation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.containers.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.containers.volumeMounts.subPath": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.volumeMounts.subPathExpr": {
      "omitEmpty": true
    },
    ".spec.template.spec.containers.workingDir": {
      "omitEmpty": true
    },
    ".spec.template.spec.dnsConfig": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.dnsConfig.nameservers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.dnsConfig.options": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.dnsConfig.options.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.dnsConfig.options.value": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.dnsConfig.searches": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.dnsPolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.enableServiceLinks": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.args": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.env": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.env.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.value": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.configMapKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.configMapKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.configMapKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.configMapKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fileKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fileKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fileKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fileKeyRef.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.fileKeyRef.volumeName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.secretKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.secretKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.secretKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.env.valueFrom.secretKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom.configMapRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom.configMapRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom.configMapRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom.prefix": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.envFrom.secretRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.image": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.imagePullPolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.postStart.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.preStop.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.lifecycle.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.livenessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.ports.containerPort": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.ports.hostIP": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.ports.hostPort": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.ports.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.ports.protocol": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.readinessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.resizePolicy": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.resizePolicy.resourceName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.resizePolicy.restartPolicy": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.resources": {
      "default": {},
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.restartPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.restartPolicyRules": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.restartPolicyRules.action": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.restartPolicyRules.exitCodes": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.restartPolicyRules.exitCodes.operator": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.restartPolicyRules.exitCodes.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.allowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.capabilities": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.capabilities.add": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.capabilities.drop": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.privileged": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.procMount": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.readOnlyRootFilesystem": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.startupProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.stdin": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.stdinOnce": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.targetContainerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.terminationMessagePath": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.terminationMessagePolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.tty": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.volumeDevices": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.volumeDevices.devicePath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.volumeDevices.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts.mountPropagation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts.subPath": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts.subPathExpr": {
      "omitEmpty": true
    },
    ".spec.template.spec.ephemeralContainers.workingDir": {
      "omitEmpty": true
    },
    ".spec.template.spec.hostAliases": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.hostAliases.hostnames": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.hostAliases.ip": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.hostIPC": {
      "omitEmpty": true
    },
    ".spec.template.spec.hostNetwork": {
      "omitEmpty": true
    },
    ".spec.template.spec.hostPID": {
      "omitEmpty": true
    },
    ".spec.template.spec.hostUsers": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.hostname": {
      "omitEmpty": true
    },
    ".spec.template.spec.hostnameOverride": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.imagePullSecrets": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.imagePullSecrets.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.args": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.env": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.env.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.value": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.env.valueFrom": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.configMapKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.configMapKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.configMapKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.configMapKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fileKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fileKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fileKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fileKeyRef.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.fileKeyRef.volumeName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.secretKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.secretKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.secretKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.env.valueFrom.secretKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.envFrom": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.envFrom.configMapRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.envFrom.configMapRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.envFrom.configMapRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.envFrom.prefix": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.envFrom.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.envFrom.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.envFrom.secretRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.image": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.imagePullPolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.postStart.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.lifecycle.preStop.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.lifecycle.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.livenessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.livenessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.livenessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.livenessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.livenessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.livenessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.ports.containerPort": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.ports.hostIP": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.ports.hostPort": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.ports.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.ports.protocol": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.readinessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.readinessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.readinessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.readinessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.readinessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.readinessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.readinessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.readinessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.readinessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.readinessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.resizePolicy": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.resizePolicy.resourceName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.resizePolicy.restartPolicy": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.resources": {
      "default": {},
      "fill": true
    },
    ".spec.template.spec.initContainers.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.restartPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.restartPolicyRules": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.restartPolicyRules.action": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.restartPolicyRules.exitCodes": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.restartPolicyRules.exitCodes.operator": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.restartPolicyRules.exitCodes.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.allowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.securityContext.capabilities": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.capabilities.add": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.securityContext.capabilities.drop": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.securityContext.privileged": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.procMount": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.readOnlyRootFilesystem": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.startupProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.startupProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.startupProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.startupProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.initContainers.startupProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.startupProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.stdin": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.stdinOnce": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.terminationMessagePath": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.terminationMessagePolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.tty": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.volumeDevices": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.volumeDevices.devicePath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.volumeDevices.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.initContainers.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.volumeMounts.mountPropagation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.initContainers.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.initContainers.volumeMounts.subPath": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.volumeMounts.subPathExpr": {
      "omitEmpty": true
    },
    ".spec.template.spec.initContainers.workingDir": {
      "omitEmpty": true
    },
    ".spec.template.spec.nodeName": {
      "omitEmpty": true
    },
    ".spec.template.spec.nodeSelector": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.os": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.os.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.overhead": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.preemptionPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.priority": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.priorityClassName": {
      "omitEmpty": true
    },
    ".spec.template.spec.readinessGates": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.readinessGates.conditionType": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.resourceClaims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.resourceClaims.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.resourceClaims.resourceClaimName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.resourceClaims.resourceClaimTemplateName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.resources": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.template.spec.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.restartPolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.runtimeClassName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.schedulerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.schedulingGates": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.schedulingGates.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.securityContext.fsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.fsGroupChangePolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.seLinuxChangePolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.template.spec.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.template.spec.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.template.spec.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.template.spec.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.securityContext.supplementalGroups": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.securityContext.supplementalGroupsPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.sysctls": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.securityContext.sysctls.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.securityContext.sysctls.value": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.serviceAccount": {
      "omitEmpty": true
    },
    ".spec.template.spec.serviceAccountName": {
      "omitEmpty": true
    },
    ".spec.template.spec.setHostnameAsFQDN": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.shareProcessNamespace": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.subdomain": {
      "omitEmpty": true
    },
    ".spec.template.spec.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.tolerations": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.tolerations.effect": {
      "omitEmpty": true
    },
    ".spec.template.spec.tolerations.key": {
      "omitEmpty": true
    },
    ".spec.template.spec.tolerations.operator": {
      "omitEmpty": true
    },
    ".spec.template.spec.tolerations.tolerationSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.tolerations.value": {
      "omitEmpty": true
    },
    ".spec.template.spec.topologySpreadConstraints": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.topologySpreadConstraints.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.topologySpreadConstraints.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.topologySpreadConstraints.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.topologySpreadConstraints.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.topologySpreadConstraints.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.topologySpreadConstraints.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.topologySpreadConstraints.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.topologySpreadConstraints.maxSkew": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.topologySpreadConstraints.minDomains": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.topologySpreadConstraints.nodeAffinityPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.topologySpreadConstraints.nodeTaintsPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.topologySpreadConstraints.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.topologySpreadConstraints.whenUnsatisfiable": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.awsElasticBlockStore": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.awsElasticBlockStore.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.awsElasticBlockStore.partition": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.awsElasticBlockStore.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.awsElasticBlockStore.volumeID": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.azureDisk": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.azureDisk.cachingMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.azureDisk.diskName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.azureDisk.diskURI": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.azureDisk.fsType": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.azureDisk.kind": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.azureDisk.readOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.azureFile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.azureFile.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.azureFile.secretName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.azureFile.shareName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.cephfs": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.cephfs.monitors": {
      "fill": true,
      "collection": true
    },
    ".spec.template.spec.volumes.cephfs.path": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cephfs.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cephfs.secretFile": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cephfs.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.cephfs.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cephfs.user": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cinder": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.cinder.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cinder.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cinder.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.cinder.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.cinder.volumeID": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.configMap.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.configMap.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.configMap.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.configMap.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.configMap.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.configMap.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.configMap.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.csi": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.csi.driver": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.csi.fsType": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.csi.nodePublishSecretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.csi.nodePublishSecretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.csi.readOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.csi.volumeAttributes": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.downwardAPI": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.downwardAPI.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.downwardAPI.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.template.spec.volumes.downwardAPI.items.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.emptyDir": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.emptyDir.medium": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.emptyDir.sizeLimit": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata": {
      "default": {},
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.generateName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.generation": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.namespace": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.selfLink": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.uid": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec": {
      "default": {
        "resources": {}
      },
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.accessModes": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource.apiGroup": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource.kind": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.apiGroup": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.kind": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.namespace": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.resources": {
      "default": {},
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.storageClassName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.volumeAttributesClassName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.volumeMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.spec.volumeName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.fc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.fc.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.fc.lun": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.fc.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.fc.targetWWNs": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.fc.wwids": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.flexVolume": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.flexVolume.driver": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.flexVolume.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.flexVolume.options": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.flexVolume.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.flexVolume.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.flexVolume.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.flocker": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.flocker.datasetName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.flocker.datasetUUID": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.gcePersistentDisk": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.gcePersistentDisk.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.gcePersistentDisk.partition": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.gcePersistentDisk.pdName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.gcePersistentDisk.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.gitRepo": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.gitRepo.directory": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.gitRepo.repository": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.gitRepo.revision": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.glusterfs": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.glusterfs.endpoints": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.glusterfs.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.glusterfs.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.hostPath": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.hostPath.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.hostPath.type": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.image": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.image.pullPolicy": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.image.reference": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.iscsi": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.iscsi.chapAuthDiscovery": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.iscsi.chapAuthSession": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.iscsi.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.iscsi.initiatorName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.iscsi.iqn": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.iscsi.iscsiInterface": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.iscsi.lun": {
      "default": 0,
      "fill": true
    },
    ".spec.template.spec.volumes.iscsi.portals": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.iscsi.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.iscsi.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.iscsi.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.iscsi.targetPortal": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.nfs": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.nfs.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.nfs.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.nfs.server": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.persistentVolumeClaim": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.persistentVolumeClaim.claimName": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.persistentVolumeClaim.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.photonPersistentDisk": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.photonPersistentDisk.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.photonPersistentDisk.pdID": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.portworxVolume": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.portworxVolume.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.portworxVolume.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.portworxVolume.volumeID": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources": {
      "fill": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.name": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.clusterTrustBundle.signerName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.configMap.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.configMap.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.configMap.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.configMap.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.configMap.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.configMap.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate.certificateChainPath": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate.credentialBundlePath": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate.keyPath": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate.keyType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate.maxExpirationSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate.signerName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.podCertificate.userAnnotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.secret": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.secret.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.projected.sources.secret.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.secret.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.secret.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.projected.sources.secret.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.secret.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.serviceAccountToken": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.serviceAccountToken.audience": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.projected.sources.serviceAccountToken.expirationSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.projected.sources.serviceAccountToken.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.quobyte": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.quobyte.group": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.quobyte.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.quobyte.registry": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.quobyte.tenant": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.quobyte.user": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.quobyte.volume": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.rbd": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.rbd.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.rbd.image": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.rbd.keyring": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.rbd.monitors": {
      "fill": true,
      "collection": true
    },
    ".spec.template.spec.volumes.rbd.pool": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.rbd.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.rbd.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.rbd.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.rbd.user": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.scaleIO.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO.gateway": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.scaleIO.protectionDomain": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO.secretRef": {
      "fill": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.scaleIO.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO.sslEnabled": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO.storageMode": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO.storagePool": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.scaleIO.system": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.scaleIO.volumeName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.secret": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.secret.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.secret.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.template.spec.volumes.secret.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.secret.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.secret.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.volumes.secret.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.secret.secretName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.storageos": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.storageos.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.storageos.readOnly": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.storageos.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.storageos.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.storageos.volumeName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.storageos.volumeNamespace": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.vsphereVolume": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.volumes.vsphereVolume.fsType": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.vsphereVolume.storagePolicyID": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.vsphereVolume.storagePolicyName": {
      "omitEmpty": true
    },
    ".spec.template.spec.volumes.vsphereVolume.volumePath": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.workloadRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.template.spec.workloadRef.name": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.workloadRef.podGroup": {
      "default": "",
      "fill": true
    },
    ".spec.template.spec.workloadRef.podGroupReplicaKey": {
      "omitEmpty": true
    },
    ".status": {
      "default": {},
      "fill": true
    },
    ".status.availableReplicas": {
      "omitEmpty": true
    },
    ".status.collisionCount": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.conditions": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.conditions.lastTransitionTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.lastUpdateTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.message": {
      "omitEmpty": true
    },
    ".status.conditions.reason": {
      "omitEmpty": true
    },
    ".status.conditions.status": {
      "default": "",
      "fill": true
    },
    ".status.conditions.type": {
      "default": "",
      "fill": true
    },
    ".status.observedGeneration": {
      "omitEmpty": true
    },
    ".status.readyReplicas": {
      "omitEmpty": true
    },
    ".status.replicas": {
      "omitEmpty": true
    },
    ".status.terminatingReplicas": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.unavailableReplicas": {
      "omitEmpty": true
    },
    ".status.updatedReplicas": {
      "omitEmpty": true
    }
  },
  "Event": {
    ".action": {
      "omitEmpty": true
    },
    ".apiVersion": {
      "omitEmpty": true
    },
    ".count": {
      "omitEmpty": true
    },
    ".eventTime": {
      "fill": true
    },
    ".firstTimestamp": {
      "fill": true,
      "time": true
    },
    ".involvedObject": {
      "default": {},
      "fill": true
    },
    ".involvedObject.apiVersion": {
      "omitEmpty": true
    },
    ".involvedObject.fieldPath": {
      "omitEmpty": true
    },
    ".involvedObject.kind": {
      "omitEmpty": true
    },
    ".involvedObject.name": {
      "omitEmpty": true
    },
    ".involvedObject.namespace": {
      "omitEmpty": true
    },
    ".involvedObject.resourceVersion": {
      "omitEmpty": true
    },
    ".involvedObject.uid": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".lastTimestamp": {
      "fill": true,
      "time": true
    },
    ".message": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".reason": {
      "omitEmpty": true
    },
    ".related": {
      "omitEmpty": true,
      "pointer": true
    },
    ".related.apiVersion": {
      "omitEmpty": true
    },
    ".related.fieldPath": {
      "omitEmpty": true
    },
    ".related.kind": {
      "omitEmpty": true
    },
    ".related.name": {
      "omitEmpty": true
    },
    ".related.namespace": {
      "omitEmpty": true
    },
    ".related.resourceVersion": {
      "omitEmpty": true
    },
    ".related.uid": {
      "omitEmpty": true
    },
    ".reportingComponent": {
      "default": "",
      "fill": true
    },
    ".reportingInstance": {
      "default": "",
      "fill": true
    },
    ".series": {
      "omitEmpty": true,
      "pointer": true
    },
    ".series.count": {
      "omitEmpty": true
    },
    ".series.lastObservedTime": {
      "fill": true
    },
    ".source": {
      "default": {},
      "fill": true
    },
    ".source.component": {
      "omitEmpty": true
    },
    ".source.host": {
      "omitEmpty": true
    },
    ".type": {
      "omitEmpty": true
    }
  },
  "LimitRange": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {
        "limits": null
      },
      "fill": true
    },
    ".spec.limits": {
      "fill": true,
      "collection": true
    },
    ".spec.limits.default": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.limits.defaultRequest": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.limits.max": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.limits.maxLimitRequestRatio": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.limits.min": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.limits.type": {
      "default": "",
      "fill": true
    }
  },
  "Namespace": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {},
      "fill": true
    },
    ".spec.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".status": {
      "default": {},
      "fill": true
    },
    ".status.conditions": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.conditions.lastTransitionTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.message": {
      "omitEmpty": true
    },
    ".status.conditions.reason": {
      "omitEmpty": true
    },
    ".status.conditions.status": {
      "default": "",
      "fill": true
    },
    ".status.conditions.type": {
      "default": "",
      "fill": true
    },
    ".status.phase": {
      "omitEmpty": true
    }
  },
  "NetworkPolicy": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {
        "podSelector": {}
      },
      "fill": true
    },
    ".spec.egress": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.ports.endPort": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.egress.ports.port": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.egress.ports.protocol": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.egress.to": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.to.ipBlock": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.egress.to.ipBlock.cidr": {
      "default": "",
      "fill": true
    },
    ".spec.egress.to.ipBlock.except": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.to.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.egress.to.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.to.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.egress.to.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.egress.to.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.to.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.to.podSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.egress.to.podSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.to.podSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.egress.to.podSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.egress.to.podSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.egress.to.podSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from.ipBlock": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ingress.from.ipBlock.cidr": {
      "default": "",
      "fill": true
    },
    ".spec.ingress.from.ipBlock.except": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ingress.from.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.ingress.from.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.ingress.from.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from.podSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ingress.from.podSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from.podSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.ingress.from.podSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.ingress.from.podSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.from.podSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ingress.ports.endPort": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ingress.ports.port": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ingress.ports.protocol": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.podSelector": {
      "default": {},
      "fill": true
    },
    ".spec.podSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.podSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.podSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.podSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.podSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.policyTypes": {
      "omitEmpty": true,
      "collection": true
    }
  },
  "Node": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {},
      "fill": true
    },
    ".spec.configSource": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.configSource.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.configSource.configMap.kubeletConfigKey": {
      "default": "",
      "fill": true
    },
    ".spec.configSource.configMap.name": {
      "default": "",
      "fill": true
    },
    ".spec.configSource.configMap.namespace": {
      "default": "",
      "fill": true
    },
    ".spec.configSource.configMap.resourceVersion": {
      "omitEmpty": true
    },
    ".spec.configSource.configMap.uid": {
      "omitEmpty": true
    },
    ".spec.externalID": {
      "omitEmpty": true
    },
    ".spec.podCIDR": {
      "omitEmpty": true
    },
    ".spec.podCIDRs": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.providerID": {
      "omitEmpty": true
    },
    ".spec.taints": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.taints.effect": {
      "default": "",
      "fill": true
    },
    ".spec.taints.key": {
      "default": "",
      "fill": true
    },
    ".spec.taints.timeAdded": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.taints.value": {
      "omitEmpty": true
    },
    ".spec.unschedulable": {
      "omitEmpty": true
    },
    ".status": {
      "default": {
        "daemonEndpoints": {
          "kubeletEndpoint": {
            "Port": 0
          }
        },
        "nodeInfo": {
          "architecture": "",
          "bootID": "",
          "containerRuntimeVersion": "",
          "kernelVersion": "",
          "kubeProxyVersion": "",
          "kubeletVersion": "",
          "machineID": "",
          "operatingSystem": "",
          "osImage": "",
          "systemUUID": ""
        }
      },
      "fill": true
    },
    ".status.addresses": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.addresses.address": {
      "default": "",
      "fill": true
    },
    ".status.addresses.type": {
      "default": "",
      "fill": true
    },
    ".status.allocatable": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.capacity": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.conditions": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.conditions.lastHeartbeatTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.lastTransitionTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.message": {
      "omitEmpty": true
    },
    ".status.conditions.reason": {
      "omitEmpty": true
    },
    ".status.conditions.status": {
      "default": "",
      "fill": true
    },
    ".status.conditions.type": {
      "default": "",
      "fill": true
    },
    ".status.config": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.config.active": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.config.active.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.config.active.configMap.kubeletConfigKey": {
      "default": "",
      "fill": true
    },
    ".status.config.active.configMap.name": {
      "default": "",
      "fill": true
    },
    ".status.config.active.configMap.namespace": {
      "default": "",
      "fill": true
    },
    ".status.config.active.configMap.resourceVersion": {
      "omitEmpty": true
    },
    ".status.config.active.configMap.uid": {
      "omitEmpty": true
    },
    ".status.config.assigned": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.config.assigned.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.config.assigned.configMap.kubeletConfigKey": {
      "default": "",
      "fill": true
    },
    ".status.config.assigned.configMap.name": {
      "default": "",
      "fill": true
    },
    ".status.config.assigned.configMap.namespace": {
      "default": "",
      "fill": true
    },
    ".status.config.assigned.configMap.resourceVersion": {
      "omitEmpty": true
    },
    ".status.config.assigned.configMap.uid": {
      "omitEmpty": true
    },
    ".status.config.error": {
      "omitEmpty": true
    },
    ".status.config.lastKnownGood": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.config.lastKnownGood.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.config.lastKnownGood.configMap.kubeletConfigKey": {
      "default": "",
      "fill": true
    },
    ".status.config.lastKnownGood.configMap.name": {
      "default": "",
      "fill": true
    },
    ".status.config.lastKnownGood.configMap.namespace": {
      "default": "",
      "fill": true
    },
    ".status.config.lastKnownGood.configMap.resourceVersion": {
      "omitEmpty": true
    },
    ".status.config.lastKnownGood.configMap.uid": {
      "omitEmpty": true
    },
    ".status.daemonEndpoints": {
      "default": {
        "kubeletEndpoint": {
          "Port": 0
        }
      },
      "fill": true
    },
    ".status.daemonEndpoints.kubeletEndpoint": {
      "default": {
        "Port": 0
      },
      "fill": true
    },
    ".status.daemonEndpoints.kubeletEndpoint.Port": {
      "default": 0,
      "fill": true
    },
    ".status.declaredFeatures": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.features": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.features.supplementalGroupsPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.images": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.images.names": {
      "fill": true,
      "collection": true
    },
    ".status.images.sizeBytes": {
      "omitEmpty": true
    },
    ".status.nodeInfo": {
      "default": {
        "architecture": "",
        "bootID": "",
        "containerRuntimeVersion": "",
        "kernelVersion": "",
        "kubeProxyVersion": "",
        "kubeletVersion": "",
        "machineID": "",
        "operatingSystem": "",
        "osImage": "",
        "systemUUID": ""
      },
      "fill": true
    },
    ".status.nodeInfo.architecture": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.bootID": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.containerRuntimeVersion": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.kernelVersion": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.kubeProxyVersion": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.kubeletVersion": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.machineID": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.operatingSystem": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.osImage": {
      "default": "",
      "fill": true
    },
    ".status.nodeInfo.swap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.nodeInfo.swap.capacity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.nodeInfo.systemUUID": {
      "default": "",
      "fill": true
    },
    ".status.phase": {
      "omitEmpty": true
    },
    ".status.runtimeHandlers": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.runtimeHandlers.features": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.runtimeHandlers.features.recursiveReadOnlyMounts": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.runtimeHandlers.features.userNamespaces": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.runtimeHandlers.name": {
      "default": "",
      "fill": true
    },
    ".status.volumesAttached": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.volumesAttached.devicePath": {
      "default": "",
      "fill": true
    },
    ".status.volumesAttached.name": {
      "default": "",
      "fill": true
    },
    ".status.volumesInUse": {
      "omitEmpty": true,
      "collection": true
    }
  },
  "Pod": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {
        "containers": null
      },
      "fill": true
    },
    ".spec.activeDeadlineSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.nodeAffinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference": {
      "default": {},
      "fill": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.preference.matchFields.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution.weight": {
      "default": 0,
      "fill": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms": {
      "fill": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchFields.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": {
      "default": {
        "topologyKey": ""
      },
      "fill": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.weight": {
      "default": 0,
      "fill": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm": {
      "default": {
        "topologyKey": ""
      },
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.weight": {
      "default": 0,
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.mismatchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaceSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.namespaces": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.automountServiceAccountToken": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers": {
      "fill": true,
      "collection": true
    },
    ".spec.containers.args": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.env": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.env.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.value": {
      "omitEmpty": true
    },
    ".spec.containers.env.valueFrom": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.configMapKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.configMapKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.valueFrom.configMapKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.containers.env.valueFrom.configMapKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.containers.env.valueFrom.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.valueFrom.fileKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.fileKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.valueFrom.fileKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.fileKeyRef.path": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.valueFrom.fileKeyRef.volumeName": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.valueFrom.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.containers.env.valueFrom.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.containers.env.valueFrom.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.valueFrom.secretKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.env.valueFrom.secretKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.containers.env.valueFrom.secretKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.containers.env.valueFrom.secretKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.envFrom": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.envFrom.configMapRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.envFrom.configMapRef.name": {
      "omitEmpty": true
    },
    ".spec.containers.envFrom.configMapRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.envFrom.prefix": {
      "omitEmpty": true
    },
    ".spec.containers.envFrom.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.envFrom.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.containers.envFrom.secretRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.image": {
      "omitEmpty": true
    },
    ".spec.containers.imagePullPolicy": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.postStart": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.postStart.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.postStart.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.lifecycle.postStart.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.postStart.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.postStart.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.lifecycle.postStart.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.lifecycle.postStart.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.containers.lifecycle.postStart.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.postStart.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.lifecycle.postStart.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.postStart.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.postStart.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.lifecycle.postStart.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.postStart.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.postStart.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.lifecycle.preStop": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.preStop.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.preStop.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.lifecycle.preStop.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.preStop.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.preStop.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.lifecycle.preStop.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.lifecycle.preStop.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.containers.lifecycle.preStop.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.preStop.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.lifecycle.preStop.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.preStop.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.preStop.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.lifecycle.preStop.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.lifecycle.preStop.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.containers.lifecycle.preStop.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.lifecycle.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.livenessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.livenessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.livenessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.livenessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.containers.livenessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.livenessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.containers.livenessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.livenessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.livenessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.containers.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.ports.containerPort": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.ports.hostIP": {
      "omitEmpty": true
    },
    ".spec.containers.ports.hostPort": {
      "omitEmpty": true
    },
    ".spec.containers.ports.name": {
      "omitEmpty": true
    },
    ".spec.containers.ports.protocol": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.readinessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.readinessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.readinessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.readinessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.readinessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.containers.readinessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.readinessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.readinessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.readinessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.containers.readinessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.readinessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.readinessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.containers.readinessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.readinessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.readinessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.containers.resizePolicy": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.resizePolicy.resourceName": {
      "default": "",
      "fill": true
    },
    ".spec.containers.resizePolicy.restartPolicy": {
      "default": "",
      "fill": true
    },
    ".spec.containers.resources": {
      "default": {},
      "fill": true
    },
    ".spec.containers.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.containers.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.restartPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.restartPolicyRules": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.restartPolicyRules.action": {
      "omitEmpty": true
    },
    ".spec.containers.restartPolicyRules.exitCodes": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.restartPolicyRules.exitCodes.operator": {
      "omitEmpty": true
    },
    ".spec.containers.restartPolicyRules.exitCodes.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.allowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.containers.securityContext.capabilities": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.capabilities.add": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.securityContext.capabilities.drop": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.securityContext.privileged": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.procMount": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.readOnlyRootFilesystem": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.containers.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.containers.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.containers.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.containers.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.containers.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.startupProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.startupProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.startupProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.startupProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.startupProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.startupProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.containers.startupProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.startupProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.startupProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.startupProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.containers.startupProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.startupProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.startupProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.containers.startupProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.containers.startupProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.startupProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.containers.stdin": {
      "omitEmpty": true
    },
    ".spec.containers.stdinOnce": {
      "omitEmpty": true
    },
    ".spec.containers.terminationMessagePath": {
      "omitEmpty": true
    },
    ".spec.containers.terminationMessagePolicy": {
      "omitEmpty": true
    },
    ".spec.containers.tty": {
      "omitEmpty": true
    },
    ".spec.containers.volumeDevices": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.volumeDevices.devicePath": {
      "default": "",
      "fill": true
    },
    ".spec.containers.volumeDevices.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.containers.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".spec.containers.volumeMounts.mountPropagation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".spec.containers.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".spec.containers.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.containers.volumeMounts.subPath": {
      "omitEmpty": true
    },
    ".spec.containers.volumeMounts.subPathExpr": {
      "omitEmpty": true
    },
    ".spec.containers.workingDir": {
      "omitEmpty": true
    },
    ".spec.dnsConfig": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.dnsConfig.nameservers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.dnsConfig.options": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.dnsConfig.options.name": {
      "omitEmpty": true
    },
    ".spec.dnsConfig.options.value": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.dnsConfig.searches": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.dnsPolicy": {
      "omitEmpty": true
    },
    ".spec.enableServiceLinks": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.args": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.env": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.env.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.value": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.env.valueFrom": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.configMapKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.configMapKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.configMapKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.env.valueFrom.configMapKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fileKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fileKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fileKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fileKeyRef.path": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.fileKeyRef.volumeName": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.env.valueFrom.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.secretKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.env.valueFrom.secretKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.env.valueFrom.secretKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.env.valueFrom.secretKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.envFrom": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.envFrom.configMapRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.envFrom.configMapRef.name": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.envFrom.configMapRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.envFrom.prefix": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.envFrom.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.envFrom.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.envFrom.secretRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.image": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.imagePullPolicy": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.postStart.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.lifecycle.preStop.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.lifecycle.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.livenessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.livenessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.livenessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.livenessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.livenessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.livenessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.ports.containerPort": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.ports.hostIP": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.ports.hostPort": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.ports.name": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.ports.protocol": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.readinessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.readinessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.readinessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.readinessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.readinessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.readinessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.readinessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.readinessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.readinessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.readinessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.resizePolicy": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.resizePolicy.resourceName": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.resizePolicy.restartPolicy": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.resources": {
      "default": {},
      "fill": true
    },
    ".spec.ephemeralContainers.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.restartPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.restartPolicyRules": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.restartPolicyRules.action": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.restartPolicyRules.exitCodes": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.restartPolicyRules.exitCodes.operator": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.restartPolicyRules.exitCodes.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.allowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.securityContext.capabilities": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.capabilities.add": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.securityContext.capabilities.drop": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.securityContext.privileged": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.procMount": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.readOnlyRootFilesystem": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.startupProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.startupProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.startupProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.startupProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ephemeralContainers.startupProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.startupProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.stdin": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.stdinOnce": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.targetContainerName": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.terminationMessagePath": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.terminationMessagePolicy": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.tty": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.volumeDevices": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.volumeDevices.devicePath": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.volumeDevices.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ephemeralContainers.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.volumeMounts.mountPropagation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".spec.ephemeralContainers.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ephemeralContainers.volumeMounts.subPath": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.volumeMounts.subPathExpr": {
      "omitEmpty": true
    },
    ".spec.ephemeralContainers.workingDir": {
      "omitEmpty": true
    },
    ".spec.hostAliases": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.hostAliases.hostnames": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.hostAliases.ip": {
      "default": "",
      "fill": true
    },
    ".spec.hostIPC": {
      "omitEmpty": true
    },
    ".spec.hostNetwork": {
      "omitEmpty": true
    },
    ".spec.hostPID": {
      "omitEmpty": true
    },
    ".spec.hostUsers": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.hostname": {
      "omitEmpty": true
    },
    ".spec.hostnameOverride": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.imagePullSecrets": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.imagePullSecrets.name": {
      "omitEmpty": true
    },
    ".spec.initContainers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.args": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.env": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.env.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.value": {
      "omitEmpty": true
    },
    ".spec.initContainers.env.valueFrom": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.configMapKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.configMapKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.configMapKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.initContainers.env.valueFrom.configMapKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.initContainers.env.valueFrom.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.fileKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.fileKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.fileKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.fileKeyRef.path": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.fileKeyRef.volumeName": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.initContainers.env.valueFrom.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.secretKeyRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.env.valueFrom.secretKeyRef.key": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.env.valueFrom.secretKeyRef.name": {
      "omitEmpty": true
    },
    ".spec.initContainers.env.valueFrom.secretKeyRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.envFrom": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.envFrom.configMapRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.envFrom.configMapRef.name": {
      "omitEmpty": true
    },
    ".spec.initContainers.envFrom.configMapRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.envFrom.prefix": {
      "omitEmpty": true
    },
    ".spec.initContainers.envFrom.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.envFrom.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.initContainers.envFrom.secretRef.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.image": {
      "omitEmpty": true
    },
    ".spec.initContainers.imagePullPolicy": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.postStart": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.postStart.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.postStart.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.lifecycle.postStart.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.postStart.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.postStart.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.lifecycle.postStart.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.postStart.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.postStart.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.lifecycle.preStop": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.preStop.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.preStop.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.lifecycle.preStop.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.preStop.sleep": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.preStop.sleep.seconds": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.lifecycle.preStop.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.lifecycle.preStop.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.lifecycle.preStop.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.lifecycle.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.livenessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.livenessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.livenessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.livenessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.livenessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.livenessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.livenessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.livenessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.livenessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.ports.containerPort": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.ports.hostIP": {
      "omitEmpty": true
    },
    ".spec.initContainers.ports.hostPort": {
      "omitEmpty": true
    },
    ".spec.initContainers.ports.name": {
      "omitEmpty": true
    },
    ".spec.initContainers.ports.protocol": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.readinessProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.readinessProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.readinessProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.readinessProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.readinessProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.initContainers.readinessProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.readinessProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.readinessProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.readinessProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.readinessProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.readinessProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.readinessProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.readinessProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.readinessProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.readinessProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.resizePolicy": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.resizePolicy.resourceName": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.resizePolicy.restartPolicy": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.resources": {
      "default": {},
      "fill": true
    },
    ".spec.initContainers.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.initContainers.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.restartPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.restartPolicyRules": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.restartPolicyRules.action": {
      "omitEmpty": true
    },
    ".spec.initContainers.restartPolicyRules.exitCodes": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.restartPolicyRules.exitCodes.operator": {
      "omitEmpty": true
    },
    ".spec.initContainers.restartPolicyRules.exitCodes.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.allowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.securityContext.capabilities": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.capabilities.add": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.securityContext.capabilities.drop": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.securityContext.privileged": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.procMount": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.readOnlyRootFilesystem": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.initContainers.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.initContainers.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.initContainers.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.initContainers.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe.exec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe.exec.command": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.startupProbe.failureThreshold": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.grpc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe.grpc.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.startupProbe.grpc.service": {
      "fill": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe.httpGet": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe.httpGet.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.httpGet.httpHeaders": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.startupProbe.httpGet.httpHeaders.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.startupProbe.httpGet.httpHeaders.value": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.startupProbe.httpGet.path": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.httpGet.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.startupProbe.httpGet.scheme": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.initialDelaySeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.periodSeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.successThreshold": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.tcpSocket": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe.tcpSocket.host": {
      "omitEmpty": true
    },
    ".spec.initContainers.startupProbe.tcpSocket.port": {
      "default": 0,
      "fill": true
    },
    ".spec.initContainers.startupProbe.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.startupProbe.timeoutSeconds": {
      "omitEmpty": true
    },
    ".spec.initContainers.stdin": {
      "omitEmpty": true
    },
    ".spec.initContainers.stdinOnce": {
      "omitEmpty": true
    },
    ".spec.initContainers.terminationMessagePath": {
      "omitEmpty": true
    },
    ".spec.initContainers.terminationMessagePolicy": {
      "omitEmpty": true
    },
    ".spec.initContainers.tty": {
      "omitEmpty": true
    },
    ".spec.initContainers.volumeDevices": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.volumeDevices.devicePath": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.volumeDevices.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.initContainers.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.volumeMounts.mountPropagation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".spec.initContainers.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".spec.initContainers.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.initContainers.volumeMounts.subPath": {
      "omitEmpty": true
    },
    ".spec.initContainers.volumeMounts.subPathExpr": {
      "omitEmpty": true
    },
    ".spec.initContainers.workingDir": {
      "omitEmpty": true
    },
    ".spec.nodeName": {
      "omitEmpty": true
    },
    ".spec.nodeSelector": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.os": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.os.name": {
      "default": "",
      "fill": true
    },
    ".spec.overhead": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.preemptionPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.priority": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.priorityClassName": {
      "omitEmpty": true
    },
    ".spec.readinessGates": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.readinessGates.conditionType": {
      "default": "",
      "fill": true
    },
    ".spec.resourceClaims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.resourceClaims.name": {
      "default": "",
      "fill": true
    },
    ".spec.resourceClaims.resourceClaimName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.resourceClaims.resourceClaimTemplateName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.resources": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".spec.resources.claims.request": {
      "omitEmpty": true
    },
    ".spec.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.restartPolicy": {
      "omitEmpty": true
    },
    ".spec.runtimeClassName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.schedulerName": {
      "omitEmpty": true
    },
    ".spec.schedulingGates": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.schedulingGates.name": {
      "default": "",
      "fill": true
    },
    ".spec.securityContext": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.appArmorProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.appArmorProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.appArmorProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.securityContext.fsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.fsGroupChangePolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.runAsGroup": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.runAsNonRoot": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.runAsUser": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.seLinuxChangePolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".spec.securityContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".spec.securityContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".spec.securityContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".spec.securityContext.seccompProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.seccompProfile.localhostProfile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.seccompProfile.type": {
      "default": "",
      "fill": true
    },
    ".spec.securityContext.supplementalGroups": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.securityContext.supplementalGroupsPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.sysctls": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.securityContext.sysctls.name": {
      "default": "",
      "fill": true
    },
    ".spec.securityContext.sysctls.value": {
      "default": "",
      "fill": true
    },
    ".spec.securityContext.windowsOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.windowsOptions.gmsaCredentialSpec": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.windowsOptions.gmsaCredentialSpecName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.windowsOptions.hostProcess": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.securityContext.windowsOptions.runAsUserName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.serviceAccount": {
      "omitEmpty": true
    },
    ".spec.serviceAccountName": {
      "omitEmpty": true
    },
    ".spec.setHostnameAsFQDN": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.shareProcessNamespace": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.subdomain": {
      "omitEmpty": true
    },
    ".spec.terminationGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.tolerations": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.tolerations.effect": {
      "omitEmpty": true
    },
    ".spec.tolerations.key": {
      "omitEmpty": true
    },
    ".spec.tolerations.operator": {
      "omitEmpty": true
    },
    ".spec.tolerations.tolerationSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.tolerations.value": {
      "omitEmpty": true
    },
    ".spec.topologySpreadConstraints": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.topologySpreadConstraints.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.topologySpreadConstraints.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.topologySpreadConstraints.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.topologySpreadConstraints.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.topologySpreadConstraints.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.topologySpreadConstraints.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.topologySpreadConstraints.matchLabelKeys": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.topologySpreadConstraints.maxSkew": {
      "default": 0,
      "fill": true
    },
    ".spec.topologySpreadConstraints.minDomains": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.topologySpreadConstraints.nodeAffinityPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.topologySpreadConstraints.nodeTaintsPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.topologySpreadConstraints.topologyKey": {
      "default": "",
      "fill": true
    },
    ".spec.topologySpreadConstraints.whenUnsatisfiable": {
      "default": "",
      "fill": true
    },
    ".spec.volumes": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.awsElasticBlockStore": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.awsElasticBlockStore.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.awsElasticBlockStore.partition": {
      "omitEmpty": true
    },
    ".spec.volumes.awsElasticBlockStore.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.awsElasticBlockStore.volumeID": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.azureDisk": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.azureDisk.cachingMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.azureDisk.diskName": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.azureDisk.diskURI": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.azureDisk.fsType": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.azureDisk.kind": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.azureDisk.readOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.azureFile": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.azureFile.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.azureFile.secretName": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.azureFile.shareName": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.cephfs": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.cephfs.monitors": {
      "fill": true,
      "collection": true
    },
    ".spec.volumes.cephfs.path": {
      "omitEmpty": true
    },
    ".spec.volumes.cephfs.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.cephfs.secretFile": {
      "omitEmpty": true
    },
    ".spec.volumes.cephfs.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.cephfs.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.cephfs.user": {
      "omitEmpty": true
    },
    ".spec.volumes.cinder": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.cinder.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.cinder.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.cinder.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.cinder.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.cinder.volumeID": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.configMap.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.configMap.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.configMap.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.configMap.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.configMap.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.configMap.name": {
      "omitEmpty": true
    },
    ".spec.volumes.configMap.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.csi": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.csi.driver": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.csi.fsType": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.csi.nodePublishSecretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.csi.nodePublishSecretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.csi.readOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.csi.volumeAttributes": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.downwardAPI": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.downwardAPI.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.downwardAPI.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.downwardAPI.items.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.downwardAPI.items.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.volumes.downwardAPI.items.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.downwardAPI.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.downwardAPI.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.downwardAPI.items.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.downwardAPI.items.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.volumes.downwardAPI.items.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.volumes.downwardAPI.items.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.emptyDir": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.emptyDir.medium": {
      "omitEmpty": true
    },
    ".spec.volumes.emptyDir.sizeLimit": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata": {
      "default": {},
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.generateName": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.generation": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.name": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.namespace": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.selfLink": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.uid": {
      "omitEmpty": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec": {
      "default": {
        "resources": {}
      },
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.accessModes": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource.apiGroup": {
      "fill": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource.kind": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSource.name": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.apiGroup": {
      "fill": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.kind": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.name": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.dataSourceRef.namespace": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.resources": {
      "default": {},
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.selector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.storageClassName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.volumeAttributesClassName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.volumeMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.spec.volumeName": {
      "omitEmpty": true
    },
    ".spec.volumes.fc": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.fc.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.fc.lun": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.fc.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.fc.targetWWNs": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.fc.wwids": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.flexVolume": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.flexVolume.driver": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.flexVolume.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.flexVolume.options": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.flexVolume.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.flexVolume.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.flexVolume.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.flocker": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.flocker.datasetName": {
      "omitEmpty": true
    },
    ".spec.volumes.flocker.datasetUUID": {
      "omitEmpty": true
    },
    ".spec.volumes.gcePersistentDisk": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.gcePersistentDisk.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.gcePersistentDisk.partition": {
      "omitEmpty": true
    },
    ".spec.volumes.gcePersistentDisk.pdName": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.gcePersistentDisk.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.gitRepo": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.gitRepo.directory": {
      "omitEmpty": true
    },
    ".spec.volumes.gitRepo.repository": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.gitRepo.revision": {
      "omitEmpty": true
    },
    ".spec.volumes.glusterfs": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.glusterfs.endpoints": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.glusterfs.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.glusterfs.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.hostPath": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.hostPath.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.hostPath.type": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.image": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.image.pullPolicy": {
      "omitEmpty": true
    },
    ".spec.volumes.image.reference": {
      "omitEmpty": true
    },
    ".spec.volumes.iscsi": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.iscsi.chapAuthDiscovery": {
      "omitEmpty": true
    },
    ".spec.volumes.iscsi.chapAuthSession": {
      "omitEmpty": true
    },
    ".spec.volumes.iscsi.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.iscsi.initiatorName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.iscsi.iqn": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.iscsi.iscsiInterface": {
      "omitEmpty": true
    },
    ".spec.volumes.iscsi.lun": {
      "default": 0,
      "fill": true
    },
    ".spec.volumes.iscsi.portals": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.iscsi.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.iscsi.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.iscsi.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.iscsi.targetPortal": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.name": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.nfs": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.nfs.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.nfs.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.nfs.server": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.persistentVolumeClaim": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.persistentVolumeClaim.claimName": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.persistentVolumeClaim.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.photonPersistentDisk": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.photonPersistentDisk.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.photonPersistentDisk.pdID": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.portworxVolume": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.portworxVolume.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.portworxVolume.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.portworxVolume.volumeID": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources": {
      "fill": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions.key": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.labelSelector.matchLabels": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.name": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.clusterTrustBundle.signerName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.configMap": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.configMap.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.configMap.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.configMap.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.configMap.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.configMap.name": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.configMap.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.downwardAPI": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.fieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.fieldRef.apiVersion": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.fieldRef.fieldPath": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef.containerName": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef.divisor": {
      "default": "0",
      "fill": true
    },
    ".spec.volumes.projected.sources.downwardAPI.items.resourceFieldRef.resource": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.podCertificate": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.podCertificate.certificateChainPath": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.podCertificate.credentialBundlePath": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.podCertificate.keyPath": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.podCertificate.keyType": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.podCertificate.maxExpirationSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.podCertificate.signerName": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.podCertificate.userAnnotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.secret": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.secret.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.projected.sources.secret.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.secret.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.secret.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.projected.sources.secret.name": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.secret.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.serviceAccountToken": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.serviceAccountToken.audience": {
      "omitEmpty": true
    },
    ".spec.volumes.projected.sources.serviceAccountToken.expirationSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.projected.sources.serviceAccountToken.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.quobyte": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.quobyte.group": {
      "omitEmpty": true
    },
    ".spec.volumes.quobyte.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.quobyte.registry": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.quobyte.tenant": {
      "omitEmpty": true
    },
    ".spec.volumes.quobyte.user": {
      "omitEmpty": true
    },
    ".spec.volumes.quobyte.volume": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.rbd": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.rbd.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.rbd.image": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.rbd.keyring": {
      "omitEmpty": true
    },
    ".spec.volumes.rbd.monitors": {
      "fill": true,
      "collection": true
    },
    ".spec.volumes.rbd.pool": {
      "omitEmpty": true
    },
    ".spec.volumes.rbd.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.rbd.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.rbd.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.rbd.user": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.scaleIO.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO.gateway": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.scaleIO.protectionDomain": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO.secretRef": {
      "fill": true,
      "pointer": true
    },
    ".spec.volumes.scaleIO.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO.sslEnabled": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO.storageMode": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO.storagePool": {
      "omitEmpty": true
    },
    ".spec.volumes.scaleIO.system": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.scaleIO.volumeName": {
      "omitEmpty": true
    },
    ".spec.volumes.secret": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.secret.defaultMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.secret.items": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.volumes.secret.items.key": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.secret.items.mode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.secret.items.path": {
      "default": "",
      "fill": true
    },
    ".spec.volumes.secret.optional": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.secret.secretName": {
      "omitEmpty": true
    },
    ".spec.volumes.storageos": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.storageos.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.storageos.readOnly": {
      "omitEmpty": true
    },
    ".spec.volumes.storageos.secretRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.storageos.secretRef.name": {
      "omitEmpty": true
    },
    ".spec.volumes.storageos.volumeName": {
      "omitEmpty": true
    },
    ".spec.volumes.storageos.volumeNamespace": {
      "omitEmpty": true
    },
    ".spec.volumes.vsphereVolume": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.volumes.vsphereVolume.fsType": {
      "omitEmpty": true
    },
    ".spec.volumes.vsphereVolume.storagePolicyID": {
      "omitEmpty": true
    },
    ".spec.volumes.vsphereVolume.storagePolicyName": {
      "omitEmpty": true
    },
    ".spec.volumes.vsphereVolume.volumePath": {
      "default": "",
      "fill": true
    },
    ".spec.workloadRef": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.workloadRef.name": {
      "default": "",
      "fill": true
    },
    ".spec.workloadRef.podGroup": {
      "default": "",
      "fill": true
    },
    ".spec.workloadRef.podGroupReplicaKey": {
      "omitEmpty": true
    },
    ".status": {
      "default": {},
      "fill": true
    },
    ".status.allocatedResources": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.conditions": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.conditions.lastProbeTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.lastTransitionTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.message": {
      "omitEmpty": true
    },
    ".status.conditions.observedGeneration": {
      "omitEmpty": true
    },
    ".status.conditions.reason": {
      "omitEmpty": true
    },
    ".status.conditions.status": {
      "default": "",
      "fill": true
    },
    ".status.conditions.type": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.allocatedResources": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.allocatedResourcesStatus": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.allocatedResourcesStatus.name": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.allocatedResourcesStatus.resources": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.allocatedResourcesStatus.resources.health": {
      "omitEmpty": true
    },
    ".status.containerStatuses.allocatedResourcesStatus.resources.resourceID": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.containerID": {
      "omitEmpty": true
    },
    ".status.containerStatuses.image": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.imageID": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.lastState": {
      "default": {},
      "fill": true
    },
    ".status.containerStatuses.lastState.running": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.lastState.running.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.containerStatuses.lastState.terminated": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.lastState.terminated.containerID": {
      "omitEmpty": true
    },
    ".status.containerStatuses.lastState.terminated.exitCode": {
      "default": 0,
      "fill": true
    },
    ".status.containerStatuses.lastState.terminated.finishedAt": {
      "fill": true,
      "time": true
    },
    ".status.containerStatuses.lastState.terminated.message": {
      "omitEmpty": true
    },
    ".status.containerStatuses.lastState.terminated.reason": {
      "omitEmpty": true
    },
    ".status.containerStatuses.lastState.terminated.signal": {
      "omitEmpty": true
    },
    ".status.containerStatuses.lastState.terminated.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.containerStatuses.lastState.waiting": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.lastState.waiting.message": {
      "omitEmpty": true
    },
    ".status.containerStatuses.lastState.waiting.reason": {
      "omitEmpty": true
    },
    ".status.containerStatuses.name": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.ready": {
      "default": false,
      "fill": true
    },
    ".status.containerStatuses.resources": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.resources.claims.request": {
      "omitEmpty": true
    },
    ".status.containerStatuses.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.restartCount": {
      "default": 0,
      "fill": true
    },
    ".status.containerStatuses.started": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.state": {
      "default": {},
      "fill": true
    },
    ".status.containerStatuses.state.running": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.state.running.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.containerStatuses.state.terminated": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.state.terminated.containerID": {
      "omitEmpty": true
    },
    ".status.containerStatuses.state.terminated.exitCode": {
      "default": 0,
      "fill": true
    },
    ".status.containerStatuses.state.terminated.finishedAt": {
      "fill": true,
      "time": true
    },
    ".status.containerStatuses.state.terminated.message": {
      "omitEmpty": true
    },
    ".status.containerStatuses.state.terminated.reason": {
      "omitEmpty": true
    },
    ".status.containerStatuses.state.terminated.signal": {
      "omitEmpty": true
    },
    ".status.containerStatuses.state.terminated.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.containerStatuses.state.waiting": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.state.waiting.message": {
      "omitEmpty": true
    },
    ".status.containerStatuses.state.waiting.reason": {
      "omitEmpty": true
    },
    ".status.containerStatuses.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.user": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.user.linux": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.containerStatuses.user.linux.gid": {
      "default": 0,
      "fill": true
    },
    ".status.containerStatuses.user.linux.supplementalGroups": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.user.linux.uid": {
      "default": 0,
      "fill": true
    },
    ".status.containerStatuses.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.containerStatuses.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".status.containerStatuses.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".status.containerStatuses.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.allocatedResources": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus.name": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus.resources": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus.resources.health": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus.resources.resourceID": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.containerID": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.image": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.imageID": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.lastState": {
      "default": {},
      "fill": true
    },
    ".status.ephemeralContainerStatuses.lastState.running": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.lastState.running.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated.containerID": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated.exitCode": {
      "default": 0,
      "fill": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated.finishedAt": {
      "fill": true,
      "time": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated.message": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated.reason": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated.signal": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.lastState.terminated.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.ephemeralContainerStatuses.lastState.waiting": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.lastState.waiting.message": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.lastState.waiting.reason": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.name": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.ready": {
      "default": false,
      "fill": true
    },
    ".status.ephemeralContainerStatuses.resources": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.resources.claims.request": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.restartCount": {
      "default": 0,
      "fill": true
    },
    ".status.ephemeralContainerStatuses.started": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.state": {
      "default": {},
      "fill": true
    },
    ".status.ephemeralContainerStatuses.state.running": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.state.running.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.ephemeralContainerStatuses.state.terminated": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.state.terminated.containerID": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.state.terminated.exitCode": {
      "default": 0,
      "fill": true
    },
    ".status.ephemeralContainerStatuses.state.terminated.finishedAt": {
      "fill": true,
      "time": true
    },
    ".status.ephemeralContainerStatuses.state.terminated.message": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.state.terminated.reason": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.state.terminated.signal": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.state.terminated.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.ephemeralContainerStatuses.state.waiting": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.state.waiting.message": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.state.waiting.reason": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.user": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.user.linux": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ephemeralContainerStatuses.user.linux.gid": {
      "default": 0,
      "fill": true
    },
    ".status.ephemeralContainerStatuses.user.linux.supplementalGroups": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.user.linux.uid": {
      "default": 0,
      "fill": true
    },
    ".status.ephemeralContainerStatuses.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ephemeralContainerStatuses.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".status.ephemeralContainerStatuses.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".status.ephemeralContainerStatuses.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.extendedResourceClaimStatus": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.extendedResourceClaimStatus.requestMappings": {
      "fill": true,
      "collection": true
    },
    ".status.extendedResourceClaimStatus.requestMappings.containerName": {
      "default": "",
      "fill": true
    },
    ".status.extendedResourceClaimStatus.requestMappings.requestName": {
      "default": "",
      "fill": true
    },
    ".status.extendedResourceClaimStatus.requestMappings.resourceName": {
      "default": "",
      "fill": true
    },
    ".status.extendedResourceClaimStatus.resourceClaimName": {
      "default": "",
      "fill": true
    },
    ".status.hostIP": {
      "omitEmpty": true
    },
    ".status.hostIPs": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.hostIPs.ip": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.allocatedResources": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.allocatedResourcesStatus": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.allocatedResourcesStatus.name": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.allocatedResourcesStatus.resources": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.allocatedResourcesStatus.resources.health": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.allocatedResourcesStatus.resources.resourceID": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.containerID": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.image": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.imageID": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.lastState": {
      "default": {},
      "fill": true
    },
    ".status.initContainerStatuses.lastState.running": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.lastState.running.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.initContainerStatuses.lastState.terminated": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.lastState.terminated.containerID": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.lastState.terminated.exitCode": {
      "default": 0,
      "fill": true
    },
    ".status.initContainerStatuses.lastState.terminated.finishedAt": {
      "fill": true,
      "time": true
    },
    ".status.initContainerStatuses.lastState.terminated.message": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.lastState.terminated.reason": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.lastState.terminated.signal": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.lastState.terminated.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.initContainerStatuses.lastState.waiting": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.lastState.waiting.message": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.lastState.waiting.reason": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.name": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.ready": {
      "default": false,
      "fill": true
    },
    ".status.initContainerStatuses.resources": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.resources.claims.request": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.restartCount": {
      "default": 0,
      "fill": true
    },
    ".status.initContainerStatuses.started": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.state": {
      "default": {},
      "fill": true
    },
    ".status.initContainerStatuses.state.running": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.state.running.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.initContainerStatuses.state.terminated": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.state.terminated.containerID": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.state.terminated.exitCode": {
      "default": 0,
      "fill": true
    },
    ".status.initContainerStatuses.state.terminated.finishedAt": {
      "fill": true,
      "time": true
    },
    ".status.initContainerStatuses.state.terminated.message": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.state.terminated.reason": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.state.terminated.signal": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.state.terminated.startedAt": {
      "fill": true,
      "time": true
    },
    ".status.initContainerStatuses.state.waiting": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.state.waiting.message": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.state.waiting.reason": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.stopSignal": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.user": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.user.linux": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.initContainerStatuses.user.linux.gid": {
      "default": 0,
      "fill": true
    },
    ".status.initContainerStatuses.user.linux.supplementalGroups": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.user.linux.uid": {
      "default": 0,
      "fill": true
    },
    ".status.initContainerStatuses.volumeMounts": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.initContainerStatuses.volumeMounts.mountPath": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.volumeMounts.name": {
      "default": "",
      "fill": true
    },
    ".status.initContainerStatuses.volumeMounts.readOnly": {
      "omitEmpty": true
    },
    ".status.initContainerStatuses.volumeMounts.recursiveReadOnly": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.message": {
      "omitEmpty": true
    },
    ".status.nominatedNodeName": {
      "omitEmpty": true
    },
    ".status.observedGeneration": {
      "omitEmpty": true
    },
    ".status.phase": {
      "omitEmpty": true
    },
    ".status.podIP": {
      "omitEmpty": true
    },
    ".status.podIPs": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.podIPs.ip": {
      "default": "",
      "fill": true
    },
    ".status.qosClass": {
      "omitEmpty": true
    },
    ".status.reason": {
      "omitEmpty": true
    },
    ".status.resize": {
      "omitEmpty": true
    },
    ".status.resourceClaimStatuses": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.resourceClaimStatuses.name": {
      "default": "",
      "fill": true
    },
    ".status.resourceClaimStatuses.resourceClaimName": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.resources": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.resources.claims": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.resources.claims.name": {
      "default": "",
      "fill": true
    },
    ".status.resources.claims.request": {
      "omitEmpty": true
    },
    ".status.resources.limits": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.resources.requests": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.startTime": {
      "omitEmpty": true,
      "pointer": true
    }
  },
  "ResourceQuota": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {},
      "fill": true
    },
    ".spec.hard": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.scopeSelector": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.scopeSelector.matchExpressions": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.scopeSelector.matchExpressions.operator": {
      "default": "",
      "fill": true
    },
    ".spec.scopeSelector.matchExpressions.scopeName": {
      "default": "",
      "fill": true
    },
    ".spec.scopeSelector.matchExpressions.values": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.scopes": {
      "omitEmpty": true,
      "collection": true
    },
    ".status": {
      "default": {},
      "fill": true
    },
    ".status.hard": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.used": {
      "omitEmpty": true,
      "collection": true
    }
  },
  "Role": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".rules": {
      "fill": true,
      "collection": true
    },
    ".rules.apiGroups": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.nonResourceURLs": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.resourceNames": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.resources": {
      "omitEmpty": true,
      "collection": true
    },
    ".rules.verbs": {
      "fill": true,
      "collection": true
    }
  },
  "RoleBinding": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".roleRef": {
      "default": {
        "apiGroup": "",
        "kind": "",
        "name": ""
      },
      "fill": true
    },
    ".roleRef.apiGroup": {
      "default": "",
      "fill": true
    },
    ".roleRef.kind": {
      "default": "",
      "fill": true
    },
    ".roleRef.name": {
      "default": "",
      "fill": true
    },
    ".subjects": {
      "omitEmpty": true,
      "collection": true
    },
    ".subjects.apiGroup": {
      "omitEmpty": true
    },
    ".subjects.kind": {
      "default": "",
      "fill": true
    },
    ".subjects.name": {
      "default": "",
      "fill": true
    },
    ".subjects.namespace": {
      "omitEmpty": true
    }
  },
  "Route": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {
        "to": {
          "kind": "",
          "name": "",
          "weight": null
        }
      },
      "fill": true
    },
    ".spec.alternateBackends": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.alternateBackends.kind": {
      "default": "",
      "fill": true
    },
    ".spec.alternateBackends.name": {
      "default": "",
      "fill": true
    },
    ".spec.alternateBackends.weight": {
      "fill": true,
      "pointer": true
    },
    ".spec.host": {
      "omitEmpty": true
    },
    ".spec.httpHeaders": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.httpHeaders.actions": {
      "default": {
        "request": null,
        "response": null
      },
      "fill": true
    },
    ".spec.httpHeaders.actions.request": {
      "fill": true,
      "collection": true
    },
    ".spec.httpHeaders.actions.request.action": {
      "default": {
        "type": ""
      },
      "fill": true
    },
    ".spec.httpHeaders.actions.request.action.set": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.httpHeaders.actions.request.action.set.value": {
      "default": "",
      "fill": true
    },
    ".spec.httpHeaders.actions.request.action.type": {
      "default": "",
      "fill": true
    },
    ".spec.httpHeaders.actions.request.name": {
      "default": "",
      "fill": true
    },
    ".spec.httpHeaders.actions.response": {
      "fill": true,
      "collection": true
    },
    ".spec.httpHeaders.actions.response.action": {
      "default": {
        "type": ""
      },
      "fill": true
    },
    ".spec.httpHeaders.actions.response.action.set": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.httpHeaders.actions.response.action.set.value": {
      "default": "",
      "fill": true
    },
    ".spec.httpHeaders.actions.response.action.type": {
      "default": "",
      "fill": true
    },
    ".spec.httpHeaders.actions.response.name": {
      "default": "",
      "fill": true
    },
    ".spec.path": {
      "omitEmpty": true
    },
    ".spec.port": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.port.targetPort": {
      "default": 0,
      "fill": true
    },
    ".spec.subdomain": {
      "omitEmpty": true
    },
    ".spec.tls": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.tls.caCertificate": {
      "omitEmpty": true
    },
    ".spec.tls.certificate": {
      "omitEmpty": true
    },
    ".spec.tls.destinationCACertificate": {
      "omitEmpty": true
    },
    ".spec.tls.externalCertificate": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.tls.externalCertificate.name": {
      "omitEmpty": true
    },
    ".spec.tls.insecureEdgeTerminationPolicy": {
      "omitEmpty": true
    },
    ".spec.tls.key": {
      "omitEmpty": true
    },
    ".spec.tls.termination": {
      "default": "",
      "fill": true
    },
    ".spec.to": {
      "default": {
        "kind": "",
        "name": "",
        "weight": null
      },
      "fill": true
    },
    ".spec.to.kind": {
      "default": "",
      "fill": true
    },
    ".spec.to.name": {
      "default": "",
      "fill": true
    },
    ".spec.to.weight": {
      "fill": true,
      "pointer": true
    },
    ".spec.wildcardPolicy": {
      "omitEmpty": true
    },
    ".status": {
      "default": {},
      "fill": true
    },
    ".status.ingress": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ingress.conditions": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.ingress.conditions.lastTransitionTime": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.ingress.conditions.message": {
      "omitEmpty": true
    },
    ".status.ingress.conditions.reason": {
      "omitEmpty": true
    },
    ".status.ingress.conditions.status": {
      "default": "",
      "fill": true
    },
    ".status.ingress.conditions.type": {
      "default": "",
      "fill": true
    },
    ".status.ingress.host": {
      "omitEmpty": true
    },
    ".status.ingress.routerCanonicalHostname": {
      "omitEmpty": true
    },
    ".status.ingress.routerName": {
      "omitEmpty": true
    },
    ".status.ingress.wildcardPolicy": {
      "omitEmpty": true
    }
  },
  "Secret": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".data": {
      "omitEmpty": true,
      "collection": true
    },
    ".immutable": {
      "omitEmpty": true,
      "pointer": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".stringData": {
      "omitEmpty": true,
      "collection": true
    },
    ".type": {
      "omitEmpty": true
    }
  },
  "SecurityContextConstraints": {
    ".allowHostDirVolumePlugin": {
      "default": false,
      "fill": true
    },
    ".allowHostIPC": {
      "default": false,
      "fill": true
    },
    ".allowHostNetwork": {
      "default": false,
      "fill": true
    },
    ".allowHostPID": {
      "default": false,
      "fill": true
    },
    ".allowHostPorts": {
      "default": false,
      "fill": true
    },
    ".allowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".allowPrivilegedContainer": {
      "default": false,
      "fill": true
    },
    ".allowedCapabilities": {
      "fill": true,
      "collection": true
    },
    ".allowedFlexVolumes": {
      "omitEmpty": true,
      "collection": true
    },
    ".allowedFlexVolumes.driver": {
      "default": "",
      "fill": true
    },
    ".allowedUnsafeSysctls": {
      "omitEmpty": true,
      "collection": true
    },
    ".apiVersion": {
      "omitEmpty": true
    },
    ".defaultAddCapabilities": {
      "fill": true,
      "collection": true
    },
    ".defaultAllowPrivilegeEscalation": {
      "omitEmpty": true,
      "pointer": true
    },
    ".forbiddenSysctls": {
      "omitEmpty": true,
      "collection": true
    },
    ".fsGroup": {
      "default": {},
      "fill": true
    },
    ".fsGroup.ranges": {
      "omitEmpty": true,
      "collection": true
    },
    ".fsGroup.ranges.max": {
      "omitEmpty": true
    },
    ".fsGroup.ranges.min": {
      "omitEmpty": true
    },
    ".fsGroup.type": {
      "omitEmpty": true
    },
    ".groups": {
      "fill": true,
      "collection": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".priority": {
      "fill": true,
      "pointer": true
    },
    ".readOnlyRootFilesystem": {
      "default": false,
      "fill": true
    },
    ".requiredDropCapabilities": {
      "fill": true,
      "collection": true
    },
    ".runAsUser": {
      "default": {},
      "fill": true
    },
    ".runAsUser.type": {
      "omitEmpty": true
    },
    ".runAsUser.uid": {
      "omitEmpty": true,
      "pointer": true
    },
    ".runAsUser.uidRangeMax": {
      "omitEmpty": true,
      "pointer": true
    },
    ".runAsUser.uidRangeMin": {
      "omitEmpty": true,
      "pointer": true
    },
    ".seLinuxContext": {
      "default": {},
      "fill": true
    },
    ".seLinuxContext.seLinuxOptions": {
      "omitEmpty": true,
      "pointer": true
    },
    ".seLinuxContext.seLinuxOptions.level": {
      "omitEmpty": true
    },
    ".seLinuxContext.seLinuxOptions.role": {
      "omitEmpty": true
    },
    ".seLinuxContext.seLinuxOptions.type": {
      "omitEmpty": true
    },
    ".seLinuxContext.seLinuxOptions.user": {
      "omitEmpty": true
    },
    ".seLinuxContext.type": {
      "omitEmpty": true
    },
    ".seccompProfiles": {
      "omitEmpty": true,
      "collection": true
    },
    ".supplementalGroups": {
      "default": {},
      "fill": true
    },
    ".supplementalGroups.ranges": {
      "omitEmpty": true,
      "collection": true
    },
    ".supplementalGroups.ranges.max": {
      "omitEmpty": true
    },
    ".supplementalGroups.ranges.min": {
      "omitEmpty": true
    },
    ".supplementalGroups.type": {
      "omitEmpty": true
    },
    ".userNamespaceLevel": {
      "omitEmpty": true
    },
    ".users": {
      "fill": true,
      "collection": true
    },
    ".volumes": {
      "fill": true,
      "collection": true
    }
  },
  "Service": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".spec": {
      "default": {},
      "fill": true
    },
    ".spec.allocateLoadBalancerNodePorts": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.clusterIP": {
      "omitEmpty": true
    },
    ".spec.clusterIPs": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.externalIPs": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.externalName": {
      "omitEmpty": true
    },
    ".spec.externalTrafficPolicy": {
      "omitEmpty": true
    },
    ".spec.healthCheckNodePort": {
      "omitEmpty": true
    },
    ".spec.internalTrafficPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ipFamilies": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ipFamilyPolicy": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.loadBalancerClass": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.loadBalancerIP": {
      "omitEmpty": true
    },
    ".spec.loadBalancerSourceRanges": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.ports.appProtocol": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.ports.name": {
      "omitEmpty": true
    },
    ".spec.ports.nodePort": {
      "omitEmpty": true
    },
    ".spec.ports.port": {
      "default": 0,
      "fill": true
    },
    ".spec.ports.protocol": {
      "omitEmpty": true
    },
    ".spec.ports.targetPort": {
      "default": 0,
      "fill": true
    },
    ".spec.publishNotReadyAddresses": {
      "omitEmpty": true
    },
    ".spec.selector": {
      "omitEmpty": true,
      "collection": true
    },
    ".spec.sessionAffinity": {
      "omitEmpty": true
    },
    ".spec.sessionAffinityConfig": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.sessionAffinityConfig.clientIP": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.sessionAffinityConfig.clientIP.timeoutSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.trafficDistribution": {
      "omitEmpty": true,
      "pointer": true
    },
    ".spec.type": {
      "omitEmpty": true
    },
    ".status": {
      "default": {
        "loadBalancer": {}
      },
      "fill": true
    },
    ".status.conditions": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.conditions.lastTransitionTime": {
      "fill": true,
      "time": true
    },
    ".status.conditions.message": {
      "default": "",
      "fill": true
    },
    ".status.conditions.observedGeneration": {
      "omitEmpty": true
    },
    ".status.conditions.reason": {
      "default": "",
      "fill": true
    },
    ".status.conditions.status": {
      "default": "",
      "fill": true
    },
    ".status.conditions.type": {
      "default": "",
      "fill": true
    },
    ".status.loadBalancer": {
      "default": {},
      "fill": true
    },
    ".status.loadBalancer.ingress": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.loadBalancer.ingress.hostname": {
      "omitEmpty": true
    },
    ".status.loadBalancer.ingress.ip": {
      "omitEmpty": true
    },
    ".status.loadBalancer.ingress.ipMode": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.loadBalancer.ingress.ports": {
      "omitEmpty": true,
      "collection": true
    },
    ".status.loadBalancer.ingress.ports.error": {
      "omitEmpty": true,
      "pointer": true
    },
    ".status.loadBalancer.ingress.ports.port": {
      "default": 0,
      "fill": true
    },
    ".status.loadBalancer.ingress.ports.protocol": {
      "default": "",
      "fill": true
    }
  },
  "ServiceAccount": {
    ".apiVersion": {
      "omitEmpty": true
    },
    ".automountServiceAccountToken": {
      "omitEmpty": true,
      "pointer": true
    },
    ".imagePullSecrets": {
      "omitEmpty": true,
      "collection": true
    },
    ".imagePullSecrets.name": {
      "omitEmpty": true
    },
    ".kind": {
      "omitEmpty": true
    },
    ".metadata": {
      "default": {},
      "fill": true
    },
    ".metadata.annotations": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.creationTimestamp": {
      "omitZero": true,
      "time": true
    },
    ".metadata.deletionGracePeriodSeconds": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.deletionTimestamp": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.finalizers": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.generateName": {
      "omitEmpty": true
    },
    ".metadata.generation": {
      "omitEmpty": true
    },
    ".metadata.labels": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.managedFields.apiVersion": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsType": {
      "omitEmpty": true
    },
    ".metadata.managedFields.fieldsV1": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.managedFields.manager": {
      "omitEmpty": true
    },
    ".metadata.managedFields.operation": {
      "omitEmpty": true
    },
    ".metadata.managedFields.subresource": {
      "omitEmpty": true
    },
    ".metadata.managedFields.time": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.name": {
      "omitEmpty": true
    },
    ".metadata.namespace": {
      "omitEmpty": true
    },
    ".metadata.ownerReferences": {
      "omitEmpty": true,
      "collection": true
    },
    ".metadata.ownerReferences.apiVersion": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.blockOwnerDeletion": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.controller": {
      "omitEmpty": true,
      "pointer": true
    },
    ".metadata.ownerReferences.kind": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.name": {
      "default": "",
      "fill": true
    },
    ".metadata.ownerReferences.uid": {
      "default": "",
      "fill": true
    },
    ".metadata.resourceVersion": {
      "omitEmpty": true
    },
    ".metadata.selfLink": {
      "omitEmpty": true
    },
    ".metadata.uid": {
      "omitEmpty": true
    },
    ".secrets": {
      "omitEmpty": true,
      "collection": true
    },
    ".secrets.apiVersion": {
      "omitEmpty": true
    },
    ".secrets.fieldPath": {
      "omitEmpty": true
    },
    ".secrets.kind": {
      "omitEmpty": true
    },
    ".secrets.name": {
      "omitEmpty": true
    },
    ".secrets.namespace": {
      "omitEmpty": true
    },
    ".secrets.resourceVersion": {
      "omitEmpty": true
    },
    ".secrets.uid": {
      "omitEmpty": true
    }
  }
};
