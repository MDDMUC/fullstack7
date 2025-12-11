'use client'

import Link from 'next/link'
import React from 'react'

type MobileNavbarState = 'Default' | 'chats' | 'events' | 'profile'

type NavItem = {
  id: MobileNavbarState | 'dab'
  label: string
  href: string
  defaultIcon: string
  activeIcon: string
  hasDot?: boolean
}

const ICON_PROFILE_DEFAULT = 'https://www.figma.com/api/mcp/asset/32526229-f77e-4bd3-8e8e-e855fede3e00'
const ICON_PROFILE_ACTIVE = 'https://www.figma.com/api/mcp/asset/3890ad32-0b2e-4a0e-8933-0d4f7661517c'

const ICON_EVENTS_DEFAULT = 'https://www.figma.com/api/mcp/asset/ac6d2090-a7bd-46ff-9758-9938c0cb1ebb'
const ICON_EVENTS_ACTIVE = 'https://www.figma.com/api/mcp/asset/c26557db-77ce-49cf-966d-5bd4aa9aa047'

const ICON_CHATS_DEFAULT = 'https://www.figma.com/api/mcp/asset/4a04fa08-1a51-4f98-82a1-df22a397af58'
const ICON_CHATS_ACTIVE = 'https://www.figma.com/api/mcp/asset/507b4b02-9e52-4e7c-abed-25f75d60f0d8'

const ICON_DAB_DEFAULT = 'https://www.figma.com/api/mcp/asset/d1c5338d-0746-465f-8355-60fcdb5567a5'
const ICON_DAB_ACTIVE = 'https://www.figma.com/api/mcp/asset/f2110be1-dffc-43d0-b46e-7f0f3091bfca'

const NAV_ITEMS: NavItem[] = [
  {
    id: 'profile',
    label: 'profile',
    href: '/profile',
    defaultIcon: ICON_PROFILE_DEFAULT,
    activeIcon: ICON_PROFILE_ACTIVE,
  },
  {
    id: 'events',
    label: 'events',
    href: '/events',
    defaultIcon: ICON_EVENTS_DEFAULT,
    activeIcon: ICON_EVENTS_ACTIVE,
  },
  {
    id: 'chats',
    label: 'chats',
    href: '/chats',
    defaultIcon: ICON_CHATS_DEFAULT,
    activeIcon: ICON_CHATS_ACTIVE,
    hasDot: true,
  },
  {
    id: 'dab',
    label: 'dab',
    href: '/home',
    defaultIcon: ICON_DAB_DEFAULT,
    activeIcon: ICON_DAB_ACTIVE,
  },
]

export type MobileNavbarProps = {
  active?: MobileNavbarState | 'dab'
}

export default function MobileNavbar({ active = 'Default' }: MobileNavbarProps) {
  return (
    <div className="mobile-navbar" data-name="mobile-navbar">
      <div className="mobile-navbar-inner">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active || (active === 'Default' && item.id === 'dab')
          const icon = isActive ? item.activeIcon : item.defaultIcon
          const textClass = isActive ? 'mobile-navbar-label active' : 'mobile-navbar-label'
          const iconClass = isActive ? 'mobile-navbar-icon active' : 'mobile-navbar-icon'
          return (
            <Link key={item.id} href={item.href} className="mobile-navbar-item">
              <span className="mobile-navbar-icon-wrap">
                <img src={icon} alt="" className={iconClass} />
                {item.hasDot && isActive && <span className="mobile-navbar-dot" />}
              </span>
              <span className={textClass}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

