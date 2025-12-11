'use client'

import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import MobileNavbar from '@/components/MobileNavbar'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, Profile as DbProfile } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'

type Profile = DbProfile

const FALLBACK_MALE = '/fallback-male.jpg'
const FALLBACK_FEMALE = '/fallback-female.jpg'

const fallbackAvatarFor = (profile?: Profile | null) => {
  const hint = (profile?.pronouns || (profile as any)?.gender || '').toString().toLowerCase()
  if (hint.includes('she') || hint.includes('her') || hint.includes('woman') || hint.includes('female')) {
    return FALLBACK_FEMALE
  }
  return FALLBACK_MALE
}

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

  const avatar = profile?.avatar_url ?? fallbackAvatarFor(profile)
  const name = profile?.username || 'Your profile'
  const age = profile?.age ? String(profile.age) : '—'
  const location = profile?.city || profile?.homebase || '—'
  const styles = useMemo(() => splitCommaList(profile?.style), [profile?.style])
  const grade = profile?.grade || ''
  const chips = useMemo(() => profile?.tags ?? [], [profile?.tags])

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
                {profile?.status || 'Online'}
              </span>
            </div>

            <div className="profile-hero">
              <img src={avatar} alt="Profile" className="profile-hero-img" />
              <div className="profile-hero-overlay">
                <div className="profile-name-row">
                  <div className="profile-name">{name}</div>
                  <div className="profile-age">{age}</div>
                </div>
                <div className="profile-location">{location}</div>
                <div className="profile-tags-row">
                  {(styles.length ? styles : ['Style']).slice(0, 2).map(tag => (
                    <span key={tag} className="button-tag">{tag}</span>
                  ))}
                  <span className="button-tag button-tag-grade">{grade || 'Grade'}</span>
                </div>
                <div className="profile-chips-row">
                  {(chips.length ? chips : ['Belay Certified', 'Host']).slice(0, 4).map(chip => (
                    <span key={chip} className="button-chip">{chip}</span>
                  ))}
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
              <button type="button" className="profile-btn-cancel" disabled={loading}>CANCEL</button>
              <button type="button" className="profile-btn-save" disabled={loading}>SAVE</button>
            </div>
          </div>

          <MobileNavbar active="profile" />
        </div>
      </div>
    </RequireAuth>
  )
}

