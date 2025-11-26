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
    city: ob.city ?? ob.home ?? profile.city ?? profile.home ?? profile.location ?? '',
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
    lookingFor: ob.lookingFor ?? profile.looking_for ?? profile.intent ?? profile.goals ?? '',
  }
}

export async function fetchProfiles(client?: SupabaseClient) {
  const c = client ?? requireSupabase()
  const { data, error } = await c
    .from('profiles')
    .select('id, username, email, created_at, onboardingprofiles(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(normalizeProfile)
}
