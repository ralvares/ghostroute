/** Current security projection; historic evidence remains on the caseboard. */
export function evaluateFindings(
  telemetryEnabled: boolean,
  policy: "none" | "deny" | "allow",
) {
  return {
    baselineDeviation: telemetryEnabled && policy === "none",
    unexpectedConfiguration: telemetryEnabled,
    unrestrictedEgress: policy === "none",
    dependencyUnavailable: policy === "deny",
  };
}
