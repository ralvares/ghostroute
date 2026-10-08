import { defineConfig } from "vite";
import { offlineBuild } from "./tools/offline-build.js";

export default defineConfig({
  plugins: [offlineBuild()],
  build: { target: "es2022" },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4174, strictPort: true },
});
