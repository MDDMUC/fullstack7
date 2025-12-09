'use client'

import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'

const PROFILE_IMAGE = 'http://localhost:3845/assets/104b4ede10b02efcc011650409ddff69e359dddd.png'

export default function ProfilePage() {
  return (
    <RequireAuth>
      <div className="profile-screen profile-screen--white" data-name="/ profile">
        <div className="profile-content">
          <div className="profile-card profile-card--white">
            <div className="profile-top">
              <span className="button-chip button-chip-pro">
                <img src="/icons/pro.svg" alt="" className="profile-pro-icon" />
                PRO
              </span>
              <span className="button-pill button-pill-focus">
                Online
              </span>
            </div>

            <div className="profile-hero">
              <img src={PROFILE_IMAGE} alt="Profile" className="profile-hero-img" />
              <div className="profile-hero-overlay">
                <div className="profile-name-row">
                  <div className="profile-name">Jared</div>
                  <div className="profile-age">20</div>
                </div>
                <div className="profile-location">Hamburg</div>
                <div className="profile-tags-row">
                  <span className="button-tag">Boulder</span>
                  <span className="button-tag">Sport</span>
                  <span className="button-tag button-tag-grade">Advanced</span>
                </div>
                <div className="profile-chips-row">
                  <span className="button-chip button-chip-belay">Belay Certified</span>
                  <span className="button-chip button-chip-focus">Edelrid Ohm</span>
                  <span className="button-chip">Edelrid Ohm</span>
                  <span className="button-chip">Host</span>
                </div>
              </div>
            </div>

            <div className="profile-form">
              <div className="profile-form-col">
                {['Tags', 'Fotos', 'Availability'].map(label => (
                  <div className="profile-dropdown" key={label}>
                    <span className="profile-dropdown-text">{label}</span>
                    <img src="/icons/Color.svg" alt="" className="profile-dropdown-icon" />
                  </div>
                ))}
              </div>
              <div className="profile-form-col">
                {['Gyms', 'Bio', 'Homebase'].map(label => (
                  <div className="profile-dropdown" key={label}>
                    <span className="profile-dropdown-text">{label}</span>
                    <img src="/icons/Color.svg" alt="" className="profile-dropdown-icon" />
                  </div>
                ))}
              </div>
            </div>

          <div className="profile-divider" aria-hidden="true" />

            <div className="profile-cta-row">
              <button type="button" className="profile-btn-cancel">CANCEL</button>
              <button type="button" className="profile-btn-save">SAVE</button>
            </div>
          </div>

          <div className="home-bottom-nav">
            <div className="home-bottom-row">
              <Link href="/profile" className="home-bottom-item home-bottom-active">
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

