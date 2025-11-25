'use client'

import Logo from './Logo'
import UserNav from './UserNav'

export default function ClientHeader() {
  return (
    <header className="site-header">
      <Logo />
      <UserNav />
    </header>
  )
}
