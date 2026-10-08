import { policyFiles } from "../simulation/resources.js";
import {
  removeTelemetry,
  applyPolicy,
  verifyRollout,
  testConnection,
} from "../simulation/operations.js";
import { validOcCommand, validPodCommand } from "./syntax.js";
import { clusterCommand } from "./cluster-shell.js";
import { S } from "../simulation/state.js";
import {
  print,
  switchPrompt,
  yes,
  closeTerminal,
  printError,
} from "../terminal/shell.js";
import { G } from "../game/runtime.js";
import { $ } from "../ui/dom.js";
import { addClue } from "../security/evidence.js";
import { line } from "../game/rendering.js";
import { toast } from "../ui/notifications.js";
import { updateHUD } from "../ui/hud.js";
import { radio } from "../characters/dialogue.js";
import { maybeWin } from "../missions/progression.js";
import { progressCommand } from "./progress-commands.js";
import { campaignCommand } from "./campaign-commands.js";
import { observeIncidentCommand } from "../missions/incident.js";
import { observeCampaignCommand } from "../campaign/engine.js";

export async function exec(cmd: string) {
  const before = $("termOutput").children.length;
  await executeCommand(cmd);
  const last = $("termOutput").lastElementChild as HTMLElement | null;
  observeCampaignCommand(
    cmd,
    $("termOutput").children.length > before &&
      !!last?.textContent &&
      !last.classList.contains("error") &&
      !last.classList.contains("command"),
  );
  observeIncidentCommand(
    cmd,
    last?.textContent ?? "",
    !!last &&
      !last.classList.contains("error") &&
      !last.classList.contains("command"),
  );
  updateHUD();
  maybeWin();
}
async function executeCommand(cmd: string) {
  const incident = S;
  let raw = cmd.trim();
  const low = raw.toLowerCase();
  if (!raw) return;
  S.history.push(raw);
  S.commands++;
  print(
    (G.podShell ? "sh-5.1$ " : $("termPrompt").textContent + " ") + raw,
    "command",
  );
  if (raw === "clear") {
    $("termOutput").innerHTML = "";
    return;
  }
  if (["help", "?", "man"].includes(low)) {
    print(
      G.podShell
        ? `Inside the payment-api Pod (SIMULATED):\n  env                 inspect process environment\n  curl -I URL         test an HTTP destination\n  nslookup NAME       test DNS\n  ip route            view route\n  exit                return to bastion`
        : `Supported offline tools:\n  oc get pods|nodes|deployments|networkpolicies\n  oc logs deployment/payment-api -n payments\n  oc get deployment payment-api -n payments -o yaml\n  oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-\n  oc apply -f policies/<name>.yaml\n  oc rsh -n payments deployment/payment-api\n  oc rollout status deployment/payment-api -n payments\n  oc auth can-i ...\n  ls / cd / cat / pwd / mkdir\n\nExplore the resources and policies. TAB completes supported commands.\nFor cluster labs, type oc --help, cat lab.txt, or ls workloads.\nLocal progress/offline: game status, game save, game export, game import.`,
      "meta",
    );
    return;
  }
  if (raw === "exit") {
    if (G.podShell) {
      switchPrompt();
      yes("Exited Pod shell. Back on bastion.");
    } else {
      closeTerminal();
    }
    return;
  }
  if (G.podShell) {
    podCmd(raw);
    return;
  }
  if (await progressCommand(raw)) return;
  if (campaignCommand(raw)) return;
  try {
    const handled = await clusterCommand(raw);
    if (S !== incident) return;
    if (handled?.legacyCommand) raw = handled.legacyCommand;
    else if (handled) {
      if (raw.startsWith("oc login") || raw.startsWith("cd")) switchPrompt();
      updateHUD();
      if (handled.stdout)
        print(handled.stdout.trimEnd(), handled.error ? "error" : "reply");
      return;
    }
  } catch (error) {
    printError((error as Error).message);
    return;
  }
  if (raw.startsWith("oc ") && !validOcCommand(raw)) {
    printError(
      "error: unsupported oc syntax in this offline episode. Type help for implemented operations. Your real cluster is never accessed.",
    );
    return;
  }
  if (raw === "pwd") {
    print("/home/operator");
    return;
  }
  if (/^ls(\s+(-la?\s*)?)?$/.test(raw)) {
    print("policies/   notes.txt");
    return;
  }
  if (/^ls\s+(policies\/?|\.\/policies)\s*$/.test(raw)) {
    print("deny-all.yaml  payments-egress.yaml");
    return;
  }
  if (/^cat\s+(notes\.txt|\.\/notes\.txt)$/.test(raw)) {
    print(
      "Incident response tip: compare observed network paths with deployment configuration. RHACS anomalies are not convictions.",
    );
    return;
  }
  const fileMatch = raw.match(/^cat\s+(?:\.\/)?(policies\/[^\s]+)$/);
  if (fileMatch) {
    if (policyFiles[fileMatch[1]]) print(policyFiles[fileMatch[1]]);
    else printError(`cat: ${fileMatch[1]}: No such file`);
    return;
  }
  if (raw === "oc whoami") {
    print("operator");
    return;
  }
  if (/^oc\s+(?:get|describe)\s+nodes?\b/.test(raw)) {
    print(
      "NAME         STATUS   ROLES    AGE   VERSION\nworker-01    Ready    worker   29d   v1.32.x\nworker-02    Ready    worker   29d   v1.32.x",
    );
    return;
  }
  if (/^oc\s+get\s+(?:ns|namespaces)\b/.test(raw)) {
    print(
      "NAME           STATUS   AGE\npayments       Active   42d\nopenshift-dns   Active   49d\nopenshift-*    Active   49d",
    );
    return;
  }
  if (/^oc\s+(?:get|describe)\s+(?:pods?|po)\b/.test(raw)) {
    if (!/\bpayments\b/.test(raw)) {
      printError(
        "No resources found in the default namespace. Hint: the app runs in payments.",
      );
      return;
    }
    const pods =
      "NAME                          READY   STATUS    NODE\n" +
      S.pods
        .map((pod) => `${pod.name}   1/1     Running   ${pod.node}`)
        .join("\n") +
      "\nledger-86bbb-zyx12            1/1     Running   worker-02";
    print(pods);
    return;
  }
  if (/^oc\s+(?:get|describe)\s+(deploy(?:ment)?s?|deployments?)\b/.test(raw)) {
    if (/(payment-api|\bdeployments?\b|\bdeploy\b|\bdeployment\b)/.test(raw)) {
      const yaml = /-o\s*(?:yaml|json)\b/.test(raw);
      if (yaml) {
        addClue("env");
        if (/-o\s+json\b/.test(raw)) {
          print(
            JSON.stringify(
              {
                apiVersion: "apps/v1",
                kind: "Deployment",
                metadata: { name: "payment-api", namespace: "payments" },
                spec: {
                  replicas: 2,
                  template: {
                    metadata: { labels: { app: "payment-api" } },
                    spec: {
                      containers: [
                        {
                          name: "payment-api",
                          image: "registry.example.test/payments:v1.8.2",
                          env: Object.entries(S.deployment.env).map(
                            ([name, value]) => ({ name, value }),
                          ),
                        },
                      ],
                    },
                  },
                },
                status: { readyReplicas: 2 },
              },
              null,
              2,
            ),
          );
          return;
        }
        print(
          `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: payment-api\n  namespace: payments\nspec:\n  replicas: 2\n  template:\n    metadata:\n      labels: { app: payment-api }\n    spec:\n      containers:\n      - name: payment-api\n        image: registry.example.test/payments:v1.8.2\n        env:${S.env ? "\n        - name: TELEMETRY_ENDPOINT\n          value: https://203.0.113.77/upload" : " [] # suspicious endpoint removed"}\nstatus:\n  readyReplicas: 2`,
        );
      } else if (/^oc\s+describe/.test(raw)) {
        addClue("env");
        print(
          `Name: payment-api\nNamespace: payments\nReplicas: 2 desired | 2 available\nContainer: payment-api\n${S.env ? "Environment: TELEMETRY_ENDPOINT=https://203.0.113.77/upload" : "Environment: no unapproved telemetry setting"}\nConditions: Available=True`,
        );
      } else
        print(
          "NAME          READY   UP-TO-DATE   AVAILABLE\npayment-api   2/2     2            2",
        );
      return;
    }
  }
  if (/^oc\s+logs\b/.test(raw)) {
    if (!/payment-api/.test(raw)) {
      printError(
        "error: only the payment-api Deployment is included in this lab.",
      );
      return;
    }
    if (!/\bpayments\b/.test(raw)) {
      printError(
        'Error from server (NotFound): deployments.apps "payment-api" not found in namespace "default"',
      );
      return;
    }
    addClue("logs");
    let line = S.env
      ? "WARN telemetry: POST https://203.0.113.77/upload (unexpected configured target)"
      : "INFO telemetry: external exporter disabled (config updated)";
    print(
      `2026-10-08T02:13:44Z INFO payment-api: ready, listening on :8080\n2026-10-08T02:14:02Z ${line}\n2026-10-08T02:14:11Z ${S.policy === "deny" ? "ERROR ledger request failed: i/o timeout (egress blocked)" : "INFO ledger request completed: 200 OK"}\n2026-10-08T02:14:18Z ${S.policy === "deny" ? "ERROR checkout degraded: cannot resolve dependencies" : "INFO /healthz passed"}`,
    );
    return;
  }
  if (/^oc\s+(?:get|describe)\s+(?:netpol|networkpolic(?:y|ies))\b/.test(raw)) {
    addClue("policy");
    if (/-o\s+yaml\b/.test(raw)) {
      const name = raw.match(
        /(?:networkpolicy|netpol)\s+(payment-egress|default-deny-egress)/,
      )?.[1];
      if (
        !name ||
        !S.policies.has(name as "payment-egress" | "default-deny-egress")
      )
        printError("Error from server (NotFound): networkpolicy not found");
      else
        print(
          policyFiles[
            name === "payment-egress"
              ? "policies/payments-egress.yaml"
              : "policies/deny-all.yaml"
          ],
        );
      return;
    }
    if (S.policy === "none")
      print(
        "No resources found in payments namespace. payment-api egress is not restricted by a NetworkPolicy.",
      );
    else if (S.policy === "deny")
      print(
        "NAME                 POD-SELECTOR      AGE\ndefault-deny-egress   app=payment-api   1m\nEgress: none (all selected Pod egress denied)",
      );
    else
      print(
        "NAME                 POD-SELECTOR      AGE\n" +
          (S.policies.has("default-deny-egress")
            ? "default-deny-egress   app=payment-api   2m\n"
            : "") +
          "payment-egress       app=payment-api   1m\nEgress: DNS (openshift-dns/53), ledger (payments/app=ledger:8443)",
      );
    return;
  }
  if (/^oc\s+auth\s+can-i\b/.test(raw)) {
    print("yes");
    return;
  }
  if (/^oc\s+rsh\b/.test(raw)) {
    if (!/payment-api/.test(raw)) {
      printError("error: choose deployment/payment-api");
      return;
    }
    if (!/\bpayments\b/.test(raw)) {
      printError(
        "Error from server (NotFound): deployment not found in namespace default",
      );
      return;
    }
    G.podShell = true;
    $("termPrompt").textContent = "sh-5.1$";
    $("termTitle").textContent = "payment-api Pod — simulated /bin/sh";
    yes(
      "Connected to payment-api Pod in payments namespace. Type help; exit returns to bastion.",
    );
    return;
  }
  if (/^oc\s+set\s+env\b/.test(raw)) {
    if (
      !/\b(?:deploy(?:ment)?\/?payment-api|deployment\s+payment-api)\b/.test(
        raw,
      )
    ) {
      printError("error: specify deployment/payment-api");
      return;
    }
    if (!/\bpayments\b/.test(raw)) {
      printError(
        "Error from server (NotFound): deployment payment-api not found in namespace default",
      );
      return;
    }
    if (
      /\bTELEMETRY_ENDPOINT-\b/.test(raw) ||
      /TELEMETRY_ENDPOINT-\s*(?:$|-n\b)/.test(raw) ||
      /TELEMETRY_ENDPOINT-$/.test(raw)
    ) {
      if (!S.env) {
        print(
          "deployment.apps/payment-api unchanged (TELEMETRY_ENDPOINT absent)",
        );
        return;
      }
      removeTelemetry();
      yes(
        "deployment.apps/payment-api env updated\nRolling out revised Pod template... 2 new Pods become Ready.",
      );
      toast("✦ Root cause removed · New Pods deployed");
      updateHUD();
      radio(
        "MIRA",
        "Good. The replacement Pods no longer export telemetry to that endpoint. But remember: removing a setting is not the same as restricting egress. What would prevent another unauthorized connection?",
      );
      return;
    }
    printError(
      "error: unrecognized environment update. This lab expects the TELEMETRY_ENDPOINT variable to be removed.",
    );
    return;
  }
  if (/^oc\s+apply\s+-f\b/.test(raw)) {
    const m = raw.match(/-f\s+(?:\.\/)?(policies\/[^\s]+)/);
    if (!m || !policyFiles[m[1]]) {
      printError(
        "error: no such local manifest. Use ls policies, then cat to inspect it.",
      );
      return;
    }
    if (m[1].includes("deny-all")) {
      applyPolicy("default-deny-egress");
      yes("networkpolicy.networking.k8s.io/default-deny-egress configured");
      toast(
        S.policy === "deny"
          ? "⚠ All egress denied · Checkout dependency failing!"
          : "✓ Existing allowed egress preserved",
      );
    } else {
      applyPolicy("payment-egress");
      yes(
        "networkpolicy.networking.k8s.io/payment-egress configured\nSelected Pods may reach openshift-dns/53 and payments/ledger:8443.",
      );
      toast("✓ Least-privilege egress enforced");
    }
    updateHUD();
    if (!S.env) {
      maybeWin();
    }
    return;
  }
  if (/^oc\s+rollout\s+status\b/.test(raw)) {
    if (!/payment-api/.test(raw) || !/payments/.test(raw)) {
      printError(
        "error: deployment/payment-api not found in current namespace",
      );
      return;
    }
    if (S.env) {
      print(
        'deployment "payment-api" successfully rolled out (current template still contains an unexpected telemetry setting)',
      );
    } else {
      verifyRollout();
      yes(
        'deployment "payment-api" successfully rolled out\n2 of 2 updated replicas are available.',
      );
      maybeWin();
    }
    return;
  }
  if (/^oc\s+/.test(raw)) {
    printError(
      `error: unsupported oc syntax in this offline episode. Type help for implemented operations. Your real cluster is never accessed.`,
    );
    return;
  }
  printError(`${raw.split(/\s/)[0]}: command not found. Type help.`);
}

