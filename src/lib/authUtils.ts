import { AuthError } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Check if an error is an invalid refresh token error
 */
export function isInvalidRefreshTokenError(error: any): boolean {
  if (!error) return false
  
  // Check for AuthApiError with invalid refresh token message
  if (error instanceof AuthError || error.name === 'AuthApiError') {
    const message = error.message?.toLowerCase() || ''
    return (
      message.includes('refresh token') ||
      message.includes('invalid refresh token') ||
      message.includes('refresh token not found')
    )
  }
  
  // Also check error object structure
  if (error.message) {
    const message = error.message.toLowerCase()
    return (
      message.includes('refresh token') ||
      message.includes('invalid refresh token') ||
      message.includes('refresh token not found')
    )
  }
  
  return false
}

/**
 * Handle invalid refresh token by clearing the session
 * Call this when you detect an invalid refresh token error
 */
export async function handleInvalidRefreshToken(
  client: SupabaseClient | null
): Promise<void> {
  if (!client) return
  
  try {
    // Clear the session and sign out
    await client.auth.signOut()
  } catch (signOutError) {
    // Even if sign out fails, we've tried to clear the session
    console.warn('Error during sign out after invalid refresh token:', signOutError)
  }
}

/**
 * Safely get user, handling invalid refresh token errors
 */
export async function safeGetUser(client: SupabaseClient | null): Promise<{ user: any; error: any }> {
  if (!client) {
    return { user: null, error: new Error('Supabase client not available') }
  }
  
  try {
    const { data, error } = await client.auth.getUser()
    
    if (error && isInvalidRefreshTokenError(error)) {
      console.warn('Invalid refresh token detected, clearing session')
      await handleInvalidRefreshToken(client)
      return { user: null, error: null } // Return no error, just no user
    }
    
    return { user: data.user, error }
  } catch (error: any) {
    if (isInvalidRefreshTokenError(error)) {
      console.warn('Invalid refresh token detected, clearing session')
      await handleInvalidRefreshToken(client)
      return { user: null, error: null }
    }
    return { user: null, error }
  }
}

/**
 * Safely get session, handling invalid refresh token errors
 */
export async function safeGetSession(client: SupabaseClient | null): Promise<{ session: any; error: any }> {
  if (!client) {
    return { session: null, error: new Error('Supabase client not available') }
  }
  
  try {
    const { data, error } = await client.auth.getSession()
    
    if (error && isInvalidRefreshTokenError(error)) {
      console.warn('Invalid refresh token detected, clearing session')
      await handleInvalidRefreshToken(client)
      return { session: null, error: null }
    }
    
    return { session: data.session, error }
  } catch (error: any) {
    if (isInvalidRefreshTokenError(error)) {
      console.warn('Invalid refresh token detected, clearing session')
      await handleInvalidRefreshToken(client)
      return { session: null, error: null }
    }
    return { session: null, error }
  }
}


