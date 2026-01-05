'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
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
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
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

// Climbing styles from Figma - exact order
const CLIMBING_STYLES = [
  'Bouldering',
  'Sport',
  'Comps',
  'Board',
  'Multipitch',
  'Alpine',
  'Ice',
  'Trad',
  'Training',
  'Mountaineering',
]

// Grade options from onboarding
const GRADES = ['Beginner', 'Intermediate', 'Advanced'] as const
type Grade = typeof GRADES[number]

// Looking for options
const LOOKING_FOR_OPTIONS = ['Climbing Partner', 'Crew', 'Meet Climbers'] as const

type Gym = {
  id: string
  name: string
  area: string
  avatar_url?: string | null
  image_url?: string | null
}

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
  const [editStyles, setEditStyles] = useState<string[]>([])
  const [styleLimitHit, setStyleLimitHit] = useState(false)
  const styleLimitTimerRef = useRef<number | null>(null)
  const [editGrade, setEditGrade] = useState<Grade | null>(null)
  const [editPurposes, setEditPurposes] = useState<string[]>([])

  // Gym selector state
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGyms, setSelectedGyms] = useState<string[]>([])
  const [climbsOutside, setClimbsOutside] = useState(false)
  const [gymsLoading, setGymsLoading] = useState(false)
  const [showMoreGyms, setShowMoreGyms] = useState(false)

  useEffect(() => {
    return () => {
      if (styleLimitTimerRef.current !== null) {
        window.clearTimeout(styleLimitTimerRef.current)
      }
    }
  }, [])

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
          setEditStyles(splitCommaList(p.style))

          // Initialize grade
          const gradeValue = p.grade?.trim()
          if (gradeValue && GRADES.includes(gradeValue as Grade)) {
            setEditGrade(gradeValue as Grade)
          } else {
            setEditGrade(null)
          }

          // Initialize purposes/looking for
          const lookingForValue = p.lookingFor || ''
          const purposes = typeof lookingForValue === 'string'
            ? lookingForValue.split(',').map(s => s.trim()).filter(Boolean)
            : []
          setEditPurposes(purposes)

          // Initialize gym selection
          const profileGyms = Array.isArray(p.gym) ? p.gym : []
          const gymIds = profileGyms.filter(id => id !== 'outside')
          setSelectedGyms(gymIds)
          setClimbsOutside(profileGyms.includes('outside'))
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

  // Fetch gyms from Supabase
  useEffect(() => {
    async function fetchGyms() {
      if (!supabase) {
        console.warn('Supabase not configured')
        return
      }

      setGymsLoading(true)
      try {
        // First try to fetch with both avatar_url and image_url
        let gymData: any[] | null = null
        let fetchError: any = null

        const { data, error } = await supabase
          .from('gyms')
          .select('id, name, area, avatar_url, image_url')
          .order('name', { ascending: true })

        gymData = data
        fetchError = error

        // If image_url column doesn't exist, fetch without it
        if (fetchError?.message?.includes('image_url does not exist')) {
          const result = await supabase
            .from('gyms')
            .select('id, name, area, avatar_url')
            .order('name', { ascending: true })

          gymData = result.data
          fetchError = result.error
        }

        if (fetchError) {
          console.error('Error fetching gyms:', fetchError.message)
        } else if (gymData) {
          const gymsWithImages = gymData.map(gym => ({
            id: gym.id,
            name: gym.name,
            area: gym.area,
            avatar_url: gym.avatar_url || null,
            image_url: gym.avatar_url || gym.image_url || null
          }))
          setGyms(gymsWithImages)
        }
      } catch (err) {
        console.error('Failed to fetch gyms:', err)
      } finally {
        setGymsLoading(false)
      }
    }

    fetchGyms()
  }, [])

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

  const handleStyleToggle = (style: string) => {
    if (editStyles.includes(style)) {
      // Always allow deselection
      setEditStyles(editStyles.filter(s => s !== style))
    } else {
      // Only allow selection if less than 3 styles are selected
      if (editStyles.length < 3) {
        setEditStyles([...editStyles, style])
        setStyleLimitHit(false)
        if (styleLimitTimerRef.current !== null) {
          window.clearTimeout(styleLimitTimerRef.current)
          styleLimitTimerRef.current = null
        }
      }
      // Show feedback if already at max (3 styles)
      if (editStyles.length >= 3) {
        setStyleLimitHit(true)
        if (styleLimitTimerRef.current !== null) {
          window.clearTimeout(styleLimitTimerRef.current)
        }
        styleLimitTimerRef.current = window.setTimeout(() => {
          setStyleLimitHit(false)
          styleLimitTimerRef.current = null
        }, 1500)
      }
    }
  }

  const handleGymToggle = (gymId: string) => {
    setSelectedGyms(prev =>
      prev.includes(gymId)
        ? prev.filter(id => id !== gymId)
        : [...prev, gymId]
    )
  }

  const handleOutsideToggle = () => {
    setClimbsOutside(prev => !prev)
  }

  const handleGradeSelect = (grade: Grade) => {
    setEditGrade(grade)
  }

  const handlePurposeToggle = (purpose: string) => {
    setEditPurposes(prev =>
      prev.includes(purpose)
        ? prev.filter(p => p !== purpose)
        : [...prev, purpose]
    )
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
    if (!userId) return

    try {
      const client = supabase ?? requireSupabase()

      // Combine gym IDs with 'outside' marker if selected
      const gymIds = climbsOutside
        ? [...selectedGyms, 'outside']
        : selectedGyms

      const updateData = {
        bio: editBio,
        city: editCity,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        styles: editStyles, // Save as array, normalizedProfile will join it if needed
        gym: gymIds, // Save selected gym IDs
        grade: editGrade || null, // Save selected grade
        lookingFor: editPurposes.join(', '), // Save looking for as comma-separated string
        // Update derived/legacy fields if needed, but onboardingprofiles is source of truth
      }

      console.log('Attempting to save profile data:', updateData)

      const { error } = await client
        .from('onboardingprofiles')
        .update(updateData)
        .eq('id', userId)

      if (error) {
        console.error('Supabase error details:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          stringified: JSON.stringify(error)
        })
        throw error
      }

      // Update local state optimistic-ish (or reload)
      // Since fetchProfiles normalizes, let's just reload mostly
      const profiles = await fetchProfiles(client, [userId])
      setProfile(profiles[0] ?? null)
      setEditOpen(false)
    } catch (err: any) {
      console.error('Failed to save profile:', {
        err,
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        stringified: JSON.stringify(err)
      })
      // Ideally show a toast here
    }
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
                    {(styles.length ? styles : ['Style']).map(tag => (
                      <span key={tag} className="button-tag">
                        {tag}
                      </span>
                    ))}
                    <span className="button-tag button-tag-grade">{grade || 'Grade'}</span>
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
            
            {/* Climbing Style Section */}
            <div className="events-create-field">
              <label className="events-create-label">Climbing Style (Max 3)</label>
              <div className="onb-style-grid">
                {CLIMBING_STYLES.map(style => {
                  const isSelected = editStyles.includes(style)
                  return (
                    <button
                      key={style}
                      type="button"
                      className={`onb-style-btn ${isSelected ? 'onb-style-btn-active' : ''}`}
                      onClick={() => handleStyleToggle(style)}
                    >
                      {style}
                    </button>
                  )
                })}
              </div>
              {styleLimitHit && (
                <p className="onb-header-subtitle" style={{ color: 'var(--color-red)', marginTop: 'var(--space-xxs)', fontSize: 'var(--font-size-sm)' }}>
                  Max 3 styles.
                </p>
              )}
            </div>

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
              <label className="events-create-label">City</label>
              <input
                type="text"
                className="events-create-input"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="Where do you climb?"
              />
            </div>

            {/* Grade selector */}
            <div className="events-create-field">
              <label className="events-create-label">Grade</label>
              <div className="onb-gender-select">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    className={`onb-gender-btn ${editGrade === grade ? 'onb-gender-btn-active' : ''}`}
                    onClick={() => handleGradeSelect(grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Looking for selector */}
            <div className="events-create-field">
              <label className="events-create-label">Looking for</label>
              <p className="onb-field-description" style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
                What brings you here? Select all that apply.
              </p>
              <div className="onb-style-grid">
                {LOOKING_FOR_OPTIONS.map((purpose) => {
                  const isSelected = editPurposes.includes(purpose)
                  return (
                    <button
                      key={purpose}
                      type="button"
                      className={`onb-style-btn ${isSelected ? 'onb-style-btn-active' : ''}`}
                      onClick={() => handlePurposeToggle(purpose)}
                    >
                      {purpose}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Gym selector */}
            <div className="events-create-field">
              <label className="events-create-label">Gyms</label>
              <p className="onb-field-description" style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
                Select all you want to follow or frequently climb at.
              </p>

              <div className="onb-gym-grid">
                {gymsLoading ? (
                  <LoadingState message="Loading gyms..." />
                ) : gyms.length === 0 ? (
                  <EmptyState message="No gyms found" />
                ) : (
                  <>
                    {/* "I climb outside" option */}
                    <button
                      type="button"
                      className={`onb-gym-card ${climbsOutside ? 'onb-gym-card-active' : ''}`}
                      onClick={handleOutsideToggle}
                    >
                      <div className="onb-gym-img-wrap">
                        <div className="onb-gym-outside-icon">🏔️</div>
                      </div>
                      <div className="onb-gym-info">
                        <span className="onb-gym-name">I climb outside</span>
                        <span className="onb-gym-city">Outdoor climbing</span>
                      </div>
                    </button>

                    {/* First 3 gyms - always visible */}
                    {gyms.slice(0, 3).map((gym) => {
                      const isSelected = selectedGyms.includes(gym.id)
                      return (
                        <button
                          key={gym.id}
                          type="button"
                          className={`onb-gym-card ${isSelected ? 'onb-gym-card-active' : ''}`}
                          onClick={() => handleGymToggle(gym.id)}
                        >
                          <div className="onb-gym-img-wrap">
                            <img
                              src={gym.image_url || '/placeholder-gym.svg'}
                              alt={gym.name}
                              className="onb-gym-img"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-gym.svg'
                              }}
                            />
                          </div>
                          <div className="onb-gym-info">
                            <span className="onb-gym-name">{gym.name}</span>
                            <span className="onb-gym-city">{gym.area}</span>
                          </div>
                        </button>
                      )
                    })}

                    {/* Dropdown for remaining gyms */}
                    {gyms.length > 3 && (
                      <div className="onb-gym-dropdown-wrapper">
                        <button
                          type="button"
                          className="onb-gym-dropdown-toggle"
                          onClick={() => setShowMoreGyms(!showMoreGyms)}
                          aria-expanded={showMoreGyms}
                        >
                          <span className="onb-gym-dropdown-text">
                            {showMoreGyms ? 'Show less' : `Show ${gyms.length - 3} more gyms`}
                          </span>
                          <span className={`onb-gym-dropdown-arrow ${showMoreGyms ? 'onb-gym-dropdown-arrow-open' : ''}`}>
                            ▼
                          </span>
                        </button>

                        {showMoreGyms && (
                          <div className="onb-gym-dropdown-content">
                            {gyms.slice(3).map((gym) => {
                              const isSelected = selectedGyms.includes(gym.id)
                              return (
                                <button
                                  key={gym.id}
                                  type="button"
                                  className={`onb-gym-card ${isSelected ? 'onb-gym-card-active' : ''}`}
                                  onClick={() => handleGymToggle(gym.id)}
                                >
                                  <div className="onb-gym-img-wrap">
                                    <img
                                      src={gym.image_url || '/placeholder-gym.svg'}
                                      alt={gym.name}
                                      className="onb-gym-img"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-gym.svg'
                                      }}
                                    />
                                  </div>
                                  <div className="onb-gym-info">
                                    <span className="onb-gym-name">{gym.name}</span>
                                    <span className="onb-gym-city">{gym.area}</span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
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


