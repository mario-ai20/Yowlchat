const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const cloned = response.clone();

  if (contentType.includes("application/json")) {
    try {
      const payload = (await cloned.json()) as { error?: unknown; message?: unknown };
      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
      }
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }
    } catch {
      // Fall back to the generic message below.
    }
  }

  const text = await cloned.text();
  return text.trim() || `Request failed with status ${response.status}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}
