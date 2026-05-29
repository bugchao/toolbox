import React, { useState } from 'react'
import { Card, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { FileText, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TextTab from './components/TextTab'
import ImageTab from './components/ImageTab'

type Tab = 'text' | 'image'

const AiDetector: React.FC = () => {
  const { t } = useTranslation('toolAiDetector')
  const [tab, setTab] = useState<Tab>('text')

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="warning"
          title={t('disclaimer.title')}
          description={t('disclaimer.body')}
        />

        <Card padded={false}>
          <div className="border-b border-gray-200 dark:border-gray-700 px-2 pt-2">
            <div className="flex gap-1">
              <TabButton active={tab === 'text'} onClick={() => setTab('text')}>
                <FileText className="h-4 w-4" />
                {t('tabs.text')}
              </TabButton>
              <TabButton active={tab === 'image'} onClick={() => setTab('image')}>
                <ImageIcon className="h-4 w-4" />
                {t('tabs.image')}
              </TabButton>
            </div>
          </div>
          <div className="p-5">{tab === 'text' ? <TextTab /> : <ImageTab />}</div>
        </Card>
      </div>
    </div>
  )
}

const TabButton: React.FC<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'inline-flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
      active
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60',
    ].join(' ')}
  >
    {children}
  </button>
)

export default AiDetector
