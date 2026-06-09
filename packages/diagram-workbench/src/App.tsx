import React, { useEffect } from 'react'
import { ConfigProvider } from 'antd'
import { StoreProvider, useStore } from './state/store'
import { Sidebar } from './components/Sidebar'
import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'
import { SettingsPanel } from './components/SettingsPanel'
import { StatusBar } from './components/StatusBar'
import { Toolbar } from './components/Toolbar'

/** Cmd/Ctrl + S 触发立即保存。 */
const KeyboardShortcuts: React.FC = () => {
  const { saveNow } = useStore()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        void saveNow()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [saveNow])
  return null
}

const Layout: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: 0 }}>
    <Toolbar />
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', minWidth: 0 }}>
        <EditorPane />
        <div style={{ width: 1, background: '#e0e0e0' }} />
        <PreviewPane />
      </main>
      <SettingsPanel />
    </div>
    <StatusBar />
    <KeyboardShortcuts />
  </div>
)

const App: React.FC = () => (
  <ConfigProvider>
    <StoreProvider>
      <Layout />
    </StoreProvider>
  </ConfigProvider>
)

export default App
