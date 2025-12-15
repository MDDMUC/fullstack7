'use client'

import React, { useEffect, useRef, useState } from 'react'

export type DropdownMenuProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
}

/**
 * Dropdown menu component matching the three-dot options menu style
 * Uses mh-silver-dropdown-menu styling for consistency
 */
export default function DropdownMenu({ label, value, options, onChange, className = '' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = value === 'All' ? label : value

  return (
    <div className={`mh-silver-dropdown-container ${className}`} ref={wrapperRef}>
      <button
        type="button"
        className="mh-silver-dropdown-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{displayValue}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <path
            d={open ? 'M7 10L3 6h8L7 10z' : 'M7 4l4 4H3l4-4z'}
            fill="currentColor"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </svg>
      </button>
      {open && (
        <div className="mh-silver-dropdown-menu" role="listbox">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className={`mh-silver-dropdown-item ${opt === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              role="option"
              aria-selected={opt === value}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

