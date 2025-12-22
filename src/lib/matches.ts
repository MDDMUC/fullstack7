// src/lib/matches.ts
import { requireSupabase } from './supabaseClient'
import { normalizeProfile } from './profiles'

const sortPair = (a: string, b: string) => (a < b ? [a, b] : [b, a])

export async function ensureDirectThreadForMatch(userA: string, userB: string) {
  const supabase = requireSupabase()
  const [user_a, user_b] = sortPair(userA, userB)

  // Find existing direct thread between the pair
  const { data: existing, error: findErr } = await supabase
    .from('threads')
    .select('id')
    .or(
      `and(user_a.eq.${user_a},user_b.eq.${user_b},or(type.eq.direct,type.is.null)),and(user_a.eq.${user_b},user_b.eq.${user_a},or(type.eq.direct,type.is.null))`,
    )
    .limit(1)
    .maybeSingle()

  if (findErr && findErr.code !== 'PGRST116') throw findErr
  if (existing?.id) return existing.id as string

  const { data, error } = await supabase
    .from('threads')
    .insert({ user_a, user_b, type: 'direct', created_by: user_a })
    .select('id')
    .single()

  if (error) throw error
  return data.id as string
}

export async function checkAndCreateMatch(swipeeId: string) {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const myId = userData.user?.id
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

  let matchRecord = data

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
    matchRecord = existing
  }

  const threadId = await ensureDirectThreadForMatch(user_a, user_b)
  return { ...(matchRecord as any), thread_id: threadId }
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
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const myId = userData.user?.id
  if (!myId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('matches')
    .select('id, created_at, user_a, user_b')
    .or(`user_a.eq.${myId},user_b.eq.${myId}`)

  if (error) throw error
  if (!data?.length) return []

  const ids = Array.from(new Set(data.flatMap(m => [m.user_a, m.user_b])))
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, username, email, created_at')
    .in('id', ids)
  if (pErr) throw pErr

  const { data: obRows, error: obErr } = await supabase
    .from('onboardingprofiles')
    .select('*')
    .in('id', ids)
  if (obErr) throw obErr
  const obMap = new Map((obRows ?? []).map(ob => [ob.id, ob]))

  const map = new Map((profiles ?? []).map(p => {
    const normalized = normalizeProfile({
      ...p,
      onboardingprofiles: obMap.get(p.id) ? [obMap.get(p.id)] : [],
    })
    return [normalized.id, normalized]
  }))
  return data.map(m => ({ ...m, profiles: [map.get(m.user_a), map.get(m.user_b)].filter(Boolean) }))
}

