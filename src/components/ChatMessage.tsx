import React, { useState } from 'react'
import { Profile } from '@/lib/profiles'
import ActionMenu from './ActionMenu'

type MessageRow = {
  id: string
  thread_id: string
  sender_id: string
  receiver_id: string
  body: string
  status: 'sent' | 'delivered' | 'read'
  created_at: string
}

type ChatMessageProps = {
  message: MessageRow
  senderProfile?: Profile | null
  isOutgoing: boolean
  statusIcon?: (status: 'sent' | 'delivered' | 'read') => string
  currentUserId?: string
  currentParticipantIds?: Set<string>
  formatLeaveTimestamp?: (timestamp: string) => string
  avatarPlaceholder?: string
  onReportMessage?: (message: MessageRow) => void
  onReportUser?: (userId: string, username?: string) => void
  onBlockUser?: (userId: string, username?: string) => void
}

const ThreeDotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3" cy="8" r="1.5"/>
    <circle cx="8" cy="8" r="1.5"/>
    <circle cx="13" cy="8" r="1.5"/>
  </svg>
)

export function ChatMessage({
  message,
  senderProfile,
  isOutgoing,
  statusIcon,
  currentUserId,
  currentParticipantIds,
  formatLeaveTimestamp,
  avatarPlaceholder = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7',
  onReportMessage,
  onReportUser,
  onBlockUser,
}: ChatMessageProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Get sender info
  const senderName = senderProfile?.username || ''
  const firstName = senderName ? senderName.split(' ')[0] : 'User'
  const senderAvatar = senderProfile?.avatar_url || avatarPlaceholder

  // Check if sender has left (for crew chats)
  const hasLeft = currentUserId && currentParticipantIds && message.sender_id !== currentUserId && !currentParticipantIds.has(message.sender_id)

  if (isOutgoing) {
    // Outgoing message (current user)
    return (
      <div className="chat-message chat-message-outgoing">
        <div className="chat-message-bubble chat-message-bubble-outgoing">{message.body}</div>
        {statusIcon && (
          <div className="chat-message-status-row">
            <div className="chat-message-status-iconwrap">
              <img src={statusIcon(message.status)} alt="" className="chat-message-status-icon" />
            </div>
            <span className="chat-message-status-text">
              {message.status === 'read' ? 'Read' : message.status === 'delivered' ? 'Delivered' : 'Sent'}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Incoming message (other user)
  return (
    <div className="chat-message chat-message-incoming">
      <div className="chat-message-avatar-wrapper">
        <div className="chat-message-avatar">
          {senderAvatar ? (
            <img src={senderAvatar} alt={firstName} className="chat-message-avatar-img" />
          ) : (
            <div className="chat-message-avatar-placeholder" />
          )}
        </div>
        <div className="chat-message-name">{firstName}</div>
      </div>
      <div className="chat-message-content">
        <div className="chat-message-bubble-wrapper">
          <div className="chat-message-bubble chat-message-bubble-incoming">{message.body}</div>
          
          {(onReportMessage || onReportUser || onBlockUser) && (
            <div className="chat-message-actions-wrapper">
              <button
                type="button"
                className="chat-message-more-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Message actions"
              >
                <ThreeDotsIcon />
              </button>
              
              <ActionMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                className="chat-message-action-menu"
                items={[
                  ...(onReportMessage ? [{
                    label: 'Report Message',
                    onClick: () => onReportMessage(message),
                  }] : []),
                  ...(onReportUser ? [{
                    label: 'Report User',
                    onClick: () => onReportUser(message.sender_id, senderName),
                  }] : []),
                  ...(onBlockUser ? [{
                    label: 'Block User',
                    onClick: () => onBlockUser(message.sender_id, senderName),
                    danger: true,
                  }] : []),
                ]}
              />
            </div>
          )}
        </div>

        {hasLeft && formatLeaveTimestamp && (
          <div className="chat-message-user-left-status">
            {firstName} left the crew {formatLeaveTimestamp(message.created_at)}
          </div>
        )}
      </div>
    </div>
  )
}

