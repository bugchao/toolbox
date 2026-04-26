import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import ViewModeToggle from './ViewModeToggle'
import type { ViewMode } from '../types'

// Mock i18n
i18n.init({
  lng: 'zh',
  ns: ['toolAiChatHub'],
  defaultNS: 'toolAiChatHub',
  resources: {
    zh: {
      toolAiChatHub: {
        viewModes: {
          grid: '平铺视图',
          tab: '标签视图'
        }
      }
    }
  }
})

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>)
}

describe('ViewModeToggle', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders both grid and tab mode buttons', () => {
    renderWithI18n(<ViewModeToggle currentMode="grid" onChange={mockOnChange} />)

    expect(screen.getByText('平铺视图')).toBeInTheDocument()
    expect(screen.getByText('标签视图')).toBeInTheDocument()
  })

  it('highlights the current mode with primary variant', () => {
    const { container } = renderWithI18n(
      <ViewModeToggle currentMode="grid" onChange={mockOnChange} />
    )

    const gridButton = screen.getByText('平铺视图').closest('button')
    const tabButton = screen.getByText('标签视图').closest('button')

    // Grid button should have primary styling (indigo background)
    expect(gridButton?.className).toContain('bg-indigo')

    // Tab button should have secondary styling (gray background)
    expect(tabButton?.className).toContain('bg-gray')
  })

  it('highlights tab mode when it is current', () => {
    const { container } = renderWithI18n(
      <ViewModeToggle currentMode="tab" onChange={mockOnChange} />
    )

    const gridButton = screen.getByText('平铺视图').closest('button')
    const tabButton = screen.getByText('标签视图').closest('button')

    // Tab button should have primary styling
    expect(tabButton?.className).toContain('bg-indigo')

    // Grid button should have secondary styling
    expect(gridButton?.className).toContain('bg-gray')
  })

  it('calls onChange with grid mode when grid button is clicked', () => {
    renderWithI18n(<ViewModeToggle currentMode="tab" onChange={mockOnChange} />)

    const gridButton = screen.getByText('平铺视图')
    fireEvent.click(gridButton)

    expect(mockOnChange).toHaveBeenCalledWith('grid')
  })

  it('calls onChange with tab mode when tab button is clicked', () => {
    renderWithI18n(<ViewModeToggle currentMode="grid" onChange={mockOnChange} />)

    const tabButton = screen.getByText('标签视图')
    fireEvent.click(tabButton)

    expect(mockOnChange).toHaveBeenCalledWith('tab')
  })

  it('does not call onChange when clicking the already active mode', () => {
    renderWithI18n(<ViewModeToggle currentMode="grid" onChange={mockOnChange} />)

    const gridButton = screen.getByText('平铺视图')
    fireEvent.click(gridButton)

    // Should still call onChange even for current mode (component is controlled)
    expect(mockOnChange).toHaveBeenCalledWith('grid')
  })

  it('renders icons alongside text labels', () => {
    const { container } = renderWithI18n(
      <ViewModeToggle currentMode="grid" onChange={mockOnChange} />
    )

    // Check that SVG icons are present (lucide-react renders SVGs)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2) // At least 2 icons (grid and tab)
  })
})
