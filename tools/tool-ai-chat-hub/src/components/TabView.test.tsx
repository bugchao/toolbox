import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TabView from './TabView'

describe('TabView', () => {
  const mockTabs = [
    { label: 'Tab 1', content: <div data-testid="content-1">Content 1</div> },
    { label: 'Tab 2', content: <div data-testid="content-2">Content 2</div> },
    { label: 'Tab 3', content: <div data-testid="content-3">Content 3</div> }
  ]

  it('renders all tab labels', () => {
    render(<TabView tabs={mockTabs} />)

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('displays first tab content by default', () => {
    render(<TabView tabs={mockTabs} />)

    expect(screen.getByTestId('content-1')).toBeInTheDocument()
    expect(screen.queryByTestId('content-2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('content-3')).not.toBeInTheDocument()
  })

  it('switches content when clicking different tab', () => {
    render(<TabView tabs={mockTabs} />)

    // Initially shows first tab
    expect(screen.getByTestId('content-1')).toBeInTheDocument()

    // Click second tab
    fireEvent.click(screen.getByText('Tab 2'))

    // Should show second tab content
    expect(screen.queryByTestId('content-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('content-2')).toBeInTheDocument()
    expect(screen.queryByTestId('content-3')).not.toBeInTheDocument()
  })

  it('switches to third tab correctly', () => {
    render(<TabView tabs={mockTabs} />)

    // Click third tab
    fireEvent.click(screen.getByText('Tab 3'))

    // Should show third tab content
    expect(screen.queryByTestId('content-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('content-2')).not.toBeInTheDocument()
    expect(screen.getByTestId('content-3')).toBeInTheDocument()
  })

  it('highlights active tab', () => {
    render(<TabView tabs={mockTabs} />)

    const tab1 = screen.getByText('Tab 1').closest('button')
    const tab2 = screen.getByText('Tab 2').closest('button')

    // First tab should be active initially
    expect(tab1?.className).toContain('border-indigo')

    // Click second tab
    fireEvent.click(screen.getByText('Tab 2'))

    // Second tab should now be active
    expect(tab2?.className).toContain('border-indigo')
  })

  it('handles empty tabs array', () => {
    const { container } = render(<TabView tabs={[]} />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('handles single tab', () => {
    const singleTab = [
      { label: 'Only Tab', content: <div data-testid="only-content">Only Content</div> }
    ]

    render(<TabView tabs={singleTab} />)

    expect(screen.getByText('Only Tab')).toBeInTheDocument()
    expect(screen.getByTestId('only-content')).toBeInTheDocument()
  })

  it('maintains tab state across multiple clicks', () => {
    render(<TabView tabs={mockTabs} />)

    // Click through tabs
    fireEvent.click(screen.getByText('Tab 2'))
    expect(screen.getByTestId('content-2')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tab 3'))
    expect(screen.getByTestId('content-3')).toBeInTheDocument()

    // Go back to first tab
    fireEvent.click(screen.getByText('Tab 1'))
    expect(screen.getByTestId('content-1')).toBeInTheDocument()
  })
})
