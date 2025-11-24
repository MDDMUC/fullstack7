import { SupabaseClient } from '@supabase/supabase-js'
import { requireSupabase } from './supabaseClient'

export type Profile = {
  id: string
  username: string
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
}

const toArray = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean)
  return []
}

export const normalizeProfile = (profile: any): Profile => ({
  id: profile.id ?? crypto.randomUUID(),
  username: profile.username ?? profile.name ?? 'Climber',
  age: profile.age ?? profile.age_range ?? undefined,
  city: profile.city ?? profile.home ?? profile.location ?? '',
  style: profile.style ?? (Array.isArray(profile.styles) ? profile.styles.join(' • ') : profile.primary_style) ?? '',
  availability: profile.availability ?? profile.schedule ?? '',
  grade: profile.grade ?? profile.grade_focus ?? profile.level ?? '',
  bio: profile.bio ?? profile.about ?? '',
  avatar_url: profile.avatar_url ?? profile.photo_url ?? null,
  created_at: profile.created_at,
  pronouns: profile.pronouns ?? profile.pronoun ?? '',
  tags: toArray(profile.tags ?? profile.traits),
  status: profile.status ?? profile.state ?? '',
  goals: profile.goals ?? profile.intent ?? '',
})

export async function fetchProfiles(client?: SupabaseClient) {
  const c = client ?? requireSupabase()
  const { data, error } = await c.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(normalizeProfile)
}
