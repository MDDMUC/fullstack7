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

  return (
    <div className="nav-links" style={{ marginLeft: 'auto', gap: '12px', alignItems: 'center' }}>
      <Link href="/">Home</Link>
      <Link href="/signup">Sign up</Link>
      <Link href="/login">Login</Link>
      {userEmail && (
        <>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{userEmail}</span>
          <button className="ghost" style={{ padding: '6px 12px' }} onClick={handleSignOut}>Logout</button>
        </>
      )}
    </div>
  )
}

export default UserNav
