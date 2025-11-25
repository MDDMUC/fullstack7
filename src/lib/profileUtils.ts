import { SupabaseClient } from '@supabase/supabase-js'
import { OnboardingDataFromStorage } from './applyOnboardingData'

/**
 * Unified profile data structure that matches onboardingprofiles table schema
 */
export type ProfileData = {
  id: string
  username: string
  age?: number
  bio?: string
  pronouns?: string
  city?: string
  original_from?: string | null
  distance?: string | null
  style?: string
  grade?: string
  availability?: string
  tags?: string[]
  goals?: string
  lookingFor?: string
  phone_number?: string | null
  avatar_url?: string | null
  photos?: string | null // JSON array of photo URLs
  status?: string
}

/**
 * Create or update a user profile in onboardingprofiles table
 * This is the single source of truth for profile creation
 */
export async function createOrUpdateProfile(
  client: SupabaseClient,
  userId: string,
  profileData: Partial<ProfileData>
): Promise<{ data: any; error: any }> {
  // Ensure required fields
  const completeProfileData: ProfileData = {
    id: userId,
    username: profileData.username || 'Climber',
    age: profileData.age,
    bio: profileData.bio || '',
    pronouns: profileData.pronouns || '',
    city: profileData.city || '',
    original_from: profileData.original_from || null,
    distance: profileData.distance || null,
    style: profileData.style || '',
    grade: profileData.grade || '',
    availability: profileData.availability || '',
    tags: profileData.tags || [],
    goals: profileData.goals || '',
    lookingFor: profileData.lookingFor || '',
    phone_number: profileData.phone_number || null,
    avatar_url: profileData.avatar_url || null,
    photos: profileData.photos || null,
    status: profileData.status || 'New member',
  }

  const { data, error } = await client
    .from('onboardingprofiles')
    .upsert(completeProfileData, { onConflict: 'id' })
    .select()
    .single()

  return { data, error }
}

/**
 * Convert onboarding data from localStorage to ProfileData format
 */
export function onboardingDataToProfileData(
  onboardingData: OnboardingDataFromStorage
): Partial<ProfileData> {
  return {
    username: onboardingData.name || 'Climber',
    age: onboardingData.age ? parseInt(onboardingData.age) : undefined,
    city: onboardingData.homebase || '',
    original_from: onboardingData.originalFrom || null,
    distance: onboardingData.distance ? `${onboardingData.distance} km` : null,
    style: onboardingData.interests?.join(', ') || '',
    grade: '',
    bio: onboardingData.bio || '',
    availability: '',
    tags: onboardingData.interests || [],
    goals: onboardingData.purposes?.join(', ') || onboardingData.purpose || '',
    lookingFor: onboardingData.showMe || '',
    phone_number: onboardingData.phoneNumber
      ? `${onboardingData.countryCode || '+1'}${onboardingData.phoneNumber}`
      : null,
    pronouns: onboardingData.gender || '',
    avatar_url: null, // Photos are handled separately in LocationStep
    photos: null, // Photos are handled separately in LocationStep
    status: 'New member',
  }
}

/**
 * Convert signup form data to ProfileData format
 */
export function signupFormDataToProfileData(formData: {
  name?: string
  email?: string
  style?: string
  grade?: string
  availability?: string
  goals?: string[]
}): Partial<ProfileData> {
  return {
    username: formData.name || formData.email?.split('@')[0] || 'Climber',
    city: '', // Home base is collected in onboarding
    style: formData.style || '',
    grade: formData.grade || '',
    availability: formData.availability || '',
    bio: '', // Bio is collected in onboarding
    tags: formData.goals || [],
    goals: formData.goals?.join(', ') || '',
    lookingFor: '',
    status: 'New member',
  }
}

/**
 * Merge profile data with priority: onboarding data > signup form data > defaults
 */
export function mergeProfileData(
  onboardingData: Partial<ProfileData> | null,
  signupData: Partial<ProfileData> | null
): Partial<ProfileData> {
  // Onboarding data takes priority as it's more complete
  if (onboardingData) {
    return {
      ...signupData, // Signup data as base
      ...onboardingData, // Onboarding data overrides
    }
  }
  return signupData || {}
}

