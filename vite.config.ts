import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { offlineBuild } from "./tools/offline-build.js";

function jqCliStreams(): Plugin {
  return {
    name: "jq-preserve-cli-stdout",
    enforce: "pre",
    transform(code, id) {
      if (
        !id.includes("/jq-wasm/dist/") ||
        !code.includes("stdoutSink.toString()")
      )
        return;
      // jq-wasm 3.0.0 trims stdout. Shell pipelines/redirection must preserve
      // jq's actual bytes, including blank strings, leading spaces and newlines.
      const before = "stdout: stdoutSink.toString().trim()";
      if (!code.includes(before))
        throw new Error(
          "jq-wasm stdout adapter changed; verify shell byte fidelity before upgrading",
        );
      return {
        code: code.replace(before, "stdout: stdoutSink.toString()"),
        map: null,
      };
    },
  };
}
export default defineConfig({
  plugins: [jqCliStreams(), offlineBuild()],
  worker: { plugins: () => [jqCliStreams()] },
  optimizeDeps: { exclude: ["jq-wasm"] },
  build: { target: "es2022" },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4174, strictPort: true },
});
