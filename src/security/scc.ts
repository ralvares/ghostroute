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
    const errors: string[] = [];
    if (input.hostNetwork || input.hostPID || input.hostIPC)
      errors.push("host namespaces are not allowed");
    if (input.volumes?.some((volume) => "hostPath" in volume))
      errors.push("hostPath volumes are not allowed to be used");
    if (
      scc.userNamespaceLevel === "RequirePodLevel" &&
      input.hostUsers === true
    )
      errors.push(".spec.hostUsers: Invalid value: true: must be false");
    const spec = structuredClone(input);
    spec.containers.forEach((container, index) => {
      const requested: SecurityContext = {
        ...spec.securityContext,
        ...container.securityContext,
      };
      const path = `.containers[${index}]`;
      const uid = requested.runAsUser;
      if (
        uid !== undefined &&
        scc.runAsUser.type === "MustRunAsRange" &&
        (uid < uidRange[0] || uid > uidRange[1])
      )
        errors.push(
          `${path}.runAsUser: Invalid value: ${uid}: must be in the ranges: [${uidRange[0]}, ${uidRange[1]}]`,
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
        if (!scc.allowedCapabilities?.includes(capability))
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
              ? uidRange[0]
              : undefined),
      };
      if (scc.allowPrivilegeEscalation === false)
        container.securityContext.allowPrivilegeEscalation = false;
      if (scc.requiredDropCapabilities?.includes("ALL"))
        container.securityContext.capabilities = {
          ...requested.capabilities,
          drop: ["ALL"],
        };
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
