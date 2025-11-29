'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

function UserNav() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setChecked(true)
        return
      }
      const { data } = await supabase.auth.getUser()
      setUserEmail(data.user?.email ?? null)
      setChecked(true)
    }
    load()

    // Keep nav in sync with auth changes (immediate UI reaction)
    const sub = supabase?.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      setChecked(true)
    })

    return () => {
      sub?.data?.subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!checked) {
    return (
      <nav className="site-header-cta">
        <span className="site-header-ghost" style={{ opacity: 0.6 }}>Loading…</span>
      </nav>
    )
  }

  if (!userEmail) {
    return (
      <nav className="site-header-cta">
        <Link className="site-header-ghost" href="/login">Login</Link>
        <Link className="site-header-cta-btn" href="/signup">Get Started</Link>
      </nav>
    )
  }

  return (
    <nav className="site-header-cta">
      <button className="site-header-ghost" onClick={handleSignOut}>
        Logout
      </button>
    </nav>
  )
}

export default UserNav
