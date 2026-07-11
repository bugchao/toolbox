import { describe, expect, it } from 'vitest'
import { EFFECTS } from './effects'
import { newStep } from './pipeline'
import { parsePipelineJson, sanitizeSteps, serializePipeline } from './storage'

describe('storage', () => {
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

  it('sanitizeSteps 直接校验持久化数据：坏效果抛错、越界 clamp', () => {
    expect(() => sanitizeSteps([{ type: 'nope', value: 1, enabled: true }])).toThrow()
    const ok = sanitizeSteps([{ type: 'blur', value: 999, enabled: true }])
    expect(ok[0].value).toBe(EFFECTS.blur.max)
    expect(ok[0].enabled).toBe(true)
  })
})
