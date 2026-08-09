import type { DnsProvider, LatencyResult } from './types'

const RUNS = 3
const TEST_DOMAIN = 'google.com'

async function measureOne(provider: DnsProvider): Promise<number> {
  const start = performance.now()
  const url = `${provider.doHUrl}?name=${encodeURIComponent(TEST_DOMAIN)}&type=A`
  await fetch(url, { headers: provider.needsJsonAccept ? { Accept: 'application/dns-json' } : {} })
  return Math.round(performance.now() - start)
}

export async function measureProvider(provider: DnsProvider): Promise<LatencyResult> {
  if (!provider.doHUrl) {
    return { id: provider.id, name: provider.name, avg: 0, min: 0, max: 0, ok: false }
  }
  const times: number[] = []
  for (let i = 0; i < RUNS; i++) {
    try {
      times.push(await measureOne(provider))
    } catch {
      // ignore single-run failure, judged by remaining successes below
    }
  }
  if (times.length === 0) {
    return { id: provider.id, name: provider.name, avg: 0, min: 0, max: 0, ok: false }
  }
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  return { id: provider.id, name: provider.name, avg, min: Math.min(...times), max: Math.max(...times), ok: true }
}
