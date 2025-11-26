import { SupabaseClient } from '@supabase/supabase-js'
import { upsertOnboardingProfile, upsertPublicProfile } from './profileUtils'

export type OnboardingDataFromStorage = {
  phone?: string
  name?: string
  username?: string
  age?: string
  gender?: 'Man' | 'Woman' | 'Other'
  pronouns?: string
  bio?: string
  purposes?: string[]
  styles?: string[]
  grade?: string
  bigGoal?: string
  availability?: string[]
  homebase?: string
  radiusKm?: number
  pledgeAccepted?: boolean
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
  const { error: obError } = await upsertOnboardingProfile(client, userId, onboardingData)
  const { data, error } = await upsertPublicProfile(client, userId, onboardingData)

  if (obError || error) {
    console.error('Error applying onboarding data:', obError || error)
    throw obError || error
  }

  console.log('Onboarding data applied to profile:', data)
  return data
}

