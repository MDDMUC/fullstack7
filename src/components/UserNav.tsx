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
      <nav className="nav-links" style={{ gap: '12px' }}>
        <span className="ghost" style={{ padding: '10px 16px', opacity: 0.6 }}>Loading…</span>
      </nav>
    )
  }

  if (!userEmail) {
    return (
      <nav className="nav-links" style={{ gap: '12px' }}>
        <Link className="cta" href="/signup" style={{ padding: '10px 16px', color: '#0c0e12' }}>Get Started</Link>
        <Link className="ghost" href="/login" style={{ padding: '10px 16px' }}>Login</Link>
      </nav>
    )
  }

  return (
    <nav className="nav-links" style={{ gap: '12px' }}>
      <button className="ghost" style={{ padding: '10px 16px' }} onClick={handleSignOut}>
        Logout
      </button>
    </nav>
  )
}

export default UserNav
