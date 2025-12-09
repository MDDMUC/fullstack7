'use client'

import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'

const AVATAR_IMG = 'http://localhost:3845/assets/4988ee5a6746ff9791c7714cf1a1e34b3cd63723.png'

export default function ChatsEventPage() {
  return (
    <RequireAuth>
      <div className="chats-event-screen" data-name="/chats/event">
        <div className="chats-event-content">
          <div className="chats-event-card">
            <div className="chats-event-header">
              <Link href="/chats" className="chats-event-back" aria-label="Back">
                <img src="/icons/chevron-left.svg" alt="" className="chats-event-back-icon" />
              </Link>
              <div className="chats-event-meta">
                <img src={AVATAR_IMG} alt="Event" className="chats-event-avatar" />
                <div className="chats-event-title">PETZL Rope Demo</div>
              </div>
              <div className="chats-event-dots">
                <img src="/icons/dots.svg" alt="" className="chats-event-dots-img" />
              </div>
            </div>

            <div className="chats-event-divider" />

            <div className="chats-event-message-row">
              <img src={AVATAR_IMG} alt="avatar" className="chats-event-bubble-avatar" />
              <div className="chats-event-bubble chats-event-bubble-incoming">
                <p className="chats-event-bubble-text">Hey, what’s up with dog pics?</p>
              </div>
            </div>

            <div className="chats-event-message-row chats-event-message-row-out">
              <div className="chats-event-bubble chats-event-bubble-outgoing">
                <p className="chats-event-bubble-text chats-event-bubble-text-out">cuz em a dog 🐶</p>
              </div>
              <div className="chats-event-status">
                <img src="/icons/message-plus.svg" alt="" className="chats-event-status-icon" />
                <img src="/icons/read.svg" alt="" className="chats-event-status-icon-secondary" />
                <span className="chats-event-status-text">Sent</span>
              </div>
            </div>

            <div className="chats-event-divider" />

            <div className="chats-event-input">
              <span className="chats-event-input-placeholder">Type a message ...</span>
            </div>
          </div>

          <div className="home-bottom-nav">
            <div className="home-bottom-row">
              <Link href="/profile" className="home-bottom-item">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="face-content">
                    <div className="home-nav-icon-inner-face">
                      <img src="/icons/face-content.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">profile</span>
              </Link>
              <Link href="/events" className="home-bottom-item">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="announcement-01">
                    <div className="home-nav-icon-inner-announcement">
                      <img src="/icons/announcement-01.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">events</span>
              </Link>
              <Link href="/chats" className="home-bottom-item home-bottom-item-chat home-bottom-active">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="message-chat-square">
                    <div className="home-nav-icon-inner-message">
                      <img src="/icons/message-chat-square.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                  <div className="home-bottom-dot" />
                </div>
                <span className="home-bottom-label">chats</span>
              </Link>
              <Link href="/home" className="home-bottom-item">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="flash">
                    <div className="home-nav-icon-inner-flash" data-name="Icon">
                      <div className="home-nav-icon-inner-flash-2">
                        <img src="/icons/flash.svg" alt="" className="home-nav-icon-img" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">dab</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}

