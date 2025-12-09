'use client'

import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'

const HERO_IMG = 'http://localhost:3845/assets/e77d367964c4498d605be651145ba7bf039e3be8.png'

export default function EventDetailPage() {
  return (
    <RequireAuth>
      <div className="events-detail-screen" data-name="/event/detail">
        <div className="events-detail-content">
          <div className="events-detail-card">
            <div className="events-detail-backbar">
              <Link href="/events" className="events-detail-back-btn" aria-label="Back">
                <img src="/icons/chevron-left.svg" alt="" className="events-detail-back-icon" />
              </Link>
              <div className="events-detail-back-text">back</div>
              <div className="events-detail-dots">
                <img src="/icons/dots.svg" alt="" className="events-detail-dots-img" />
              </div>
            </div>

            <div className="events-detail-hero">
              <img src={HERO_IMG} alt="Event" className="events-detail-hero-img" />
              <div className="events-detail-hero-overlay">
                <div className="events-detail-hero-text">
                  <p className="events-detail-title">PETZL Rope Demo</p>
                  <p className="events-detail-subtitle">DAV Thalkirchen</p>
                  <div className="events-detail-info-row">
                    <p className="events-detail-info-loc">Munich</p>
                    <p className="events-detail-info-att">27 people are going</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="events-detail-block">
              <div className="events-detail-block-text">
                <p className="events-detail-block-title">TIME &amp; LOCATION</p>
                <p className="events-detail-block-body">Saturday / 27.12.2025 / 16:30pm (CET)</p>
              </div>
            </div>

            <div className="events-detail-block">
              <div className="events-detail-block-text">
                <p className="events-detail-block-title">DESCRIPTION</p>
                <p className="events-detail-block-body">
                  Try out new ropes, chat with PETZL rope experts and see how advancements in rope making have changed
                  climbing history first hand. There will be a separate signup table at the entrance. All levels welcome.
                  Drop in, say hi and join the event and learn more about ropes and the expertise that goes into making
                  them.
                </p>
              </div>
            </div>

            <div className="events-detail-cta-row">
              <button type="button" className="events-detail-btn events-detail-btn-chat">
                CHAT
              </button>
              <button type="button" className="events-detail-btn events-detail-btn-join">
                JOIN
              </button>
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
              <Link href="/events" className="home-bottom-item home-bottom-active">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="announcement-01">
                    <div className="home-nav-icon-inner-announcement">
                      <img src="/icons/announcement-01.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">events</span>
              </Link>
              <Link href="/chats" className="home-bottom-item home-bottom-item-chat">
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

