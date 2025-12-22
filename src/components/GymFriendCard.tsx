'use client'

import React from 'react'
import Avatar from '@/components/Avatar'

export type GymFriendProfile = {
  id: string
  username: string | null
  avatar_url: string | null
  style: string | string[] | null
  availability: string | null
  lookingFor: string | null
}

export type GymFriendCardProps = {
  profile: GymFriendProfile
  gymName: string
  onInvite: () => void
  onMessage: () => void
}

// Helper to format style for display
const formatStyle = (style: string | string[] | null): string => {
  if (!style) return ''
  if (Array.isArray(style)) {
    return style.slice(0, 2).join(', ')
  }
  // Handle comma-separated string
  const styles = style.split(',').map(s => s.trim()).filter(Boolean)
  return styles.slice(0, 2).join(', ')
}

// Helper to get first name
const getFirstName = (username: string | null): string => {
  if (!username) return 'User'
  return username.split(' ')[0] || 'User'
}

export default function GymFriendCard({ profile, gymName, onInvite, onMessage }: GymFriendCardProps) {
  const firstName = getFirstName(profile.username)
  const styleText = formatStyle(profile.style)

  return (
    <div className="gym-friend-card">
      <div className="gym-friend-card-avatar">
        <Avatar
          src={profile.avatar_url}
          alt={firstName}
          size={60}
          className="gym-friend-card-avatar-img"
        />
      </div>
      <div className="gym-friend-card-info">
        <p className="gym-friend-card-name">{firstName}</p>
        {styleText && (
          <p className="gym-friend-card-style">{styleText}</p>
        )}
        {profile.availability && (
          <p className="gym-friend-card-availability">{profile.availability}</p>
        )}
        {profile.lookingFor && (
          <p className="gym-friend-card-looking">{profile.lookingFor}</p>
        )}
      </div>
      <div className="gym-friend-card-actions">
        <button
          type="button"
          className="gym-friend-card-invite"
          onClick={onInvite}
          title={`Invite ${firstName} to climb`}
        >
          Invite
        </button>
        <button
          type="button"
          className="gym-friend-card-message"
          onClick={onMessage}
          title={`Message ${firstName}`}
        >
          Message
        </button>
      </div>
    </div>
  )
}

// Container for multiple friend cards
export function GymFriendsSection({
  friends,
  gymName,
  onInvite,
  onMessage,
  emptyMessage,
}: {
  friends: GymFriendProfile[]
  gymName: string
  onInvite: (profile: GymFriendProfile) => void
  onMessage: (profile: GymFriendProfile) => void
  emptyMessage?: string
}) {
  if (friends.length === 0) {
    return (
      <div className="gym-friends-empty">
        <p className="gym-friends-empty-text">
          {emptyMessage || 'No matches at this gym yet. Keep swiping or explore other gyms.'}
        </p>
      </div>
    )
  }

  return (
    <div className="gym-friends-section">
      <div className="gym-friends-header">
        <p className="gym-friends-title">Friends at {gymName}</p>
        <p className="gym-friends-count">{friends.length} {friends.length === 1 ? 'match' : 'matches'}</p>
      </div>
      <div className="gym-friends-list">
        {friends.map((profile, index) => (
          <GymFriendCard
            key={profile.id}
            profile={profile}
            gymName={gymName}
            onInvite={() => onInvite(profile)}
            onMessage={() => onMessage(profile)}
          />
        ))}
      </div>
    </div>
  )
}

// Fallback section showing other gyms with matches
export function GymFriendsFallback({
  gymsWithMatches,
  onGymClick,
}: {
  gymsWithMatches: Array<{ gymId: string; gymName: string; matchCount: number }>
  onGymClick: (gymId: string) => void
}) {
  if (gymsWithMatches.length === 0) return null

  return (
    <div className="gym-friends-fallback">
      <p className="gym-friends-fallback-title">Your people at other gyms</p>
      <div className="gym-friends-fallback-list">
        {gymsWithMatches.map(gym => (
          <button
            key={gym.gymId}
            type="button"
            className="gym-friends-fallback-item"
            onClick={() => onGymClick(gym.gymId)}
          >
            <span className="gym-friends-fallback-name">{gym.gymName}</span>
            <span className="gym-friends-fallback-count">
              {gym.matchCount} {gym.matchCount === 1 ? 'match' : 'matches'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

