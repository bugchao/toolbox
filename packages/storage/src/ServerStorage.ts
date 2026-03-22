/**
 * ServerStorage: REST API backed by SQLite on the server.
 * Base URL auto-detected from VITE_API_URL env or same-origin /api
 */

const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '/api'

async function req<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return null
    if (method === 'DELETE') return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export const ServerStorage = {
  async get<T>(ns: string, key: string): Promise<T | null> {
    const result = await req<{ value: T }>('GET', `/store/${ns}/${key}`)
    return result?.value ?? null
  },

  async set<T>(ns: string, key: string, value: T): Promise<void> {
    await req('PUT', `/store/${ns}/${key}`, { value })
  },

  async remove(ns: string, key: string): Promise<void> {
    await req('DELETE', `/store/${ns}/${key}`)
  },

  async list(ns: string): Promise<string[]> {
    const result = await req<{ keys: string[] }>('GET', `/store/${ns}`)
    return result?.keys ?? []
  },

  async clear(ns: string): Promise<void> {
    await req('DELETE', `/store/${ns}`)
  },
}
