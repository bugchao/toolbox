import React from 'react'
import { Card, Empty, Input, InputNumber, Select } from 'antd'
import { useStore } from '../state/store'
import { DEFAULT_SETTINGS, type DiagramSettings } from '../domain/types'

export const SettingsPanel: React.FC = () => {
  const { selected, dispatch } = useStore()

  if (!selected) {
    return (
      <aside style={{ width: 280, borderLeft: '1px solid #e0e0e0', padding: 12 }}>
        <Empty description="No selection" />
      </aside>
    )
  }

  const s = selected.settings
  const patch = (next: Partial<DiagramSettings>) =>
    dispatch({ type: 'UPDATE_SETTINGS', id: selected.id, patch: next })

  return (
    <aside style={{ width: 280, borderLeft: '1px solid #e0e0e0', padding: 12, overflowY: 'auto' }}>
      <Card size="small" title="Diagram settings">
        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Theme</label>
        <Select
          size="small"
          value={s.theme ?? DEFAULT_SETTINGS.theme}
          style={{ width: '100%', marginBottom: 8 }}
          onChange={(v) => patch({ theme: v })}
          options={[
            { value: 'default', label: 'Default' },
            { value: 'dark', label: 'Dark' },
            { value: 'forest', label: 'Forest' },
            { value: 'neutral', label: 'Neutral' },
          ]}
        />

        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Background</label>
        <Input
          size="small"
          placeholder="#fafafa or transparent"
          value={s.background ?? ''}
          onChange={(e) => patch({ background: e.target.value })}
          style={{ marginBottom: 8 }}
        />

        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Preview scale</label>
        <InputNumber
          size="small"
          min={0.25}
          max={3}
          step={0.1}
          value={s.previewScale ?? 1}
          onChange={(v) => patch({ previewScale: typeof v === 'number' ? v : 1 })}
          style={{ width: '100%', marginBottom: 8 }}
        />

        {selected.engine === 'plantuml' && (
          <>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
              PlantUML server URL
            </label>
            <Input
              size="small"
              placeholder={DEFAULT_SETTINGS.plantumlServerUrl}
              value={s.plantumlServerUrl ?? ''}
              onChange={(e) => patch({ plantumlServerUrl: e.target.value })}
              style={{ marginBottom: 4 }}
            />
            <div style={{ fontSize: 11, color: '#c69026', marginBottom: 8 }}>
              ⚠ 公网 server 会接收你的源码；默认指向 localhost。
            </div>
          </>
        )}

        {selected.engine === 'drawio' && (
          <>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>draw.io embed URL</label>
            <Input
              size="small"
              placeholder={DEFAULT_SETTINGS.drawioUrl}
              value={s.drawioUrl ?? ''}
              onChange={(e) => patch({ drawioUrl: e.target.value })}
              style={{ marginBottom: 8 }}
            />
          </>
        )}
      </Card>
    </aside>
  )
}
