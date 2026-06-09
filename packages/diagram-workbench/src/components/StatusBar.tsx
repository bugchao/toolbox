import React from 'react'
import { useStore } from '../state/store'

const STATUS_TEXT = {
  idle: 'Ready',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
} as const

const STATUS_COLOR = {
  idle: '#888',
  saving: '#1890ff',
  saved: '#52c41a',
  error: '#ff4d4f',
} as const

export const StatusBar: React.FC = () => {
  const { state } = useStore()
  return (
    <footer
      style={{
        borderTop: '1px solid #e0e0e0',
        padding: '4px 12px',
        fontSize: 12,
        display: 'flex',
        justifyContent: 'space-between',
        background: '#fff',
      }}
    >
      <span>{state.workspace.documents.length} diagram(s)</span>
      <span style={{ color: STATUS_COLOR[state.saveStatus] }}>
        {STATUS_TEXT[state.saveStatus]}
        {state.dirty ? ' · unsaved changes' : ''}
      </span>
    </footer>
  )
}
