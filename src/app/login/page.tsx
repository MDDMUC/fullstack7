'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import LoginGuard from '@/components/LoginGuard'
import { safeGetUser } from '@/lib/authUtils'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const email = (data.get('email') as string)?.trim()
    const password = (data.get('password') as string) || ''

    setStatus('')
    if (!email) {
      setStatus('Email is required.')
      return
    }
    if (!supabase) {
      setStatus('Supabase not configured.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setStatus(error.message)
      return
    }

    // Best practice: route first-time logins to onboarding if profile not set
    const { user, error: userError } = await safeGetUser(supabase)
    if (!user || userError) {
      router.push('/dab')
      return
    }
    const { data: obProfile } = await supabase
      .from('onboardingprofiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (obProfile) {
      router.push('/home')
    } else {
      router.push('/dab')
    }
  }

  return (
    <LoginGuard>
      <main className="signup-wrapper">
        <section className="signup-hero">
          <div className="signup-copy">
            <p className="eyebrow">Welcome back</p>
            <h1>Log in to keep sending.</h1>
            <p className="lede">Match partners, chat in real-time, and plan your next project.</p>
          </div>

          <div className="signup-panel">
            <div className="panel-header">
              <h3>Log in</h3>
              <p className="sub">Use your account email and password.</p>
            </div>

            <div className="oauth-buttons">
              <button type="button" className="oauth-btn google-btn">
                <span className="oauth-icon google-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                    <path fill="#EA4335" d="M9 7.3v3.6h5.1c-.2 1.2-.9 2.2-2 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.8 0-.7-.1-1.4-.3-2H9z"/>
                    <path fill="#34A853" d="M9 18c2.4 0 4.4-.8 5.9-2.2l-3.1-2.4c-.8.5-1.7.8-2.8.8-2.2 0-4.1-1.5-4.8-3.5L1 13.3C2.5 16 5.5 18 9 18z"/>
                    <path fill="#4A90E2" d="M4.2 10.7c-.2-.5-.3-1-.3-1.7s.1-1.2.3-1.7L1 4.7C.4 6 .1 7.5.1 9s.3 3 .9 4.3l3.2-2.6z"/>
                    <path fill="#FBBC05" d="M9 3.6c1.3 0 2.5.4 3.4 1.3l2.5-2.5C13.3.9 11.3 0 9 0 5.5 0 2.5 2 1 4.7l3.2 2.6C4.9 5.1 6.8 3.6 9 3.6z"/>
                  </svg>
                </span>
                Continue with Google
              </button>
              <button type="button" className="oauth-btn apple-btn">
                <span className="oauth-icon apple-icon" aria-hidden="true">
                  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M12.9 9.7c0 1.8.9 2.6.9 2.6s-.7 2.2-2.1 2.2c-.6 0-1.1-.4-1.8-.4-.7 0-1.3.4-1.8.4-1.4 0-2.5-2.1-2.5-3.7 0-1.6 1-2.4 2-2.4.8 0 1.5.4 1.8.4.3 0 1.2-.5 2.1-.5 1.7-.1 1.4 1.4 1.4 1.4zm-2.3-4.3c.4-.5.7-1.2.7-1.9 0-.1 0-.2-.1-.3-.6.1-1.3.4-1.7.9-.4.5-.7 1.1-.6 1.8 0 .1 0 .2.1.3.6.1 1.3-.3 1.6-.8z"/>
                  </svg>
                </span>
                Continue with Apple
              </button>
            </div>

            <div className="divider"><span>or</span></div>

            <form className="signup-form" onSubmit={onSubmit}>
              <label className="field">
                <span>Email</span>
                <input type="email" name="email" required placeholder="you@climbmail.com" />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" name="password" required minLength={8} placeholder="Your password" />
              </label>
              <button className="megabtn megabtn-cta megabtn-full" type="submit" disabled={loading} aria-busy={loading}>
                {loading ? 'Signing in…' : 'Log in'}
              </button>
              {status && (
                <p className="form-note error" aria-live="polite">{status}</p>
              )}
            </form>
          </div>
        </section>
      </main>
    </LoginGuard>
  )
}
