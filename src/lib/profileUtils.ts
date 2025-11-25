import { SupabaseClient } from '@supabase/supabase-js'
import { OnboardingData } from '@/contexts/OnboardingContext'

type UpsertResult = { data: any; error: any }

const join = (arr?: string[]) =>
  Array.isArray(arr) && arr.length ? arr.join(', ') : null

const asTextArray = (arr?: string[]) =>
  Array.isArray(arr) ? arr.filter(Boolean) : []

export function onboardingDataToProfilePayload(data: Partial<OnboardingData>) {
  const styles = join(data.styles)
  const availability = join(data.availability)
  const purposes = join(data.purposes)
  const distance = data.radiusKm ? `${data.radiusKm} km` : data.homebase ? '100 km' : null
  const goalsText = (data.bigGoal && data.bigGoal.trim()) || purposes || null
  const username =
    data.username ||
    (data as any).name ||
    (data as any).email?.split?.('@')?.[0] ||
    'Climber'

  const tags = asTextArray(data.styles)
  if (data.gender) tags.push(`gender:${data.gender}`)
  if (data.interest) tags.push(`pref:${data.interest}`)

  return {
    username,
    age: data.age ? Number(data.age) : null,
    bio: data.bio || null,
    pronouns: data.pronouns || null,
    city: data.homebase || null,
    distance,
    style: styles,
    grade: data.grade || null,
    availability,
    tags,
    goals: goalsText,
    lookingFor: purposes || null,
    phone_number: data.phone || null,
    status: 'New member',
    pronouns: data.pronouns || (data as any).gender || null,
  }
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
  const payload = onboardingDataToProfilePayload(data)

  try {
    const { data: row, error } = await client
      .from('profiles')
      .upsert(
        {
          id: userId,
          username: payload.username || undefined,
          bio: payload.bio || undefined,
          age: payload.age || undefined,
          city: payload.city || undefined,
          style: payload.style || undefined,
          grade: payload.grade || undefined,
          availabilty: payload.availability || undefined,
          status: payload.status,
          tags: payload.tags?.join(', ') || undefined,
          goals: payload.goals || undefined,
          email: (data as any)?.email || undefined,
          home: payload.city || undefined,
          primary_style: payload.style || undefined,
          pronouns: payload.pronouns || undefined,
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
