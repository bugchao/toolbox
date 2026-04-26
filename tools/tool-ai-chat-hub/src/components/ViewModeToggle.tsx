import React from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, Columns } from 'lucide-react'
import { Button } from '@toolbox/ui-kit'
import type { ViewMode } from '../types'

export interface ViewModeToggleProps {
  currentMode: ViewMode
  onChange: (mode: ViewMode) => void
}

/**
 * View mode toggle component
 * Allows switching between grid and tab view modes
 */
const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ currentMode, onChange }) => {
  const { t } = useTranslation('toolAiChatHub')

  return (
    <div className="inline-flex rounded-lg shadow-sm" role="group">
      <Button
        variant={currentMode === 'grid' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => onChange('grid')}
        className="rounded-r-none flex items-center gap-2"
      >
        <LayoutGrid size={16} />
        <span>{t('viewModes.grid')}</span>
      </Button>
      <Button
        variant={currentMode === 'tab' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => onChange('tab')}
        className="rounded-l-none flex items-center gap-2"
      >
        <Columns size={16} />
        <span>{t('viewModes.tab')}</span>
      </Button>
    </div>
  )
}

export default ViewModeToggle
