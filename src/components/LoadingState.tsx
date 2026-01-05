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
    <div 
      className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg 
        className="animate-spin h-8 w-8 text-[var(--color-primary)]" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && (
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-muted)',
            fontWeight: 'var(--font-weight-medium)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}

