export function createTektonState() {
  return { sequence: 0, logs: {} as Record<string, Record<string, string>> };
}
