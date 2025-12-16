'use client'

import { Profile } from '@/lib/profiles'

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
}

export function ChatMessage({
  message,
  senderProfile,
  isOutgoing,
  statusIcon,
  currentUserId,
  currentParticipantIds,
  formatLeaveTimestamp,
  avatarPlaceholder = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7',
}: ChatMessageProps) {
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
        <div className="chat-message-bubble chat-message-bubble-incoming">{message.body}</div>
        {hasLeft && formatLeaveTimestamp && (
          <div className="chat-message-user-left-status">
            {firstName} left the crew {formatLeaveTimestamp(message.created_at)}
          </div>
        )}
      </div>
    </div>
  )
}
