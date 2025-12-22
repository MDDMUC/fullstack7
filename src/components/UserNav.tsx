'use client'

import ButtonGhost from './ButtonGhost'
import ButtonCta from './ButtonCta'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
        <ButtonGhost disabled aria-live="polite" aria-busy>
          Loading...
        </ButtonGhost>
      </nav>
    )
  }

  if (!userEmail) {
    return (
      <nav className="site-header-cta">
        <ButtonGhost href="/login">Login</ButtonGhost>
        <ButtonCta href="/signup">Get Started</ButtonCta>
      </nav>
    )
  }

  return (
    <nav className="site-header-cta">
      <ButtonGhost onClick={handleSignOut}>Logout</ButtonGhost>
    </nav>
  )
}

export default UserNav

