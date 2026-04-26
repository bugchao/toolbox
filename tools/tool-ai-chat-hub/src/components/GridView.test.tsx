import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GridView from './GridView'

describe('GridView', () => {
  it('renders all children correctly', () => {
    render(
      <GridView>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </GridView>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('applies grid layout classes', () => {
    const { container } = render(
      <GridView>
        <div>Child</div>
      </GridView>
    )

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer.className).toContain('grid')
  })

  it('handles empty children gracefully', () => {
    const { container } = render(<GridView />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer.children.length).toBe(0)
  })

  it('renders single child correctly', () => {
    render(
      <GridView>
        <div data-testid="only-child">Only Child</div>
      </GridView>
    )

    expect(screen.getByTestId('only-child')).toBeInTheDocument()
  })

  it('renders many children in grid layout', () => {
    const children = Array.from({ length: 8 }, (_, i) => (
      <div key={i} data-testid={`child-${i}`}>
        Child {i}
      </div>
    ))

    render(<GridView>{children}</GridView>)

    children.forEach((_, i) => {
      expect(screen.getByTestId(`child-${i}`)).toBeInTheDocument()
    })
  })
})
