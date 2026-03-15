import React from 'react'
import { Card, PageHero, ParticlesBackground, cn } from '@toolbox/ui-kit'

interface SecurityWorkbenchProps {
  title: string
  description: string
  children: React.ReactNode
}

const SecurityWorkbench: React.FC<SecurityWorkbenchProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-indigo-50 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/50">
        <ParticlesBackground preset="network" className="opacity-70" />
        <div className={cn('relative')}>
          <PageHero title={title} description={description} className="py-2" />
        </div>
      </Card>
      {children}
    </div>
  )
}

export default SecurityWorkbench
