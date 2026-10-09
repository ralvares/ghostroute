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
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(assets.map(url => new Request(url, { cache: 'reload' })));
    // Publish only a complete cache. Existing tabs may keep running their loaded
    // code; their next navigation must receive this version without closing all tabs.
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const previous = (await caches.keys()).filter(name => name.startsWith(prefix) && name !== cacheName);
    for (const name of previous.slice(0, -1)) {
      await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'offline-readiness' || !event.ports[0]) return;
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    const entry = new URL(event.data.entry, base);
    const ready = entry.origin === base.origin && assets.includes(entry.href) && !!(await cache.match(entry.href));
    event.ports[0].postMessage({ ready });
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const match = await cache.match(event.request.mode === 'navigate' ? new URL('index.html', base).href : event.request);
    if (match) return match;
    // A still-open older tab may request its lazy worker/assets after activation.
    for (const name of (await caches.keys()).filter(name => name.startsWith(prefix) && name !== cacheName)) {
      const previous = await (await caches.open(name)).match(event.request);
      if (previous) return previous;
    }
    return fetch(event.request);
  })());
});
`,
      );
    },
  };
}
