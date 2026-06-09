import React from 'react'
import { Button, List, Tag, Tooltip } from 'antd'
import { DeleteOutlined, FileAddOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import { useStore } from '../state/store'
import type { DiagramEngine } from '../domain/types'

const ENGINE_LABELS: Record<DiagramEngine, string> = {
  mermaid: 'Mermaid',
  plantuml: 'PlantUML',
  drawio: 'draw.io',
}

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useStore()
  const docs = state.workspace.documents

  return (
    <aside style={{ width: 240, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 6 }}>
        <Tooltip title="New Mermaid">
          <Button
            size="small"
            icon={<FileAddOutlined />}
            onClick={() => dispatch({ type: 'CREATE', engine: 'mermaid' })}
          >
            Mermaid
          </Button>
        </Tooltip>
        <Tooltip title="New PlantUML">
          <Button
            size="small"
            onClick={() => dispatch({ type: 'CREATE', engine: 'plantuml' })}
          >
            PlantUML
          </Button>
        </Tooltip>
        <Tooltip title="New draw.io">
          <Button
            size="small"
            onClick={() => dispatch({ type: 'CREATE', engine: 'drawio' })}
          >
            draw.io
          </Button>
        </Tooltip>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <List
          size="small"
          dataSource={docs}
          locale={{ emptyText: 'No diagrams yet' }}
          renderItem={(doc) => {
            const isSelected = doc.id === state.workspace.selectedId
            const isMain = doc.id === state.workspace.mainId
            return (
              <List.Item
                key={doc.id}
                onClick={() => dispatch({ type: 'SELECT', id: doc.id })}
                style={{
                  cursor: 'pointer',
                  background: isSelected ? '#e6f4ff' : undefined,
                  padding: '6px 12px',
                }}
                actions={[
                  <Tooltip key="main" title={isMain ? 'Main diagram' : 'Set as main'}>
                    <Button
                      type="text"
                      size="small"
                      icon={isMain ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'SET_MAIN', id: doc.id })
                      }}
                    />
                  </Tooltip>,
                  <Tooltip key="del" title="Delete">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'DELETE', id: doc.id })
                      }}
                    />
                  </Tooltip>,
                ]}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.title}
                  </div>
                  <Tag style={{ marginTop: 2 }}>{ENGINE_LABELS[doc.engine]}</Tag>
                </div>
              </List.Item>
            )
          }}
        />
      </div>
    </aside>
  )
}
