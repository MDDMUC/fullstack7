import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Safe wrapper to get the current user without throwing on auth errors.
 * Returns { user, error } with a null user if not signed in.
 */
export async function safeGetUser(client: SupabaseClient) {
  try {
    const { data, error } = await client.auth.getUser()
    if (error) return { user: null, error }
    return { user: data.user ?? null, error: null }
  } catch (err: any) {
    return { user: null, error: err }
  }
}

