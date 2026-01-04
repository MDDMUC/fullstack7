import { SupabaseClient } from '@supabase/supabase-js'
import { OnboardingData } from '@/contexts/OnboardingContext'

type UpsertResult = { data: any; error: any }

/**
 * Upload image file to Supabase storage
 * @param client Supabase client
 * @param userId User ID
 * @param file Image file to upload
 * @param bucketName Storage bucket name (default: 'user-images')
 * @returns Public URL of uploaded image or null if error
 */
export async function uploadImageToStorage(
  client: SupabaseClient,
  userId: string,
  file: File,
  bucketName: string = 'user-images'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = client.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Failed to upload image:', error)
    return null
  }
}

const join = (arr?: string[]) =>
  Array.isArray(arr) && arr.length ? arr.join(', ') : null

const asTextArray = (arr?: string[]) =>
  Array.isArray(arr) ? arr.filter(Boolean) : []

const onlyStrings = (arr?: (string | File)[]) =>
  Array.isArray(arr) ? arr.filter((v): v is string => typeof v === 'string' && !!v) : []

export function onboardingDataToProfilePayload(data: Partial<OnboardingData>) {
  const stylesJoined = join(data.styles)
  const availabilityJoined = join(data.availability)
  const purposes = join(data.purposes)
  const goalsText = (data.bigGoal && data.bigGoal.trim()) || purposes || null
  const username =
    data.username ||
    (data as any).name ||
    (data as any).email?.split?.('@')?.[0] ||
    'Climber'

  const tags = asTextArray(data.styles)
  // Gender is saved in its own column, not in tags
  if (data.interest) tags.push(`pref:${data.interest}`)

  const availabilityArray = asTextArray(data.availability)
  const photoUrls = onlyStrings(data.photos)
  const mainPhoto = (data as any).photo || photoUrls[0] || null

  const payload: any = {
    username,
    age: data.age ? Number(data.age) : null,
    gender: data.gender || null,
    searchradius: typeof data.radiusKm === 'number' ? data.radiusKm : null,
    bio: data.bio || null,
    city: data.homebase || null, // Required field (database column is 'city', context field is 'homebase')
    styles: Array.isArray(data.styles) ? data.styles : (data.styles ? [data.styles] : []), // Ensure it's an array
    grade: data.grade || null,
    availability: availabilityArray.length ? availabilityArray : (availabilityJoined ? [availabilityJoined] : []), // Ensure it's an array
    interest: data.interest ?? null,
    photo: mainPhoto,
    photos: photoUrls.length ? photoUrls : [], // Ensure it's an array
    avatar_url: mainPhoto,
    tags,
    goals: goalsText,
    "lookingFor": purposes || null,
    phone_number: data.phone || null,
    status: 'New member',
    gym: Array.isArray(data.gym) ? data.gym : (data.gym ? [data.gym] : []), // Ensure it's an array
  }

  // Safety: ensure we never send legacy columns that may not exist remotely
  delete payload.homebase // Legacy column, now called 'city'
  delete payload.distance
  delete payload.style

  return payload
}

export async function upsertOnboardingProfile(
  client: SupabaseClient,
  userId: string,
  data: Partial<OnboardingData>
): Promise<UpsertResult> {
  const payload = onboardingDataToProfilePayload(data)

  const { data: row, error } = await client
    .from('onboardingprofiles')
    .upsert({ id: userId, ...payload }, { onConflict: 'id' })
    .select('*')
    .single()

  return { data: row, error }
}

export async function upsertPublicProfile(
  client: SupabaseClient,
  userId: string,
  data: Partial<OnboardingData>
): Promise<UpsertResult> {
  try {
    const { data: row, error } = await client
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: (data as any)?.email || undefined,
          username: data.username || (data as any)?.name || (data as any)?.email?.split?.('@')?.[0] || 'Climber',
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single()

    return { data: row, error }
  } catch (error: any) {
    // RLS can block public profile upsert; return error but don't throw
    return { data: null, error }
  }
}

