const POSTGRES_PROTOCOL_RE = /^postgres(?:ql)?:\/\//i;
const PLACEHOLDER_SEGMENTS_RE = /(PASTE_|CHANGE_ME|REPLACE_ME|YOUR_|_HERE\b|TODO|EXAMPLE|PLACEHOLDER)/i;

export function normalizeDatabaseUrl(url: string | undefined | null) {
  const value = url?.trim();
  if (!value) {
    return null;
  }

  if (PLACEHOLDER_SEGMENTS_RE.test(value)) {
    return null;
  }

  if (POSTGRES_PROTOCOL_RE.test(value)) {
    return value;
  }

  if (value.includes("://")) {
    return value;
  }

  return `postgresql://${value}`;
}

export function isConfiguredDatabaseUrl(url: string | undefined | null) {
  return normalizeDatabaseUrl(url) !== null;
}
