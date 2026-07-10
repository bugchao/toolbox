export interface RegionData {
  name: string
  value: number
}

export type RegionParseErrorCode = 'unsupportedFormat' | 'missingColumns' | 'noData'

export class RegionParseError extends Error {
  code: RegionParseErrorCode
  constructor(code: RegionParseErrorCode) {
    super(code)
    this.code = code
  }
}

/**
 * 解析 CSV / JSON 区域数据文件为 { name, value }[]。
 * name 已经过 standardize() 转换为地图 GeoJSON 使用的标准名称。
 */
export function parseRegionFile(
  content: string,
  filename: string,
  standardize: (name: string) => string
): RegionData[] {
  let data: RegionData[] = []

  if (filename.endsWith('.json')) {
    const json = JSON.parse(content)
    if (Array.isArray(json)) {
      data = json.map((item) => ({
        name: standardize(String(item.name ?? item.region ?? item.province ?? item.国家 ?? item.country ?? '')),
        value: Number(item.value ?? item.count ?? 0),
      }))
    } else if (json && typeof json === 'object') {
      data = Object.entries(json).map(([name, value]) => ({
        name: standardize(name),
        value: Number(value),
      }))
    }
  } else if (filename.endsWith('.csv')) {
    const lines = content.split('\n').filter((line) => line.trim())
    const headers = (lines[0] ?? '').split(',').map((h) => h.trim())
    const nameIndex = headers.findIndex(
      (h) => h === '国家' || /name|region|province/i.test(h)
    )
    const valueIndex = headers.findIndex((h) => /value|count|data/i.test(h))

    if (nameIndex === -1 || valueIndex === -1) {
      throw new RegionParseError('missingColumns')
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      if (values[nameIndex] && values[valueIndex]) {
        data.push({
          name: standardize(values[nameIndex]),
          value: Number(values[valueIndex]) || 0,
        })
      }
    }
  } else {
    throw new RegionParseError('unsupportedFormat')
  }

  if (data.length === 0) {
    throw new RegionParseError('noData')
  }

  return data
}
