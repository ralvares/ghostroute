export const sceneIds = [
  "district",
  "soc",
  "external",
  "cluster",
  "worker-01",
  "worker-02",
  "operations",
  "archive",
] as const;
export type SceneId = (typeof sceneIds)[number];
export const scenes: Record<
  SceneId,
  {
    title: string;
    description: string;
    art:
      | "district"
      | "cluster-corridor"
      | "worker-room"
      | "soc-room"
      | "untrusted-edge"
      | "records-room"
      | "operations-room";
    parent?: SceneId;
    spawn: { x: number; y: number };
  }
> = {
  district: {
    title: "Security district",
    description: "Follow the ghost signal · RHACS Central and prod-east",
    art: "district",
    spawn: { x: 500, y: 410 },
  },
  soc: {
    title: "RHACS Central · security operations",
    description: "Trusted operator hub · Rhea · bastion · maintenance locker",
    art: "soc-room",
    parent: "district",
    spawn: { x: 450, y: 450 },
  },
  external: {
    title: "External network · untrusted zone",
    description: "Outside the cluster boundary · investigate before trusting",
    art: "untrusted-edge",
    parent: "district",
    spawn: { x: 650, y: 440 },
  },
  cluster: {
    title: "prod-east · cluster lobby",
    description: "Worker rooms · operations · locked records archive",
    art: "cluster-corridor",
    parent: "district",
    spawn: { x: 600, y: 400 },
  },
  "worker-01": {
    title: "prod-east / worker-01",
    description:
      "Pods inside this worker · inspect release notes and dependencies",
    art: "worker-room",
    parent: "cluster",
    spawn: { x: 400, y: 440 },
  },
  "worker-02": {
    title: "prod-east / worker-02",
    description: "Payments tenant · payment Pod and ledger dependency",
    art: "worker-room",
    parent: "cluster",
    spawn: { x: 400, y: 440 },
  },
  operations: {
    title: "prod-east · operations room",
    description:
      "Meet Kai · release handover · application security investigation",
    art: "operations-room",
    parent: "cluster",
    spawn: { x: 450, y: 460 },
  },
  archive: {
    title: "prod-east · records archive",
    description: "Maintenance access · audit trail and release records",
    art: "records-room",
    parent: "cluster",
    spawn: { x: 450, y: 460 },
  },
};
export function isScene(value: unknown): value is SceneId {
  return sceneIds.includes(value as SceneId);
}
