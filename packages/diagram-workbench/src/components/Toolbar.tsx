import React, { useRef } from 'react'
import { Button, Dropdown, Space, Tooltip, message } from 'antd'
import { DownloadOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { useStore } from '../state/store'
import { decodeWorkspace, downloadAsFile, encodeWorkspace } from '../storage/json'
import { downloadSource, downloadSvg, importSourceFile } from '../storage/export'
import { adapterFor } from '../adapters/registry'

const WORKSPACE_JSON_RE = /\.json$/i

export const Toolbar: React.FC = () => {
  const { state, dispatch, saveNow, selected } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msgApi, contextHolder] = message.useMessage()

  const onImportClick = () => fileRef.current?.click()
  const onImportFile = async (file: File) => {
    if (WORKSPACE_JSON_RE.test(file.name)) {
      const text = await file.text()
      const r = decodeWorkspace(text)
      if (r.ok) {
        dispatch({ type: 'IMPORT_WORKSPACE', workspace: r.workspace })
        msgApi.success(`Imported workspace with ${r.workspace.documents.length} diagram(s)`)
      } else {
        msgApi.error(`Workspace JSON: ${r.message}`)
      }
    } else {
      const r = await importSourceFile(file)
      if (r.ok) {
        dispatch({ type: 'IMPORT_DOCUMENT', document: r.document })
        msgApi.success(`Imported ${r.document.engine} diagram: ${r.document.title}`)
      } else {
        msgApi.error(r.message)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const onExportWorkspaceJson = () => {
    downloadAsFile(`workspace-${new Date().toISOString().slice(0, 10)}.json`, encodeWorkspace(state.workspace))
  }
  const onExportSource = () => {
    if (!selected) { msgApi.warning('No diagram selected'); return }
    downloadSource(selected)
  }
  const onExportSvg = async () => {
    if (!selected) { msgApi.warning('No diagram selected'); return }
    if (selected.engine === 'drawio') {
      msgApi.warning('Use draw.io toolbar to export SVG; this pane does not host its renderer.')
      return
    }
    const adapter = adapterFor(selected.engine)
    const r = await adapter.render(selected.source, {
      theme: selected.settings.theme,
      serverUrl: selected.settings.plantumlServerUrl,
    })
    if (r.ok) {
      downloadSvg(selected, r.svg)
    } else {
      msgApi.error(`Render failed: ${r.message}`)
    }
  }

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault()
        onImportClick()
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault()
        void onExportSource()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const exportMenu = {
    items: [
      { key: 'src', label: 'Source file (current diagram)' },
      { key: 'svg', label: 'SVG (current diagram)' },
      { key: 'ws', label: 'Workspace JSON (all)' },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'src') onExportSource()
      else if (key === 'svg') void onExportSvg()
      else onExportWorkspaceJson()
    },
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
      {contextHolder}
      <strong>Diagram Workbench</strong>
      <Space size="small">
        <Tooltip title="Import (Cmd/Ctrl+O) — workspace JSON or .mmd/.puml/.drawio">
          <Button size="small" icon={<UploadOutlined />} onClick={onImportClick}>Import</Button>
        </Tooltip>
        <Dropdown menu={exportMenu}>
          <Button size="small" icon={<DownloadOutlined />}>
            Export
          </Button>
        </Dropdown>
        <Tooltip title="Save now (Cmd/Ctrl+S)">
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
          accept=".json,.mmd,.mermaid,.puml,.plantuml,.drawio,.xml,application/json"
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
