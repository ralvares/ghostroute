import type { Resource } from "../simulation/cluster-model.js";
import type { SceneId } from "../world/scene-model.js";
export type Witness = "rhea" | "mira" | "kai" | "vale";
export interface Goal {
  label: string;
  kind: string;
  namespace?: string;
  name: string;
  path: string;
  value: unknown;
}
export interface Probe {
  id: string;
  label: string;
  model: string;
  expected: boolean;
}
export interface Chapter {
  id: string;
  title: string;
  act: string;
  district: string;
  namespace: string;
  hook: string;
  reveal: string;
  outcome: string;
  sources: string[];
  witnesses: { who: Witness; scene: SceneId; text: string }[];
  artifact: { scene: SceneId; title: string; text: string };
  files: Record<string, Resource | string>;
  seed: Resource[];
  goals: Goal[];
  probes: Probe[];
  conclusion: string;
  risk: string;
}
export interface Proof {
  fingerprint: string;
  passed: boolean;
  detail: string;
}
export function makeCampaign() {
  return {
    active: 0,
    completed: [] as number[],
    interviews: [] as string[],
    evidence: [] as string[],
    artifactFound: false,
    proofs: {} as Record<string, Proof>,
    diagnostics: {} as Record<string, Resource>,
    reports: [] as {
      chapter: number;
      conclusion: string;
      commands: number;
      trust: number;
    }[],
    commandStart: 0,
    trust: 0,
    finished: false,
  };
}
