import React from 'react'

export interface GridViewProps {
  children?: React.ReactNode
}

/**
 * Grid view container component
 * Displays children in a responsive grid layout (1-4 columns based on screen width)
 */
const GridView: React.FC<GridViewProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {children}
    </div>
  )
}

export default GridView
