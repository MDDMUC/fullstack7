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
  if (Array.isArray(value)) {
    // Handle array - flatten nested arrays and parse JSON strings
    return value
      .filter(Boolean)
      .map(v => {
        const str = String(v).trim()
        // If it's a JSON array string (e.g., '["uuid"]'), parse it
        if (str.startsWith('[') && str.endsWith(']')) {
          try {
            const parsed = JSON.parse(str)
            if (Array.isArray(parsed)) {
              return parsed.map(p => String(p).trim()).filter(Boolean)
            }
            return [String(parsed).trim()]
          } catch {
            return [str]
          }
        }
        return [str]
      })
      .flat()
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    // Check if it's a JSON array string
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.map(p => String(p).trim()).filter(Boolean)
        }
        return [String(parsed).trim()]
      } catch {
        // If parsing fails, treat as comma-separated
        return trimmed.split(',').map(v => v.trim()).filter(Boolean)
      }
    }
    // Normal comma-separated string
    return trimmed.split(',').map(v => v.trim()).filter(Boolean)
  }
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

export type Gym = {
  id: string
  name: string
  area?: string
}

/**
 * Fetch gyms from the gyms table filtered by area (city)
 * @param area Optional area/city filter - if provided, only returns gyms from that area
 * @returns Array of gym objects with id and name
 */
export async function fetchGymsFromTable(client?: SupabaseClient, area?: string): Promise<Gym[]> {
  try {
    const c = client ?? requireSupabase()
    
    let query = c
      .from('gyms')
      .select('id, name, area')
      .order('name', { ascending: true })
    
    if (area) {
      query = query.eq('area', area)
    }
    
    const { data, error } = await query
    
    if (error) {
      // Try to stringify the error to see what's in it
      try {
        const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error))
        console.error('Failed to fetch gyms from table - error (stringified):', errorStr)
      } catch (e) {
        console.error('Failed to fetch gyms from table - error (raw):', error)
        console.error('Error type:', typeof error)
        console.error('Error keys:', Object.keys(error || {}))
      }
      
      if (error && Object.keys(error).length === 0) {
        console.warn('Error object is empty - this might be a false positive, checking data...')
        if (data && data.length > 0) {
          console.log('Data exists despite error object, proceeding...')
        } else {
          return []
        }
      } else {
        return []
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('No gyms returned from gyms table')
      return []
    }
    
    // Return gym objects with id and name
    return data
      .filter((row: any) => row.id && row.name)
      .map((row: any) => ({
        id: String(row.id),
        name: String(row.name).trim(),
        area: row.area ? String(row.area).trim() : undefined
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error('Exception in fetchGymsFromTable:', err)
    if (err instanceof Error) {
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
    }
    return []
  }
}

/**
 * Fetch all unique gyms from onboardingprofiles table with their cities
 * Returns a map of gym name to array of cities where that gym exists
 * @deprecated Use fetchGymsFromTable instead
 */
export async function fetchAllGymsWithCities(client?: SupabaseClient): Promise<Map<string, string[]>> {
  try {
    const c = client ?? requireSupabase()
    
    // Try selecting all fields first to see if that works better
    const { data, error } = await c
      .from('onboardingprofiles')
      .select('*')
    
    // Log the raw response for debugging
    if (error) {
      // Try to stringify the error to see what's in it
      try {
        const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error))
        console.error('Failed to fetch gyms - error (stringified):', errorStr)
      } catch (e) {
        console.error('Failed to fetch gyms - error (raw):', error)
        console.error('Error type:', typeof error)
        console.error('Error keys:', Object.keys(error || {}))
      }
      
      // Check if it's actually an error or just an empty object
      if (error && Object.keys(error).length === 0) {
        console.warn('Error object is empty - this might be a false positive, checking data...')
        // If error is empty but we have data, continue processing
        if (data && data.length > 0) {
          console.log('Data exists despite error object, proceeding...')
        } else {
          return new Map()
        }
      } else {
        return new Map()
      }
    }
    
    if (!data || data.length === 0) {
      console.warn('No data returned from gyms query')
      return new Map()
    }
    
    console.log('Successfully fetched', data.length, 'profiles for gym extraction')
    
    const gymCityMap = new Map<string, Set<string>>()
    let processedCount = 0
    
    ;(data || []).forEach(row => {
      if (row.gym && Array.isArray(row.gym) && row.city) {
        processedCount++
        row.gym.forEach((g: string) => {
          if (g && typeof g === 'string') {
            const gymName = g.trim()
            if (gymName) {
              if (!gymCityMap.has(gymName)) {
                gymCityMap.set(gymName, new Set())
              }
              gymCityMap.get(gymName)!.add(row.city)
            }
          }
        })
      }
    })
    
    console.log('Processed', processedCount, 'profiles with gym data')
    
    // Convert Set to Array
    const result = new Map<string, string[]>()
    gymCityMap.forEach((cities, gym) => {
      result.set(gym, Array.from(cities))
    })
    
    console.log('Extracted', result.size, 'unique gyms')
    return result
  } catch (err) {
    console.error('Exception in fetchAllGymsWithCities:', err)
    if (err instanceof Error) {
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
    }
    return new Map()
  }
}

/**
 * Fetch all unique gyms from onboardingprofiles table
 * @param city Optional city filter - if provided, only returns gyms from profiles in that city
 */
export async function fetchAllGyms(client?: SupabaseClient, city?: string): Promise<string[]> {
  try {
    const c = client ?? requireSupabase()
    
    let query = c
      .from('onboardingprofiles')
      .select('gym, city')
    
    if (city) {
      query = query.eq('city', city)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Failed to fetch gyms - error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      return []
    }
    
    if (!data) {
      console.warn('No data returned from gyms query')
      return []
    }
    
    const gyms = new Set<string>()
    ;(data || []).forEach(row => {
      if (row.gym && Array.isArray(row.gym)) {
        row.gym.forEach((g: string) => {
          if (g && typeof g === 'string') {
            const trimmed = g.trim()
            if (trimmed) {
              gyms.add(trimmed)
            }
          }
        })
      }
    })
    
    return Array.from(gyms).sort()
  } catch (err) {
    console.error('Exception in fetchAllGyms:', err)
    return []
  }
}
