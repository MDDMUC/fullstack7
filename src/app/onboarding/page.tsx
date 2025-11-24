'use client'

import { useEffect, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PhoneStep from './steps/PhoneStep'
import WelcomeStep from './steps/WelcomeStep'
import NameAgeGenderStep from './steps/NameAgeGenderStep'
import PurposeStep from './steps/PurposeStep'
import ShowMeStep from './steps/ShowMeStep'
import InterestsStep from './steps/InterestsStep'
import PhotosStep from './steps/PhotosStep'
import LocationStep from './steps/LocationStep'
import SuccessStep from './steps/SuccessStep'

export default function OnboardingPage() {
  const { currentStep } = useOnboarding()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      if (!supabase) {
        setChecking(false)
        return
      }

      // Don't redirect if user is on the success step (step 9)
      if (currentStep === 9) {
        setChecking(false)
        return
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // If user is authenticated, check if they have a profile
        if (user && !userError) {
          const { data: profile, error: profileError } = await supabase
            .from('onboardingprofiles')
            .select('id')
            .eq('id', user.id)
            .single()

          // If profile exists, redirect to home (they've already completed onboarding)
          // But only if not on the success step
          if (profile && !profileError && currentStep !== 9) {
            console.log('User already has a profile, redirecting to home')
            router.replace('/home')
            return
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
  }, [router, currentStep])

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
    { component: WelcomeStep, step: 2 },
    { component: NameAgeGenderStep, step: 3 },
    { component: PurposeStep, step: 4 },
    { component: ShowMeStep, step: 5 },
    { component: InterestsStep, step: 6 },
    { component: PhotosStep, step: 7 },
    { component: LocationStep, step: 8 },
    { component: SuccessStep, step: 9 },
  ]

  const currentStepData = steps.find(s => s.step === currentStep)
  
  // If no step found, default to first step
  if (!currentStepData) {
    console.warn(`Step ${currentStep} not found, defaulting to step 1`)
  }
  
  const CurrentComponent = currentStepData?.component || PhoneStep

  return <CurrentComponent />
}

