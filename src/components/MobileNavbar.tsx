'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { isMessageUnread, isThreadUnread } from '@/lib/messages'

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
  const [resolvedActive, setResolvedActive] = useState<MobileNavbarState | 'dab' | 'Default'>(active)
  const [forceNoActive, setForceNoActive] = useState(false)
  const [hasUnreadChats, setHasUnreadChats] = useState(false)
  const [hasUnreadCrews, setHasUnreadCrews] = useState(false)

  // On /profile, /gyms, /notifications pages, no navbar icon should be active
  useEffect(() => {
    if (typeof window === 'undefined') return
    const path = window.location.pathname
    if (path.startsWith('/profile') || path.startsWith('/gyms') || path.startsWith('/notifications')) {
      setForceNoActive(true)
      setResolvedActive('Default')
    } else {
      setForceNoActive(false)
      setResolvedActive(active)
    }
  }, [active])

  useEffect(() => {
    if (!supabase || !userId) {
      setHasUnreadChats(false)
      setHasUnreadCrews(false)
      return
    }

    const client = supabase

    const checkUnreadChats = async () => {
      try {
        // Use the exact same logic as /chats page to determine unread status
        // Direct 1:1 threads where current user is user_a or user_b
        const { data: directThreads } = await client
          .from('threads')
          .select('id,user_a,user_b,type,gym_id,title')
          .or(`user_a.eq.${userId},user_b.eq.${userId}`)

        // Group/gym threads via participant table
        const { data: participantThreads } = await client
          .from('thread_participants')
          .select('thread:threads(id,user_a,user_b,type,gym_id,title)')
          .eq('user_id', userId)

        const directIds = new Set<string>((directThreads ?? []).map(t => t.id).filter(Boolean))
        const participantThreadRows = (participantThreads ?? [])
          .map(p => (p as unknown as { thread: { id: string; user_a: string | null; user_b: string | null; type: string | null; gym_id: string | null; title: string | null } }).thread)
          .filter(Boolean)
        const participantIds = new Set<string>(participantThreadRows.map(t => t.id).filter(Boolean))
        const allowedIds = new Set<string>([...directIds, ...participantIds])

        const threadsData = [
          ...(directThreads ?? []),
          ...participantThreadRows,
        ].filter(t => t?.id && allowedIds.has(t.id))

        // Dedupe by thread id
        const uniqueThreadsMap = new Map<string, typeof threadsData[0]>()
        threadsData.forEach(t => {
          if (t?.id && allowedIds.has(t.id) && !uniqueThreadsMap.has(t.id)) {
            uniqueThreadsMap.set(t.id, t)
          }
        })
        const uniqueThreads = Array.from(uniqueThreadsMap.values())

        // Exclude crew threads - they only appear on /crew page
        const withoutCrews = uniqueThreads.filter(t => (t.type ?? 'direct') !== 'crew')

        // Keep only the three canonical gym thread titles; drop anything else.
        const allowedGymTitles = new Set(['general', 'beta center', 'routesetting'])
        const filteredThreads = withoutCrews.filter(t => {
          if ((t.type ?? 'direct') !== 'gym') return true
          const title = ((t as any).title ?? '').trim().toLowerCase()
          return allowedGymTitles.has(title)
        })

        // Dedupe gym threads per gym_id+title (simplified - just get unique thread IDs)
        const gymKeySeen = new Set<string>()
        const fullyFilteredThreads: typeof filteredThreads = []
        filteredThreads.forEach(t => {
          if ((t.type ?? 'direct') !== 'gym') {
            fullyFilteredThreads.push(t)
            return
          }
          const key = `${(t as any).gym_id ?? ''}::${((t as any).title ?? '').trim().toLowerCase()}`
          if (!gymKeySeen.has(key)) {
            gymKeySeen.add(key)
            fullyFilteredThreads.push(t)
          }
        })

        const latestByThread: Record<string, { sender_id: string; receiver_id: string; status: string | null }> = {}
        const threadIds = fullyFilteredThreads.map(t => t.id).filter(Boolean) as string[]
        if (threadIds.length > 0) {
          const { data: latestMsgs } = await client
            .from('messages')
            .select('id,thread_id,sender_id,receiver_id,status')
            .in('thread_id', threadIds)
            .order('created_at', { ascending: false })
          if (latestMsgs) {
            for (const m of latestMsgs) {
              if (!latestByThread[m.thread_id]) {
                latestByThread[m.thread_id] = { sender_id: m.sender_id, receiver_id: m.receiver_id, status: m.status }
              }
            }
          }
        }

        // Use unified unread helper from lib/messages
        const hasUnread = fullyFilteredThreads.some(t => {
          const fallbackMsg = latestByThread[t.id]
          const isDirect = (t.type ?? 'direct') === 'direct'
          const hasMessages = !!fallbackMsg || !!(t as any).last_message

          return isThreadUnread(
            fallbackMsg ? { sender_id: fallbackMsg.sender_id, receiver_id: fallbackMsg.receiver_id, status: fallbackMsg.status } : null,
            userId,
            isDirect,
            hasMessages
          )
        })

        setHasUnreadChats(hasUnread)
      } catch (error) {
        console.error('Error checking unread chats:', error)
        setHasUnreadChats(false)
      }
    }

    const checkUnreadCrews = async () => {
      try {
        // Get all thread_participants for the user
        const { data: participantThreads } = await client
          .from('thread_participants')
          .select('thread_id')
          .eq('user_id', userId)

        if (!participantThreads || participantThreads.length === 0) {
          setHasUnreadCrews(false)
          return
        }

        const participantThreadIds = participantThreads.map(p => p.thread_id).filter(Boolean) as string[]

        // Get crew threads where user is a participant
        const { data: crewThreads } = await client
          .from('threads')
          .select('id')
          .eq('type', 'crew')
          .in('id', participantThreadIds)

        if (!crewThreads || crewThreads.length === 0) {
          setHasUnreadCrews(false)
          return
        }

        const threadIds = crewThreads.map(t => t.id).filter(Boolean) as string[]

        // Get latest message for each crew thread
        const { data: latestMessages, error: messagesError } = await client
          .from('messages')
          .select('id,thread_id,sender_id,receiver_id,status')
          .in('thread_id', threadIds)
          .order('created_at', { ascending: false })

        if (messagesError) {
          console.error('Error fetching crew messages for unread check:', messagesError)
        }

        if (!latestMessages || latestMessages.length === 0) {
          setHasUnreadCrews(false)
          return
        }

        // Group by thread_id and get the latest message per thread
        const latestByThread = new Map<string, typeof latestMessages[0]>()
        for (const msg of latestMessages) {
          if (!latestByThread.has(msg.thread_id)) {
            latestByThread.set(msg.thread_id, msg)
          }
        }

        // Use unified unread helper for crew threads (isDirect = false for all crew threads)
        const hasUnread = Array.from(latestByThread.values()).some(msg => {
          return isMessageUnread(
            { sender_id: msg.sender_id, receiver_id: msg.receiver_id, status: msg.status },
            userId,
            false // isDirect = false for crew threads
          )
        })

        setHasUnreadCrews(hasUnread)
      } catch (error) {
        console.error('Error checking unread crews:', error)
        setHasUnreadCrews(false)
      }
    }

    checkUnreadChats()
    checkUnreadCrews()

    // Subscribe to message changes
    // Use unique channel per user with timestamp to avoid conflicts from React Strict Mode
    const channelName = `navbar-unread-${userId}-${Date.now()}`
    let isSubscribed = true

    const channel = client.channel(channelName)

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (!isSubscribed) return
          console.log('[MobileNavbar] New message received')
          checkUnreadChats()
          checkUnreadCrews()
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          if (!isSubscribed) return
          checkUnreadChats()
          checkUnreadCrews()
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[MobileNavbar] Realtime connected')
        }
      })

    // Poll every 10s as reliable fallback
    const pollInterval = setInterval(() => {
      if (!isSubscribed) return
      checkUnreadChats()
      checkUnreadCrews()
    }, 10000)

    return () => {
      isSubscribed = false
      channel.unsubscribe()
      clearInterval(pollInterval)
    }
  }, [userId])

  return (
    <div className="mobile-navbar" data-name="mobile-navbar">
      <div className="mobile-navbar-inner">
        {NAV_ITEMS.map((item) => {
          // When forceNoActive is true (on /profile, /gyms, /notifications), no icon should be active
          const isActive = !forceNoActive && (item.id === resolvedActive || (resolvedActive === 'Default' && item.id === 'dab'))
          const icon = isActive ? item.activeIcon : item.defaultIcon
          const textClass = isActive ? 'mobile-navbar-label active' : 'mobile-navbar-label'
          const iconClass = `mobile-navbar-icon ${item.iconSize === 24 ? 'crew' : ''} ${isActive ? 'active' : 'default-state'}`
          const itemClass = `mobile-navbar-item ${isActive ? 'active' : ''}`
          const showDot = (item.id === 'chats' && hasUnreadChats) || (item.id === 'crew' && hasUnreadCrews)
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

