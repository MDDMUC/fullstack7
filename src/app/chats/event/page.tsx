'use client'

import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import MobileNavbar from '@/components/MobileNavbar'

const HERO_IMG = 'https://www.figma.com/api/mcp/asset/6adb3ca3-0513-4775-88ca-40e2e7b63cd3'
const AVATAR_IMG = 'https://www.figma.com/api/mcp/asset/875a43ce-f895-4170-893e-c2d83c8a6e56'
const BACK_ICON = 'https://www.figma.com/api/mcp/asset/5fed23cc-cd2b-40b2-baae-f59643e79b0b'
const MENU_ICON = 'https://www.figma.com/api/mcp/asset/ccc45227-14b0-4a26-bcc6-3cf30f676a51'
const STATUS_ICON_PRIMARY = 'https://www.figma.com/api/mcp/asset/9669b4a0-521f-4460-b5ea-398ba81c3620'
const STATUS_ICON_SECONDARY = 'https://www.figma.com/api/mcp/asset/a7a888de-184f-46cf-a824-bf78fa777b31'

export default function ChatsEventPage() {
  return (
    <RequireAuth>
      <div className="chats-event-screen" data-name="/chats/event">
        <div className="chats-event-content">
          <div className="chats-event-card">
            <div className="chats-event-backbar">
              <Link href="/chats" className="chats-event-back" aria-label="Back">
                <img src={BACK_ICON} alt="" className="chats-event-back-icon" />
              </Link>
              <div className="chats-event-back-title">back</div>
              <button type="button" className="chats-event-menu" aria-label="Menu">
                <img src={MENU_ICON} alt="" className="chats-event-menu-icon" />
              </button>
            </div>

            <div className="chats-event-hero">
              <div className="chats-event-hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
              <div className="chats-event-hero-overlay" />
              <div className="chats-event-hero-text">
                <div className="chats-event-hero-title">Beginner Lead Class</div>
                <div className="chats-event-hero-subtitle">DAV Thalkirchen</div>
                <div className="chats-event-hero-info">
                  <span className="chats-event-hero-location">Munich</span>
                  <span className="chats-event-hero-attendance">27 people are going</span>
                </div>
              </div>
            </div>

            <div className="chats-event-divider" />

            <div className="chats-event-system-text">You joined this chat on 11/07/2023.</div>

            <div className="chats-event-message-row">
              <div className="chats-event-avatar">
                <img src={AVATAR_IMG} alt="avatar" />
              </div>
              <div className="chats-event-bubble chats-event-bubble-incoming">
                Hey, what&apos;s up with dog pics?
              </div>
            </div>

            <div className="chats-event-response">
              <div className="chats-event-bubble chats-event-bubble-outgoing">cuz em a dog 🐶</div>
              <div className="chats-event-status-row">
                <div className="chats-event-status-iconwrap">
                  <img src={STATUS_ICON_PRIMARY} alt="" className="chats-event-status-icon" />
                </div>
                <img src={STATUS_ICON_SECONDARY} alt="" className="chats-event-status-check" />
                <span className="chats-event-status-text">Sent</span>
              </div>
            </div>

            <div className="chats-event-divider" />

            <div className="chats-event-input">
              <span className="chats-event-input-placeholder">Type a message ...</span>
            </div>
          </div>

          <MobileNavbar active="chats" />
        </div>
      </div>
    </RequireAuth>
  )
}

