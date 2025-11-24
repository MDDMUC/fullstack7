'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function UserNav() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
      if (event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    if (!supabase) return
    try {
      await supabase.auth.signOut()
      setIsLoggedIn(false)
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="nav-links" style={{ marginLeft: 'auto' }}>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>Loading...</span>
      </div>
    )
  }

  return (
    <div className="nav-links" style={{ marginLeft: 'auto', gap: '12px', alignItems: 'center' }}>
      {isLoggedIn ? (
        <button 
          className="ghost" 
          style={{ 
            padding: '6px 12px',
            fontSize: 15
          }} 
          onClick={handleSignOut}
        >
          Log out
        </button>
      ) : (
        <Link href="/login" style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>
          Login
        </Link>
      )}
    </div>
  )
}

export default UserNav
