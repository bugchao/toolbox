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
