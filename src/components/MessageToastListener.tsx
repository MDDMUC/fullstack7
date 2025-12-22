'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useToast } from '@/components/Toast'
import { fetchProfiles } from '@/lib/profiles'

type MessagePayload = {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
}

export function MessageToastListener() {
  const { session } = useAuthSession()
  const userId = session?.user?.id
  const router = useRouter()
  const pathname = usePathname()
  const { addToast } = useToast()

  // Track current chat thread to avoid showing toast for messages in the current chat
  const currentThreadIdRef = useRef<string | null>(null)

  // Update current thread ID based on pathname
  useEffect(() => {
    // If on /chats/[id], extract the thread ID
    const match = pathname?.match(/^\/chats\/([^\/]+)/)
    if (match) {
      currentThreadIdRef.current = match[1]
    } else {
      currentThreadIdRef.current = null
    }
  }, [pathname])

  useEffect(() => {
    if (!supabase || !userId) return

    const client = supabase

    // Cache for sender profiles to avoid repeated fetches
    const senderCache = new Map<string, { username: string; avatar_url?: string | null }>()

    const getSenderName = async (senderId: string): Promise<string> => {
      if (senderCache.has(senderId)) {
        const cached = senderCache.get(senderId)
        return cached?.username?.split(' ')[0] || 'Someone'
      }

      try {
        const profiles = await fetchProfiles(client, [senderId])
        if (profiles.length > 0) {
          senderCache.set(senderId, profiles[0])
          return profiles[0].username?.split(' ')[0] || 'Someone'
        }
      } catch (err) {
        console.error('Failed to fetch sender profile for toast', err)
      }
      return 'Someone'
    }

    const getThreadInfo = async (threadId: string): Promise<{ type: string; title?: string }> => {
      try {
        const { data: thread } = await client
          .from('threads')
          .select('type,title,crew_id')
          .eq('id', threadId)
          .single()

        if (thread) {
          // For crew threads, get the crew name
          if (thread.type === 'crew' && thread.crew_id) {
            const { data: crew } = await client
              .from('crews')
              .select('title')
              .eq('id', thread.crew_id)
              .single()
            return { type: 'crew', title: crew?.title || 'Crew' }
          }
          return { type: thread.type || 'direct', title: thread.title || undefined }
        }
      } catch (err) {
        console.error('Failed to fetch thread info for toast', err)
      }
      return { type: 'direct' }
    }

    const handleNewMessage = async (payload: { new: MessagePayload }) => {
      const message = payload.new

      // Don't show toast for messages sent by the current user
      if (message.sender_id === userId) return

      // Don't show toast if user is currently viewing this thread
      if (currentThreadIdRef.current === message.thread_id) return

      // Get sender name and thread info
      const [senderName, threadInfo] = await Promise.all([
        getSenderName(message.sender_id),
        getThreadInfo(message.thread_id),
      ])

      // Truncate message body
      const maxLength = 50
      const truncatedBody = message.body.length > maxLength
        ? message.body.substring(0, maxLength) + '...'
        : message.body

      // Build title based on thread type
      let title = `New message from ${senderName}`
      if (threadInfo.type === 'crew') {
        title = `${senderName} in ${threadInfo.title || 'Crew'}`
      } else if (threadInfo.type === 'gym') {
        title = `${senderName} in ${threadInfo.title || 'Gym Chat'}`
      }

      addToast({
        type: 'message',
        title,
        message: truncatedBody,
        duration: 5000,
        onClick: () => {
          router.push(`/chats/${message.thread_id}`)
        },
      })
    }

    // Subscribe to new messages
    const channelName = `toast-messages-${userId}-${Date.now()}`
    const channel = client.channel(channelName)

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        handleNewMessage
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, addToast, router])

  // This component doesn't render anything - it's just a listener
  return null
}

