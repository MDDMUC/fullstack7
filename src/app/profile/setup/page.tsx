'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import { fetchProfiles, Profile } from '@/lib/profiles'
import { upsertOnboardingProfile } from '@/lib/profileUtils'

export default function ProfileSetup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const client = supabase ?? requireSupabase()
        const { data: userData, error: userErr } = await client.auth.getUser()
        if (userErr || !userData.user) {
          router.push('/login')
          return
        }
        const list = await fetchProfiles(client, [userData.user.id])
        if (list[0]) setProfile(list[0])
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [router])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const username = (data.get('username') as string)?.trim()
    const city = (data.get('city') as string)?.trim()
    const style = (data.get('style') as string)?.trim()
    const grade = (data.get('grade') as string)?.trim()
    const bio = (data.get('bio') as string)?.trim()
    const availability = (data.get('availability') as string)?.trim()

    try {
      const client = supabase ?? requireSupabase()
      const { data: userData, error: userErr } = await client.auth.getUser()
      if (userErr || !userData.user) {
        router.push('/login')
        return
      }
      setLoading(true)
      await upsertOnboardingProfile(client, userData.user.id, {
        username: username || userData.user.email || undefined,
        homebase: city,
        styles: style ? style.split('/').map(s => s.trim()) : undefined,
        grade,
        bio,
        availability: availability ? availability.split(',').map(s => s.trim()) : undefined,
      })
      // Note: profiles table has been removed - all data now in onboardingprofiles
      setLoading(false)
      setStatus('Profile saved.')
      router.push('/home')
    } catch (err: any) {
      setLoading(false)
      setStatus(err.message ?? 'Failed to save profile')
    }
  }

  return (
    <main className="signup-wrapper">
      <section className="signup-hero">
        <div className="signup-copy">
          <p className="eyebrow">Set up your profile</p>
          <h1>Share your climbing style and schedule.</h1>
          <p className="lede">Add the essentials so partners know where and how you climb.</p>
        </div>

        <div className="signup-panel">
          <div className="panel-header">
            <h3>Your profile</h3>
            <p className="sub">You can update this anytime.</p>
          </div>

          <form className="signup-form" onSubmit={onSubmit}>
            <label className="field">
              <span>Name</span>
              <input name="username" defaultValue={profile?.username} placeholder="Alex Sender" />
            </label>
            <label className="field">
              <span>City</span>
              <input name="city" defaultValue={profile?.city} placeholder="Boulder, CO" />
            </label>
            <div className="field-duo">
              <label className="field">
                <span>Style</span>
                <input name="style" defaultValue={profile?.style} placeholder="Bouldering / Sport" />
              </label>
              <label className="field">
                <span>Grade focus</span>
                <input name="grade" defaultValue={profile?.grade} placeholder="5.11b / V5" />
              </label>
            </div>
            <label className="field">
              <span>Availability</span>
              <input name="availability" defaultValue={profile?.availability} placeholder="Weeknights / Weekends" />
            </label>
            <label className="field">
              <span>Bio</span>
              <textarea name="bio" rows={3} defaultValue={profile?.bio} placeholder="Trad partner for desert season, training for alpine this summer." />
            </label>
            <button className="button-navlink button-navlink-hover" style={{ width: '100%', height: 'var(--btn-height-lg)' }} type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Saving...' : 'Save profile'}
            </button>
            {status && <p className="form-note" aria-live="polite">{status}</p>}
          </form>
        </div>
      </section>
    </main>
  )
}

