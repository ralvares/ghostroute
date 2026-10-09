import type { ImageAsset } from "./types.js";
/** Immutable authored content. Findings/scan timestamps/tag location are not image bytes. */
export function imageDigestMaterial(asset: ImageAsset): string {
  return JSON.stringify({
    format: "ghostroute-authored-image-v1",
    application: asset.ref.split("/").at(-1)?.split(":")[0],
    created: asset.created,
    user: asset.user,
    labels: asset.labels,
    dockerfile: asset.dockerfile,
    components: asset.components.map(({ name, version, purl }) => ({
      name,
      version,
      purl,
    })),
  });
}
