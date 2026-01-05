'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const { session, loading } = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    // If user is logged in, redirect to /home
    if (!loading && session) {
      router.push('/home')
    }
  }, [session, loading, router])

  // Show nothing while checking auth or redirecting
  if (loading || session) {
    return null
  }

  // Show landing page only for logged-out users
  return <LandingPage />
}

