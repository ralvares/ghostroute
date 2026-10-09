export type EventType =
  | "deployment.updated"
  | "pods.replaced"
  | "rollout.completed"
  | "policy.applied"
  | "connectivity.tested"
  | "evidence.collected"
  | "security.reevaluated"
  | "simulation.reset"
  | "cluster.request"
  | "controller.reconciled"
  | "rhacs.alert"
  | "rhacs.baseline";

export interface DomainEvent {
  readonly sequence: number;
  readonly at: string;
  readonly type: EventType;
  readonly actor: "operator" | "simulation";
  readonly data: Readonly<Record<string, string | number | boolean>>;
}

type Listener = (event: DomainEvent) => void;
const listeners = new Set<Listener>();
let eventBuffer: DomainEvent[] | undefined;
/** Mutating API validation can run without exposing intermediate state to views or saves. */
export function bufferEvents<T>(run: () => T, commit: boolean): T {
  const outer = eventBuffer;
  const pending: DomainEvent[] = [];
  eventBuffer = pending;
  try {
    const value = run();
    eventBuffer = outer;
    if (commit) for (const event of pending) publish(event);
    return value;
  } finally {
    eventBuffer = outer;
  }
}
export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function publish(event: DomainEvent) {
  if (eventBuffer) {
    eventBuffer.push(event);
    return;
  }
  for (const listener of listeners) listener(event);
}
