const names = [
  "kai",
  "vale",
  "dossier",
  "mira-run",
  "soc-room",
  "untrusted-edge",
  "district",
  "cluster-corridor",
  "records-room",
  "operations-room",
  "locker",
  "keycard",
  "operator-walk",
  "worker-room",
  "pod-blue",
  "pod-alert",
  "database",
  "station",
  "operator",
  "rhea",
  "mira",
] as const;
export type ArtworkName = (typeof names)[number];
export const artwork = {} as Record<ArtworkName, HTMLImageElement>;
/** Preloaded once; drawing and local cache require no network during play. */
export async function loadArtwork() {
  await Promise.all(
    names.map(async (name) => {
      const image = new Image();
      image.src = `${import.meta.env.BASE_URL}art/${name}.webp`;
      await image.decode();
      artwork[name] = image;
    }),
  );
}
