export function createGitOpsState() {
  return {
    sequence: 0,
    managed: {} as Record<string, string[]>,
    attempted: {} as Record<string, string>,
    logs: [] as string[],
  };
}
