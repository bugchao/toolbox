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

export async function queryDohJson(
  url: string,
  domain: string,
  type: string,
  needsJsonAccept: boolean
): Promise<{ ms: number; answers: string[] }> {
  const { ms, response } = await timedFetch(`${url}?name=${encodeURIComponent(domain)}&type=${type}`, needsJsonAccept)
  if (!response.ok) throw new Error(`DoH request failed: HTTP ${response.status}`)
  const answers = parseDohAnswer(await response.json())
  return { ms, answers }
}
