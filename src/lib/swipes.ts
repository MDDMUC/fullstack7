// src/lib/swipes.ts
import { requireSupabase } from './supabaseClient'

export type SwipeAction = 'like' | 'pass'

export async function sendSwipe(swipeeId: string, action: SwipeAction) {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = userData.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('swipes')
    .insert({ swiper: userId, swipee: swipeeId, action })
    .select()
    .single()

  if (error) throw error
  return data
}

