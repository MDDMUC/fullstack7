'use client'

import React from 'react'

type FriendTileProps = {
  name: string
  avatarUrl: string | null
  placeholderUrl?: string
  imagePosition?: number // 1-6 for cycling through position variants
  isHost?: boolean // Show "owner" indicator
}

const DEFAULT_PLACEHOLDER = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7'

export function FriendTile({ 
  name, 
  avatarUrl, 
  placeholderUrl = DEFAULT_PLACEHOLDER,
  imagePosition = 1,
  isHost = false
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

