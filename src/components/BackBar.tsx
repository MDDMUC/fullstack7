import React from 'react'
import Link from 'next/link'

interface BackBarProps {
  backHref?: string
  backText?: string
  onBackClick?: () => void
  centerSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  className?: string
}

/**
 * BackBar component for consistent back navigation across the app
 * Used in event detail, event create, crew detail, chat detail, and other pages
 *
 * @param backHref - URL to navigate back to (uses Link)
 * @param backText - Text to display next to back button (defaults to "back"). Ignored if centerSlot is provided.
 * @param onBackClick - Optional click handler (uses button instead of Link)
 * @param centerSlot - Optional custom content to display in the center (e.g., avatar and name)
 * @param rightSlot - Optional content to display on the right side (e.g., menu button)
 * @param className - Optional CSS class name for the container
 */
export default function BackBar({
  backHref,
  backText = 'back',
  onBackClick,
  centerSlot,
  rightSlot,
  className = ''
}: BackBarProps) {
  const backButton = onBackClick ? (
    <button
      type="button"
      className="chats-event-back"
      aria-label="Back"
      onClick={onBackClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img
        src="/icons/chevron-left.svg"
        alt=""
        className="chats-event-back-icon"
      />
    </button>
  ) : backHref ? (
    <Link href={backHref} className="chats-event-back" aria-label="Back">
      <img
        src="/icons/chevron-left.svg"
        alt=""
        className="chats-event-back-icon"
      />
    </Link>
  ) : null

  return (
    <div className={className || 'chats-event-backbar'}>
      {backButton}
      {centerSlot || <div className="chats-event-back-title">{backText}</div>}
      {rightSlot && <div style={{ marginLeft: 'auto' }}>{rightSlot}</div>}
    </div>
  )
}
