import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from '@toolbox/ui-kit'
import type { DimensionScore } from './types'
import { formatDimensionData } from './utils'

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#e11d48']

function getColor(score: number) {
  if (score >= 80) return COLORS[3]
  if (score >= 60) return COLORS[2]
  if (score >= 35) return COLORS[1]
  return COLORS[0]
}

interface ScoreBreakdownChartProps {
  t: (key: string) => string
  dimensions: DimensionScore[]
  title: string
}

const ScoreBreakdownChart: React.FC<ScoreBreakdownChartProps> = ({ t, dimensions, title }) => {
  const data = formatDimensionData(t, dimensions)

  return (
    <ChartContainer title={title} height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis type="category" dataKey="label" width={120} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
          formatter={(value: number) => `${value}/100`}
        />
        <Bar dataKey="score" radius={[0, 8, 8, 0]}>
          {data.map((item) => (
            <Cell key={item.name} fill={getColor(item.score)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export default ScoreBreakdownChart
