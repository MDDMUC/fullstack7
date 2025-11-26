import { SupabaseClient } from '@supabase/supabase-js'
import { requireSupabase } from './supabaseClient'

export type Profile = {
  id: string
  username: string
  email?: string
  age?: number
  city?: string
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
  const styles = Array.isArray(ob.styles ?? profile.styles)
    ? (ob.styles ?? profile.styles).join(', ')
    : ob.primary_style ?? profile.primary_style

  const rawTags = toArray(ob.tags ?? profile.tags ?? profile.traits)

  return {
    id: profile.id ?? ob.id ?? crypto.randomUUID(),
    username: profile.username ?? profile.name ?? ob.username ?? 'Climber',
    email: profile.email ?? undefined,
    age: ob.age ?? profile.age ?? profile.age_range ?? undefined,
    city: ob.homebase ?? ob.city ?? ob.home ?? profile.city ?? profile.home ?? profile.location ?? '',
    style: ob.style ?? styles ?? '',
    availability: ob.availability ?? profile.availability ?? profile.schedule ?? '',
    grade: ob.grade ?? profile.grade ?? profile.grade_focus ?? profile.level ?? '',
    bio: ob.bio ?? profile.bio ?? profile.about ?? '',
    avatar_url: ob.avatar_url ?? profile.avatar_url ?? profile.photo_url ?? null,
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

  return (baseProfiles ?? []).map(profile =>
    normalizeProfile({
      ...profile,
      onboardingprofiles: obMap.get(profile.id) ? [obMap.get(profile.id)] : [],
    })
  )
}
