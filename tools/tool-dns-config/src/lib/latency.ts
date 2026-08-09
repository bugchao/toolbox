import { queryDohJson } from '@toolbox/doh-client'
import type { DnsProvider, LatencyResult } from './types'

const RUNS = 3

export async function measureProvider(provider: DnsProvider, domain: string, type: string): Promise<LatencyResult> {
  if (!provider.doHUrl) {
    return { id: provider.id, name: provider.name, avg: 0, min: 0, max: 0, ok: false, answers: [] }
  }
  const times: number[] = []
  let answers: string[] = []
  for (let i = 0; i < RUNS; i++) {
    try {
      const r = await queryDohJson(provider.doHUrl, domain, type, provider.needsJsonAccept)
      times.push(r.ms)
      if (r.answers.length > 0) answers = r.answers
    } catch {
      // ignore single-run failure, judged by remaining successes below
    }
  }
  if (times.length === 0 || answers.length === 0) {
    return { id: provider.id, name: provider.name, avg: 0, min: 0, max: 0, ok: false, answers: [] }
  }
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  return { id: provider.id, name: provider.name, avg, min: Math.min(...times), max: Math.max(...times), ok: true, answers }
}
