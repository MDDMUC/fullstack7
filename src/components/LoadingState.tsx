import React from 'react'

interface LoadingStateProps {
  message?: string
  className?: string
}

/**
 * LoadingState component for consistent loading UI across the app
 * Uses design tokens for styling and provides accessible loading indicators
 */
export default function LoadingState({
  message = 'Loading…',
  className = ''
}: LoadingStateProps) {
  return (
    <p
      className={className}
      role="status"
      aria-live="polite"
      style={{
        fontFamily: 'var(--fontfamily-inter)',
        fontSize: 'var(--font-size-md)',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        padding: 'var(--space-xl)',
        margin: 0,
      }}
    >
      {message}
    </p>
  )
}
