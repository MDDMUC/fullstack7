import { SupabaseClient } from '@supabase/supabase-js'
import { requireSupabase } from './supabaseClient'

export type Profile = {
  id: string
  username: string
  email?: string
  age?: number
  gender?: string
  photo?: string | null
  city?: string
  homebase?: string
  style?: string
  availability?: string
  grade?: string
  bio?: string
  avatar_url?: string | null
  created_at?: string
  pronouns?: string
  tags?: string[]
  status?: string
  goals?: string
  distance?: string
  lookingFor?: string
  gym?: string[]
  onboardingprofiles?: any[]
}

const toArray = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean)
  return []
}

export const normalizeProfile = (profile: any): Profile => {
  const ob = (profile as any).onboardingprofiles?.[0] ?? {}
  const styles = Array.isArray(ob.styles ?? (profile as any).styles ?? profile.styles)
    ? (ob.styles ?? (profile as any).styles ?? profile.styles).join(', ')
    : ob.primary_style ?? profile.primary_style ?? (profile as any).style

  const rawTags = toArray(ob.tags ?? profile.tags ?? profile.traits)
  const availability = toArray(ob.availability ?? profile.availability ?? profile.schedule).join(', ')
  const mainPhoto = ob.photo ?? profile.photo ?? ob.avatar_url ?? profile.avatar_url ?? profile.photo_url ?? null
  const gym = toArray(ob.gym ?? profile.gym ?? (profile as any).gyms)

  return {
    id: profile.id ?? ob.id ?? crypto.randomUUID(),
    username: profile.username ?? profile.name ?? ob.username ?? 'Climber',
    email: profile.email ?? undefined,
    age: ob.age ?? profile.age ?? profile.age_range ?? undefined,
    gender: ob.gender ?? profile.gender ?? '',
    homebase: ob.homebase ?? (profile as any).homebase ?? profile.home ?? profile.location ?? '',
    city: ob.homebase ?? ob.city ?? ob.home ?? (profile as any).homebase ?? profile.city ?? profile.home ?? profile.location ?? '',
    style: styles ?? '',
    availability,
    grade: ob.grade ?? profile.grade ?? profile.grade_focus ?? profile.level ?? '',
    bio: ob.bio ?? profile.bio ?? profile.about ?? '',
    avatar_url: mainPhoto ?? null,
    photo: mainPhoto ?? null,
    created_at: profile.created_at ?? ob.created_at,
    pronouns: ob.pronouns ?? profile.pronouns ?? profile.pronoun ?? '',
    tags: rawTags,
    status: ob.status ?? profile.status ?? profile.state ?? '',
    goals: ob.goals ?? profile.goals ?? profile.intent ?? '',
    distance: ob.distance ?? profile.distance ?? '10 km',
    lookingFor:
      ob.lookingfor ??
      ob.lookingFor ??
      profile.lookingfor ??
      profile.looking_for ??
      profile.intent ??
      profile.goals ??
      '',
    gym,
  }
}

const USER_IMAGES_BUCKET = 'user-images'
const SUPABASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

// Pre-mapped demo user images (bucket folders with explicit filenames)
const DEMO_IMAGE_MAP: Record<string, string> = {
  '1a518ec3-83f4-4c0b-a279-9195a983f4c1': '1a518ec3-83f4-4c0b-a279-9195a983f4c1/yarahost.jpg',
  '266a5e75-89d9-407d-a1d8-0cc8dc6d6196': '266a5e75-89d9-407d-a1d8-0cc8dc6d6196/timopogo.jpg',
  '618fbbfa-1032-4bc3-a282-15755d2479df': '618fbbfa-1032-4bc3-a282-15755d2479df/lenaflash.jpg',
  '9530fc24-bbed-4724-9a5c-b4d66d198f2a': '9530fc24-bbed-4724-9a5c-b4d66d198f2a/maraearly.jpg',
  '9886aaf9-8bd8-4cd7-92e1-72962891eace': '9886aaf9-8bd8-4cd7-92e1-72962891eace/stefanhoermann.jpg',
  'd63497aa-a038-49e7-b393-aeb16f5c52be': 'd63497aa-a038-49e7-b393-aeb16f5c52be/marcoboard.jpg',
  'dba824e8-04d8-48ab-81b1-bdb8f7360287': 'dba824e8-04d8-48ab-81b1-bdb8f7360287/finnslab.jpg',
  'e5d0e0da-a9d7-4a89-ad61-e5bc7641905f': 'e5d0e0da-a9d7-4a89-ad61-e5bc7641905f/maxtrad.jpg',
}

