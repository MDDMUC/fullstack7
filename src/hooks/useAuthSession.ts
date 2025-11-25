// src/hooks/useAuthSession.ts
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { safeGetSession } from '@/lib/authUtils'

export function useAuthSession() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<null | { access_token: string }>(null)

  useEffect(() => {
    let mounted = true
    const fetchSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { session: fetchedSession } = await safeGetSession(supabase)
      if (mounted) {
        setSession(fetchedSession)
        setLoading(false)
      }
    }
    fetchSession()

    const { data: listener } = supabase?.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) setSession(newSession)
    }) ?? { data: null }

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return { session, loading }
}
