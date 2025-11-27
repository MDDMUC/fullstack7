import { SupabaseClient } from '@supabase/supabase-js'
import { OnboardingData } from '@/contexts/OnboardingContext'

type UpsertResult = { data: any; error: any }

const join = (arr?: string[]) =>
  Array.isArray(arr) && arr.length ? arr.join(', ') : null

const asTextArray = (arr?: string[]) =>
  Array.isArray(arr) ? arr.filter(Boolean) : []

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
  if (data.gender) tags.push(`gender:${data.gender}`)
  if (data.interest) tags.push(`pref:${data.interest}`)

  const pronouns = data.pronouns || (data as any).gender || null

  const payload: any = {
    username,
    age: data.age ? Number(data.age) : null,
    searchradius: typeof data.radiusKm === 'number' ? data.radiusKm : null,
    bio: data.bio || null,
    homebase: data.homebase || null,
    styles: data.styles ?? null,
    style: undefined,
    grade: data.grade || null,
    availability: availabilityJoined,
    interest: data.interest ?? null,
    tags,
    goals: goalsText,
    lookingfor: purposes || null,
    phone_number: data.phone || null,
    status: 'New member',
    pronouns,
  }

  // Safety: ensure we never send legacy columns that may not exist remotely
  delete payload.city
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
