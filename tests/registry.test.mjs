import test from "node:test";
import assert from "node:assert/strict";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import { base64Command } from "../.test-build/src/terminal/base64.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import { applyResource } from "../.test-build/src/simulation/cluster-api.js";
import {
  registryCredential,
  leakedToken,
  replacementToken,
} from "../.test-build/src/security/registry.js";
import { secretValue } from "../.test-build/src/simulation/secrets.js";
import { chapters, materialize } from "../.test-build/src/campaign/catalog.js";
import { readVirtualFile } from "../.test-build/src/simulation/filesystem.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
test("base64 supports UTF8, wrapping, decode/no newline, file input and explicit errors", async () => {
  resetState();
  for (const text of ["token", "hello 🌍", "", "x".repeat(80)]) {
    const b = base64Command(["-w0"], text);
    assert.equal(base64Command(["-d"], b.stdout).stdout, text);
  }
  assert.equal(
    base64Command([], "x".repeat(80)).stdout.split("\n")[0].length,
    76,
  );
  assert.equal(base64Command(["--decode"], "aGVsbG8=").stdout, "hello");
  assert.equal(base64Command(["-d"], "???").exitCode, 1);
  assert.equal(
    (await clusterCommand("printf '%s' training-v2 | base64 | base64 -d"))
      .stdout,
    "training-v2",
  );
  const r = await clusterCommand(
    "printf '%s' training-v2 | base64 > encoded.txt",
  );
  assert.equal(
    (await clusterCommand("base64 -d encoded.txt")).stdout,
    "training-v2",
  );
  assert.throws(() => base64Command(["--execute"], "abc"), /unrecognized/);
});
test("revoked registry credentials deny login; replacement permits authored push/pull and survives save", async () => {
  resetState();
  let r = await clusterCommand(
    "printf '%s' " +
      leakedToken +
      " | podman login registry.example.test --username release-bot --password-stdin",
  );
  assert.equal(r.exitCode, 1);
  assert.match(r.stderr, /unauthorized/);
  r = await clusterCommand(
    "printf '%s' " +
      replacementToken +
      " | podman login registry.example.test --username release-bot --password-stdin",
  );
  assert.equal(r.stdout, "Login Succeeded\n");
  assert.equal(
    (
      await clusterCommand(
        "podman push registry.example.test/private/payments:v1.8.3",
      )
    ).exitCode,
    0,
  );
  assert.equal(
    (
      await clusterCommand(
        "podman pull registry.example.test/private/payments:v1.8.3",
      )
    ).exitCode,
    0,
  );
  assert.equal(
    (await clusterCommand("podman pull quay.io/not-authored:latest")).exitCode,
    1,
  );
  assert.deepEqual(
    decodeProgress(encodeProgress(S)).cluster.registry,
    S.cluster.registry,
  );
  assert.ok(
    JSON.parse(readVirtualFile(".config/containers/auth.json")).auths[
      "registry.example.test"
    ],
  );
  await clusterCommand("podman logout registry.example.test");
  assert.equal(
    (
      await clusterCommand(
        "podman push registry.example.test/private/payments:v1.8.3",
      )
    ).exitCode,
    1,
  );
});
test("private image pull uses cluster dockerconfigjson Secret, not bastion login; revoked Secret remains rejected", async () => {
  resetState();
  S.cluster.user = "platform-admin";
  applyResource({
    apiVersion: "v1",
    kind: "Namespace",
    metadata: { name: "rs-09" },
  });
  const ch = chapters.find((c) => c.id === "09");
  for (const o of ch.seed) applyResource(materialize(o, "rs-09"), "rs-09");
  let pods = () =>
    S.cluster.resources.filter(
      (p) => p.kind === "Pod" && p.metadata.namespace === "rs-09",
    );
  assert.equal(
    pods()[0].status.containerStatuses[0].state.waiting.reason,
    "ImagePullBackOff",
  );
  await clusterCommand(
    "printf '%s' " +
      replacementToken +
      " | podman login registry.example.test --username release-bot --password-stdin",
  );
  assert.equal(pods()[0].status.containerStatuses[0].ready, false);
  const old = S.cluster.resources.find(
    (r) => r.kind === "Secret" && r.metadata.name === "registry-leaked",
  );
  assert.equal(
    secretValue(old, ".dockerconfigjson"),
    registryCredential(leakedToken),
  );
  for (const name of ["registry-credentials.yaml", "private-release.yaml"])
    applyResource(materialize(ch.files[name], "rs-09"), "rs-09");
  assert.equal(pods()[0].status.containerStatuses[0].ready, true);
  assert.equal(pods()[0].spec.imagePullSecrets[0].name, "registry-current");
  assert.ok(old.data[".dockerconfigjson"]);
  assert.ok(!old.stringData);
});

test("Skopeo inspects catalog digests/config/tags without pulling and enforces private registry auth", async () => {
  resetState();
  let r = await clusterCommand(
    "skopeo inspect docker://registry.example.test/payments:v1.8.3",
  );
  const image = JSON.parse(r.stdout);
  assert.match(image.Digest, /^sha256:[0-9a-f]{64}$/);
  assert.deepEqual(image.RepoTags, ["v1.8.2", "v1.8.3", "v1.8.4"]);
  assert.deepEqual(S.cluster.registry.pulled, []);
  r = await clusterCommand(
    "skopeo inspect --config docker://registry.example.test/payments:v1.8.3",
  );
  assert.equal(JSON.parse(r.stdout).config.User, "1001");
  r = await clusterCommand(
    "skopeo inspect --no-tags docker://registry.example.test/payments:v1.8.3",
  );
  assert.deepEqual(JSON.parse(r.stdout).RepoTags, []);
  r = await clusterCommand(
    "skopeo list-tags docker://registry.example.test/payments",
  );
  assert.equal(JSON.parse(r.stdout).Tags.length, 3);
  r = await clusterCommand(
    "skopeo inspect docker://registry.example.test/private/payments:v1.8.3",
  );
  assert.equal(r.exitCode, 1);
  r = await clusterCommand(
    "skopeo inspect --creds release-bot:training-registry-v1-revoked docker://registry.example.test/private/payments:v1.8.3",
  );
  assert.match(r.stderr, /unauthorized/);
  r = await clusterCommand(
    "skopeo inspect --creds release-bot:training-registry-v2 docker://registry.example.test/private/payments:v1.8.3",
  );
  assert.equal(JSON.parse(r.stdout).Digest, image.Digest);
  for (const command of [
    "skopeo copy docker://a docker://b",
    "skopeo inspect --raw docker://registry.example.test/payments:v1.8.3",
    "podman build .",
  ])
    assert.equal((await clusterCommand(command)).exitCode, 1);
  assert.equal(
    (await clusterCommand("podman pull registry.example.test/payments:v1.8.3"))
      .exitCode,
    0,
  );
});
