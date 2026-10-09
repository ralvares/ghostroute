// SHA3-224 for the pinned ESO ObjectHash contract (Go fmt %+v, not JSON).
const mask = (1n << 64n) - 1n;
const offsets = [
  0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18,
  2, 61, 56, 14,
];
const rounds = [
  0x1n,
  0x8082n,
  0x800000000000808an,
  0x8000000080008000n,
  0x808bn,
  0x80000001n,
  0x8000000080008081n,
  0x8000000000008009n,
  0x8an,
  0x88n,
  0x80008009n,
  0x8000000an,
  0x8000808bn,
  0x800000000000008bn,
  0x8000000000008089n,
  0x8000000000008003n,
  0x8000000000008002n,
  0x8000000000000080n,
  0x800an,
  0x800000008000000an,
  0x8000000080008081n,
  0x8000000000008080n,
  0x80000001n,
  0x8000000080008008n,
];
const rotate = (x: bigint, n: number) =>
  n ? ((x << BigInt(n)) | (x >> BigInt(64 - n))) & mask : x;
export function sha3_224(text: string): string {
  const input = new TextEncoder().encode(text),
    rate = 144;
  const padded = new Uint8Array((Math.floor(input.length / rate) + 1) * rate);
  padded.set(input);
  padded[input.length] = 0x06;
  padded[padded.length - 1] |= 0x80;
  let state = Array<bigint>(25).fill(0n);
  for (let block = 0; block < padded.length; block += rate) {
    for (let byte = 0; byte < rate; byte++)
      state[Math.floor(byte / 8)] ^=
        BigInt(padded[block + byte]) << BigInt(8 * (byte % 8));
    for (const round of rounds) {
      const c = Array.from(
        { length: 5 },
        (_, x) =>
          state[x] ^
          state[x + 5] ^
          state[x + 10] ^
          state[x + 15] ^
          state[x + 20],
      );
      const d = c.map((_, x) => c[(x + 4) % 5] ^ rotate(c[(x + 1) % 5], 1));
      for (let i = 0; i < 25; i++) state[i] ^= d[i % 5];
      const b = Array<bigint>(25).fill(0n);
      for (let x = 0; x < 5; x++)
        for (let y = 0; y < 5; y++)
          b[y + 5 * ((2 * x + 3 * y) % 5)] = rotate(
            state[x + 5 * y],
            offsets[x + 5 * y],
          );
      state = b.map(
        (value, i) =>
          value ^
          (~b[(((i % 5) + 1) % 5) + 5 * Math.floor(i / 5)] &
            mask &
            b[(((i % 5) + 2) % 5) + 5 * Math.floor(i / 5)]),
      );
      state[0] ^= round;
    }
  }
  return Array.from({ length: 28 }, (_, i) =>
    Number((state[Math.floor(i / 8)] >> BigInt(8 * (i % 8))) & 255n)
      .toString(16)
      .padStart(2, "0"),
  ).join("");
}
const goMap = (data: Record<string, string> | undefined, bytes = false) =>
  "map[" +
  Object.entries(data ?? {})
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(
      ([key, value]) =>
        key +
        ":" +
        (bytes
          ? "[" +
            Array.from(atob(value), (c) => c.charCodeAt(0)).join(" ") +
            "]"
          : value),
    )
    .join(" ") +
  "]";
export const esoDataHash = (data: Record<string, string> | undefined) =>
  sha3_224(goMap(data, true));
export const esoMetaHash = (
  labels: Record<string, string> | undefined,
  annotations: Record<string, string> | undefined,
) => sha3_224(`{annotations:${goMap(annotations)} labels:${goMap(labels)}}`);
