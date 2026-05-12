const POSTGRES_PROTOCOL_RE = /^postgres(?:ql)?:\/\//i;

export function normalizeDatabaseUrl(url: string | undefined | null) {
  const value = url?.trim();
  if (!value) {
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

