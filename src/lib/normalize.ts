export function normalizeEstablishment(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
