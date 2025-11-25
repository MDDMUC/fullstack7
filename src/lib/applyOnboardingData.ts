import { SupabaseClient } from '@supabase/supabase-js'
import { createOrUpdateProfile, onboardingDataToProfileData } from './profileUtils'

export type OnboardingDataFromStorage = {
  phoneNumber?: string
  countryCode?: string
  rulesAccepted?: boolean[]
  name?: string
  age?: string
  gender?: 'Man' | 'Woman' | 'Other'
  bio?: string
  purpose?: string
  purposes?: string[]
  showMe?: 'Men' | 'Women' | 'All'
  interests?: string[]
  photosMetadata?: Array<{
    name: string
    size: number
    type: string
    index: number
  }>
  homebase?: string
  originalFrom?: string
  distance?: number
}

/**
 * Apply onboarding data from localStorage to user profile
 * This is used when user completes onboarding without being authenticated,
 * then signs up or logs in later
 */
export async function applyOnboardingDataToProfile(
  client: SupabaseClient,
  userId: string,
  onboardingData: OnboardingDataFromStorage
) {
  const profileData = onboardingDataToProfileData(onboardingData)
  
  const { data, error } = await createOrUpdateProfile(client, userId, profileData)

  if (error) {
    console.error('Error applying onboarding data:', error)
    throw error
  }

  console.log('Onboarding data applied to profile:', data)
  return data
}

