import { describe, expect, it } from 'vitest'
import { parseRegionFile, RegionParseError } from './regionData'
import { getStandardChinaRegionName } from './chinaRegionNames'
import { getStandardWorldRegionName } from './worldRegionNames'

const identity = (name: string) => name

describe('parseRegionFile', () => {
  it('parses a JSON array with name/value fields', () => {
    const data = parseRegionFile('[{"name":"广东","value":10}]', 'data.json', identity)
    expect(data).toEqual([{ name: '广东', value: 10 }])
  })

  it('parses a JSON object map into name/value pairs', () => {
    const data = parseRegionFile('{"广东":10,"北京":20}', 'data.json', identity)
    expect(data).toEqual([
      { name: '广东', value: 10 },
      { name: '北京', value: 20 },
    ])
  })

  it('parses CSV with name/value headers', () => {
    const csv = 'name,value\n广东,10\n北京,20\n'
    const data = parseRegionFile(csv, 'data.csv', identity)
    expect(data).toEqual([
      { name: '广东', value: 10 },
      { name: '北京', value: 20 },
    ])
  })

  it('throws missingColumns when CSV lacks recognizable headers', () => {
    const csv = 'foo,bar\n1,2\n'
    expect(() => parseRegionFile(csv, 'data.csv', identity)).toThrow(RegionParseError)
    try {
      parseRegionFile(csv, 'data.csv', identity)
    } catch (err) {
      expect((err as RegionParseError).code).toBe('missingColumns')
    }
  })

  it('throws unsupportedFormat for other extensions', () => {
    expect(() => parseRegionFile('irrelevant', 'data.txt', identity)).toThrow(RegionParseError)
  })

  it('throws noData when the parsed result is empty', () => {
    expect(() => parseRegionFile('[]', 'data.json', identity)).toThrow(RegionParseError)
  })

  it('applies the standardize callback to each name', () => {
    const data = parseRegionFile('[{"name":"广东","value":1}]', 'data.json', getStandardChinaRegionName)
    expect(data).toEqual([{ name: '广东省', value: 1 }])
  })
})

describe('getStandardChinaRegionName', () => {
  it('maps municipalities directly', () => {
    expect(getStandardChinaRegionName('北京')).toBe('北京市')
  })

  it('appends 省 for ordinary provinces', () => {
    expect(getStandardChinaRegionName('广东')).toBe('广东省')
  })

  it('passes through names that already carry a suffix', () => {
    expect(getStandardChinaRegionName('广东省')).toBe('广东省')
  })

  it('maps cities to their parent province', () => {
    expect(getStandardChinaRegionName('深圳')).toBe('广东省')
  })
})

describe('getStandardWorldRegionName', () => {
  it('maps known aliases', () => {
    expect(getStandardWorldRegionName('沙特')).toBe('沙特阿拉伯')
  })

  it('passes through unknown names unchanged', () => {
    expect(getStandardWorldRegionName('法国')).toBe('法国')
  })
})
