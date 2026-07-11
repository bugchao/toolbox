import { describe, expect, it } from 'vitest'
import { EFFECTS } from './effects'
import { initialHistory, newStep, pipelineReducer, type PipelineHistory } from './pipeline'

function run(actions: Parameters<typeof pipelineReducer>[1][], from: PipelineHistory = initialHistory) {
  return actions.reduce(pipelineReducer, from)
}

describe('pipelineReducer', () => {
  it('add 使用效果默认值并追加到末尾', () => {
    const h = run([{ type: 'add', effect: 'grayscale' }, { type: 'add', effect: 'blur' }])
    expect(h.present.map((s) => s.type)).toEqual(['grayscale', 'blur'])
    expect(h.present[0].value).toBe(EFFECTS.grayscale.defaultValue)
    expect(h.present.every((s) => s.enabled)).toBe(true)
  })

  it('remove/toggle/move 生效，move 越界与未知 id 为 no-op', () => {
    let h = run([{ type: 'add', effect: 'grayscale' }, { type: 'add', effect: 'blur' }])
    const [gray, blur] = h.present
    h = pipelineReducer(h, { type: 'move', id: blur.id, dir: -1 })
    expect(h.present.map((s) => s.type)).toEqual(['blur', 'grayscale'])
    const boundary = pipelineReducer(h, { type: 'move', id: blur.id, dir: -1 })
    expect(boundary).toBe(h)
    expect(pipelineReducer(h, { type: 'remove', id: 'nope' })).toBe(h)
    h = pipelineReducer(h, { type: 'toggle', id: gray.id })
    expect(h.present.find((s) => s.id === gray.id)?.enabled).toBe(false)
    h = pipelineReducer(h, { type: 'remove', id: gray.id })
    expect(h.present.map((s) => s.type)).toEqual(['blur'])
  })

  it('undo/redo round-trip，空栈 no-op', () => {
    expect(pipelineReducer(initialHistory, { type: 'undo' })).toBe(initialHistory)
    let h = run([{ type: 'add', effect: 'sepia' }, { type: 'add', effect: 'invert' }])
    h = pipelineReducer(h, { type: 'undo' })
    expect(h.present.map((s) => s.type)).toEqual(['sepia'])
    h = pipelineReducer(h, { type: 'redo' })
    expect(h.present.map((s) => s.type)).toEqual(['sepia', 'invert'])
    expect(pipelineReducer(h, { type: 'redo' })).toBe(h)
  })

  it('编辑动作清空 redo 栈', () => {
    let h = run([{ type: 'add', effect: 'sepia' }, { type: 'add', effect: 'invert' }, { type: 'undo' }])
    h = pipelineReducer(h, { type: 'add', effect: 'blur' })
    expect(h.future).toHaveLength(0)
  })

  it('同一步骤连续 setValue 合并为一条历史', () => {
    let h = run([{ type: 'add', effect: 'brightness' }])
    const id = h.present[0].id
    h = run(
      [
        { type: 'setValue', id, value: 110 },
        { type: 'setValue', id, value: 130 },
        { type: 'setValue', id, value: 150 },
      ],
      h,
    )
    expect(h.present[0].value).toBe(150)
    h = pipelineReducer(h, { type: 'undo' })
    expect(h.present[0].value).toBe(EFFECTS.brightness.defaultValue)
  })

  it('不同步骤的 setValue 不合并', () => {
    let h = run([{ type: 'add', effect: 'brightness' }, { type: 'add', effect: 'contrast' }])
    const [a, b] = h.present
    h = run(
      [
        { type: 'setValue', id: a.id, value: 120 },
        { type: 'setValue', id: b.id, value: 60 },
      ],
      h,
    )
    h = pipelineReducer(h, { type: 'undo' })
    expect(h.present.find((s) => s.id === b.id)?.value).toBe(EFFECTS.contrast.defaultValue)
    expect(h.present.find((s) => s.id === a.id)?.value).toBe(120)
  })

  it('replace 全量替换并保留可撤销', () => {
    let h = run([{ type: 'add', effect: 'sepia' }])
    const steps = [newStep('blur'), newStep('threshold')]
    h = pipelineReducer(h, { type: 'replace', steps })
    expect(h.present.map((s) => s.type)).toEqual(['blur', 'threshold'])
    h = pipelineReducer(h, { type: 'undo' })
    expect(h.present.map((s) => s.type)).toEqual(['sepia'])
  })
})
