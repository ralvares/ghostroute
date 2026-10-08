type QueryResult = { stdout: string; stderr: string; exitCode: number };
type Slot = { worker?: Worker; queue: Promise<unknown> };
const engines: Record<"jq" | "template", Slot> = {
  jq: { queue: Promise.resolve() },
  template: { queue: Promise.resolve() },
};

/** Keep compiled WASM warm off the main thread; replace a worker after timeout. */
export function runQuery(
  tool: "jq" | "template",
  input: string,
  query: string,
  flags: string[] = [],
) {
  const slot = engines[tool];
  const task = slot.queue
    .catch(() => {})
    .then(
      () =>
        new Promise<QueryResult>((resolve, reject) => {
          const worker = (slot.worker ??= new Worker(
            new URL("./query-worker.ts", import.meta.url),
            {
              type: "module",
            },
          ));
          const discard = () => {
            worker.terminate();
            slot.worker = undefined;
          };
          const timer = setTimeout(() => {
            discard();
            reject(
              new Error(
                `${tool}: query exceeded the simulation's 5-second execution limit`,
              ),
            );
          }, 5000);
          worker.onmessage = (event) => {
            clearTimeout(timer);
            resolve(event.data);
          };
          worker.onerror = (event) => {
            clearTimeout(timer);
            discard();
            reject(new Error(event.message));
          };
          worker.postMessage({ tool, input, query, flags });
        }),
    );
  slot.queue = task;
  return task;
}
