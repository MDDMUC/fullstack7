'use client'

import React, { useEffect, useRef } from 'react'

export type ActionMenuItem = {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  danger?: boolean
}

export type ActionMenuProps = {
  items: ActionMenuItem[]
  open: boolean
  onClose: () => void
  className?: string
}

/**
 * ActionMenu component for three-dot action menus
 * Consolidates the repeated pattern of action dropdowns across the app
 *
 * @param items - Array of action items with label, onClick, disabled, loading, danger props
 * @param open - Whether the menu is open
 * @param onClose - Callback to close the menu
 * @param className - Optional additional CSS class
 */
export default function ActionMenu({ items, open, onClose, className = '' }: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={menuRef}
      className={`mh-silver-dropdown-menu mh-silver-dropdown-right ${className}`}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        zIndex: 1000,
        minWidth: '180px',
        background: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-stroke)',
        padding: '4px 0',
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && (
            <div
              style={{
                height: '1px',
                background: 'var(--color-stroke)',
                margin: '4px 0',
              }}
            />
          )}
          <button
            type="button"
            className="mh-silver-dropdown-item"
            onClick={() => {
              item.onClick()
              if (!item.loading) onClose()
            }}
            disabled={item.disabled || item.loading}
            style={{
              display: 'block',
              width: '100%',
              padding: 'var(--space-md) var(--space-lg)',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              color: item.disabled || item.loading
                ? 'var(--color-text-muted)'
                : item.danger
                ? 'var(--color-state-red)'
                : 'var(--color-text-default)',
              fontFamily: 'var(--fontfamily-inter)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 500,
              cursor: item.disabled || item.loading ? 'not-allowed' : 'pointer',
              opacity: item.disabled || item.loading ? 0.6 : 1,
            }}
          >
            {item.loading ? (item.loadingLabel || 'Loading...') : item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}
