'use client'

import { useEffect, useState, useRef } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PhoneStep from './steps/PhoneStep'
import WelcomeStep from './steps/WelcomeStep'
import NameAgeGenderStep from './steps/NameAgeGenderStep'
import PurposeStep from './steps/PurposeStep'
import ShowMeStep from './steps/ShowMeStep'
import InterestsStep from './steps/InterestsStep'
import LocationStep from './steps/LocationStep'
import SuccessStep from './steps/SuccessStep'

export default function OnboardingPage() {
  const { currentStep } = useOnboarding()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const hasCheckedRef = useRef(false)

  // Only run the profile check once on initial mount, and only if not on final steps
  useEffect(() => {
    // CRITICAL: Never run check if on final steps (7 pledge, 8 success)
    // This prevents redirects during active onboarding completion
    if (currentStep >= 7) {
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
        
        // If user is authenticated, check if they have a profile
        if (user && !userError) {
          // Check current step again before redirecting (in case it changed during async operation)
          const stepAtCheckTime = currentStep
          
          // CRITICAL: Never redirect if on final onboarding steps
          if (stepAtCheckTime >= 7) {
            console.log('On final onboarding steps, skipping redirect check')
            return
          }
          
          const { data: profile, error: profileError } = await supabase
            .from('onboardingprofiles')
            .select('id')
            .eq('id', user.id)
            .single()

          // Check if testing mode is enabled (bypass profile check)
          const isTestingMode = 
            typeof window !== 'undefined' && 
            (localStorage.getItem('onboarding_test_mode') === 'true' || 
             new URLSearchParams(window.location.search).get('test') === 'true')
          
          // Only redirect if:
          // 1. Profile exists
          // 2. We're still on early steps (1-3)
          // 3. User is not actively completing onboarding (steps 4+ mean they're in flow)
          // 4. Testing mode is not enabled
          if (profile && !profileError && stepAtCheckTime < 4 && !isTestingMode) {
            // Final safety check - never redirect if somehow we got to final steps
            if (currentStep >= 7) {
              console.log('Step changed to final steps during check, aborting redirect')
              return
            }
            console.log('User already has a profile, redirecting to home')
            console.log('💡 To test onboarding again, add ?test=true to the URL or set localStorage.setItem("onboarding_test_mode", "true")')
            router.replace('/home')
            return
          } else if (profile && !profileError) {
            // User has profile but is on step 4+, meaning they're actively in onboarding
            // Don't redirect - let them complete it
            console.log('User has profile but is in onboarding flow, allowing to continue')
          } else if (isTestingMode) {
            console.log('🧪 Testing mode enabled - allowing onboarding even with existing profile')
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
        <p className="text-[#757575]">Loading...</p>
      </div>
    )
  }

  const steps = [
    { component: PhoneStep, step: 1 },
    { component: NameAgeGenderStep, step: 2 },
    { component: InterestsStep, step: 3 },
    { component: ShowMeStep, step: 4 },
    { component: LocationStep, step: 5 },
    { component: PurposeStep, step: 6 },
    { component: WelcomeStep, step: 7 },
    { component: SuccessStep, step: 8 },
  ]

  const currentStepData = steps.find(s => s.step === currentStep)
  
  // If no step found, default to first step
  if (!currentStepData) {
    console.warn(`Step ${currentStep} not found, defaulting to step 1`)
  }
  
  const CurrentComponent = currentStepData?.component || PhoneStep

  return <CurrentComponent />
}

