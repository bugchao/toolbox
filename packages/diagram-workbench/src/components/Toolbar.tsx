import React, { useRef } from 'react'
import { Button, Space, Tooltip } from 'antd'
import { DownloadOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { useStore } from '../state/store'
import { decodeWorkspace, downloadAsFile, encodeWorkspace } from '../storage/json'

export const Toolbar: React.FC = () => {
  const { state, dispatch, saveNow } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const onImport = () => fileRef.current?.click()
  const onImportFile = async (file: File) => {
    const text = await file.text()
    const r = decodeWorkspace(text)
    if (r.ok) {
      dispatch({ type: 'IMPORT_WORKSPACE', workspace: r.workspace })
    } else {
      // 简化：alert；未来接 antd message
      window.alert(`Import failed: ${r.message}`)
    }
    if (fileRef.current) fileRef.current.value = ''
  }
  const onExport = () => {
    downloadAsFile(`workspace-${new Date().toISOString().slice(0, 10)}.json`, encodeWorkspace(state.workspace))
  }

  return (
    <header style={{
      padding: '8px 12px',
      borderBottom: '1px solid #e0e0e0',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <strong>Diagram Workbench</strong>
      <Space size="small">
        <Tooltip title="Import workspace JSON">
          <Button size="small" icon={<UploadOutlined />} onClick={onImport}>Import</Button>
        </Tooltip>
        <Tooltip title="Export workspace JSON">
          <Button size="small" icon={<DownloadOutlined />} onClick={onExport}>Export</Button>
        </Tooltip>
        <Tooltip title="Save now (Cmd/Ctrl+S also works)">
          <Button
            size="small"
            type="primary"
            icon={<SaveOutlined />}
            disabled={!state.dirty || state.saveStatus === 'saving'}
            onClick={() => void saveNow()}
          >
            Save
          </Button>
        </Tooltip>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onImportFile(f)
          }}
        />
      </Space>
    </header>
  )
}
