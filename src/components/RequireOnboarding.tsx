// src/components/RequireOnboarding.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { hasCompletedOnboarding } from '@/lib/onboardingGuard'

/**
 * Protects routes by requiring both authentication AND completed onboarding
 * Redirects to /dab if user is not authenticated or hasn't completed onboarding
 */
export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { session, loading: authLoading } = useAuthSession()
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkOnboarding() {
      // Wait for auth to load
      if (authLoading) return

      // Not authenticated → redirect to onboarding/signup
      if (!session) {
        router.replace('/dab')
        return
      }

      // Check if onboarding is complete
      const isComplete = await hasCompletedOnboarding()
      setOnboardingComplete(isComplete)

      // Onboarding not complete → redirect to onboarding flow
      if (!isComplete) {
        router.replace('/dab')
      }
    }

    checkOnboarding()
  }, [session, authLoading, router])

  // Show nothing while checking
  if (authLoading || onboardingComplete === null) {
    return null
  }

  // Show nothing if not authenticated or onboarding incomplete (redirecting)
  if (!session || !onboardingComplete) {
    return null
  }

  // All checks passed - render children
  return <>{children}</>
}
