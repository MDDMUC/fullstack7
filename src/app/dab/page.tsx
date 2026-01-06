'use client'

import { useEffect, useState, useRef } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import BasicProfileStep from './steps/BasicProfileStep'

import InterestsStep from './steps/InterestsStep'
import LocationStep from './steps/LocationStep'
import PledgeStep from './steps/PledgeStep'
import SuccessStep from './steps/SuccessStep'

export default function OnboardingPage() {
  const { currentStep } = useOnboarding()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const hasCheckedRef = useRef(false)

  // Only run the profile check once on initial mount, and only if not on final steps
  useEffect(() => {
    // CRITICAL: Never run check if on final steps (4 pledge, 5 success)
    // This prevents redirects during active onboarding completion
    if (currentStep >= 4) {
      setChecking(false)
      hasCheckedRef.current = true // Mark as checked to prevent future runs
      return
    }

    // Skip check if already checked
    if (hasCheckedRef.current) {
      setChecking(false)
      return
    }

    const checkAuthAndProfile = async () => {
      if (!supabase) {
        setChecking(false)
        hasCheckedRef.current = true
        return
      }

      // Mark as checked immediately to prevent re-runs
      hasCheckedRef.current = true

      try {
        const { safeGetUser } = await import('@/lib/authUtils')
        const { user, error: userError } = await safeGetUser(supabase)

        // If user is authenticated, check if they have completed onboarding
        if (user && !userError) {
          // Check current step again before redirecting (in case it changed during async operation)
          const stepAtCheckTime = currentStep

          // CRITICAL: Never redirect if on final onboarding steps
          if (stepAtCheckTime >= 4) {
            console.log('On final onboarding steps, skipping redirect check')
            return
          }

          // Use hasCompletedOnboarding to check if profile is COMPLETE (not just exists)
          // This prevents redirect loops where profile exists but is missing required fields
          const { hasCompletedOnboarding } = await import('@/lib/onboardingGuard')
          const isComplete = await hasCompletedOnboarding()

          // Check if testing mode is enabled (bypass profile check)
          const isTestingMode =
            typeof window !== 'undefined' &&
            (localStorage.getItem('onboarding_test_mode') === 'true' ||
             new URLSearchParams(window.location.search).get('test') === 'true')

          // Only redirect if:
          // 1. Onboarding is COMPLETE (profile has all required fields)
          // 2. We're still on early steps (1-3)
          // 3. User is not actively completing onboarding (steps 4+ mean they're in flow)
          // 4. Testing mode is not enabled
          if (isComplete && stepAtCheckTime < 4 && !isTestingMode) {
            // Final safety check - never redirect if somehow we got to final steps
            if (currentStep >= 4) {
              console.log('Step changed to final steps during check, aborting redirect')
              return
            }
            console.log('User has completed onboarding, redirecting to home')
            console.log('💡 To test onboarding again, add ?test=true to the URL or set localStorage.setItem("onboarding_test_mode", "true")')
            router.replace('/home')
            return
          } else if (isComplete) {
            // User has completed onboarding but is on step 4+, meaning they're actively in onboarding
            // Don't redirect - let them complete it
            console.log('User has completed onboarding but is in onboarding flow, allowing to continue')
          } else if (isTestingMode) {
            console.log('🧪 Testing mode enabled - allowing onboarding even with existing profile')
          } else {
            console.log('Onboarding incomplete, staying on /dab to complete')
          }
        }
      } catch (error) {
        console.error('Error checking auth/profile:', error)
        // Continue with onboarding if check fails
      } finally {
        setChecking(false)
      }
    }

    checkAuthAndProfile()
  }, [currentStep, router])

  // Show loading state while checking
  if (checking) {
    return (
      <div className="bg-white flex items-center justify-center min-h-screen w-full">
        <p style={{ color: 'var(--color-muted)' }}>Loading...</p>
      </div>
    )
  }

  // Onboarding flow: 4 steps + success
  const steps = [
    { component: BasicProfileStep, step: 1 }, // Step 1: Basic Profile (Photo, Age, Gender)
    { component: InterestsStep, step: 2 },    // Step 2: Intent + Climbing Style (max 3)
    { component: LocationStep, step: 3 },     // Step 3: Homebase + Gyms (optional)
    { component: PledgeStep, step: 4 },       // Step 4: Pledge (single-tap)
    { component: SuccessStep, step: 5 },      // Step 5: Success / Welcome to the Crew
  ]

  const currentStepData = steps.find(s => s.step === currentStep)
  
  // If no step found, default to first step
  if (!currentStepData) {
    console.warn(`Step ${currentStep} not found, defaulting to step 1`)
  }

  const CurrentComponent = currentStepData?.component || BasicProfileStep

  // Render step component directly - no mobile shell for maximum screen space
  // Onboarding is our most critical feature and needs to be seamless
  return <CurrentComponent />
}


