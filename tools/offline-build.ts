import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { createHash } from "node:crypto";
import type { Plugin } from "vite";

/** Precache the actual build: no CDN or first-use downloads after installation. */
export function offlineBuild(): Plugin {
  let output = "dist";
  return {
    name: "ghost-route-offline",
    apply: "build",
    configResolved(config) {
      output = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const walk = (directory: string): string[] =>
        readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
          entry.isDirectory()
            ? walk(join(directory, entry.name))
            : [join(directory, entry.name)],
        );
      const files = walk(output).filter((path) => !path.endsWith("/sw.js"));
      const hash = createHash("sha256");
      for (const path of files.sort())
        hash.update(relative(output, path)).update(readFileSync(path));
      const version = hash.digest("hex").slice(0, 16);
      const assets = files.map((path) => "./" + relative(output, path));
      writeFileSync(
        join(output, "sw.js"),
        `
const base = new URL('./', self.location.href);
const prefix = 'nexus-offline:' + base.pathname + ':';
const cacheName = prefix + '${version}';
const assets = ${JSON.stringify(assets)}.map(path => new URL(path, base).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const match = await cache.match(event.request.mode === 'navigate' ? new URL('index.html', base).href : event.request);
    return match || fetch(event.request);
  })());
});
`,
      );
    },
  };
}
