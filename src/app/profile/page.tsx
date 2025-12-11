'use client'

import { RequireAuth } from '@/components/RequireAuth'
import MobileNavbar from '@/components/MobileNavbar'

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

          <MobileNavbar active="profile" />
        </div>
      </div>
    </RequireAuth>
  )
}

