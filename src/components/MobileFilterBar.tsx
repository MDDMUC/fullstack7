'use client'

import React from 'react'
import DropdownMenu from './DropdownMenu'

export type MobileFilterBarProps = {
  filters: Record<string, string>
  filterOptions: Record<string, string[]>
  onFilterChange: (key: string, value: string) => void
  filterKeys: readonly string[] | string[]
  className?: string
}

/**
 * Global mobile filter bar component
 * Displays filter dropdowns in a horizontal row with equal width distribution
 */
export default function MobileFilterBar({
  filters,
  filterOptions,
  onFilterChange,
  filterKeys,
  className = '',
}: MobileFilterBarProps) {
  return (
    <div className={`mobile-filterbar ${className}`} data-name="filterbar" data-node-id="765:1755">
      <div className="mobile-filterbar-content" data-name="filterbar-content" data-node-id="765:1756">
        {filterKeys.map(key => (
          <div key={key} className="mobile-filterbar-item" style={{ flex: '1 1 0', minWidth: 0 }}>
            <DropdownMenu
              label={key}
              value={filters[key] || 'All'}
              options={filterOptions[key] || ['All']}
              onChange={val => onFilterChange(key, val)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

