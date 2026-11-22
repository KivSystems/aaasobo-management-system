export function requireSafeDbName(dbName: string) {
  if (!/^[a-z0-9_]+$/i.test(dbName)) {
    throw new Error(`Unsafe database name: ${dbName}`);
  }
}

export function quotedIdentifier(id: string) {
  requireSafeDbName(id);
  return `"${id.replaceAll('"', '""')}"`;
}

export function asAdminDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  url.pathname = "/postgres";
  return url.toString();
}
