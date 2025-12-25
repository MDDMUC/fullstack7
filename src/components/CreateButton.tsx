'use client'

import React from 'react'
import Link from 'next/link'

export type CreateButtonProps = {
  href?: string
  onClick?: () => void
  label: string
  className?: string
  variant?: 'primary' | 'ghost'
}

/**
 * CreateButton - Global component for "create" actions
 * Used for creating new items (events, crews, etc.)
 * Follows design system with proper button styling and tokens
 *
 * @param href - Link destination (use this OR onClick)
 * @param onClick - Click handler (use this OR href)
 * @param label - Button text (e.g., "Create Event", "Create Crew")
 * @param className - Additional CSS classes
 * @param variant - Button style: 'primary' (gradient) or 'ghost' (outline) - default 'ghost'
 */
export default function CreateButton({
  href,
  onClick,
  label,
  className = '',
  variant = 'ghost'
}: CreateButtonProps) {
  const buttonClass = variant === 'primary' ? 'create-button-primary' : 'create-button-ghost'

  const content = (
    <>
      <div className="create-button-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="create-button-text">{label}</span>
    </>
  )

  // If onClick is provided, render a button; otherwise render a Link
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`create-button ${buttonClass} ${className}`}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      href={href || '#'}
      className={`create-button ${buttonClass} ${className}`}
    >
      {content}
    </Link>
  )
}
