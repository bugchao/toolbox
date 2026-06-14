import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoreProvider } from '../state/store'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'

function withStore(node: React.ReactNode) {
  return render(<StoreProvider>{node}</StoreProvider>)
}

describe('Sidebar', () => {
  it('mounts with a default Mermaid diagram visible', () => {
    withStore(<Sidebar />)
    // default workspace 包含一个 Untitled Mermaid（多处匹配，用 getAllByText）
    const hits = screen.getAllByText(/Mermaid/i)
    expect(hits.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Untitled Mermaid')).toBeInTheDocument()
  })

  it('creates a new PlantUML diagram when the PlantUML button is clicked', () => {
    withStore(<Sidebar />)
    fireEvent.click(screen.getByRole('button', { name: /^PlantUML$/i }))
    expect(screen.getByText(/Untitled plantuml/i)).toBeInTheDocument()
  })
})

describe('StatusBar', () => {
  it('shows diagram count', () => {
    withStore(<StatusBar />)
    expect(screen.getByText(/1 diagram\(s\)/i)).toBeInTheDocument()
  })
})
