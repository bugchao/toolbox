// 世界地图：常用简称/俗称 → world.json 中 properties.name（标准中文名）
const worldRegionNameMap: Record<string, string> = {
  沙特: '沙特阿拉伯',
  塔吉克: '塔吉克斯坦',
  印尼: '印度尼西亚',
  所罗门: '所罗门群岛',
  孟加拉: '孟加拉国',
  刚果: '刚果（金）', // 地图有刚果（布）/刚果（金），数据中"刚果"常指刚果（金）
}

export function getStandardWorldRegionName(name: string): string {
  const trimmed = name.trim()
  return worldRegionNameMap[trimmed] ?? trimmed
}

interface WorldGeoJson {
  features?: { properties?: { name?: string } }[]
}

/** 从地图 GeoJSON 中取出全部国家名称，用于把上传数据与全量国家列表合并展示 */
export function getAllWorldCountryNames(worldMapData: unknown): string[] {
  const geo = worldMapData as WorldGeoJson
  if (!geo?.features?.length) return []
  return geo.features.map((f) => f.properties?.name ?? '').filter(Boolean)
}
