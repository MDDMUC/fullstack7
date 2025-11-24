'use client'

import { useOnboarding } from '@/contexts/OnboardingContext'
import { useRouter } from 'next/navigation'
import PhoneStep from './steps/PhoneStep'
import WelcomeStep from './steps/WelcomeStep'
import NameAgeGenderStep from './steps/NameAgeGenderStep'
import PurposeStep from './steps/PurposeStep'
import ShowMeStep from './steps/ShowMeStep'
import InterestsStep from './steps/InterestsStep'
import PhotosStep from './steps/PhotosStep'
import LocationStep from './steps/LocationStep'

export default function OnboardingPage() {
  const { currentStep } = useOnboarding()
  const router = useRouter()

  const steps = [
    { component: PhoneStep, step: 1 },
    { component: WelcomeStep, step: 2 },
    { component: NameAgeGenderStep, step: 3 },
    { component: PurposeStep, step: 4 },
    { component: ShowMeStep, step: 5 },
    { component: InterestsStep, step: 6 },
    { component: PhotosStep, step: 7 },
    { component: LocationStep, step: 8 },
  ]

  const currentStepData = steps.find(s => s.step === currentStep)
  const CurrentComponent = currentStepData?.component || PhoneStep

  return <CurrentComponent />
}

