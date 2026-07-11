import { beforeEach, describe, expect, it } from 'vitest'
import { EFFECTS } from './effects'
import { newStep } from './pipeline'
import { deletePipeline, listPipelines, parsePipelineJson, savePipeline, serializePipeline } from './storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('save → list → delete round-trip，按名 upsert', () => {
    const steps = [newStep('grayscale'), newStep('blur')]
    savePipeline('老照片', steps)
    savePipeline('老照片', steps.slice(0, 1))
    savePipeline('另一个', steps)
    const saved = listPipelines()
    expect(saved.map((p) => p.name).sort()).toEqual(['另一个', '老照片'])
    expect(saved.find((p) => p.name === '老照片')?.steps).toHaveLength(1)
    deletePipeline('老照片')
    expect(listPipelines().map((p) => p.name)).toEqual(['另一个'])
  })

  it('serialize → parse 复原 type/value/enabled，id 重新生成', () => {
    const steps = [
      { ...newStep('brightness'), value: 150, enabled: false },
      { ...newStep('threshold'), value: 66 },
    ]
    const parsed = parsePipelineJson(serializePipeline(steps))
    expect(parsed.map(({ type, value, enabled }) => ({ type, value, enabled }))).toEqual([
      { type: 'brightness', value: 150, enabled: false },
      { type: 'threshold', value: 66, enabled: true },
    ])
    expect(parsed[0].id).not.toBe(steps[0].id)
  })

  it('非法输入抛错：坏 JSON / steps 非数组 / 未知效果类型 / value 非数字', () => {
    expect(() => parsePipelineJson('not json')).toThrow()
    expect(() => parsePipelineJson('{"version":1,"steps":{}}')).toThrow()
    expect(() => parsePipelineJson('{"version":1,"steps":[{"type":"nope","value":1,"enabled":true}]}')).toThrow()
    expect(() => parsePipelineJson('{"version":1,"steps":[{"type":"blur","value":"x","enabled":true}]}')).toThrow()
  })

  it('越界 value 被 clamp 到效果范围', () => {
    const json = '{"version":1,"steps":[{"type":"blur","value":999,"enabled":true},{"type":"pixelate","value":-5,"enabled":true}]}'
    const parsed = parsePipelineJson(json)
    expect(parsed[0].value).toBe(EFFECTS.blur.max)
    expect(parsed[1].value).toBe(EFFECTS.pixelate.min)
  })
})
