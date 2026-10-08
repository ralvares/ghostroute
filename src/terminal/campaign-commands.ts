import { explainIncident } from "../missions/incident.js";
import { S } from "../simulation/state.js";
import { showEnding } from "../missions/progression.js";
import {
  campaignStatus,
  currentChapter,
  chapterRoot,
  runCampaignProbe,
  concludeCampaign,
} from "../campaign/engine.js";
import { print, printError } from "./shell.js";
import { continueJourney, showCampaignEnding } from "../ui/campaign.js";
import { updateHUD } from "../ui/hud.js";
export function campaignCommand(raw: string) {
  if (!/^case(?:\s|$)/.test(raw)) return false;
  const words = raw.split(/\s+/);
  try {
    if (words[1] === "status") print(campaignStatus());
    else if (words[1] === "explain" && words.length === 3) {
      print(explainIncident(words[2]));
      if (S.done && !S.campaign.active) showEnding();
    } else if (words[1] === "hint") {
      if (!S.campaign.active) {
        print(
          "First explain the change: cat audit/kube-apiserver.log; cat case/release-job.json; cat case/permission-review.yaml. Correlate the auditID and import-support-config step. Then case explain release-import. Preserve checkout and verify containment.",
        );
        return true;
      }
      const ch = currentChapter();
      print(
        "Read " +
          chapterRoot() +
          "briefing.txt. Interview " +
          ch.witnesses
            .map((w) => w.who.toUpperCase() + " in " + w.scene)
            .join(" and ") +
          ". Inspect the archive dossier.\nUse cd ~/" +
          chapterRoot() +
          " and cat the manifests. Apply dependency resources before their consumers.\n" +
          "Resource changes invalidate older proof; rerun all required case tests after the final change.\n" +
          ch.risk,
      );
      if (ch.id === "05")
        print(
          "Dedicated exception: oc login -u platform-admin -p training; oc apply -f scc.yaml; oc adm policy add-scc-to-user rs-vendor -z vendor -n " +
            ch.namespace +
            "; oc rollout restart deployment/vendor -n " +
            ch.namespace,
        );
      if (ch.id === "25")
        print(
          "Recorded profile: apply identity.yaml and scc.yaml; oc adm policy add-scc-to-user rs-profile -z profiled -n " +
            ch.namespace +
            "; log back in as operator; apply app.yaml.",
        );
    } else if (words[1] === "test" && words.length === 3)
      print(runCampaignProbe(words[2]));
    else if (words[1] === "conclude" && words.length === 3) {
      concludeCampaign(words[2]);
      print("Case closed. Report retained locally.");
      showCampaignEnding();
    } else if (words[1] === "next") continueJourney();
    else
      printError(
        "Use case status, case hint, case test <id>, case conclude <finding>, case next.",
      );
  } catch (error) {
    printError((error as Error).message);
  }
  updateHUD();
  return true;
}
