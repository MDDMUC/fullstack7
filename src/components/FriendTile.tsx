'use client'

import React from 'react'

type FriendTileProps = {
  name: string
  avatarUrl: string | null
  placeholderUrl?: string
  imagePosition?: number // 1-6 for cycling through position variants
  isHost?: boolean // Show "owner" indicator
  canKick?: boolean // Show kick button (for hosts to remove members)
  onKick?: () => void // Called when kick button is clicked
}

const DEFAULT_PLACEHOLDER = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7'

export function FriendTile({
  name,
  avatarUrl,
  placeholderUrl = DEFAULT_PLACEHOLDER,
  imagePosition = 1,
  isHost = false,
  canKick = false,
  onKick
}: FriendTileProps) {
  const avatar = avatarUrl || placeholderUrl
  const firstName = name?.split(' ')[0] || name || 'User'
  // Ensure position is between 1-6
  const position = Math.max(1, Math.min(6, imagePosition || 1))
  const imgClassNum = position

  return (
    <div className="friend-tile" data-name="friend-tile">
      <div className="friend-tile-bg" aria-hidden="true">
        <div className="friend-tile-img-wrapper">
          <img
            src={avatar}
            alt={firstName}
            className={`friend-tile-img friend-tile-img-${imgClassNum}`}
            onError={(e) => {
              e.currentTarget.src = placeholderUrl
            }}
          />
        </div>
        <div className="friend-tile-overlay" />
      </div>
      {isHost && (
        <div className="friend-tile-host-indicator">
          <p>owner</p>
        </div>
      )}
      {canKick && onKick && (
        <button
          type="button"
          className="friend-tile-kick-btn"
          onClick={(e) => {
            e.stopPropagation()
            onKick()
          }}
          aria-label={`Remove ${firstName}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div className="friend-tile-name">
        <p>{firstName}</p>
      </div>
    </div>
  )
}

export function FriendTilesContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="friend-tiles-container" data-name="friend-tiles-container">
      {children}
    </div>
  )
}


