import React from 'react'

interface EmptyStateProps {
  message?: string
  className?: string
}

/**
 * EmptyState component for consistent empty state UI across the app
 * Uses design tokens for styling and provides semantic HTML
 */
export default function EmptyState({
  message = 'No items found',
  className = ''
}: EmptyStateProps) {
  return (
    <p
      className={className}
      role="status"
      aria-live="polite"
      style={{
        fontFamily: 'var(--fontfamily-inter)',
        fontSize: 'var(--font-size-md)',
        color: 'var(--color-muted)',
        textAlign: 'center',
        padding: 'var(--space-xl)',
        margin: 0,
      }}
    >
      {message}
    </p>
  )
}

