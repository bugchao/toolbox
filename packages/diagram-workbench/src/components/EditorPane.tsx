import React from 'react'
import { Input, Empty } from 'antd'
import { useStore } from '../state/store'

const { TextArea } = Input

/** 源代码编辑器（Mermaid / PlantUML）；draw.io 显示占位（iframe 在 Section 6 集成后接入）。 */
export const EditorPane: React.FC = () => {
  const { state, dispatch, selected } = useStore()

  if (!selected) {
    return (
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No diagram selected" />
      </section>
    )
  }

  if (selected.engine === 'drawio') {
    return (
      <section style={{ flex: 1, padding: 24 }}>
        <Empty
          description={
            <>
              draw.io editor pane —— 集成 iframe 留 Phase 4 接入。
              <br />
              当前 XML 长度：{selected.source.length}
            </>
          }
        />
      </section>
    )
  }

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 8 }}>
      <Input
        size="small"
        value={selected.title}
        onChange={(e) => dispatch({ type: 'UPDATE_TITLE', id: selected.id, title: e.target.value })}
        style={{ marginBottom: 6 }}
      />
      <TextArea
        value={selected.source}
        onChange={(e) =>
          dispatch({ type: 'UPDATE_SOURCE', id: selected.id, source: e.target.value })
        }
        style={{
          flex: 1,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 13,
          resize: 'none',
        }}
        autoSize={false}
        spellCheck={false}
      />
      <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
        Engine: <strong>{selected.engine}</strong> · {selected.source.length} chars · last edited{' '}
        {new Date(selected.updatedAt).toLocaleTimeString()}
        {state.dirty ? ' · unsaved' : ''}
      </div>
    </section>
  )
}
