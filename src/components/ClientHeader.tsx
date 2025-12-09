'use client'

import Logo from './Logo'
import UserNav from './UserNav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Routes where the header should be hidden (onboarding flows, preview pages, mobile home/chats/events/profile)
const HIDDEN_HEADER_ROUTES = ['/dab', '/signup', '/chats', '/home', '/events', '/profile']

export default function ClientHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Close the mobile nav when the route changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setIsOpen(false)
  }, [pathname, isOpen])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide header on onboarding routes and mobile pages
  const shouldHideHeader = HIDDEN_HEADER_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (shouldHideHeader) {
    return null
  }

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
