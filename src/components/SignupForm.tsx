'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  compact?: boolean
  heading?: string
  subheading?: string
}

export default function SignupForm({ compact = false, heading, subheading }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'info' | 'success'; text: string } | null>(null)
  const router = useRouter()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = (data.get('name') as string)?.trim()
    const email = (data.get('email') as string)?.trim()
    const password = (data.get('password') as string) || ''
    const confirm = (data.get('confirm') as string) || ''

    setMessage(null)

    if (!email || !password || !confirm || !name) {
      setMessage({ type: 'error', text: 'All fields are required.' })
      return
    }
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' })
      return
    }

    setLoading(true)
    setMessage({ type: 'info', text: 'Creating your account...' })

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name },
      },
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }

    setMessage({ type: 'success', text: 'Check your email to confirm. Redirecting...' })
    router.push('/dab')
  }

  return (
    <div className={`signup-panel ${compact ? '' : ''}`}>
      <div className="panel-header">
        <h3>{heading || 'Create your account'}</h3>
        <p className="sub">{subheading || 'We’ll take you through a fast onboarding next.'}</p>
      </div>

      <div className="oauth-buttons">
        <button type="button" className="oauth-btn google-btn">Continue with Google</button>
        <button type="button" className="oauth-btn apple-btn">Continue with Apple</button>
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
        <button className="cta wide" type="submit" disabled={loading} aria-busy={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
        {message && (
          <p className={`form-note ${message.type}`} aria-live="polite">
            {message.text}
          </p>
        )}
      </form>
    </div>
  )
}
