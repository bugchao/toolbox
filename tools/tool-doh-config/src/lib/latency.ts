import { timedFetch, parseDohAnswer } from '@toolbox/doh-client'
import type { DohProvider, LatencyResult } from './types'

const RUNS = 3

async function queryOnce(provider: DohProvider, domain: string, type: string): Promise<{ ms: number; answers: string[] }> {
  const url = `${provider.url}?name=${encodeURIComponent(domain)}&type=${type}`
  const { ms, response } = await timedFetch(url, provider.needsJsonAccept)
  const answers = parseDohAnswer(await response.json())
  return { ms, answers }
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