const publicUrlFor = (path?: string | null) => {
  if (!path || !SUPABASE_PUBLIC_URL) return null
  return `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${USER_IMAGES_BUCKET}/${path}`
}

const toSlug = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const resolveAvatarUrl = async (
  client: SupabaseClient,
  profileId: string,
  existingUrl?: string | null,
  bucketListing?: { name: string }[]
): Promise<string | null | undefined> => {
  if (existingUrl) return existingUrl
  try {
    // Try a folder named after the profile ID (recommended structure)
    const { data, error } = await client.storage
      .from(USER_IMAGES_BUCKET)
      .list(profileId, { limit: 1, offset: 0, sortBy: { column: 'created_at', order: 'desc' } })
    if (error || !data?.length) return existingUrl
    const filePath = `${profileId}/${data[0].name}`
    const { data: urlData } = client.storage.from(USER_IMAGES_BUCKET).getPublicUrl(filePath)
    return urlData?.publicUrl ?? existingUrl
  } catch (err) {
    console.warn('Avatar lookup failed', err)
    return existingUrl
  }
}

export async function fetchProfiles(client?: SupabaseClient, ids?: string[]) {
  const c = client ?? requireSupabase()
  const baseQuery = c
    .from('profiles')
    .select('id, username, email, created_at')
    .order('created_at', { ascending: false })
  if (ids?.length) baseQuery.in('id', ids)

  const { data: baseProfiles, error: baseErr } = await baseQuery
  if (baseErr) throw baseErr

  const obIds = (baseProfiles ?? []).map(p => p.id)
  const { data: obRows, error: obErr } = await c
    .from('onboardingprofiles')
    .select('*')
    .in('id', obIds)
  if (obErr) throw obErr
  const obMap = new Map((obRows ?? []).map(ob => [ob.id, ob]))

  // Preload a flat listing at root as a fallback for manually uploaded files not placed in user folders
  let bucketListing: { name: string }[] | undefined
  try {
    const { data, error } = await c.storage.from(USER_IMAGES_BUCKET).list('', { limit: 200 })
    if (!error && data?.length) bucketListing = data
  } catch (err) {
    console.warn('Bucket root listing failed', err)
  }

  const resolved = await Promise.all(
    (baseProfiles ?? []).map(async profile => {
      const normalized = normalizeProfile({
        ...profile,
        onboardingprofiles: obMap.get(profile.id) ? [obMap.get(profile.id)] : [],
      })

      let avatarUrl = normalized.avatar_url

      // Known demo mapping: always prefer the uploaded file for these seeded users
      if (DEMO_IMAGE_MAP[normalized.id]) {
        const mappedPath = DEMO_IMAGE_MAP[normalized.id]
        const { data: urlData } = c.storage.from(USER_IMAGES_BUCKET).getPublicUrl(mappedPath)
        avatarUrl = urlData?.publicUrl ?? publicUrlFor(mappedPath) ?? avatarUrl
      }

      // Try explicit folder lookup
      avatarUrl = (await resolveAvatarUrl(c, normalized.id, avatarUrl, bucketListing)) ?? avatarUrl

      // If still missing, try matching root files by slug/id when a bucket listing is available
      if (!avatarUrl && bucketListing?.length) {
        const slug = toSlug(normalized.username)
        const candidate = bucketListing.find(file => {
          const name = (file.name || '').toLowerCase()
          return name.includes(slug) || name.includes(normalized.id.toLowerCase())
        })
        if (candidate) {
          const path = candidate.name // root-level file
          const { data: urlData } = c.storage.from(USER_IMAGES_BUCKET).getPublicUrl(path)
          avatarUrl = urlData?.publicUrl ?? null
        }
      }

      return { ...normalized, avatar_url: avatarUrl ?? null }
    })
  )

  return resolved
}
