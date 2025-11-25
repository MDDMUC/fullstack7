'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { appUrl, supabase } from '@/lib/supabaseClient'
import LoginGuard from '@/components/LoginGuard'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined

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
      // Check if error is due to unconfirmed email
      const isUnconfirmedEmail = 
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.message?.toLowerCase().includes('email_not_confirmed') ||
        error.message?.toLowerCase().includes('confirm your email') ||
        error.message?.toLowerCase().includes('verification')
      
      if (isUnconfirmedEmail) {
        setNeedsEmailConfirmation(true)
        setPendingEmail(email)
        setStatus('Please confirm your email address before logging in. Check your inbox for the verification email.')
      } else {
        setStatus(error.message)
      }
      return
    }

    if (!loginData.user?.id) {
      setStatus('Login successful but user ID not available.')
      return
    }

    // Check if user has a profile
    const { data: profile } = await supabase
      .from('onboardingprofiles')
      .select('id')
      .eq('id', loginData.user.id)
      .single()

    // Check for saved onboarding data
    const savedOnboardingData = localStorage.getItem('onboarding_data')
    
    if (savedOnboardingData) {
      try {
        const _onboardingData = JSON.parse(savedOnboardingData)
        console.log('Found onboarding data after login, will apply during onboarding...')
        // Don't apply here - let onboarding flow handle it
      } catch (applyError: any) {
        console.error('Error parsing onboarding data after login:', applyError)
      }
    }

    // Redirect based on profile status
    if (profile) {
      // User has profile, go to home
      router.push('/home')
    } else {
      // No profile yet, redirect to onboarding
      router.push('/onboarding')
    }
  }

  const handleResendConfirmation = async () => {
    if (!supabase || !pendingEmail) {
      setStatus('Email not available for resend.')
      return
    }

    setResendLoading(true)
    setStatus('Resending confirmation email...')

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (resendError) {
        console.error('Resend confirmation error:', resendError)
        const msg = resendError.message || 'Failed to resend confirmation email. Please check your spam folder.'
        const lower = msg.toLowerCase()
        if (lower.includes('redirect')) {
          setStatus('Redirect URL not allowed. Add your site URL and /auth/callback to Supabase > Authentication > URL Configuration.')
        } else if (resendError.status === 429 || lower.includes('rate')) {
          setStatus('Too many attempts. Please wait a minute and try again.')
        } else {
          setStatus(msg)
        }
      } else {
        setStatus('Confirmation email sent! Please check your inbox (and spam folder).')
      }
    } catch (error: any) {
      console.error('Resend confirmation error:', error)
      setStatus(error.message || 'Failed to resend confirmation email.')
    } finally {
      setResendLoading(false)
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

            <form className="signup-form" onSubmit={onSubmit}>
              <label className="field">
                <span>Email</span>
                <input type="email" name="email" required placeholder="you@climbmail.com" />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" name="password" required minLength={8} placeholder="Your password" />
              </label>
              <button className="cta wide" type="submit" disabled={loading || resendLoading} aria-busy={loading}>
                {loading ? 'Signing in…' : 'Log in'}
              </button>
              {status && (
                <p className={`form-note ${needsEmailConfirmation ? 'info' : 'error'}`} aria-live="polite">
                  {status}
                </p>
              )}
              {needsEmailConfirmation && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="ghost"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      border: '1px solid var(--stroke)',
                      borderRadius: '8px',
                      background: 'transparent',
                      cursor: resendLoading ? 'not-allowed' : 'pointer',
                      opacity: resendLoading ? 0.6 : 1,
                    }}
                  >
                    {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </LoginGuard>
  )
}
