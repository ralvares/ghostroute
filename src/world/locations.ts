import { S, type SimulationState } from "../simulation/state.js";
import type { SceneId } from "./scene-model.js";
import { chapters } from "../campaign/catalog.js";
export interface WorldObject {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  sub: string;
  kind: "terminal" | "pod" | "npc" | "edge" | "portal" | "prop";
  art?: "rhea" | "mira" | "kai" | "vale";
  action?: string;
  requiredItem?: string;
  destination?: SceneId;
  namespace?: string;
  resourceName?: string;
}
const object = (
  id: string,
  x: number,
  y: number,
  label: string,
  sub: string,
  kind: WorldObject["kind"],
  extra: Partial<WorldObject> = {},
): WorldObject => ({ id, x, y, r: 55, label, sub, kind, ...extra });
/** Only Pods assigned to a worker appear in that worker's room. Controllers have no floor sprite. */
export function worldObjects(state: SimulationState = S): WorldObject[] {
  if (state.world.scene === "district")
    return [
      object(
        "soc-entry",
        210,
        340,
        "RHACS CENTRAL",
        "Enter security operations",
        "portal",
        { destination: "soc" },
      ),
      object(
        "external-entry",
        1050,
        480,
        "EXTERNAL NETWORK",
        "Walk beyond the cluster perimeter",
        "portal",
        { destination: "external" },
      ),
      object(
        "cluster-entry",
        820,
        295,
        "prod-east",
        state.campaign.active
          ? "Continue in the same cluster · tenant " +
              chapters[state.campaign.active].namespace
          : "Enter cluster building",
        "portal",
        { destination: "cluster", r: 70 },
      ),
    ];
  if (state.world.scene === "soc")
    return [
      object(
        "locker",
        830,
        390,
        "Maintenance locker",
        "Search for an access keycard",
        "prop",
        { action: "keycard" },
      ),
      object(
        "ops",
        650,
        320,
        "BASTION",
        "Use the training terminal",
        "terminal",
      ),
      object("rhea", 480, 410, "RHEA", "RHACS analyst", "npc"),
      ...(state.story.mira.scene === "soc"
        ? [
            object(
              "mira",
              state.story.mira.x,
              state.story.mira.y,
              "MIRA",
              "Platform engineer · responding to outage",
              "npc",
              { art: "mira" },
            ),
          ]
        : []),
      object(
        "soc-exit",
        160,
        535,
        "Security district",
        "Leave security operations",
        "portal",
        { destination: "district" },
      ),
    ];
  if (state.world.scene === "external")
    return [
      object(
        "edge",
        980,
        370,
        "UNTRUSTED DESTINATION",
        "Inspect external route",
        "edge",
      ),
      object(
        "external-exit",
        205,
        400,
        "Security district",
        "Return inside the perimeter",
        "portal",
        { destination: "district" },
      ),
    ];
  if (state.world.scene === "cluster")
    return [
      object(
        "worker-entry-01",
        380,
        230,
        "worker-01",
        state.story.inventory.includes("worker-pass")
          ? "Enter worker room"
          : "Access required · talk to Mira",
        "portal",
        { destination: "worker-01", r: 60 },
      ),
      object(
        "worker-entry-02",
        800,
        280,
        "worker-02",
        state.story.inventory.includes("worker-pass")
          ? "Enter worker room"
          : "Access required · talk to Mira",
        "portal",
        { destination: "worker-02", r: 60 },
      ),
      object(
        "operations-entry",
        110,
        350,
        "Operations",
        "Inspect platform controls",
        "portal",
        { destination: "operations" },
      ),
      object(
        "archive-entry",
        1055,
        425,
        "Records archive",
        state.story.inventory.includes("maintenance-keycard")
          ? "Keycard acquired · enter"
          : "Locked · find maintenance keycard",
        "portal",
        { destination: "archive", requiredItem: "maintenance-keycard" },
      ),
      object(
        "district-exit",
        170,
        565,
        "Security district",
        "Exit cluster building",
        "portal",
        { destination: "district" },
      ),
      ...(state.story.mira.scene === "cluster"
        ? [
            object("mira", 895, 465, "MIRA", "Platform engineer", "npc", {
              art: "mira",
            }),
          ]
        : []),
    ];
  if (state.world.scene === "operations" || state.world.scene === "archive")
    return [
      object(
        "story-exit",
        180,
        510,
        "Cluster lobby",
        "Leave this room",
        "portal",
        { destination: "cluster" },
      ),
      ...(state.world.scene === "archive"
        ? [
            object(
              "vale",
              500,
              330,
              "VALE",
              "Archive custodian · ask about the audit trail",
              "npc",
              { action: "audit", art: "vale" },
            ),
            object(
              state.campaign.active ? "campaign-dossier" : "release-record",
              760,
              350,
              state.campaign.active
                ? chapters[state.campaign.active].artifact.title
                : "Release records",
              state.campaign.active
                ? "Inspect this case's retained dossier"
                : "Read the telemetry change notes",
              "prop",
              { action: "release" },
            ),
          ]
        : [
            object(
              "kai",
              650,
              330,
              "KAI",
              state.campaign.active
                ? "Release engineer · ask about this case"
                : "Release engineer · ask what changed",
              "npc",
              {
                action: state.campaign.active ? "image" : "release",
                art: "kai",
              },
            ),
          ]),
    ];
  const worker = state.world.scene;
  const payment = state.pods.find((pod) => pod.node === worker)!;
  const objects = [
    ...(worker === "worker-01"
      ? [
          object(
            "release-desk",
            860,
            340,
            "Kai’s release handover",
            "Inspect retained delivery notes",
            "prop",
            { action: "release" },
          ),
        ]
      : [
          object(
            "dependency-board",
            300,
            370,
            "Mira’s dependency notes",
            "Read checkout’s required paths",
            "prop",
            { action: "boundary" },
          ),
        ]),
    object(
      "room-exit",
      160,
      535,
      "Cluster lobby",
      "Leave worker room",
      "portal",
      { destination: "cluster" },
    ),
    object(
      worker === "worker-01" ? "pod1" : "pod2",
      490,
      330,
      "payment-api",
      `payments · Pod · ${worker}`,
      "pod",
      { namespace: "payments", resourceName: payment.name },
    ),
  ];
  if (worker === "worker-02")
    objects.push(
      object(
        "ledger",
        745,
        335,
        "ledger",
        `payments · Pod · ${worker}`,
        "pod",
        { namespace: "payments", resourceName: "ledger-86bbb-zyx12" },
      ),
    );
  const labPods = state.cluster.resources.filter(
    (item) => item.kind === "Pod" && item.spec?.nodeName === worker,
  );
  if (state.campaign.active)
    labPods.sort(
      (a, b) =>
        Number(
          b.metadata.namespace === chapters[state.campaign.active].namespace,
        ) -
        Number(
          a.metadata.namespace === chapters[state.campaign.active].namespace,
        ),
    );
  if (state.campaign.active)
    objects.push(
      object(
        "worker-register",
        370,
        275,
        "Tenant register",
        labPods.length + " scheduled Pods · inspect full register",
        "prop",
      ),
    );
  labPods.slice(0, 2).forEach((pod, index) =>
    objects.push(
      object(
        `lab-pod:${pod.metadata.namespace}/${pod.metadata.name}`,
        730 + (index % 2) * 165,
        435 + Math.floor(index / 2) * 95,
        pod.metadata.name,
        `${pod.metadata.namespace} · Pod · ${worker}`,
        "pod",
        {
          namespace: pod.metadata.namespace,
          resourceName: pod.metadata.name,
        },
      ),
    ),
  );
  return objects;
}
