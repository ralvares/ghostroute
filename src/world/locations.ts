export interface WorldObject {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  sub: string;
  kind: "terminal" | "pod" | "npc" | "edge";
}
export const objects: WorldObject[] = [
  {
    id: "rhacs",
    x: 220,
    y: 310,
    r: 62,
    label: "RHACS SOC",
    sub: "Network anomaly",
    kind: "terminal",
  },
  {
    id: "pod1",
    x: 468,
    y: 312,
    r: 54,
    label: "payment-api",
    sub: "Pod · worker-01",
    kind: "pod",
  },
  {
    id: "pod2",
    x: 758,
    y: 363,
    r: 54,
    label: "payment-api",
    sub: "Pod · worker-02",
    kind: "pod",
  },
  {
    id: "ledger",
    x: 747,
    y: 252,
    r: 55,
    label: "ledger",
    sub: "Internal API · worker-02",
    kind: "pod",
  },
  {
    id: "ops",
    x: 525,
    y: 526,
    r: 56,
    label: "OPS TERMINAL",
    sub: "OpenShift CLI",
    kind: "terminal",
  },
  {
    id: "rhea",
    x: 291,
    y: 470,
    r: 52,
    label: "RHEA",
    sub: "RHACS analyst",
    kind: "npc",
  },
  {
    id: "mira",
    x: 882,
    y: 505,
    r: 52,
    label: "MIRA",
    sub: "Platform engineer",
    kind: "npc",
  },
  {
    id: "edge",
    x: 1067,
    y: 330,
    r: 62,
    label: "OUTSIDE",
    sub: "Untrusted network",
    kind: "edge",
  },
];
