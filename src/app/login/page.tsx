'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import LoginGuard from '@/components/LoginGuard'

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
    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setStatus(error.message)
      return
    }

    if (!loginData.user?.id) {
      setStatus('Login successful but user ID not available.')
      return
    }

    // Check for saved onboarding data and apply it
    const savedOnboardingData = localStorage.getItem('onboarding_data')
    if (savedOnboardingData) {
      try {
        const onboardingData = JSON.parse(savedOnboardingData)
        console.log('Found onboarding data after login, applying to profile...')
        
        const { applyOnboardingDataToProfile } = await import('@/lib/applyOnboardingData')
        await applyOnboardingDataToProfile(supabase, loginData.user.id, onboardingData)
        
        console.log('Onboarding data successfully applied after login')
        localStorage.removeItem('onboarding_data')
      } catch (applyError: any) {
        console.error('Error applying onboarding data after login:', applyError)
        setStatus(`Login successful, but failed to apply saved profile data: ${applyError.message || 'Unknown error'}`)
        // Continue to home even if applying fails - user can update profile later
      }
    }

    router.push('/home')
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

            <form className="signup-form" onSubmit={onSubmit}>
              <label className="field">
                <span>Email</span>
                <input type="email" name="email" required placeholder="you@climbmail.com" />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" name="password" required minLength={8} placeholder="Your password" />
              </label>
              <button className="cta wide" type="submit" disabled={loading} aria-busy={loading}>
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
