import { describe, it, expect, beforeEach } from 'vitest'
import { clearWorkspace, getWorkspace, saveWorkspace, __resetDbForTests } from './indexeddb'
import { createDefaultWorkspace } from '../domain/factory'

beforeEach(async () => {
  await __resetDbForTests()
  // fake-indexeddb 在每次测试间自动 reset，但显式 clear 一下
  try { await clearWorkspace() } catch { /* ignore */ }
})

describe('IndexedDB repository', () => {
  it('returns null when empty', async () => {
    expect(await getWorkspace()).toBeNull()
  })

  it('save → get roundtrips workspace', async () => {
    const ws = createDefaultWorkspace()
    await saveWorkspace(ws)
    const got = await getWorkspace()
    expect(got).not.toBeNull()
    expect(got!.id).toBe(ws.id)
    expect(got!.documents).toHaveLength(1)
  })

  it('save overwrites previous value', async () => {
    await saveWorkspace(createDefaultWorkspace())
    const fresh = createDefaultWorkspace()
    await saveWorkspace(fresh)
    expect((await getWorkspace())!.id).toBe(fresh.id)
  })

  it('clear removes existing value', async () => {
    await saveWorkspace(createDefaultWorkspace())
    await clearWorkspace()
    expect(await getWorkspace()).toBeNull()
  })
})
