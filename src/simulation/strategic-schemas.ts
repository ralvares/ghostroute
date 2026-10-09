// Generated from pinned upstream Kubernetes 1.35.2 / OpenShift Go API types.
// Regenerate with node tools/record-api-fixtures.mjs.
export const strategicSchemas: Record<string, Record<string, {key?: string; strategies: string[]}>> = {
  "ClusterRole": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "ClusterRoleBinding": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "ConfigMap": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "Deployment": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".spec.strategy": {
      "strategies": [
        "retainKeys"
      ]
    },
    ".spec.template.metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.containers": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.containers.env": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.containers.ports": {
      "key": "containerPort",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.containers.volumeDevices": {
      "key": "devicePath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.containers.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.ephemeralContainers": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.ephemeralContainers.env": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.ephemeralContainers.ports": {
      "key": "containerPort",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.ephemeralContainers.volumeDevices": {
      "key": "devicePath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.ephemeralContainers.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.hostAliases": {
      "key": "ip",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.imagePullSecrets": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.initContainers": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.initContainers.env": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.initContainers.ports": {
      "key": "containerPort",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.initContainers.volumeDevices": {
      "key": "devicePath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.initContainers.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.resourceClaims": {
      "key": "name",
      "strategies": [
        "merge",
        "retainKeys"
      ]
    },
    ".spec.template.spec.schedulingGates": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.topologySpreadConstraints": {
      "key": "topologyKey",
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.volumes": {
      "key": "name",
      "strategies": [
        "merge",
        "retainKeys"
      ]
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".spec.template.spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".status.conditions": {
      "key": "type",
      "strategies": [
        "merge"
      ]
    }
  },
  "Event": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "LimitRange": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "Namespace": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".status.conditions": {
      "key": "type",
      "strategies": [
        "merge"
      ]
    }
  },
  "NetworkPolicy": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "Node": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".spec.podCIDRs": {
      "strategies": [
        "merge"
      ]
    },
    ".status.addresses": {
      "key": "type",
      "strategies": [
        "merge"
      ]
    },
    ".status.conditions": {
      "key": "type",
      "strategies": [
        "merge"
      ]
    }
  },
  "Pod": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".spec.containers": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.containers.env": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.containers.ports": {
      "key": "containerPort",
      "strategies": [
        "merge"
      ]
    },
    ".spec.containers.volumeDevices": {
      "key": "devicePath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.containers.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.ephemeralContainers": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.ephemeralContainers.env": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.ephemeralContainers.ports": {
      "key": "containerPort",
      "strategies": [
        "merge"
      ]
    },
    ".spec.ephemeralContainers.volumeDevices": {
      "key": "devicePath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.ephemeralContainers.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.hostAliases": {
      "key": "ip",
      "strategies": [
        "merge"
      ]
    },
    ".spec.imagePullSecrets": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.initContainers": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.initContainers.env": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.initContainers.ports": {
      "key": "containerPort",
      "strategies": [
        "merge"
      ]
    },
    ".spec.initContainers.volumeDevices": {
      "key": "devicePath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.initContainers.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".spec.resourceClaims": {
      "key": "name",
      "strategies": [
        "merge",
        "retainKeys"
      ]
    },
    ".spec.schedulingGates": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".spec.topologySpreadConstraints": {
      "key": "topologyKey",
      "strategies": [
        "merge"
      ]
    },
    ".spec.volumes": {
      "key": "name",
      "strategies": [
        "merge",
        "retainKeys"
      ]
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".spec.volumes.ephemeral.volumeClaimTemplate.metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".status.conditions": {
      "key": "type",
      "strategies": [
        "merge"
      ]
    },
    ".status.containerStatuses.allocatedResourcesStatus": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".status.containerStatuses.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".status.ephemeralContainerStatuses.allocatedResourcesStatus": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".status.ephemeralContainerStatuses.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".status.hostIPs": {
      "key": "ip",
      "strategies": [
        "merge"
      ]
    },
    ".status.initContainerStatuses.allocatedResourcesStatus": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    },
    ".status.initContainerStatuses.volumeMounts": {
      "key": "mountPath",
      "strategies": [
        "merge"
      ]
    },
    ".status.podIPs": {
      "key": "ip",
      "strategies": [
        "merge"
      ]
    },
    ".status.resourceClaimStatuses": {
      "key": "name",
      "strategies": [
        "merge",
        "retainKeys"
      ]
    }
  },
  "ResourceQuota": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "Role": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "RoleBinding": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "Route": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "Secret": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "SecurityContextConstraints": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    }
  },
  "Service": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".spec.ports": {
      "key": "port",
      "strategies": [
        "merge"
      ]
    },
    ".status.conditions": {
      "key": "type",
      "strategies": [
        "merge"
      ]
    }
  },
  "ServiceAccount": {
    ".metadata.finalizers": {
      "strategies": [
        "merge"
      ]
    },
    ".metadata.ownerReferences": {
      "key": "uid",
      "strategies": [
        "merge"
      ]
    },
    ".secrets": {
      "key": "name",
      "strategies": [
        "merge"
      ]
    }
  }
};
