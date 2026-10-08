import { $ } from "../ui/dom.js";
import type { WorldObject } from "../world/locations.js";

export const C = $("world");
const context = C.getContext("2d");
if (!context) throw new Error("Ghost Route requires Canvas 2D support");
export const ctx = context;
export const W = 1180,
  H = 650;
export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const keys = new Set<string>();

/** Presentation/input state only; infrastructure and progression live in S. */
export const G = {
  cameraX: 0,
  frame: 0,
  lastTime: 0,
  active: false,
  terminalOpen: false,
  detailOpen: false,
  radioOpen: false,
  caseOpen: false,
  endOpen: false,
  traceEnd: 0,
  traceOn: false,
  target: null as { x: number; y: number } | null,
  near: null as WorldObject | null,
  pending: null as WorldObject | null,
  toastTimer: 0,
  tabIndex: 0,
  histPointer: -1,
  podShell: false,
  stopLoop: false,
};
