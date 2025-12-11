// src/hooks/useAuthSession.ts
'use client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export function useAuthSession() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data } = await supabase.auth.getSession()
      if (mounted) {
        setSession(data.session)
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
