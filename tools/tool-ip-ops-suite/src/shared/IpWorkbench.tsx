import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, PageHero, ParticlesBackground } from '@toolbox/ui-kit'

interface IpWorkbenchProps {
  title: string
  description: string
  icon: LucideIcon
  children: React.ReactNode
}

const IpWorkbench: React.FC<IpWorkbenchProps> = ({ title, description, icon, children }) => {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-indigo-100 via-white to-cyan-50 dark:border-slate-700/80 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40">
        <ParticlesBackground preset="network" className="opacity-60" />
        <div className="relative py-2">
          <PageHero icon={icon} title={title} description={description} />
        </div>
      </Card>
      {children}
    </div>
  )
}

export default IpWorkbench
