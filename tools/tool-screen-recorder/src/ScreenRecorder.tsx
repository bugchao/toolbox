import React from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const ScreenRecorder: React.FC = () => {
  const { t } = useTranslation('toolScreenRecorder')

  return (
    <div className="relative min-h-[60vh]">
      {/* 粒子背景，受应用层 BackgroundVisibilityProvider 全局开关控制 */}
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero
          title={t('title')}
          description={t('description')}
        />
        {/* TODO: 实现工具内容 */}
      </div>
    </div>
  )
}

export default ScreenRecorder
