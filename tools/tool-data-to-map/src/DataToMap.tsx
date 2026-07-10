import React, { useState } from 'react'
import { Globe2, MapPinned } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import WorldMapPanel from './WorldMapPanel'
import ChinaMapPanel from './ChinaMapPanel'

type Tab = 'world' | 'china'

const DataToMap: React.FC = () => {
  const { t } = useTranslation('toolDataToMap')
  const [tab, setTab] = useState<Tab>('world')

  return (
    <div className="relative min-h-[60vh]">
      <div className="relative z-10 space-y-6 pb-16">
        <PageHero title={t('title')} description={t('description')} />

        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={() => setTab('world')}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'world' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Globe2 className="h-4 w-4" />
            {t('tabs.world')}
          </button>
          <button
            type="button"
            onClick={() => setTab('china')}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'china' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <MapPinned className="h-4 w-4" />
            {t('tabs.china')}
          </button>
        </div>

        {tab === 'world' ? <WorldMapPanel /> : <ChinaMapPanel />}
      </div>
    </div>
  )
}

export default DataToMap