export function podCmd(raw: string) {
  const txt = raw.trim();
  if (!validPodCommand(txt)) {
    printError(
      "error: unsupported Pod syntax or destination in this offline episode. Type help.",
    );
    return;
  }
  if (/^env(?:\s|$)/.test(txt)) {
    print(
      `POD_NAME=${S.pods[0].name}\nPOD_NAMESPACE=payments\nLEDGER_URL=https://ledger.payments.svc.cluster.local:8443\n${S.env ? "TELEMETRY_ENDPOINT=https://203.0.113.77/upload" : "# No TELEMETRY_ENDPOINT configured"}`,
    );
    return;
  }
  if (/^ip\s+route/.test(txt)) {
    print(
      "default via 10.128.0.1 dev eth0\n10.128.0.0/23 dev eth0 proto kernel scope link",
    );
    return;
  }
  if (/^nslookup\b/.test(txt)) {
    if (!testConnection("dns"))
      printError(
        ";; connection timed out; no servers could be reached (egress DNS blocked)",
      );
    else
      print(
        "Server: 172.30.0.10\nName: ledger.payments.svc.cluster.local\nAddress: 172.30.121.42",
      );
    return;
  }
  if (/^curl\b/.test(txt)) {
    const addr = txt.match(/https?:\/\/([^\s/]+)/)?.[1] || "";
    if (addr.includes("ledger") || addr.includes("172.30.121.42")) {
      if (!testConnection("ledger")) {
        printError(
          "curl: (28) Connection timed out after 3000 milliseconds\nThe selected Pod cannot reach the ledger dependency.",
        );
      } else {
        yes(
          'HTTP/1.1 200 OK\ncontent-type: application/json\n{ "status": "healthy", "ledger": "connected" }',
        );
        maybeWin();
      }
      return;
    }
    if (/203\.0\.113\.77/.test(addr)) {
      if (testConnection("external")) {
        print(
          "HTTP/1.1 202 Accepted\nserver: simulated-external-listener\nWARNING: external egress is still reachable. This does not mean the app is actively sending data.",
          "error",
        );
      } else {
        yes(
          "curl: (28) Failed to connect to 203.0.113.77 port 443: Operation timed out\nExpected negative test: egress is blocked by NetworkPolicy.",
        );
        maybeWin();
      }
      return;
    }
    printError(
      "curl: (6) Could not resolve host (offline scenario only supports ledger and 203.0.113.77)",
    );
    return;
  }
  printError(
    `sh: ${txt.split(/\s/)[0]}: not found in the simulated payment-api Pod. Type help.`,
  );
}
