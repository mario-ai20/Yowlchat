import { useSessionStore } from "../store/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useSessionStore.getState().accessToken;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
