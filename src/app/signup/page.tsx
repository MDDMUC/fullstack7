'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const styles = ['Bouldering', 'Sport', 'Trad', 'Alpine', 'Ice']
const goals = ['Regular partner', 'Weekend projects', 'Trip planning', 'Training accountability']

type Status = { type: 'idle' | 'error' | 'success' | 'info'; message: string }

export default function Signup() {
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const name         = (data.get('name') as string)?.trim()
    const email        = (data.get('email') as string)?.trim()
    const password     = (data.get('password') as string) || ''
    const confirm      = (data.get('confirm') as string) || ''
    const home         = (data.get('home') as string)?.trim()
    const style        = data.get('style') as string
    const grade        = (data.get('grade') as string)?.trim()
    const availability = data.get('availability') as string
    const bio          = (data.get('bio') as string)?.trim()
    const goalTags     = data.getAll('goals') as string[]

    if (password !== confirm) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    if (!email) {
      setStatus({ type: 'error', message: 'Email is required.' })
      return
    }

    setLoading(true)
    setStatus({ type: 'info', message: 'Creating your account...' })

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name,
          home,
          style,
          grade,
          availability,
          bio,
          goals: goalTags,
        },
      },
    })

    if (signUpError) {
      setStatus({ type: 'error', message: signUpError.message })
      setLoading(false)
      return
    }

    const userId = signUpData.user?.id
    let profileErr: string | null = null

    if (userId) {
      const { error: profileInsertError } = await supabase.from('profiles').upsert([
        {
          id: userId,
          username: name || email,
          city: home,
          style,
          grade,
          bio,
          tags: goalTags,
          status: 'Joined just now',
        },
      ])
      if (profileInsertError) profileErr = profileInsertError.message
    }

    form.reset()
    setLoading(false)

    if (profileErr) {
      setStatus({
        type: 'error',
        message: `Account created, but profile not saved: ${profileErr}`,
      })
      return
    }

    setStatus({
      type: 'success',
      message: 'Check your email to confirm. Your profile has been saved.',
    })
  }

  return (
    <main className="signup-wrapper">
      <section className="signup-hero">
        <div className="signup-copy">
          <p className="eyebrow">Join the beta</p>
          <h1>Sign up and match with climbers who send like you do.</h1>
          <p className="lede">Fast onboarding, clear safety checks, and matches tuned to your grades, style, and schedule.</p>
          <div className="pill-row">
            <span>1. Verify email</span>
            <span>2. Set climbing styles</span>
            <span>3. Get matched</span>
          </div>
          <ul className="benefits">
            <li>Modern safety defaults (no phone sharing until you opt-in)</li>
            <li>Signal boost for verified belayers and mentors</li>
            <li>Smart filters for grades, availability, and travel radius</li>
          </ul>
        </div>

        <div className="signup-panel">
          <div className="panel-header">
            <h3>Create your account</h3>
            <p className="sub">We&apos;ll sync your profile in under a minute.</p>
          </div>

          <div className="oauth-buttons">
            <button type="button" className="ghost wide">Continue with Google</button>
            <button type="button" className="ghost wide">Continue with Apple</button>
          </div>

          <div className="divider"><span>or</span></div>

          <form className="signup-form" onSubmit={onSubmit}>
            <label className="field">
              <span>Full name</span>
              <input name="name" required placeholder="Alex Sender" />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" name="email" required placeholder="you@climbmail.com" />
            </label>
            <div className="field-duo">
              <label className="field">
                <span>Password</span>
                <input type="password" name="password" required minLength={8} placeholder="8+ characters" />
              </label>
              <label className="field">
                <span>Confirm</span>
                <input type="password" name="confirm" required minLength={8} placeholder="Repeat password" />
              </label>
            </div>
            <label className="field">
              <span>Home base</span>
              <input name="home" required placeholder="Boulder, CO" />
            </label>
            <div className="field-duo">
              <label className="field">
                <span>Primary style</span>
                <select name="style" defaultValue="">
                  <option value="" disabled>Select style</option>
                  {styles.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Grade focus</span>
                <input name="grade" placeholder="5.11b / V5" />
              </label>
            </div>
            <label className="field">
              <span>What are you looking for?</span>
              <div className="chip-row">
                {goals.map(goal => (
                  <label key={goal} className="chip-toggle">
                    <input type="checkbox" name="goals" value={goal} />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </label>
            <label className="field">
              <span>Availability</span>
              <select name="availability" defaultValue="">
                <option value="" disabled>Select availability</option>
                <option>Weeknights</option>
                <option>Weekends</option>
                <option>Dawn patrol</option>
                <option>Flexible</option>
              </select>
            </label>
            <label className="field">
              <span>Bio</span>
              <textarea name="bio" rows={3} placeholder="Trad partner for desert season, training for alpine this summer." />
            </label>
            <label className="checkbox">
              <input type="checkbox" name="terms" required />
              <span>I agree to community guidelines and safety rules.</span>
            </label>
            <button className="cta wide" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
            {status.message && (
              <p className={`form-note ${status.type}`} aria-live="polite">
                {status.message}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}
