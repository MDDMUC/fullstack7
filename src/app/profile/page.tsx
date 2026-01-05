'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/RequireAuth'
import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, Profile as DbProfile } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import ActionMenu from '@/components/ActionMenu'
import Modal from '@/components/Modal'
import {
  isPushSupported,
  isIOSSafariNonPWA,
  subscribeToPush,
  unsubscribeFromPush,
  getPushPreferences,
} from '@/lib/pushNotifications'
import { isFirebaseConfigured } from '@/lib/firebaseConfig'

type Profile = DbProfile

const PRO_ICON = '/icons/pro.svg'
const ROCK_ICON = '/icons/rocknrollhand.svg'

const splitCommaList = (value?: string | null) =>
  (value || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)

const canonicalStyle = (value: string): string | null => {
  const lower = value.trim().toLowerCase()
  if (!lower) return null
  if (lower.includes('boulder')) return 'bouldering'
  if (lower.includes('sport')) return 'sport'
  if (lower.includes('lead')) return 'lead'
  if (lower.includes('trad')) return 'trad'
  return null
}

export default function ProfilePage() {
  const { session } = useAuthSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // Settings state
  const userId = session?.user?.id
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showIOSWarning, setShowIOSWarning] = useState(false)
  const [firebaseConfigured, setFirebaseConfigured] = useState(false)

  // Edit form state
  const [editBio, setEditBio] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editTags, setEditTags] = useState('')

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
        const p = profiles[0] ?? null
        setProfile(p)
        if (p) {
          setEditBio(p.bio || '')
          setEditCity(p.city || p.homebase || '')
          setEditTags(p.tags?.join(', ') || '')
        }
      } catch (err) {
        console.error('Failed to load profile', err)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [session])

  // Load push preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!userId) return

      try {
        setFirebaseConfigured(isFirebaseConfigured())

        // Check if iOS Safari non-PWA
        if (isIOSSafariNonPWA()) {
          setShowIOSWarning(true)
        }

        // Load saved preferences
        const prefs = await getPushPreferences(userId)
        setPushEnabled(prefs?.enabled ?? false)
      } catch (err) {
        console.error('Failed to load push preferences:', err)
      } finally {
        setPushLoading(false)
      }
    }

    loadPreferences()
  }, [userId])

  const handleToggle = async () => {
    if (!userId) return

    setToggling(true)
    setError(null)
    setSuccessMsg(null)

    // Add timeout to prevent UI from getting stuck
    const timeoutId = setTimeout(() => {
      setToggling(false)
      setError('Request timed out. Please try again.')
    }, 30000) // 30 second timeout

    try {
      if (!firebaseConfigured) {
        throw new Error('Push notifications not configured. Please contact support.')
      }

      if (!isPushSupported()) {
        throw new Error('Push notifications are not supported in this browser.')
      }

      if (isIOSSafariNonPWA()) {
        throw new Error('Please add DAB to your home screen to enable notifications on iOS.')
      }

      if (!pushEnabled) {
        // Enable notifications
        console.log('Starting push subscription...')
        setSuccessMsg('Requesting browser permission...')
        await subscribeToPush(userId)
        console.log('Push subscription successful')
        setPushEnabled(true)
        setError(null)
        setSuccessMsg('✅ Notifications enabled successfully!')
      } else {
        // Disable notifications
        console.log('Starting push unsubscription...')
        setSuccessMsg('Disabling notifications...')
        await unsubscribeFromPush(userId)
        console.log('Push unsubscription successful')
        setPushEnabled(false)
        setError(null)
        setSuccessMsg('Notifications disabled')
      }

      // Clear timeout since operation completed
      clearTimeout(timeoutId)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000)

    } catch (err: any) {
      console.error('Failed to toggle push notifications:', err)
      clearTimeout(timeoutId)
      setError(err.message || 'Failed to update notification settings')
      // Revert toggle state on error
      setPushEnabled(!pushEnabled)
    } finally {
      clearTimeout(timeoutId)
      setToggling(false)
    }
  }

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
    const styleKeys = new Set(
      styles.map(style => canonicalStyle(style)).filter((s): s is string => Boolean(s))
    )
    return chips.filter(chip => {
      if (specials.has(chip)) return false
      const canonical = canonicalStyle(chip)
      if (canonical && styleKeys.has(canonical)) return false
      return true
    })
  }, [chips, specialTopChips, styles])

  const statusText = (profile?.status || '').toLowerCase()
  const showProChip = statusText.includes('pro') || specialTopChips.some(chip => chip.toLowerCase().includes('pro'))

  const handleMenuAction = (action: string) => {
    setSettingsOpen(false)
    if (action === 'settings') {
      router.push('/profile/settings')
    } else if (action === 'community') {
      router.push('/community-guidelines')
    } else if (action === 'safety') {
      router.push('/safety')
    }
  }

  const handleSaveProfile = async () => {
    // TODO: Implement actual save logic
    setEditOpen(false)
  }

  return (
    <RequireAuth>
      <div className="profile-screen" data-name="/profile">
        <MobileTopbar breadcrumb="Profile" />
        <div className="profile-content">
          <div className="home-card profile-card--home">
            <div className="home-card-main">
              <div className="home-image-wrapper" style={loading ? { visibility: 'hidden' } : undefined}>
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

              <div className="profile-divider" aria-hidden="true" style={{ margin: 'var(--space-md) 0' }} />

              <div className="profile-cta-row" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <button
                  type="button"
                  className="button-navlink button-navlink-hover profile-btn-cancel"
                  onClick={() => setEditOpen(true)}
                  style={{ 
                    flex: 1,
                    border: '1px solid var(--color-stroke)',
                    justifyContent: 'center'
                  }}
                >
                  Edit Profile
                </button>
                
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  style={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-stroke)',
                    borderRadius: 'var(--radius-md)',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  aria-label="Settings and Help"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <MobileNavbar active="Default" />

        {/* Settings Modal */}
        <Modal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title="Settings & Help"
          footer={
            <div className="profile-cta-row">
              <button
                type="button"
                className="button-navlink profile-btn-cancel"
                onClick={() => setSettingsOpen(false)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          }
        >
          <div className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            
            {/* Notifications Section */}
            <div className="settings-section" style={{ padding: 0, border: 'none', background: 'transparent' }}>
              
              {/* Firebase Configuration Warning */}
              {!firebaseConfigured && (
                <div className="settings-alert settings-alert-error" style={{ marginBottom: 'var(--space-md)' }}>
                  <p className="settings-alert-text settings-alert-text-error">
                    ⚠️ Push notifications are not configured. Please complete Firebase setup.
                  </p>
                </div>
              )}

              {/* iOS Safari Warning */}
              {showIOSWarning && (
                <div className="settings-alert settings-alert-warning" style={{ marginBottom: 'var(--space-md)' }}>
                  <p className="settings-alert-text">
                    📱 <strong>iOS users:</strong> To receive notifications, tap the Share button in Safari and select "Add to Home Screen" first.
                  </p>
                </div>
              )}

              {/* Toggle */}
              <div className="settings-toggle-row" style={{ 
                background: 'var(--color-card)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div className="settings-toggle-label">
                  <p className="settings-toggle-title" style={{
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--space-xxs)',
                    color: 'var(--color-text)'
                  }}>
                    Enable push notifications
                  </p>
                  <p className="settings-toggle-desc" style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--color-muted)',
                    margin: 0
                  }}>
                    Get notified about new matches, messages, and events
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={toggling || !firebaseConfigured || pushLoading}
                  className="settings-toggle-switch"
                  aria-checked={pushEnabled}
                  role="switch"
                  aria-label="Enable push notifications"
                >
                  <div className="settings-toggle-thumb" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="settings-alert settings-alert-error" style={{ marginTop: 'var(--space-md)' }}>
                  <p className="settings-alert-text settings-alert-text-error">
                    {error}
                  </p>
                </div>
              )}
              
              {/* Success Message */}
              {successMsg && (
                <div className="settings-alert" style={{ 
                  marginTop: 'var(--space-md)',
                  borderColor: 'var(--color-primary)', 
                  backgroundColor: 'rgba(92, 225, 230, 0.1)' 
                }}>
                  <p className="settings-alert-text" style={{ color: 'var(--color-primary)' }}>
                    {successMsg}
                  </p>
                </div>
              )}
            </div>

            <div className="profile-divider" aria-hidden="true" style={{ margin: 'var(--space-xs) 0' }} />
            
            <button
              type="button"
              className="button-navlink button-navlink-hover profile-dropdown"
              onClick={() => handleMenuAction('community')}
            >
              <span className="profile-dropdown-text">Community Guidelines</span>
              <span className="profile-dropdown-chevron" aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="button-navlink button-navlink-hover profile-dropdown"
              onClick={() => handleMenuAction('safety')}
            >
              <span className="profile-dropdown-text">Safety Guidelines</span>
              <span className="profile-dropdown-chevron" aria-hidden="true">→</span>
            </button>
          </div>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit Profile"
          footer={
            <div className="profile-cta-row">
              <button
                type="button"
                className="button-navlink profile-btn-cancel"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="onb-cta-btn profile-btn-save"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          }
        >
          <div className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="events-create-field">
              <label className="events-create-label">Bio</label>
              <textarea
                className="events-create-input"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                placeholder="Share your climbing interests..."
              />
            </div>

            <div className="events-create-field">
              <label className="events-create-label">City / Homebase</label>
              <input
                type="text"
                className="events-create-input"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="Where do you climb?"
              />
            </div>

            <div className="events-create-field">
              <label className="events-create-label">Tags</label>
              <input
                type="text"
                className="events-create-input"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Comma separated tags (e.g. bouldering, coffee)"
              />
            </div>

            <div className="events-create-field" style={{ opacity: 0.6 }}>
              <label className="events-create-label">Photos</label>
              <div className="events-create-input" style={{ fontStyle: 'italic' }}>
                Photo management coming soon
              </div>
            </div>
          </div>
        </Modal>

      </div>
    </RequireAuth>
  )
}


