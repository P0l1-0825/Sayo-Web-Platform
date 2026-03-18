// ============================================================
// SAYO — API Client
// Wraps fetch() to call the backend gateway (sayo-platform).
// In demo mode, the backend itself returns mock data — the
// frontend no longer needs its own isDemoMode logic.
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("sayo-auth")
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.access_token ?? null
  } catch {
    return null
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    let code = "UNKNOWN"
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      code = body?.error?.code ?? code
      message = body?.error?.message ?? message
    } catch {
      // Response wasn't JSON
    }
    throw new ApiError(res.status, code, message)
  }

  const body = await res.json()
  return body.data as T
}

export const api = {
  get: <T>(path: string) => fetchApi<T>(path),

  post: <T>(path: string, body?: unknown) =>
    fetchApi<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body: unknown) =>
    fetchApi<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    fetchApi<T>(path, { method: "DELETE" }),
}

export default api
