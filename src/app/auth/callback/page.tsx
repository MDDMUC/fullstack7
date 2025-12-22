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
    const exchange = async () => {
      if (!supabase) {
        setError('Supabase is not configured.')
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


