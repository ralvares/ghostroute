import type {
  ProcessBaseline,
  ProcessIndicator,
  RuntimeAlert,
} from "./runtime.js";
export const createRuntime = () => ({
  sequence: 0,
  baselines: [] as ProcessBaseline[],
  processes: [] as ProcessIndicator[],
  alerts: [] as RuntimeAlert[],
});
