'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { isMessageUnread, isThreadUnread } from '@/lib/messages'

type MobileNavbarState = 'Default' | 'chats' | 'events' | 'crew'

// Inline SVG icons using currentColor for proper tokenized color support
const EventsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.8333 8.6667V13M11.1041 5.95836H7.36663C5.54645 5.95836 4.63637 5.95836 3.94115 6.31259C3.32963 6.62418 2.83244 7.12136 2.52085 7.73289C2.16662 8.42811 2.16662 9.33819 2.16663 11.1584L2.16663 12.4584C2.16663 13.4679 2.16663 13.9727 2.33156 14.3708C2.55146 14.9017 2.97325 15.3235 3.50415 15.5434C3.90232 15.7084 4.40709 15.7084 5.41663 15.7084V20.3125C5.41663 20.564 5.41663 20.6898 5.42706 20.7957C5.52838 21.8244 6.34224 22.6383 7.37092 22.7396C7.47685 22.75 7.60261 22.75 7.85413 22.75C8.10565 22.75 8.2314 22.75 8.33733 22.7396C9.36602 22.6383 10.1799 21.8244 10.2812 20.7957C10.2916 20.6898 10.2916 20.564 10.2916 20.3125V15.7084H11.1041C13.0178 15.7084 15.3586 16.7342 17.1646 17.7186C18.2182 18.293 18.745 18.5801 19.09 18.5379C19.4099 18.4987 19.6518 18.355 19.8394 18.0929C20.0416 17.8102 20.0416 17.2445 20.0416 16.1132V5.5535C20.0416 4.42219 20.0416 3.85653 19.8394 3.57382C19.6518 3.31167 19.4099 3.16802 19.09 3.12883C18.745 3.08657 18.2182 3.37374 17.1646 3.94808C15.3586 4.93256 13.0178 5.95836 11.1041 5.95836Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChatsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.8333 16.25L7.50176 19.6232C7.03706 20.0937 6.80471 20.329 6.60499 20.3456C6.43172 20.3599 6.26208 20.2903 6.14891 20.1583C6.01848 20.0062 6.01848 19.6755 6.01848 19.0142V17.3243C6.01848 16.731 5.53262 16.3017 4.9456 16.2157C3.52485 16.0076 2.40905 14.8918 2.20094 13.471C2.16663 13.2368 2.16663 12.9572 2.16663 12.3982V7.36669C2.16663 5.54652 2.16663 4.63643 2.52085 3.94122C2.83244 3.32969 3.32963 2.8325 3.94116 2.52092C4.63637 2.16669 5.54646 2.16669 7.36663 2.16669H15.3833C17.2035 2.16669 18.1135 2.16669 18.8088 2.52092C19.4203 2.8325 19.9175 3.32969 20.2291 3.94122C20.5833 4.63643 20.5833 5.54652 20.5833 7.36669V11.9167" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.5833 23.8334L18.2255 22.1941C17.8941 21.9637 17.7284 21.8485 17.548 21.7668C17.3879 21.6943 17.2196 21.6416 17.0468 21.6097C16.8521 21.5738 16.6503 21.5738 16.2466 21.5738H14.3C13.0865 21.5738 12.4798 21.5738 12.0163 21.3377C11.6086 21.13 11.2772 20.7985 11.0694 20.3908C10.8333 19.9273 10.8333 19.3206 10.8333 18.1072V15.3834C10.8333 14.1699 10.8333 13.5632 11.0694 13.0997C11.2772 12.692 11.6086 12.3606 12.0163 12.1528C12.4798 11.9167 13.0865 11.9167 14.3 11.9167H20.3666C21.5801 11.9167 22.1868 11.9167 22.6503 12.1528C23.058 12.3606 23.3894 12.692 23.5971 13.0997C23.8333 13.5632 23.8333 14.1699 23.8333 15.3834V18.3238C23.8333 19.3334 23.8333 19.8381 23.6684 20.2363C23.4485 20.7672 23.0267 21.189 22.4958 21.4089C22.0976 21.5738 21.5928 21.5738 20.5833 21.5738V23.8334Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CrewIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 11.5H14.5L13 14.5L11 8.5L9.5 11.5H8.5M11.9932 5.13581C9.9938 2.7984 6.65975 2.16964 4.15469 4.31001C1.64964 6.45038 1.29697 10.029 3.2642 12.5604C4.75009 14.4724 8.97129 18.311 10.948 20.0749C11.3114 20.3991 11.4931 20.5613 11.7058 20.6251C11.8905 20.6805 12.0958 20.6805 12.2805 20.6251C12.4932 20.5613 12.6749 20.3991 13.0383 20.0749C15.015 18.311 19.2362 14.4724 20.7221 12.5604C22.6893 10.029 22.3797 6.42787 19.8316 4.31001C17.2835 2.19216 13.9925 2.7984 11.9932 5.13581Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DabIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,24.7c-.1,0-.3,0-.4,0-.4-.2-.6-.6-.6-1l.9-7.5h-6.8c-.7,0-1.2,0-1.7-.3-.4-.3-.6-.7-.6-1.2,0-.5.3-.9.8-1.5L13.4,1.4c.3-.3.8-.5,1.2-.3.4.2.6.6.6,1l-.9,7.5h6.8c.8,0,1.2,0,1.7.3.4.3.6.8.6,1.2,0,.5-.3.9-.8,1.5l-9.6,11.6c-.2.2-.5.4-.8.4ZM5.4,14h7.6c.3,0,.6.1.7.3.2.2.3.5.2.8l-.7,5.3,7.3-8.7h-7.6c-.3,0-.6-.1-.7-.3-.2-.2-.3-.5-.2-.8l.7-5.3-7.3,8.7ZM21.6,11.7h0Z" fill="currentColor"/>
  </svg>
)

// Icon component mapping
const iconComponents = {
  events: EventsIcon,
  chats: ChatsIcon,
  crew: CrewIcon,
  dab: DabIcon,
}

type NavItemConfig = {
  id: keyof typeof iconComponents
  label: string
  href: string
  hasDot?: boolean
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'events',
    label: 'Events',
    href: '/events',
  },
  {
    id: 'chats',
    label: 'Chats',
    href: '/chats',
    hasDot: true,
  },
  {
    id: 'crew',
    label: 'Crew',
    href: '/crew',
  },
  {
    id: 'dab',
    label: 'Dab',
    href: '/home',
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
          const IconComponent = iconComponents[item.id]
          const textClass = isActive ? 'mobile-navbar-label active' : 'mobile-navbar-label'
          const iconClass = `mobile-navbar-icon ${isActive ? 'active' : 'default-state'}`
          const itemClass = `mobile-navbar-item ${isActive ? 'active' : ''}`
          const showDot = (item.id === 'chats' && hasUnreadChats) || (item.id === 'crew' && hasUnreadCrews)
          return (
            <Link key={item.id} href={item.href} className={itemClass}>
              <span className="mobile-navbar-icon-wrap">
                <span className={iconClass}>
                  <IconComponent />
                </span>
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


