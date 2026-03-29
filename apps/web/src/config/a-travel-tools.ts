// 旅行工具配置 - Travel Tools
// 包含：行程/预算/清单/时差/距离等工具

import type { ToolEntry } from './tools'
import {
  Plane, Wallet, Percent, Watch, Milestone, Luggage, Navigation,
  Stamp, Backpack, Compass, Languages, BookOpen, ClipboardCheck
} from 'lucide-react'

export const TRAVEL_TOOLS: ToolEntry[] = [
  // 旅行规划（5 个）
  { path: '/travel-checklist', nameKey: 'tools.travel_checklist', icon: ClipboardCheck, categoryKey: 'travel', keywords: ['旅行', 'checklist', '清单', '出行'], i18nNamespace: 'toolTravelChecklist' },
  { path: '/travel-budget', nameKey: 'tools.travel_budget', icon: Wallet, categoryKey: 'travel', keywords: ['旅行', '预算', '费用', '旅游'], i18nNamespace: 'toolTravelBudget' },
  { path: '/split-bill', nameKey: 'tools.split_bill', icon: Percent, categoryKey: 'travel', keywords: ['aa', '分摊', '账单', '聚餐'], i18nNamespace: 'toolSplitBill' },
  { path: '/timezone-calc', nameKey: 'tools.timezone_calc', icon: Watch, categoryKey: 'travel', keywords: ['时差', '时区', '换算', '时间'], i18nNamespace: 'toolTimezoneCalc' },
  { path: '/distance-calc', nameKey: 'tools.distance_calc', icon: Milestone, categoryKey: 'travel', keywords: ['距离', '地图', '城市', '经纬度'], i18nNamespace: 'toolDistanceCalc' },

  // 旅行实用（5 个）
  { path: '/packing-list', nameKey: 'tools.packing_list', icon: Luggage, categoryKey: 'travel', keywords: ['行李', '清单', '打包', '出行'], i18nNamespace: 'toolPackingList' },
  { path: '/travel-cost-estimate', nameKey: 'tools.travel_cost_estimate', icon: Wallet, categoryKey: 'travel', keywords: ['旅行', '消费', '预算', '估算'], i18nNamespace: 'toolTravelCostEstimate' },
  { path: '/multi-city-route', nameKey: 'tools.multi_city_route', icon: Navigation, categoryKey: 'travel', keywords: ['路线', '城市', '行程', '优化'], i18nNamespace: 'toolMultiCityRoute' },
  { path: '/visa-info', nameKey: 'tools.visa_info', icon: Stamp, categoryKey: 'travel', keywords: ['签证', '免签', '出行', 'visa'], i18nNamespace: 'toolVisaInfo' },
  { path: '/trip-planner', nameKey: 'tools.trip_planner', icon: Backpack, categoryKey: 'travel', keywords: ['行程', '旅行', '规划', 'trip'], i18nNamespace: 'toolTripPlanner' },
  { path: '/day-trip', nameKey: 'tools.day_trip', icon: Compass, categoryKey: 'travel', keywords: ['一日游', '城市', '景点', 'day trip'], i18nNamespace: 'toolDayTrip' },
  { path: '/travel-translator', nameKey: 'tools.travel_translator', icon: Languages, categoryKey: 'travel', keywords: ['翻译', '旅行', '短语', 'translator'], i18nNamespace: 'toolTravelTranslator' },
]
