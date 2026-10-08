/// <reference lib="webworker" />
import { loadJq } from "jq-wasm";
import wasmURL from "jq-wasm/jq.wasm?url";

declare global {
  var Go: new () => {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
  };
  var renderKubeJsonPath: (
    template: string,
    json: string,
    asJson: boolean,
  ) => string;
  var renderGoTemplate: (template: string, json: string) => string;
}
let jq: Awaited<ReturnType<typeof loadJq>> | undefined;
let templateReady = false;

self.onmessage = async (
  event: MessageEvent<{
    tool: "jq" | "template" | "jsonpath";
    input: string;
    query: string;
    flags: string[];
  }>,
) => {
  try {
    const { tool, input, query, flags } = event.data;
    if (tool === "jq") {
      jq ??= await loadJq({ wasmURL });
      self.postMessage(jq.raw(input, query, flags));
    } else {
      if (!templateReady) {
        const runtimeUrl = `${import.meta.env.BASE_URL}tools/wasm_exec.js`;
        // Public assets are static bytes. Vite rejects importing their URL in
        // development; load the bundled Go runtime as a local module instead.
        const runtime = await fetch(runtimeUrl);
        if (!runtime.ok)
          throw new Error(`Go runtime unavailable: HTTP ${runtime.status}`);
        const moduleUrl = URL.createObjectURL(
          new Blob([await runtime.text()], { type: "text/javascript" }),
        );
        try {
          await import(/* @vite-ignore */ moduleUrl);
        } finally {
          URL.revokeObjectURL(moduleUrl);
        }
        const go = new globalThis.Go();
        const response = await fetch(
          `${import.meta.env.BASE_URL}tools/template.wasm`,
        );
        const instance = await WebAssembly.instantiate(
          await response.arrayBuffer(),
          go.importObject,
        );
        void go.run(instance.instance);
        templateReady = true;
      }
      const result = JSON.parse(
        tool === "jsonpath"
          ? globalThis.renderKubeJsonPath(
              query,
              input,
              flags.includes("as-json"),
            )
          : globalThis.renderGoTemplate(query, input),
      ) as {
        output?: string;
        error?: string;
      };
      self.postMessage({
        stdout: result.output ?? "",
        stderr: result.error ?? "",
        exitCode: result.error ? 1 : 0,
      });
    }
  } catch (error) {
    self.postMessage({
      stdout: "",
      stderr: (error as Error).message,
      exitCode: 1,
    });
  }
};
