// 区域名称映射表：将常见名称映射到中国地图 GeoJSON 中的标准名称（阿里云 DataV 格式）
const regionNameMap: Record<string, string> = {
  北京: '北京市',
  上海: '上海市',
  天津: '天津市',
  重庆: '重庆市',

  广东: '广东省',
  河南: '河南省',
  山东: '山东省',
  江苏: '江苏省',
  云南: '云南省',
  黑龙江: '黑龙江省',
  江西: '江西省',
  山西: '山西省',
  陕西: '陕西省',
  浙江: '浙江省',
  贵州: '贵州省',
  河北: '河北省',
  福建: '福建省',
  安徽: '安徽省',
  湖北: '湖北省',
  四川: '四川省',
  吉林: '吉林省',
  青海: '青海省',
  辽宁: '辽宁省',
  甘肃: '甘肃省',
  湖南: '湖南省',

  内蒙古: '内蒙古自治区',
  新疆: '新疆维吾尔自治区',
  西藏: '西藏自治区',
  宁夏: '宁夏回族自治区',
  广西: '广西壮族自治区',

  香港: '香港特别行政区',
  澳门: '澳门特别行政区',

  深圳: '广东省', // 深圳属于广东省，按省级地图归并
}

const specialRegions: Record<string, string> = {
  北京: '北京市',
  上海: '上海市',
  天津: '天津市',
  重庆: '重庆市',
  内蒙古: '内蒙古自治区',
  新疆: '新疆维吾尔自治区',
  西藏: '西藏自治区',
  宁夏: '宁夏回族自治区',
  广西: '广西壮族自治区',
  香港: '香港特别行政区',
  澳门: '澳门特别行政区',
}

/** 把常见简称转换成中国地图 GeoJSON 使用的标准名称 */
export function getStandardChinaRegionName(name: string): string {
  const trimmed = name.trim()

  if (regionNameMap[trimmed]) return regionNameMap[trimmed]

  if (trimmed.includes('省') || trimmed.includes('市') || trimmed.includes('自治区') || trimmed.includes('特别行政区')) {
    return trimmed
  }

  if (specialRegions[trimmed]) return specialRegions[trimmed]

  return `${trimmed}省`
}
