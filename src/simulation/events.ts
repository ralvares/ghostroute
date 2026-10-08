export type EventType =
  | "deployment.updated"
  | "pods.replaced"
  | "rollout.completed"
  | "policy.applied"
  | "connectivity.tested"
  | "evidence.collected"
  | "security.reevaluated"
  | "simulation.reset"
  | "cluster.request";

export interface DomainEvent {
  readonly sequence: number;
  readonly at: string;
  readonly type: EventType;
  readonly actor: "operator" | "simulation";
  readonly data: Readonly<Record<string, string | number | boolean>>;
}

type Listener = (event: DomainEvent) => void;
const listeners = new Set<Listener>();
export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function publish(event: DomainEvent) {
  for (const listener of listeners) listener(event);
}
