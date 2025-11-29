'use client'

import Logo from './Logo'
import UserNav from './UserNav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClientHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Close the mobile nav when the route changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setIsOpen(false)
  }, [pathname, isOpen])

  const links = [
    { href: '/gym-chat', label: 'Gym Chat' },
    { href: '/partner-finder', label: 'Partners' },
    { href: '/events', label: 'Events' },
    { href: '/check-in', label: 'Check-In' },
  ]

  return (
    <header className="site-header-new">
      <div className="site-header-container">
        <div className="site-header-logo">
          <Logo />
        </div>
        <nav className={`site-header-nav ${isOpen ? 'is-open' : ''}`}>
          {links.map(link => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-header-navlink ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="site-header-cta">
          <UserNav />
        </div>
        <button
          className="site-header-toggle"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
