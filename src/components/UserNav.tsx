'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

function UserNav() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      const { data } = await supabase.auth.getUser()
      setUserEmail(data.user?.email ?? null)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // Temporarily disable this nav to avoid duplicate headers on landing
  return null
}

export default UserNav
