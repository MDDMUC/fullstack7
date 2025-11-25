'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const styles = ['Bouldering', 'Sport', 'Trad', 'Alpine', 'Ice']
const goals = ['Regular partner', 'Weekend projects', 'Trip planning', 'Training accountability']

type Status = { type: 'idle' | 'error' | 'success' | 'info'; message: string }

export default function Signup() {
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' })
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
  const router = useRouter()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const name         = (data.get('name') as string)?.trim()
    const email        = (data.get('email') as string)?.trim()
    const password     = (data.get('password') as string) || ''
    const confirm      = (data.get('confirm') as string) || ''
    const style        = data.get('style') as string
    const grade        = (data.get('grade') as string)?.trim()
    const availability = data.get('availability') as string
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

    if (!supabase) {
      setStatus({ type: 'error', message: 'Supabase is not configured.' })
      setLoading(false)
      return
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name,
          style,
          grade,
          availability,
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
    if (!userId) {
      setStatus({ type: 'error', message: 'Account created but user ID not available. Please try logging in.' })
      setLoading(false)
      return
    }

    // Check for saved onboarding data
    let onboardingData: any = null
    const savedOnboardingData = localStorage.getItem('onboarding_data')
    
    if (savedOnboardingData) {
      try {
        onboardingData = JSON.parse(savedOnboardingData)
        console.log('Found saved onboarding data, will apply to profile')
      } catch (e) {
        console.error('Error parsing onboarding data:', e)
        // Continue with signup form data if parsing fails
      }
    }

    // Create profile using unified utility
    try {
      if (onboardingData) {
        // Use onboarding data (more complete)
        const { applyOnboardingDataToProfile } = await import('@/lib/applyOnboardingData')
        await applyOnboardingDataToProfile(supabase, userId, onboardingData)
        console.log('Onboarding data successfully applied to profile')
        localStorage.removeItem('onboarding_data')
      } else {
        // Use signup form data
        const { createOrUpdateProfile, signupFormDataToProfileData } = await import('@/lib/profileUtils')
        const profileData = signupFormDataToProfileData({
          name,
          email,
          style,
          grade,
          availability,
          goals: goalTags,
        })
        
        const { error: profileError } = await createOrUpdateProfile(supabase, userId, profileData)
        if (profileError) {
          throw profileError
        }
        console.log('Profile created from signup form data')
      }
    } catch (profileError: any) {
      console.error('Error creating profile:', profileError)
      setStatus({
        type: 'error',
        message: `Account created, but profile could not be saved: ${profileError.message || 'Unknown error'}. Please contact support.`,
      })
      setLoading(false)
      return
    }

    form.reset()
    setLoading(false)

    // Success - redirect based on whether onboarding was completed
    if (onboardingData) {
      // User completed onboarding, redirect to home
      setStatus({
        type: 'success',
        message: 'Account created! Your profile has been saved. Redirecting...',
      })
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    } else {
      // User signed up directly, redirect to profile setup
      setStatus({
        type: 'success',
        message: 'Account created! Check your email to confirm. Redirecting...',
      })
      setTimeout(() => {
        router.push('/profile/setup')
      }, 1500)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setStatus({ type: 'error', message: 'Supabase is not configured.' })
      return
    }

    setOauthLoading('google')
    setStatus({ type: 'info', message: 'Redirecting to Google...' })

    try {
      // Check for saved onboarding data to pass along
      const savedOnboardingData = localStorage.getItem('onboarding_data')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        setStatus({ type: 'error', message: error.message })
        setOauthLoading(null)
      }
      // If successful, user will be redirected to Google, then to callback
      // The callback handler will create the profile
    } catch (error: any) {
      console.error('Google OAuth error:', error)
      setStatus({ type: 'error', message: error.message || 'Failed to sign in with Google.' })
      setOauthLoading(null)
    }
  }

  const handleAppleSignIn = async () => {
    if (!supabase) {
      setStatus({ type: 'error', message: 'Supabase is not configured.' })
      return
    }

    setOauthLoading('apple')
    setStatus({ type: 'info', message: 'Redirecting to Apple...' })

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setStatus({ type: 'error', message: error.message })
        setOauthLoading(null)
      }
      // If successful, user will be redirected to Apple, then to callback
    } catch (error: any) {
      console.error('Apple OAuth error:', error)
      setStatus({ type: 'error', message: error.message || 'Failed to sign in with Apple.' })
      setOauthLoading(null)
    }
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
            <button 
              type="button" 
              className="oauth-button oauth-google"
              onClick={handleGoogleSignIn}
              disabled={oauthLoading !== null || loading}
            >
              <svg className="oauth-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H15.9564C17.4382 14.2527 18.18 12.0455 18.18 9.20454H17.64Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65455 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65455 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              <span>{oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
            <button 
              type="button" 
              className="oauth-button oauth-apple"
              onClick={handleAppleSignIn}
              disabled={oauthLoading !== null || loading}
            >
              <svg className="oauth-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.2812 3.09375C12.4688 3.9375 11.3438 4.5 10.125 4.40625C10.0312 3.375 10.4062 2.34375 11.1562 1.59375C11.9062 0.84375 12.9375 0.46875 13.875 0.5625C13.9688 1.59375 13.5938 2.625 13.2812 3.09375ZM13.5 4.78125C12.375 4.6875 11.3438 5.25 10.6875 5.25C10.0312 5.25 9.09375 4.78125 8.15625 4.78125C6.1875 4.78125 4.5 5.71875 3.65625 7.40625C2.34375 9.84375 3.375 13.2188 4.78125 15.0938C5.53125 16.0312 6.375 17.0625 7.5 16.9688C8.53125 16.875 8.90625 16.3125 10.125 16.3125C11.3438 16.3125 11.625 16.9688 12.75 16.875C13.875 16.7812 14.625 15.8438 15.375 14.9062C16.2188 13.7812 16.5938 12.6562 16.6875 12.5625C16.5938 12.4688 13.9688 11.5312 13.875 8.15625C13.7812 5.34375 15.9375 4.40625 16.0312 4.40625C15.0938 3.09375 13.5938 4.6875 13.5 4.78125Z" fill="currentColor"/>
              </svg>
              <span>{oauthLoading === 'apple' ? 'Connecting...' : 'Continue with Apple'}</span>
            </button>
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
