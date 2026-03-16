import React from 'react'
import { Card, PageHero, ParticlesBackground } from '@toolbox/ui-kit'

interface IpamWorkbenchProps {
  title: string
  description: string
  children: React.ReactNode
}

const IpamWorkbench: React.FC<IpamWorkbenchProps> = ({ title, description, children }) => {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-emerald-50 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40">
        <ParticlesBackground preset="network" className="opacity-60" />
        <div className="relative py-2">
          <PageHero title={title} description={description} />
        </div>
      </Card>
      {children}
    </div>
  )
}

export default IpamWorkbench
