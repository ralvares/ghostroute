const encoder = new TextEncoder();
export async function gitObject(
  type: string,
  body: Uint8Array | string,
): Promise<string> {
  const bytes = typeof body === "string" ? encoder.encode(body) : body,
    header = encoder.encode(`${type} ${bytes.length}\0`),
    input = new Uint8Array(header.length + bytes.length);
  input.set(header);
  input.set(bytes, header.length);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-1", input))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function gitTree(files: Record<string, string>): Promise<string> {
  const dirs = new Set(
    Object.keys(files)
      .filter((k) => k.includes("/"))
      .map((k) => k.split("/")[0]),
  );
  const entries: { name: string; mode: string; sha: string }[] = [];
  for (const [name, text] of Object.entries(files))
    if (!name.includes("/"))
      entries.push({
        name,
        mode: "100644",
        sha: await gitObject("blob", text),
      });
  for (const name of dirs) {
    const child = Object.fromEntries(
      Object.entries(files)
        .filter(([k]) => k.startsWith(name + "/"))
        .map(([k, v]) => [k.slice(name.length + 1), v]),
    );
    entries.push({ name, mode: "40000", sha: await gitTree(child) });
  }
  entries.sort((a, b) => {
    const x = a.name + (a.mode === "40000" ? "/" : ""),
      y = b.name + (b.mode === "40000" ? "/" : "");
    return x < y ? -1 : x > y ? 1 : 0;
  });
  const chunks = entries.map((e) => {
    const h = encoder.encode(`${e.mode} ${e.name}\0`),
      b = new Uint8Array(h.length + 20);
    b.set(h);
    b.set(
      Uint8Array.from(e.sha.match(/../g)!, (s) => parseInt(s, 16)),
      h.length,
    );
    return b;
  });
  const bytes = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.length;
  }
  return gitObject("tree", bytes);
}
export function commitText(
  tree: string,
  parent: string | undefined,
  message: string,
  timestamp: number,
) {
  return `tree ${tree}\n${parent ? `parent ${parent}\n` : ""}author Kai <kai@training.example.test> ${timestamp} +0000\ncommitter Kai <kai@training.example.test> ${timestamp} +0000\n\n${message}\n`;
}
