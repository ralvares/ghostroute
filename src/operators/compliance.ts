import type { Resource } from "../simulation/cluster-model.js";
import { S } from "../simulation/state.js";
import { emulatorTime } from "../simulation/clock.js";
import { apiVersion, ruleIds } from "./compliance-inventory.js";
const find = (kind: string, name: string, ns: string) =>
  S.cluster.resources.find(
    (r) =>
      r.kind === kind &&
      r.metadata.name === name &&
      r.metadata.namespace === ns,
  );
const id = (name: string) => "xccdf_compliance.openshift.io_profile_" + name;
const xml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
function upsert(r: Resource) {
  const previous = find(r.kind, r.metadata.name, r.metadata.namespace!);
  if (previous)
    Object.assign(previous, r, {
      metadata: { ...previous.metadata, ...r.metadata },
    });
  else S.cluster.resources.push(r);
}
/** Recorded posture evaluator with native tailoring, remediation, rescan and result resources. */
export function reconcileCompliance() {
  for (const profile of S.cluster.resources.filter(
    (r) => r.kind === "TailoredProfile",
  )) {
    const ns = profile.metadata.namespace!,
      spec = profile.spec ?? {},
      parent = find("Profile", spec.extends, ns);
    const selected = [
      ...(spec.disableRules ?? []),
      ...(spec.enableRules ?? []),
    ];
    const missing = selected.find((r: any) => !find("Rule", r.name, ns));
    if (
      !parent ||
      missing ||
      spec.setValues?.length ||
      spec.manualRules?.length
    ) {
      profile.status = {
        state: "ERROR",
        errorMessage: !parent
          ? `Profile '${spec.extends}' not found`
          : missing
            ? `Rule '${missing.name}' not found`
            : "Unsupported recorded tailoring values or manual rules",
      };
      continue;
    }
    const name = profile.metadata.name + "-tp";
    const selections = selected
      .map(
        (r: any) =>
          `  <select idref="${xml(String(find("Rule", r.name, ns)?.id))}" selected="${(spec.enableRules ?? []).some((e: any) => e.name === r.name)}"/>`,
      )
      .join("\n");
    upsert({
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: {
        name,
        namespace: ns,
        labels: { "tailored-profile": profile.metadata.name },
        ownerReferences: [
          {
            apiVersion,
            kind: "TailoredProfile",
            name: profile.metadata.name,
            uid: profile.metadata.uid ?? "",
            controller: true,
          },
        ],
      },
      data: {
        "tailoring.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<Tailoring xmlns="http://checklists.nist.gov/xccdf/1.2" id="xccdf_compliance.openshift.io_tailoring_${xml(profile.metadata.name)}"><Profile id="${xml(id(profile.metadata.name))}" extends="${xml(String(parent.id))}"><title>${xml(spec.title)}</title><description>${xml(spec.description)}</description>\n${selections}\n</Profile></Tailoring>\n`,
      },
    });
    profile.status = {
      state: "READY",
      errorMessage: "",
      id: id(profile.metadata.name),
      outputRef: { name, namespace: ns },
    };
  }
  for (const remediation of S.cluster.resources.filter(
    (r) => r.kind === "ComplianceRemediation",
  )) {
    if (!remediation.spec?.apply) {
      remediation.status = { applicationState: "NotApplied" };
      continue;
    }
    const object = remediation.spec.current?.object as Resource | undefined;
    if (
      !object ||
      object.kind !== "ConfigMap" ||
      object.metadata.name !== "node-posture"
    ) {
      remediation.status = {
        applicationState: "Error",
        errorMessage: "No recorded remediation adapter for this payload",
      };
      continue;
    }
    const ns = remediation.metadata.namespace!,
      target = find("ConfigMap", "node-posture", ns);
    if (!target) {
      remediation.status = {
        applicationState: "Error",
        errorMessage: "Posture target is absent",
      };
      continue;
    }
    target.data = { ...target.data, ...object.data };
    remediation.status = { applicationState: "Applied" };
  }
  for (const scan of S.cluster.resources.filter(
    (r) => r.kind === "ComplianceScan",
  )) {
    const ns = scan.metadata.namespace!,
      spec = scan.spec ?? {},
      requested = Object.hasOwn(
        scan.metadata.annotations ?? {},
        "compliance.openshift.io/rescan",
      );
    if (scan.status?.phase === "DONE" && !requested) continue;
    const tp = S.cluster.resources.find(
      (r) =>
        r.kind === "TailoredProfile" &&
        r.metadata.namespace === ns &&
        r.status?.id === spec.profile,
    );
    const base = S.cluster.resources.find(
      (r) =>
        r.kind === "Profile" &&
        r.metadata.namespace === ns &&
        r.id === spec.profile,
    );
    const posture = find("ConfigMap", "node-posture", ns);
    // The profile ID and output ConfigMap must both match the successful tailoring.
    const tailored =
      tp &&
      tp.status?.state === "READY" &&
      spec.tailoringConfigMap?.name === (tp.status?.outputRef as any)?.name &&
      find("ConfigMap", spec.tailoringConfigMap?.name, ns);
    const start = new Date(emulatorTime()).toISOString(),
      index = Number(scan.status?.currentIndex ?? 0) + Number(requested);
    if (requested)
      delete scan.metadata.annotations!["compliance.openshift.io/rescan"];
    if (
      !posture ||
      (!base && !tailored) ||
      spec.content !== "ssg-rhcos4-ds.xml"
    ) {
      scan.status = {
        phase: "DONE",
        result: "ERROR",
        currentIndex: index,
        errormsg:
          "Recorded scan content, profile or tailoring ConfigMap is unavailable",
        startTimestamp: start,
        endTimestamp: start,
      };
      continue;
    }
    let failed = false,
      checked = 0;
    const disabled = new Set(
      (tp?.spec?.disableRules ?? []).map((r: any) => r.name),
    );
    const profileRules = (base?.rules ??
      find("Profile", tp?.spec?.extends, ns)?.rules ??
      []) as string[];
    for (const name of profileRules) {
      if (disabled.has(name)) continue;
      checked++;
      const passed =
        name === "rhcos4-service-auditd-enabled"
          ? posture.data?.audit === "enabled"
          : posture.data?.usb === "absent";
      failed ||= !passed;
      const result = {
        apiVersion,
        kind: "ComplianceCheckResult",
        metadata: {
          name: scan.metadata.name + "-" + name.replace(/^rhcos4-/, ""),
          namespace: ns,
          labels: {
            "compliance.openshift.io/scan-name": scan.metadata.name,
            "compliance.openshift.io/check-status": passed ? "PASS" : "FAIL",
            "compliance.openshift.io/check-severity": "medium",
          },
        },
        id: ruleIds[name as keyof typeof ruleIds],
        severity: "medium",
        description: find("Rule", name, ns)?.description,
        status: passed ? "PASS" : "FAIL",
      };
      upsert(result as unknown as Resource);
    }
    scan.status = {
      phase: "DONE",
      result: checked
        ? failed
          ? "NON-COMPLIANT"
          : "COMPLIANT"
        : "NOT-APPLICABLE",
      currentIndex: index,
      startTimestamp: start,
      endTimestamp: start,
    };
  }
}
