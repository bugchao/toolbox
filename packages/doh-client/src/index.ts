export async function timedFetch(url: string, needsJsonAccept: boolean): Promise<{ ms: number; response: Response }> {
  const start = performance.now()
  const response = await fetch(url, { headers: needsJsonAccept ? { Accept: 'application/dns-json' } : {} })
  const ms = Math.round(performance.now() - start)
  return { ms, response }
}

interface DohAnswer {
  data?: string
}

interface DohResponse {
  Status?: number
  Answer?: DohAnswer[]
}

export function parseDohAnswer(json: unknown): string[] {
  if (typeof json !== 'object' || json === null) return []
  const res = json as DohResponse
  if (res.Status !== 0) return []
  if (!Array.isArray(res.Answer)) return []
  return res.Answer.map((a) => a.data).filter((d): d is string => typeof d === 'string' && d.length > 0)
}
