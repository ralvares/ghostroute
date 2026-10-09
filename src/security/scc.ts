import type {
  PodSpec,
  Scc,
  SecurityContext,
} from "../simulation/cluster-model.js";

/** OpenShift 4.22 SCC subset, validated against requested fields before defaulting. */
export function admitPod(
  input: PodSpec,
  profiles: Scc[],
  usable: Set<string>,
  uidRange: [number, number],
  mcs?: string,
) {
  const failures: string[] = [];
  const ordered = [...profiles].sort(
    (a, b) =>
      (b.priority ?? 0) - (a.priority ?? 0) ||
      (a.metadata.name === "restricted-v3"
        ? -1
        : b.metadata.name === "restricted-v3"
          ? 1
          : a.metadata.name.localeCompare(b.metadata.name)),
  );
  for (const scc of ordered) {
    const name = scc.metadata.name;
    if (!usable.has(name)) {
      failures.push(
        `provider "${name}": Forbidden: not usable by user or serviceaccount`,
      );
      continue;
    }
    const range: [number, number] = [
      scc.runAsUser.uidRangeMin ?? uidRange[0],
      scc.runAsUser.uidRangeMax ?? uidRange[1],
    ];
    const errors: string[] = [];
    if ((input.hostNetwork && !scc.allowHostNetwork) || (input.hostPID && !scc.allowHostPID) || (input.hostIPC && !scc.allowHostIPC))
      errors.push("host namespaces are not allowed");
    if (!scc.allowHostDirVolumePlugin && input.volumes?.some((volume) => "hostPath" in volume))
      errors.push("hostPath volumes are not allowed to be used");
    if (
      scc.userNamespaceLevel === "RequirePodLevel" &&
      input.hostUsers === true
    )
      errors.push(".spec.hostUsers: Invalid value: true: must be false");
    const spec = structuredClone(input);
    const allowedVolumes=scc.volumes as string[]|undefined;
    for(const volume of input.volumes??[]) for(const type of Object.keys(volume).filter(k=>k!=="name")) if(allowedVolumes&&!allowedVolumes.includes("*")&&!allowedVolumes.includes(type)) errors.push(`.spec.volumes: Invalid value: "${type}": ${type} volumes are not allowed to be used`);
    const podSecurity=spec.securityContext??={};
    for(const field of ["fsGroup","supplementalGroups"] as const) {
      const strategy=scc[field] as {type:string;ranges?:{min:number;max:number}[]}|undefined;
      if(strategy?.type!=="MustRunAs")continue;
      const ranges=strategy.ranges?.length?strategy.ranges:[{min:uidRange[0],max:uidRange[1]}];
      const requested=field==="fsGroup"?(podSecurity.fsGroup===undefined?[]:[podSecurity.fsGroup]):podSecurity.supplementalGroups??[];
      for(const value of requested) if(!ranges.some(r=>value>=r.min&&value<=r.max))errors.push(`.spec.securityContext.${field}: Invalid value: ${value}: is not an allowed group`);
      if(field==="fsGroup")podSecurity.fsGroup??=ranges[0].min;
      else if(podSecurity.supplementalGroups===undefined)podSecurity.supplementalGroups=[ranges[0].min];
    }
    const selinux=scc.seLinuxContext as {type:string;seLinuxOptions?:SecurityContext["seLinuxOptions"]}|undefined;
    const requiredSelinux=selinux?.type==="MustRunAs"?{...(mcs?{level:mcs}:{}),...selinux.seLinuxOptions}:undefined;
    if(requiredSelinux) {
      for(const [field,value] of Object.entries(requiredSelinux))if(podSecurity.seLinuxOptions?.[field as keyof NonNullable<SecurityContext["seLinuxOptions"]>]!==undefined&&podSecurity.seLinuxOptions[field as keyof NonNullable<SecurityContext["seLinuxOptions"]>]!==value)errors.push(`.spec.securityContext.seLinuxOptions.${field}: Invalid value: SELinux context must match the SCC`);
      podSecurity.seLinuxOptions={...podSecurity.seLinuxOptions,...requiredSelinux};
    }
    if ((input.hostUsers === false || scc.userNamespaceLevel === "RequirePodLevel") && (input.hostNetwork || input.hostPID || input.hostIPC)) errors.push(".spec.hostUsers: Invalid value: false: cannot use host namespaces with a user namespace");
    [...spec.containers,...(spec.initContainers??[])].forEach((container, index) => {
      const requested: SecurityContext = {
        ...spec.securityContext,
        ...container.securityContext,
      };
      // Pod-only group fields are not valid Container SecurityContext fields.
      delete requested.fsGroup;
      delete requested.supplementalGroups;
      const path = index < spec.containers.length ? `.containers[${index}]` : `.initContainers[${index-spec.containers.length}]`;
      const uid = requested.runAsUser;
      if(requiredSelinux)for(const [field,value]of Object.entries(requiredSelinux))if(requested.seLinuxOptions?.[field as keyof NonNullable<SecurityContext["seLinuxOptions"]>]!==undefined&&requested.seLinuxOptions[field as keyof NonNullable<SecurityContext["seLinuxOptions"]>]!==value)errors.push(`${path}.seLinuxOptions.${field}: Invalid value: SELinux context must match the SCC`);
      if(requested.procMount==="Unmasked"&&scc.userNamespaceLevel!=="RequirePodLevel")errors.push(`${path}.procMount: Invalid value: "Unmasked": requires a pod user namespace`);
      if (
        uid !== undefined &&
        scc.runAsUser.type === "MustRunAsRange" &&
        (uid < range[0] || uid > range[1])
      )
        errors.push(
          `${path}.runAsUser: Invalid value: ${uid}: must be in the ranges: [${range[0]}, ${range[1]}]`,
        );
      if (
        scc.runAsUser.type === "MustRunAs" &&
        uid !== undefined &&
        uid !== scc.runAsUser.uid
      )
        errors.push(
          `${path}.runAsUser: Invalid value: ${uid}: must be ${scc.runAsUser.uid}`,
        );
      if (
        scc.runAsUser.type === "MustRunAsNonRoot" &&
        (uid === 0 || uid === undefined)
      )
        errors.push(
          `${path}.runAsUser: Invalid value: ${uid ?? 0}: must be non-zero`,
        );
      if (requested.privileged && !scc.allowPrivilegedContainer)
        errors.push(
          `${path}.privileged: Invalid value: true: Privileged containers are not allowed`,
        );
      const seccomp = requested.seccompProfile;
      if (seccomp) {
        const profile =
          seccomp.type === "RuntimeDefault"
            ? "runtime/default"
            : seccomp.type === "Localhost"
              ? "localhost/" + seccomp.localhostProfile
              : "unconfined";
        const allowed = scc.seccompProfiles as string[] | undefined;
        if (
          allowed &&
          !allowed.includes("*") &&
          !allowed.includes(profile) &&
          !(profile.startsWith("localhost/") && allowed.includes("localhost/*"))
        )
          errors.push(
            path +
              ".seccompProfile: Forbidden: profile " +
              profile +
              " is not allowed",
          );
      }
      if (
        requested.allowPrivilegeEscalation &&
        scc.allowPrivilegeEscalation === false
      )
        errors.push(
          `${path}.allowPrivilegeEscalation: Invalid value: true: Allowing privilege escalation for containers is not allowed`,
        );
      if (
        scc.readOnlyRootFilesystem === true &&
        requested.readOnlyRootFilesystem !== true
      )
        errors.push(
          `${path}.readOnlyRootFilesystem: Invalid value: false: ReadOnlyRootFilesystem is required`,
        );
      if (
        (name.includes("-v") ||
          (Array.isArray(scc.seccompProfiles) &&
            !scc.seccompProfiles.includes("*"))) &&
        requested.seccompProfile?.type === "Unconfined"
      )
        errors.push(
          `${path}.seccompProfile: Forbidden: seccomp profile is not allowed`,
        );
      for (const capability of requested.capabilities?.add ?? [])
        if (!scc.allowedCapabilities?.includes(capability) && !scc.allowedCapabilities?.includes("*"))
          errors.push(
            `${path}.capabilities.add: Invalid value: "${capability}": capability may not be added`,
          );
      container.securityContext = {
        ...requested,
        runAsUser:
          uid ??
          (scc.runAsUser.type === "MustRunAs"
            ? scc.runAsUser.uid
            : scc.runAsUser.type === "MustRunAsRange"
              ? range[0]
              : undefined),
      };
      if (scc.allowPrivilegeEscalation === false)
        container.securityContext.allowPrivilegeEscalation = false;
      if (scc.requiredDropCapabilities?.includes("ALL"))
        container.securityContext.capabilities = {
          ...requested.capabilities,
          drop: ["ALL"],
        };
      else if(scc.requiredDropCapabilities?.length)container.securityContext.capabilities={...requested.capabilities,drop:[...new Set([...(requested.capabilities?.drop??[]),...scc.requiredDropCapabilities])]};
      if(requiredSelinux)container.securityContext.seLinuxOptions={...requested.seLinuxOptions,...requiredSelinux};
      if (name.includes("-v"))
        container.securityContext.seccompProfile ??= { type: "RuntimeDefault" };
    });
    if (scc.userNamespaceLevel === "RequirePodLevel") spec.hostUsers = false;
    if (!errors.length) return { accepted: true as const, scc: name, spec };
    failures.push(...errors.map((error) => `provider ${name}: ${error}`));
  }
  return {
    accepted: false as const,
    message: `unable to validate against any security context constraint: [${failures.join(", ")}]`,
  };
}
