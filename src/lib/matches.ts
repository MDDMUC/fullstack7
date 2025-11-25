// src/lib/matches.ts
import { requireSupabase } from './supabaseClient'
import { safeGetUser } from './authUtils'

const sortPair = (a: string, b: string) => (a < b ? [a, b] : [b, a])

export async function checkAndCreateMatch(swipeeId: string) {
  const supabase = requireSupabase()
  const { user, error: userErr } = await safeGetUser(supabase)
  if (userErr) throw userErr
  const myId = user?.id
  if (!myId) throw new Error('Not authenticated')

  // Check reciprocal like
  const { data: reciprocal, error: recErr } = await supabase
    .from('swipes')
    .select('id')
    .eq('swiper', swipeeId)
    .eq('swipee', myId)
    .eq('action', 'like')
    .limit(1)

  if (recErr) throw recErr
  if (!reciprocal || reciprocal.length === 0) return null

  const [user_a, user_b] = sortPair(myId, swipeeId)

  const { data, error } = await supabase
    .from('matches')
    .insert({ user_a, user_b })
    .select()
    .single()

  if (error) {
    // Ignore duplicate insert; return the existing match if already created
    if (error.code !== '23505') throw error
    const { data: existing, error: fetchErr } = await supabase
      .from('matches')
      .select('*')
      .eq('user_a', user_a)
      .eq('user_b', user_b)
      .single()
    if (fetchErr) throw fetchErr
    return existing
  }

  return data
}

export type MatchWithProfiles = {
  id: string
  created_at: string
  user_a: string
  user_b: string
  profiles?: any[]
}

export async function listMatches() {
  const supabase = requireSupabase()
  const { user, error: userErr } = await safeGetUser(supabase)
  if (userErr) throw userErr
  const myId = user?.id
  if (!myId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('matches')
    .select('id, created_at, user_a, user_b')
    .or(`user_a.eq.${myId},user_b.eq.${myId}`)

  if (error) throw error
  if (!data?.length) return []

  const ids = Array.from(new Set(data.flatMap(m => [m.user_a, m.user_b])))
  const { data: profiles, error: pErr } = await supabase
    .from('onboardingprofiles')
    .select('*')
    .in('id', ids)

  if (pErr) {
    console.error('Error fetching profiles for matches:', pErr)
    throw pErr
  }
  const map = new Map(profiles?.map(p => [p.id, p]))
  return data.map(m => ({ ...m, profiles: [map.get(m.user_a), map.get(m.user_b)].filter(Boolean) }))
}
