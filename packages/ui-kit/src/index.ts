/**
 * @toolbox/ui-kit
 * 公共 UI 组件，统一主题（浅色/暗色由应用层 html.dark 控制，组件内使用 Tailwind dark:）
 * 含：基础组件、动画(motion)、弹簧(react-spring)、粒子背景、图表(recharts)、shadcn 风格 cn()
 */
export { default as Button } from './Button'
export type { ButtonProps } from './Button'
export { default as Card } from './Card'
export type { CardProps } from './Card'
export { default as Input } from './Input'
export type { InputProps } from './Input'
export { default as TextArea } from './TextArea'
export type { TextAreaProps } from './TextArea'
export { default as DatePicker } from './DatePicker'
export type { DatePickerProps } from './DatePicker'
export { default as PageHero } from './PageHero'
export type { PageHeroProps } from './PageHero'
export { default as DataTable } from './DataTable'
export type { DataTableProps, DataTableColumn } from './DataTable'
export { default as PropertyGrid } from './PropertyGrid'
export type { PropertyGridProps, PropertyGridItem } from './PropertyGrid'
export { default as NoticeCard } from './NoticeCard'
export type { NoticeCardProps } from './NoticeCard'
export { default as DnsQueryForm } from './DnsQueryForm'
export type { DnsQueryFormProps } from './DnsQueryForm'
export { default as QueryHistory } from './QueryHistory'
export type { QueryHistoryProps } from './QueryHistory'
export { useQueryHistory } from './hooks/useQueryHistory'
export type { QueryHistoryRecord } from './hooks/useQueryHistory'
export { default as ToolTabView } from './ToolTabView'
export type { ToolTabViewProps } from './ToolTabView'
export { default as ProgressRing } from './ProgressRing'
export type { ProgressRingProps } from './ProgressRing'
export { default as TagInput } from './TagInput'
export type { TagInputProps } from './TagInput'
export { default as StatusBadge } from './StatusBadge'
export type { StatusBadgeProps, StatusLevel } from './StatusBadge'
export { default as Timeline } from './Timeline'
export type { TimelineProps, TimelineItem } from './Timeline'
export { theme } from './theme'
export { cn } from './lib/cn'

export { FadeIn, StaggerChildren } from './animations'
export type { FadeInProps, StaggerChildrenProps } from './animations'

export { FlipCard, Parallax } from './spring'
export type { FlipCardProps, ParallaxProps } from './spring'

export {
  GlobalBackground,
  ParticlesBackground,
  BackgroundVisibilityProvider,
  useBackgroundVisibility,
  particlesPresets,
} from './background'
export type {
  GlobalBackgroundProps,
  ParticlesBackgroundProps,
  BackgroundVisibilityProviderProps,
  BackgroundVisibilityContextValue,
  ParticlesPresetKey,
} from './background'

export { ChartContainer } from './charts'
export type { ChartContainerProps } from './charts'
export {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from './charts'

export { RiskBadge, MetricCard, InsightList } from './security'
export type {
  RiskBadgeProps,
  MetricCardProps,
  InsightListProps,
  RiskLevel,
  InsightItem,
} from './security'
