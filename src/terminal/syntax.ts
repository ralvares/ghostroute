/** Bounded episode grammar: unknown options/resources never report success. */
export function validOcCommand(raw: string) {
  const words = raw.trim().split(/\s+/);
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 1; i < words.length; i++) {
    const token = words[i];
    if (!token.startsWith("-")) {
      positional.push(token);
      continue;
    }
    const [flag, inline] = token.split("=");
    if (!["-n", "-o", "-f", "--tail"].includes(flag) || flag in flags)
      return false;
    const value = inline ?? words[++i];
    if (!value || value.startsWith("-")) return false;
    flags[flag] = value;
  }
  const base = positional.join(" ");
  const allowedFlags = (keys: string[]) =>
    Object.keys(flags).every((key) => keys.includes(key));
  const payments = flags["-n"] === undefined || flags["-n"] === "payments";
  if (base === "whoami") return allowedFlags([]);
  if (
    /^(get|describe) nodes?$/.test(base) ||
    /^get (ns|namespaces)$/.test(base)
  )
    return allowedFlags([]);
  if (/^(get|describe) (po|pods?)$/.test(base))
    return (
      payments &&
      allowedFlags(["-n", "-o"]) &&
      (!flags["-o"] || flags["-o"] === "wide")
    );
  if (
    /^(get|describe) (deploy|deployment|deployments)( payment-api)?$/.test(base)
  ) {
    if (flags["-n"] !== "payments") return false;
    return (
      allowedFlags(["-n", "-o"]) &&
      (base.startsWith("describe")
        ? !flags["-o"]
        : !flags["-o"] || ["yaml", "json"].includes(flags["-o"]))
    );
  }
  if (
    /^(get|describe) (netpol|networkpolicy|networkpolicies)( (payment-egress|default-deny-egress))?$/.test(
      base,
    )
  ) {
    if (flags["-n"] !== "payments") return false;
    return (
      allowedFlags(["-n", "-o"]) &&
      (!flags["-o"] ||
        (flags["-o"] === "yaml" &&
          /^get (netpol|networkpolicy) (payment-egress|default-deny-egress)$/.test(
            base,
          )))
    );
  }
  if (base === "logs deployment/payment-api")
    return (
      payments &&
      allowedFlags(["-n", "--tail"]) &&
      (!flags["--tail"] || /^\d+$/.test(flags["--tail"]))
    );
  if (base === "rsh deployment/payment-api")
    return payments && allowedFlags(["-n"]);
  if (
    base === "set env deployment/payment-api TELEMETRY_ENDPOINT-" ||
    base === "set env deployment payment-api TELEMETRY_ENDPOINT-" ||
    base === "set env deploy/payment-api TELEMETRY_ENDPOINT-"
  )
    return payments && allowedFlags(["-n"]);
  if (base === "rollout status deployment/payment-api")
    return payments && allowedFlags(["-n"]);
  if (base === "auth can-i patch deployments")
    return flags["-n"] === "payments" && allowedFlags(["-n"]);
  if (base === "apply")
    return allowedFlags(["-f", "-n"]) && payments && !!flags["-f"];
  return false;
}

export function validPodCommand(raw: string) {
  if (
    ["env", "ip route"].includes(raw) ||
    /^nslookup (ledger|ledger\.payments|ledger\.payments\.svc|ledger\.payments\.svc\.cluster\.local)$/.test(
      raw,
    )
  )
    return true;
  const match = raw.match(/^curl(?:\s+(-I|-v))?\s+(https?:\/\/\S+)$/);
  if (!match) return false;
  try {
    const url = new URL(match[2]);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password || url.search || url.hash) return false;
    const ledger = [
      "ledger",
      "ledger.payments",
      "ledger.payments.svc",
      "ledger.payments.svc.cluster.local",
      "172.30.121.42",
    ].includes(url.hostname);
    return (
      (ledger &&
        url.port === "8443" &&
        ["/", "/health"].includes(url.pathname)) ||
      (url.hostname === "203.0.113.77" &&
        (!url.port || url.port === "443") &&
        ["/", "/upload"].includes(url.pathname))
    );
  } catch {
    return false;
  }
}
