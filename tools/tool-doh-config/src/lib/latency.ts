import { queryDohJson, queryDohWire } from '@toolbox/doh-client'
import type { DohProvider, LatencyResult } from './types'

const RUNS = 3

function queryOnce(provider: DohProvider, domain: string, type: string): Promise<{ ms: number; answers: string[] }> {
  if (provider.protocol === 'wire') return queryDohWire(provider.url, domain, type)
  return queryDohJson(provider.url, domain, type, provider.needsJsonAccept)
}

export async function measureProvider(provider: DohProvider, domain: string, type: string): Promise<LatencyResult> {
  const times: number[] = []
  let answers: string[] = []
  for (let i = 0; i < RUNS; i++) {
    try {
      const r = await queryOnce(provider, domain, type)
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
