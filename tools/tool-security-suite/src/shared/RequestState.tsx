import React from 'react'
import { TriangleAlert } from 'lucide-react'
import { Card, Spinner } from '@toolbox/ui-kit'

export const LoadingCard: React.FC<{ text: string }> = ({ text }) => (
  <Card className="text-center">
    <Spinner size="lg" className="mx-auto text-indigo-500" />
    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">{text}</div>
  </Card>
)

export const ErrorCard: React.FC<{ text: string }> = ({ text }) => (
  <Card className="border-rose-200 bg-rose-50/80 dark:border-rose-900 dark:bg-rose-950/30">
    <div className="flex items-start gap-3 text-sm text-rose-700 dark:text-rose-300">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      <div>{text}</div>
    </div>
  </Card>
)
