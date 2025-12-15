'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'

type MobileNavbarState = 'Default' | 'chats' | 'events' | 'crew'

type NavItem = {
  id: MobileNavbarState | 'dab'
  label: string
  href: string
  defaultIcon: string
  activeIcon: string
  hasDot?: boolean
  iconSize?: 24 | 26
}

const ICON_EVENTS_DEFAULT = 'https://www.figma.com/api/mcp/asset/ac6d2090-a7bd-46ff-9758-9938c0cb1ebb'
const ICON_EVENTS_ACTIVE = 'https://www.figma.com/api/mcp/asset/c26557db-77ce-49cf-966d-5bd4aa9aa047'

const ICON_CHATS_DEFAULT = 'https://www.figma.com/api/mcp/asset/4a04fa08-1a51-4f98-82a1-df22a397af58'
const ICON_CHATS_ACTIVE = 'https://www.figma.com/api/mcp/asset/507b4b02-9e52-4e7c-abed-25f75d60f0d8'

const ICON_CREW_DEFAULT = 'https://www.figma.com/api/mcp/asset/a09a2aae-281e-4ee1-8315-b57790c3e6c5'
const ICON_CREW_ACTIVE = 'https://www.figma.com/api/mcp/asset/0d875354-1561-4eae-aecd-c73d380c56b0'

const ICON_DAB_DEFAULT = 'https://www.figma.com/api/mcp/asset/d1c5338d-0746-465f-8355-60fcdb5567a5'
const ICON_DAB_ACTIVE = 'https://www.figma.com/api/mcp/asset/f2110be1-dffc-43d0-b46e-7f0f3091bfca'

const NAV_ITEMS: NavItem[] = [
  {
    id: 'events',
    label: 'Events',
    href: '/events',
    defaultIcon: ICON_EVENTS_DEFAULT,
    activeIcon: ICON_EVENTS_ACTIVE,
    iconSize: 26,
  },
  {
    id: 'chats',
    label: 'Chats',
    href: '/chats',
    defaultIcon: ICON_CHATS_DEFAULT,
    activeIcon: ICON_CHATS_ACTIVE,
    hasDot: true,
    iconSize: 26,
  },
  {
    id: 'crew',
    label: 'Crew',
    href: '/crew',
    defaultIcon: ICON_CREW_DEFAULT,
    activeIcon: ICON_CREW_ACTIVE,
    iconSize: 24,
  },
  {
    id: 'dab',
    label: 'Dab',
    href: '/home',
    defaultIcon: ICON_DAB_DEFAULT,
    activeIcon: ICON_DAB_ACTIVE,
    iconSize: 26,
  },
]

export type MobileNavbarProps = {
  active?: MobileNavbarState | 'dab'
}

export default function MobileNavbar({ active = 'Default' }: MobileNavbarProps) {
  const { session } = useAuthSession()
  const userId = session?.user?.id
  const [hasUnreadChats, setHasUnreadChats] = useState(false)

  useEffect(() => {
    if (!supabase || !userId) {
      setHasUnreadChats(false)
      return
    }

    const checkUnreadChats = async () => {
      try {
        // Get all threads the user is part of
        const { data: directThreads } = await supabase
          .from('threads')
          .select('id')
          .or(`user_a.eq.${userId},user_b.eq.${userId}`)

        const { data: participantThreads } = await supabase
          .from('thread_participants')
          .select('thread_id')
          .eq('user_id', userId)

        const threadIds = new Set<string>()
        directThreads?.forEach(t => t.id && threadIds.add(t.id))
        participantThreads?.forEach(p => p.thread_id && threadIds.add(p.thread_id))

        if (threadIds.size === 0) {
          setHasUnreadChats(false)
          return
        }

        // Get latest message for each thread
        const { data: latestMessages } = await supabase
          .from('messages')
          .select('id,thread_id,receiver_id,status')
          .in('thread_id', Array.from(threadIds))
          .order('created_at', { ascending: false })

        if (!latestMessages || latestMessages.length === 0) {
          setHasUnreadChats(false)
          return
        }

        // Group by thread_id and get the latest message per thread
        const latestByThread = new Map<string, typeof latestMessages[0]>()
        for (const msg of latestMessages) {
          if (!latestByThread.has(msg.thread_id)) {
            latestByThread.set(msg.thread_id, msg)
          }
        }

        // Check if any thread has an unread message (receiver is current user and status is not 'read')
        const hasUnread = Array.from(latestByThread.values()).some(
          msg => msg.receiver_id === userId && (msg.status ?? '').toLowerCase() !== 'read'
        )

        setHasUnreadChats(hasUnread)
      } catch (error) {
        console.error('Error checking unread chats:', error)
        setHasUnreadChats(false)
      }
    }

    checkUnreadChats()

    // Subscribe to message changes
    const channel = supabase
      .channel('navbar-unread-check')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          checkUnreadChats()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="mobile-navbar" data-name="mobile-navbar">
      <div className="mobile-navbar-inner">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active || (active === 'Default' && item.id === 'dab')
          const icon = isActive ? item.activeIcon : item.defaultIcon
          const textClass = isActive ? 'mobile-navbar-label active' : 'mobile-navbar-label'
          const iconClass = `mobile-navbar-icon ${item.iconSize === 24 ? 'crew' : ''} ${isActive ? 'active' : 'default-state'}`
          const itemClass = `mobile-navbar-item ${isActive ? 'active' : ''}`
          const showDot = item.id === 'chats' && hasUnreadChats
          return (
            <Link key={item.id} href={item.href} className={itemClass}>
              <span className="mobile-navbar-icon-wrap">
                <img src={icon} alt="" className={iconClass} />
                {showDot && <span className="mobile-navbar-dot" />}
              </span>
              <span className={textClass}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

