'use client'

import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, Profile as DbProfile } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'

type Profile = DbProfile

const PRO_ICON = '/icons/pro.svg'
const ROCK_ICON = '/icons/rocknrollhand.svg'

const splitCommaList = (value?: string | null) =>
  (value || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)

export default function ProfilePage() {
  const { session } = useAuthSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const client = supabase ?? requireSupabase()
        const { data } = await client.auth.getUser()
        const uid = data?.user?.id
        if (!uid) {
          setProfile(null)
          setLoading(false)
          return
        }
        const profiles = await fetchProfiles(client, [uid])
        setProfile(profiles[0] ?? null)
      } catch (err) {
        console.error('Failed to load profile', err)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [session])

  const avatar = profile?.avatar_url ?? profile?.photo ?? null
  const rawName = (profile?.username || profile?.email || '').trim()
  const name =
    rawName.split(/\s+/)[0] ||
    (rawName.includes('@') ? rawName.split('@')[0] : rawName)
  const age = profile?.age ? String(profile.age) : '—'
  const location = profile?.city || profile?.homebase || '—'
  const styles = useMemo(() => splitCommaList(profile?.style), [profile?.style])
  const grade = profile?.grade || ''
  const chips = useMemo(() => profile?.tags ?? [], [profile?.tags])
  const specialTopChips = useMemo(
    () => chips.filter(chip => ['pro', 'founder', 'crew'].some(flag => chip.toLowerCase().includes(flag))),
    [chips]
  )
  const remainingChips = useMemo(() => {
    const specials = new Set(specialTopChips)
    return chips.filter(chip => !specials.has(chip))
  }, [chips, specialTopChips])

  const statusText = (profile?.status || '').toLowerCase()
  const showProChip = statusText.includes('pro') || specialTopChips.some(chip => chip.toLowerCase().includes('pro'))

  return (
    <RequireAuth>
      <div className="profile-screen profile-screen--white" data-name="/ profile">
        <div className="profile-content">
          <MobileTopbar breadcrumb="Profile" />
          <div className="home-card profile-card--home">
            <div className="home-card-header">
              <div className="home-card-header-left">
                {showProChip && (
                  <span className="button-chip button-chip-pro">
                    <img src={PRO_ICON} alt="" className="profile-pro-icon" />
                    PRO
                  </span>
                )}
              </div>
              <div className="home-card-header-right">
                <span className="button-pill button-pill-focus button-pill-online-now">
                  <span className="button-pill-dot" />
                  {profile?.status || 'Online now'}
                </span>
              </div>
            </div>

            <div className="home-card-main">
              <div className="home-image-wrapper" style={loading ? { visibility: 'hidden' } : undefined}>
                {!loading && specialTopChips.length > 0 && (
                  <div className="home-special-chips">
                    {specialTopChips.map(chip => {
                      const lower = chip.toLowerCase()
                      const isPro = lower.includes('pro')
                      const isFounder = lower.includes('founder')
                      const isCrew = lower.includes('crew')
                      let chipClass = 'fc-chip'
                      if (isPro) chipClass += ' fc-chip-pro'
                      else if (isFounder) chipClass += ' fc-chip-founder'
                      else if (isCrew) chipClass += ' fc-chip-crew'
                      const iconSrc = isPro ? PRO_ICON : ROCK_ICON
                      const needsGradient = isFounder || isCrew
                      return (
                        <span key={`special-${chip}`} className={chipClass}>
                          <img src={iconSrc} alt="" className="fc-chip-icon" />
                          {needsGradient ? <span className="fc-chip-text">{chip}</span> : chip}
                        </span>
                      )
                    })}
                  </div>
                )}
                {!loading && avatar && <img src={avatar} alt="Profile" className="home-image" key={profile?.id || 'profile-img'} />}
                <div className="home-image-overlay" style={loading ? { visibility: 'hidden' } : undefined}>
                  <div className="home-name-row">
                    <div className="home-name">{name}</div>
                    {age && <div className="home-age">{age}</div>}
                  </div>
                  <div className="home-location">{location}</div>
                  <div className="home-chips-row">
                    {(styles.length ? styles : ['Style']).slice(0, 2).map(tag => (
                      <span key={tag} className="button-tag">
                        {tag}
                      </span>
                    ))}
                    <span className="button-tag button-tag-grade">{grade || 'Grade'}</span>
                    {remainingChips.map((chip, idx) => {
                      const chipLower = chip.toLowerCase()
                      const isPro = chipLower.includes('pro') && !chipLower.includes('founder') && !chipLower.includes('crew')
                      const isFounder = chipLower.includes('founder')
                      const isCrew = chipLower.includes('crew')
                      const isBelay = chipLower.includes('belay')

                      let chipClass = 'fc-chip'
                      if (isPro) chipClass += ' fc-chip-pro'
                      else if (isFounder) chipClass += ' fc-chip-founder'
                      else if (isCrew) chipClass += ' fc-chip-crew'
                      else if (isBelay) chipClass += ' fc-chip-belay'
                      else chipClass += ' fc-chip-standard'

                      const needsGradient = isFounder || isCrew
                      const showIcon = isPro || isFounder || isCrew
                      const iconSrc = isPro ? PRO_ICON : ROCK_ICON

                      return (
                        <span key={`chip-${chip}-${idx}`} className={chipClass}>
                          {showIcon && <img src={iconSrc} alt="" className="fc-chip-icon" />}
                          {needsGradient ? <span className="fc-chip-text">{chip}</span> : chip}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="home-bio">
                <p className="home-bio-text">{profile?.bio || 'Tell partners about your climbing and availability.'}</p>
                <div className="home-bio-shadow" />
              </div>

              <div className="profile-form">
                <div className="profile-form-col">
                  {['Tags', 'Fotos', 'Availability'].map(label => (
                    <button type="button" className="button-navlink button-navlink-hover profile-dropdown" key={label}>
                      <span className="profile-dropdown-text">{label}</span>
                      <span className="profile-dropdown-chevron" aria-hidden="true">
                        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="profile-form-col">
                  {['Gyms', 'Bio', 'Homebase'].map(label => (
                    <button type="button" className="button-navlink button-navlink-hover profile-dropdown" key={label}>
                      <span className="profile-dropdown-text">{label}</span>
                      <span className="profile-dropdown-chevron" aria-hidden="true">
                        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-divider" aria-hidden="true" />

              <div className="profile-cta-row">
                <button
                  type="button"
                  className="button-navlink button-navlink-hover profile-btn-cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="onb-cta-btn profile-btn-save"
                  disabled={loading}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <MobileNavbar active="Default" />
        </div>
      </div>
    </RequireAuth>
  )
}

