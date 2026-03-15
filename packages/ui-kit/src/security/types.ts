export type RiskLevel = 'info' | 'low' | 'medium' | 'high' | 'critical'

export interface InsightItem {
  id?: string
  title: string
  description: string
  level: RiskLevel
}
