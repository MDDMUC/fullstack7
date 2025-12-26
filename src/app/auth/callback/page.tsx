'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    // Check for errors in URL hash fragment (Supabase auth errors)
    const handleHashErrors = () => {
      if (typeof window === 'undefined') return null
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const error = params.get('error')
      const errorCode = params.get('error_code')
      const errorDescription = params.get('error_description')

      if (error) {
        return {
          error,
          code: errorCode,
          description: errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : error
        }
      }
      return null
    }

    const hashError = handleHashErrors()

    const exchange = async () => {
      if (!supabase) {
        setError('Supabase is not configured.')
        setStatus('error')
        return
      }

      // Check for hash fragment errors (like expired links)
      if (hashError) {
        if (hashError.code === 'otp_expired') {
          setError('This confirmation link has expired. Please sign up again to receive a new confirmation email.')
        } else {
          setError(hashError.description || 'Authentication failed.')
        }
        setStatus('error')
        return
      }

      if (!code) {
        setError('Missing confirmation code.')
        setStatus('error')
        return
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        setError(exchangeError.message)
        setStatus('error')
        return
      }

      const next = searchParams.get('next') || '/dab'
      setStatus('done')
      router.replace(next)
    }

    exchange()
  }, [router, searchParams])

  return (
    <div className="auth-callback-screen">
      <div className="auth-callback-card">
        <p className="auth-callback-title">
          {status === 'loading' ? 'Confirming your email...' : status === 'done' ? 'Redirecting to onboarding...' : 'Something went wrong'}
        </p>
        {error && <p className="auth-callback-error">{error}</p>}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="auth-callback-screen">
        <div className="auth-callback-card">
          <p className="auth-callback-title">Confirming your email...</p>
        </div>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  )
}


