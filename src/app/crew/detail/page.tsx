'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useRef, useState } from 'react'

import MobileNavbar from '@/components/MobileNavbar'
import BackBar from '@/components/BackBar'
import { RequireAuth } from '@/components/RequireAuth'
import { FriendTile, FriendTilesContainer } from '@/components/FriendTile'
import { ChatMessage } from '@/components/ChatMessage'
import Avatar from '@/components/Avatar'
import ActionMenu from '@/components/ActionMenu'
import Modal from '@/components/Modal'
import ReportModal from '@/components/ReportModal'
import BlockConfirmModal from '@/components/BlockConfirmModal'
import { useAuthSession } from '@/hooks/useAuthSession'
import { supabase } from '@/lib/supabaseClient'
import { fetchProfiles, fetchGymsFromTable, Gym, Profile } from '@/lib/profiles'
import { blockUser, getBlockedUsers } from '@/lib/blocks'

const BACK_ICON = '/icons/chevron-left.svg'
const MENU_ICON = '/icons/dots.svg'
const STATUS_ICON_PRIMARY = 'https://www.figma.com/api/mcp/asset/9669b4a0-521f-4460-b5ea-398ba81c3620'
const STATUS_ICON_SECONDARY = 'https://www.figma.com/api/mcp/asset/a7a888de-184f-46cf-a824-bf78fa777b31'
const ICON_SEND = '/icons/send.svg'
const AVATAR_PLACEHOLDER = '/avatar-fallback.jpg'
const CREW_IMAGE_FALLBACK = '/crew-fallback.jpg'

type CrewRow = {
  id: string
  title: string
  location: string | null
  description: string | null
  image_url?: string | null
  created_by: string | null
}

type ThreadRow = {
  id: string
}

type MessageRow = {
  id: string
  thread_id: string
  sender_id: string
  receiver_id: string
  body: string
  status: 'sent' | 'delivered' | 'read'
  created_at: string
}


const extractCity = (location?: string | null) => {
  if (!location) return ''
  const parts = location.split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length > 1) return parts[parts.length - 1]
  return ''
}

function CrewDetailContent() {
  const searchParams = useSearchParams()
  const crewId = searchParams.get('crewId')
  const router = useRouter()
  const { session } = useAuthSession()
  const userId = session?.user?.id

  const [crew, setCrew] = useState<CrewRow | null>(null)
  const [thread, setThread] = useState<ThreadRow | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [participants, setParticipants] = useState<Profile[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joinedAt, setJoinedAt] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [searchCity, setSearchCity] = useState('')
  const [searchGym, setSearchGym] = useState('')
  const [searchName, setSearchName] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [searching, setSearching] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [currentParticipantIds, setCurrentParticipantIds] = useState<Set<string>>(new Set())
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isParticipant, setIsParticipant] = useState<boolean | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null)
  const [requestingInvite, setRequestingInvite] = useState(false)
  const [showNotMemberOverlay, setShowNotMemberOverlay] = useState(false)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [participantToRemove, setParticipantToRemove] = useState<{ id: string; name: string } | null>(null)
  const [removingParticipant, setRemovingParticipant] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{
    userId?: string,
    username?: string,
    messageId?: string,
    messageBody?: string
  } | null>(null)
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([])
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false)
  const [blockTarget, setBlockTarget] = useState<{ userId: string, username?: string } | null>(null)
  const [blockingUser, setBlockingUser] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const inviteModalRef = useRef<HTMLDivElement | null>(null)

  // Rate limiting: max 5 messages per 10 seconds
  const RATE_LIMIT_MAX = 5
  const RATE_LIMIT_WINDOW_MS = 10000
  const messageTimes = useRef<number[]>([])
  const [rateLimited, setRateLimited] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Fetch crew, thread, messages, and ensure participation
  useEffect(() => {
    let cancelled = false
    const client = supabase
    if (!crewId || !userId) {
      if (!crewId) setError('Crew not found')
      setLoading(false)
      return
    }
    if (!client) {
      setError('Unable to connect to Supabase')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      // Fetch crew
      const { data: crewData, error: crewError } = await client
        .from('crews')
        .select('id,title,location,description,image_url,created_by')
        .eq('id', crewId)
        .maybeSingle()

      if (cancelled) return

      if (crewError || !crewData) {
        setError('Crew not found')
        setLoading(false)
        return
      }

      setCrew(crewData)

      // Check if user is the crew creator
      const isCreator = crewData.created_by === userId

      // Get or create thread
      const { data: threadData, error: threadError } = await client
        .from('threads')
        .select('id')
        .eq('type', 'crew')
        .eq('crew_id', crewId)
        .maybeSingle()

      if (cancelled) return

      if (threadError) {
        console.error('Error fetching thread:', threadError)
      }

      let threadId: string | null = threadData?.id ?? null

      // Create thread if it doesn't exist
      if (!threadId) {
        const { data: newThread, error: createErr } = await client
          .from('threads')
          .insert({
            type: 'crew',
            crew_id: crewId,
            title: crewData.title,
            user_a: userId, // Set user_a to satisfy RLS policies that may require it
            last_message: 'New crew chat',
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .maybeSingle()
        if (createErr || !newThread?.id) {
          setError(createErr?.message || 'Could not create crew chat.')
          setLoading(false)
          return
        }
        threadId = newThread.id
        if (threadId) {
          setThread({ id: threadId })
        }
      } else if (threadId) {
        setThread({ id: threadId })
      }

      // Check if user is a participant
      let userIsParticipant = false
      let participantCheck = null
      
      if (threadId) {
        const { data: participantData, error: participantError } = await client
          .from('thread_participants')
          .select('user_id')
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .maybeSingle()

        if (participantError) {
          console.error('Error checking participant status:', participantError)
          console.error('Error message:', participantError.message)
          console.error('Error details:', participantError.details)
          console.error('Error hint:', participantError.hint)
          console.error('Error code:', participantError.code)
        } else {
          participantCheck = participantData
          userIsParticipant = !!participantCheck
          console.log('Participant check result:', { userIsParticipant, participantCheck, threadId, userId })
        }
      } else {
        console.warn('Cannot check participant status: threadId is null')
      }

      // If user is the creator but not a participant, automatically add them
      if (isCreator && !userIsParticipant && threadId) {
        console.log('Creator is not a participant, attempting to add them', { userId, threadId })
        const { error: addError } = await client
          .from('thread_participants')
          .upsert({ thread_id: threadId, user_id: userId, role: 'owner' })

        if (addError) {
          console.error('CRITICAL: Failed to add creator to thread_participants:', addError)
          console.error('Error message:', addError.message)
          console.error('Error details:', addError.details)
          console.error('Error hint:', addError.hint)
          setError(`Failed to join crew chat: ${addError.message}. Please contact support.`)
          setLoading(false)
          return
        }

        userIsParticipant = true
        console.log('Successfully added creator to thread_participants')
        // Re-fetch participant data
        const { data: newParticipantData } = await client
          .from('thread_participants')
          .select('user_id')
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .maybeSingle()
        participantCheck = newParticipantData
      }

      setIsParticipant(userIsParticipant)

      // If user is not a participant and not the creator, show the overlay and fetch owner profile
      if (!userIsParticipant && !isCreator) {
        console.log('User is not a participant, showing overlay', { userIsParticipant, isCreator, threadId, userId })
        setShowNotMemberOverlay(true)
        // Fetch owner profile
        if (crewData.created_by) {
          const ownerProfiles = await fetchProfiles(client, [crewData.created_by])
          if (ownerProfiles.length > 0) {
            setOwnerProfile(ownerProfiles[0])
          }
        }
        setLoading(false)
        return
      } else {
        console.log('User is a participant or creator, not showing overlay', { userIsParticipant, isCreator, threadId, userId })
        setShowNotMemberOverlay(false)
      }

      // Get join date - since created_at doesn't exist in thread_participants, use current date
      if (participantCheck) {
        const joinDate = new Date()
        setJoinedAt(joinDate.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' }))
      }

      // Fetch messages
      const { data: msgs, error: messagesError } = await client
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (cancelled) return

      setMessages(msgs ?? [])
      if (messagesError) {
        console.error('Error loading messages', messagesError)
      }

      // Fetch profiles for message senders
      const senderIds = Array.from(new Set((msgs ?? []).map(m => m.sender_id).filter(Boolean)))
      if (senderIds.length > 0) {
        const { data: profilesData } = await client
          .from('profiles')
          .select('id,username,avatar_url')
          .in('id', senderIds)
        if (profilesData) {
          const profilesMap: Record<string, Profile> = {}
          profilesData.forEach(p => {
            profilesMap[p.id] = p
          })
          setProfiles(profilesMap)
        }
      }

      // Fetch all thread participants for friend tiles and tracking who left
      if (threadId) {
        const { data: participantData } = await client
          .from('thread_participants')
          .select('user_id')
          .eq('thread_id', threadId)
        
        if (participantData && participantData.length > 0) {
          const participantIds = participantData.map(p => p.user_id).filter(Boolean)
          setCurrentParticipantIds(new Set(participantIds))
          const participantProfiles = await fetchProfiles(client, participantIds)
          setParticipants(participantProfiles)
          
          // Also add to profiles map for messages
          const profilesMap = { ...profiles }
          participantProfiles.forEach(p => {
            if (p.id) {
              profilesMap[p.id] = { id: p.id, username: p.username, avatar_url: p.avatar_url }
            }
          })
          setProfiles(profilesMap)
        } else {
          setCurrentParticipantIds(new Set())
        }
      }

      // Fetch blocked users
      try {
        const blocked = await getBlockedUsers()
        setBlockedUserIds(blocked)
      } catch (err) {
        console.error('Error fetching blocked users:', err)
      }

      setLoading(false)
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [crewId, userId])

  // Real-time subscription for new messages
  useEffect(() => {
    const client = supabase
    if (!client || !thread?.id) return
    const channel = client
      .channel(`crew-thread-${thread.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `thread_id=eq.${thread.id}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as MessageRow
            setMessages(prev => {
              // Prevent duplicates (message may already be added from local insert)
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            // Fetch sender profile if new
            if (newMsg.sender_id && !profiles[newMsg.sender_id]) {
              client
                .from('profiles')
                .select('id,username,avatar_url')
                .eq('id', newMsg.sender_id)
                .single()
                .then(({ data }) => {
                  if (data) {
                    setProfiles(prev => ({ ...prev, [data.id]: data }))
                  }
                })
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(m => (m.id === (payload.old as MessageRow)?.id ? (payload.new as MessageRow) : m)),
            )
          }
        },
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [thread?.id, profiles])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const client = supabase
    if (!client || !userId || !thread?.id || !draft.trim()) return

    const body = draft.trim()

    // Rate limiting check
    const now = Date.now()
    messageTimes.current = messageTimes.current.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
    if (messageTimes.current.length >= RATE_LIMIT_MAX) {
      setRateLimited(true)
      setSendError('Slow down! You can send up to 5 messages per 10 seconds.')
      setTimeout(() => {
        setRateLimited(false)
        setSendError(null)
      }, RATE_LIMIT_WINDOW_MS)
      return
    }
    messageTimes.current.push(now)

    setDraft('')
    setSendError(null)
    const { data, error: msgError } = await client
      .from('messages')
      .insert({
        thread_id: thread.id,
        sender_id: userId,
        receiver_id: userId, // For group threads we populate receiver_id to satisfy schema
        body,
        status: 'sent',
      })
      .select('*')
      .single()

    if (msgError) {
      console.error('Error sending message:', msgError?.message ?? msgError)
      setDraft(body) // restore draft on failure
      setSendError('Failed to send message')
      return
    }

    if (data) {
      setMessages(prev => [...prev, data as MessageRow])
      // Update thread last_message / last_message_at
      await client
        .from('threads')
        .update({ last_message: body, last_message_at: data.created_at })
        .eq('id', thread.id)
    }
  }

  // Mark incoming messages as read when viewing (group thread)
  useEffect(() => {
    const client = supabase
    if (!client || !userId || !thread?.id || messages.length === 0) return
    const incoming = messages.filter(m => m.sender_id !== userId)
    const toRead = incoming.filter(m => m.status !== 'read').map(m => m.id)
    if (toRead.length === 0) return
    ;(async () => {
      await client.from('messages').update({ status: 'read' }).in('id', toRead)
      setMessages(prev =>
        prev.map(m => (toRead.includes(m.id) ? { ...m, status: 'read' } : m)),
      )
    })()
  }, [messages, thread?.id, userId])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleAskForInvite = async () => {
    const client = supabase
    if (!client || !crew || !userId || !ownerProfile?.id) {
      console.error('Missing required data:', { client: !!client, crew: !!crew, userId, ownerId: ownerProfile?.id })
      setError('Missing required information to send invite request')
      return
    }

    setRequestingInvite(true)
    setError('')
    try {
      // Create a crew_invite request where:
      // - inviter_id = owner (they need to approve)
      // - invitee_id = current user (requesting to join)
      // - status = 'pending' (owner will see this and can accept/decline)
      const { data: inviteData, error: inviteError } = await client
        .from('crew_invites')
        .insert({
          crew_id: crew.id,
          inviter_id: ownerProfile.id, // Owner is the one who needs to approve
          invitee_id: userId, // Current user is requesting
          status: 'pending',
        })
        .select()

      if (inviteError) {
        console.error('Error requesting invite:', inviteError)
        // Log more details
        if (inviteError.message) console.error('Error message:', inviteError.message)
        if (inviteError.details) console.error('Error details:', inviteError.details)
        if (inviteError.hint) console.error('Error hint:', inviteError.hint)
        if (inviteError.code) console.error('Error code:', inviteError.code)
        setError(inviteError.message || 'Failed to send invite request')
      } else if (inviteData && inviteData.length > 0) {
        console.log('Invite request created successfully:', inviteData[0])
        // Show success toast
        showToast(`Invite request sent to ${ownerProfile.username || 'owner'}`)
        // Redirect to /crew after a short delay to let the toast be visible
        setTimeout(() => {
          router.push('/crew')
        }, 1500) // 1.5 seconds to see the toast
      } else {
        console.error('No data returned from invite insert')
        setError('Failed to send invite request - no data returned')
      }
    } catch (err: any) {
      console.error('Exception requesting invite:', err)
      if (err.message) console.error('Exception message:', err.message)
      if (err.stack) console.error('Exception stack:', err.stack)
      setError(err.message || 'Failed to send invite request')
    } finally {
      setRequestingInvite(false)
    }
  }

  // Format timestamp for "left the crew" status
  const formatLeaveTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })
  }

  const handleLeaveCrew = async () => {
    const client = supabase
    if (!client || !userId || !thread?.id) {
      setError('Unable to leave crew')
      return
    }
    setLeaving(true)
    setMenuOpen(false)

    // Remove user from thread participants
    const { error: leaveError } = await client
      .from('thread_participants')
      .delete()
      .eq('thread_id', thread.id)
      .eq('user_id', userId)

    if (leaveError) {
      setError(leaveError.message)
      setLeaving(false)
      return
    }

    // Redirect to crew list
    router.push('/crew')
  }

  const handleInviteUsers = () => {
    setMenuOpen(false)
    setInviteModalOpen(true)
    // Load gyms for filter
    const loadGyms = async () => {
      const client = supabase
      if (!client) return
      const gymsList = await fetchGymsFromTable(client)
      setGyms(gymsList)
    }
    loadGyms()
  }

  // Search users with filters
  useEffect(() => {
    if (!inviteModalOpen) {
      setSearchResults([])
      return
    }

    // Don't search if all filters are empty
    if (!searchCity.trim() && !searchGym.trim() && !searchName.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    const searchUsers = async () => {
      const client = supabase
      if (!client || !thread?.id) return

      setSearching(true)
      try {
        // Get current participant IDs to exclude them from search
        const { data: currentParticipants, error: participantsError } = await client
          .from('thread_participants')
          .select('user_id')
          .eq('thread_id', thread.id)
        
        if (participantsError) {
          console.error('Error fetching participants:', participantsError)
        }
        
        const participantIds = new Set((currentParticipants || []).map(p => p.user_id))

        // Build query for onboardingprofiles (has city, gym data)
        let query = client
          .from('onboardingprofiles')
          .select('*')
          .limit(100)

        // Exclude current user
        if (userId) {
          query = query.neq('id', userId)
        }

        // Filter by city
        if (searchCity.trim()) {
          query = query.ilike('city', `%${searchCity.trim()}%`)
        }

        // Filter by name
        if (searchName.trim()) {
          query = query.ilike('username', `%${searchName.trim()}%`)
        }

        let onboardingProfiles: any[] | null = null
        let queryError: any = null

        try {
          const result = await query
          onboardingProfiles = result.data
          queryError = result.error
        } catch (err: any) {
          console.error('Exception during query execution:', err)
          queryError = err
        }

        if (queryError) {
          console.error('Error searching users:', queryError)
          // Log more details if available
          if (queryError.message) console.error('Error message:', queryError.message)
          if (queryError.details) console.error('Error details:', queryError.details)
          if (queryError.hint) console.error('Error hint:', queryError.hint)
          if (queryError.code) console.error('Error code:', queryError.code)
          // If error is empty object, it might be a query construction issue
          if (queryError && typeof queryError === 'object' && Object.keys(queryError).length === 0) {
            console.error('Empty error object - possible query construction issue. Check RLS policies and query syntax.')
          }
          setSearchResults([])
          setSearching(false)
          return
        }

        // Ensure we have data
        if (!onboardingProfiles) {
          console.warn('No onboarding profiles returned from query')
          setSearchResults([])
          setSearching(false)
          return
        }

        // Filter out current participants
        let filteredProfiles = (onboardingProfiles || []).filter(p => !participantIds.has(p.id))
        
        // Filter by gym (post-query filter since gym is stored as array/JSON)
        if (searchGym.trim() && gyms.length > 0) {
          const searchTerm = searchGym.toLowerCase().trim()
          filteredProfiles = filteredProfiles.filter(p => {
            if (!p.gym) return false
            let gymArray: string[] = []
            try {
              if (Array.isArray(p.gym)) {
                gymArray = p.gym
              } else if (typeof p.gym === 'string') {
                if (p.gym.startsWith('[')) {
                  gymArray = JSON.parse(p.gym)
                } else {
                  gymArray = [p.gym]
                }
              }
            } catch (e) {
              gymArray = []
            }
            return gymArray.some((g: string) => {
              // Check if gym ID or name matches
              const matchingGym = gyms.find(gym => 
                gym.id === g || 
                gym.name.toLowerCase().includes(searchTerm) ||
                g.toLowerCase().includes(searchTerm)
              )
              return !!matchingGym
            })
          })
        }

        if (filteredProfiles.length === 0) {
          setSearchResults([])
          setSearching(false)
          return
        }

        // Use fetchProfiles to normalize and merge data
        const profileIds = filteredProfiles.map(p => p.id)
        const profiles = await fetchProfiles(client, profileIds)

        setSearchResults(profiles)
      } catch (err) {
        console.error('Error in user search:', err)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [inviteModalOpen, searchCity, searchGym, searchName, thread?.id, userId, gyms])

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  // Show toast notification (supports queuing multiple toasts)
  const toastQueueRef = useRef<string[]>([])
  const isShowingToastRef = useRef(false)

  const showToast = (message: string) => {
    toastQueueRef.current.push(message)
    processToastQueue()
  }

  const processToastQueue = () => {
    if (isShowingToastRef.current || toastQueueRef.current.length === 0) {
      return
    }

    isShowingToastRef.current = true
    const message = toastQueueRef.current.shift()!
    setToastMessage(message)

    // Auto-hide after 3 seconds (matches CSS animation duration)
    setTimeout(() => {
      setToastMessage(null)
      isShowingToastRef.current = false
      // Process next toast in queue after a short delay
      setTimeout(() => {
        processToastQueue()
      }, 300)
    }, 3000)
  }

  const handleInvite = async () => {
    const client = supabase
    if (!client || !thread?.id || !crew || selectedUsers.size === 0) {
      console.warn('Cannot invite: missing client, thread, crew, or selected users')
      return
    }

    if (!userId) {
      setError('You must be logged in to invite users')
      return
    }

    setInviting(true)
    setError('')
    
    try {
      // Get usernames for toast messages
      const userIdsArray = Array.from(selectedUsers)
      const userProfilesMap: Record<string, string> = {}
      
      // Fetch profiles for selected users to get their names
      if (userIdsArray.length > 0) {
        const profiles = await fetchProfiles(client, userIdsArray)
        profiles.forEach(p => {
          if (p.id) {
            userProfilesMap[p.id] = p.username || 'User'
          }
        })
      }

      // Create crew_invites for each selected user
      const invites = userIdsArray.map(inviteeId => ({
        crew_id: crew.id,
        inviter_id: userId,
        invitee_id: inviteeId,
        status: 'pending',
      }))

      const { data: inviteData, error: inviteError } = await client
        .from('crew_invites')
        .insert(invites)
        .select()

      if (inviteError) {
        console.error('Error creating invites:', inviteError)
        setError(inviteError.message || 'Failed to send invitations')
        setInviting(false)
        return
      }

      // Show toast for each invited user
      userIdsArray.forEach(userId => {
        const userName = userProfilesMap[userId] || 'User'
        showToast(`Invite has been sent to ${userName}`)
      })

      // Close modal and reset
      setInviteModalOpen(false)
      setSelectedUsers(new Set())
      setSearchCity('')
      setSearchGym('')
      setSearchName('')
      setSearchResults([])
    } catch (err: any) {
      console.error('Error inviting users:', err)
      setError(err.message || 'Failed to invite users')
    } finally {
      setInviting(false)
    }
  }

  const handleCancelInvite = () => {
    setInviteModalOpen(false)
    setSelectedUsers(new Set())
    setSearchCity('')
    setSearchGym('')
    setSearchName('')
    setSearchResults([])
  }

  // Close invite modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inviteModalRef.current && !inviteModalRef.current.contains(event.target as Node)) {
        handleCancelInvite()
      }
    }
    if (inviteModalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [inviteModalOpen])

  const handleDeleteCrew = async () => {
    const client = supabase
    if (!client || !userId || !crew || !isCreator) {
      setError('Only the crew creator can delete the crew')
      return
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${crew.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    setMenuOpen(false)

    // Delete the crew (threads will be cascade deleted due to FK)
    const { error: deleteError } = await client
      .from('crews')
      .delete()
      .eq('id', crew.id)
      .eq('created_by', userId) // Extra safety check

    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }

    // Redirect to crew list
    router.push('/crew')
  }

  const isCreator = crew?.created_by === userId

  const handleKickParticipant = (participantId: string, participantName: string) => {
    setParticipantToRemove({ id: participantId, name: participantName })
    setRemoveModalOpen(true)
  }

  const confirmRemoveParticipant = async () => {
    if (!thread?.id || !userId || !participantToRemove) return

    setRemovingParticipant(true)
    const client = supabase
    if (!client) {
      setRemovingParticipant(false)
      return
    }

    const { error } = await client
      .from('thread_participants')
      .delete()
      .eq('thread_id', thread.id)
      .eq('user_id', participantToRemove.id)

    if (error) {
      console.error('Failed to kick participant:', error)
      setRemovingParticipant(false)
      return
    }

    // Remove from local state
    setParticipants(prev => prev.filter(p => p.id !== participantToRemove.id))
    setCurrentParticipantIds(prev => {
      const updated = new Set(prev)
      updated.delete(participantToRemove.id)
      return updated
    })

    // Close modal and reset
    setRemoveModalOpen(false)
    setParticipantToRemove(null)
    setRemovingParticipant(false)
  }

  const cancelRemoveParticipant = () => {
    setRemoveModalOpen(false)
    setParticipantToRemove(null)
    setRemovingParticipant(false)
  }

  const handleReportMessage = (message: MessageRow) => {
    const sender = profiles[message.sender_id]
    setReportTarget({
      messageId: message.id,
      messageBody: message.body,
      userId: message.sender_id,
      username: sender?.username || 'User'
    })
    setReportModalOpen(true)
  }

  const handleReportUser = (targetUserId: string, username?: string) => {
    setReportTarget({
      userId: targetUserId,
      username
    })
    setReportModalOpen(true)
  }

  const handleBlockUserAction = (targetUserId: string, username?: string) => {
    setBlockTarget({ userId: targetUserId, username })
    setBlockConfirmOpen(true)
  }

  const confirmBlockUser = async () => {
    if (!blockTarget) return

    setBlockingUser(true)
    try {
      await blockUser(blockTarget.userId)
      setBlockedUserIds(prev => [...prev, blockTarget.userId])
      setBlockConfirmOpen(false)
      setBlockTarget(null)
    } catch (err) {
      console.error('Error blocking user:', err)
    } finally {
      setBlockingUser(false)
    }
  }

  const statusIcon = (status?: string) => {
    if (status === 'read') return STATUS_ICON_SECONDARY
    if (status === 'delivered') return STATUS_ICON_PRIMARY
    return STATUS_ICON_PRIMARY
  }

  const cityLabel = extractCity(crew?.location) || 'Location'

  if (loading) {
    return (
      <div className="chats-event-screen" data-name="/crew/detail">
        <div className="chats-event-content">
          <div className="chats-event-card">
            <p style={{ padding: 'var(--button-padding-xxxxl)', textAlign: 'center' }}>Loading crew chat…</p>
          </div>
        </div>
        <MobileNavbar active="crew" />
      </div>
    )
  }

  // Show not member overlay if user is not a participant
  // Only show if explicitly set to true AND participant check is complete (not null) AND user is not a participant
  if (showNotMemberOverlay && isParticipant === false && crew) {
    return (
      <div className="chats-event-screen" data-name="/crew/detail">
        <div className="chats-event-content">
          <div className="chats-event-card crew-not-member-card">
            <div className="crew-not-member-overlay">
              <button
                className="crew-not-member-close"
                onClick={() => {
                  setShowNotMemberOverlay(false)
                  router.push('/crew')
                }}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="crew-not-member-content">
                <h2 className="crew-not-member-title">You are not part of this crew.</h2>
                <p className="crew-not-member-subtitle">In order to join the chat, ask the owner to be invited</p>

                {ownerProfile && (
                  <div className="crew-not-member-owner">
                    <div className="crew-not-member-owner-avatar">
                      <Avatar
                        src={ownerProfile.avatar_url}
                        alt={ownerProfile.username || 'Owner'}
                        fallback={AVATAR_PLACEHOLDER}
                      />
                    </div>
                    <div className="crew-not-member-owner-info">
                      <div className="crew-not-member-owner-name">{ownerProfile.username || 'Owner'}</div>
                      <div className="crew-not-member-owner-label">Owner</div>
                    </div>
                  </div>
                )}

                <button
                  className="crew-not-member-ask-button"
                  onClick={handleAskForInvite}
                  disabled={requestingInvite || !ownerProfile}
                >
                  {requestingInvite ? 'Requesting...' : 'Ask for invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <MobileNavbar active="crew" />
      </div>
    )
  }

  if (error || !crew) {
    return (
      <div className="chats-event-screen" data-name="/crew/detail">
        <div className="chats-event-content">
          <div className="chats-event-card">
            <p style={{ padding: 'var(--button-padding-xxxxl)', textAlign: 'center', color: 'red' }}>{error || 'Crew not found'}</p>
          </div>
        </div>
        <MobileNavbar active="crew" />
      </div>
    )
  }

  return (
    <div className="chats-event-screen" data-name="/crew/detail">
      <div className="chats-event-content">
        <div className="chats-event-card chats-event-card-with-sticky-input">
          <BackBar
            backHref="/crew"
            backText="back"
            className="chats-event-backbar"
            rightSlot={
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="chats-event-menu"
                  aria-label="Menu"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <img src={MENU_ICON} alt="" className="chats-event-menu-icon" />
                </button>
                <ActionMenu
                  open={menuOpen}
                  onClose={() => setMenuOpen(false)}
                  items={[
                    ...(isCreator ? [{
                      label: 'Invite users to Crew',
                      onClick: handleInviteUsers,
                    }] : []),
                    {
                      label: 'Leave crew',
                      onClick: handleLeaveCrew,
                      loading: leaving,
                      loadingLabel: 'Leaving...',
                    },
                    ...(isCreator ? [{
                      label: 'Delete Crew',
                      onClick: handleDeleteCrew,
                      loading: deleting,
                      loadingLabel: 'Deleting...',
                      danger: true,
                    }] : []),
                  ]}
                />
              </div>
            }
          />

          <div className="chats-event-hero">
            <div
              className="chats-event-hero-bg"
              style={{ backgroundImage: `url(${crew.image_url || CREW_IMAGE_FALLBACK})` }}
            />
            <div className="chats-event-hero-overlay" />
            <div className="chats-event-hero-text">
              <div className="chats-event-hero-title">{crew.title}</div>
              <div className="chats-event-hero-subtitle">{crew.location || cityLabel}</div>
              <div className="chats-event-hero-info">
                <span className="chats-event-hero-location">{cityLabel}</span>
                <span className="chats-event-hero-attendance">Group Chat</span>
              </div>
            </div>
          </div>

          {/* Friend tiles for all participants */}
          {participants.length > 0 && (
            <FriendTilesContainer>
              {participants.map((participant, index) => {
                const isParticipantHost = participant.id === crew?.created_by
                const canKick = isCreator && !isParticipantHost && participant.id !== userId
                return (
                  <FriendTile
                    key={participant.id || index}
                    name={participant.username || 'User'}
                    avatarUrl={participant.avatar_url || (participant as any)?.photo || null}
                    placeholderUrl={AVATAR_PLACEHOLDER}
                    imagePosition={(index % 6) + 1}
                    isHost={isParticipantHost}
                    canKick={canKick}
                    onKick={() => handleKickParticipant(participant.id, participant.username || 'User')}
                  />
                )
              })}
            </FriendTilesContainer>
          )}

          <div className="chats-event-divider" />

          {joinedAt && (
            <div className="chats-event-system-text">You joined this chat on {joinedAt}.</div>
          )}

          <div className="chats-event-messages-container custom-scrollbar">
            {messages
              .filter(msg => !blockedUserIds.includes(msg.sender_id))
              .map((msg) => {
              const isOutgoing = msg.sender_id === userId
              const senderProfile = profiles[msg.sender_id]
              
              // Check if this is the last message from this sender (for left status)
              const isLastMessageFromSender = (() => {
                const hasLeft = msg.sender_id !== userId && currentParticipantIds && !currentParticipantIds.has(msg.sender_id)
                if (!hasLeft) return false
                // Find the last message from this sender
                for (let i = messages.length - 1; i >= 0; i--) {
                  if (messages[i].sender_id === msg.sender_id) {
                    return messages[i].id === msg.id
                  }
                }
                return false
              })()

              return (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  senderProfile={senderProfile}
                  isOutgoing={isOutgoing}
                  statusIcon={statusIcon}
                  currentUserId={userId}
                  currentParticipantIds={currentParticipantIds}
                  formatLeaveTimestamp={isLastMessageFromSender ? formatLeaveTimestamp : undefined}
                  avatarPlaceholder={AVATAR_PLACEHOLDER}
                  onReportMessage={handleReportMessage}
                  onReportUser={handleReportUser}
                  onBlockUser={handleBlockUserAction}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chats-event-divider" />

          <div className="chats-event-input-sticky">
            {sendError && (
              <div className="chat-send-error">
                <span className="chat-send-error-text">{sendError}</span>
              </div>
            )}
            <div className="chats-event-input">
              <input
                type="text"
                placeholder="Type a message ..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (draft.trim()) handleSend()
                  }
                }}
              />
              <button
                type="button"
                className="chats-event-send-btn"
                onClick={handleSend}
                disabled={!draft.trim()}
              >
                <img src={ICON_SEND} alt="Send" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileNavbar active="crew" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mh-toast">
          <p>{toastMessage}</p>
        </div>
      )}

      {/* Invite Users Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={handleCancelInvite}
        title="Invite Users"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="invite-users-btn-cancel"
              onClick={handleCancelInvite}
              disabled={inviting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="invite-users-btn-invite"
              onClick={handleInvite}
              disabled={inviting || selectedUsers.size === 0}
            >
              {inviting ? 'Inviting...' : `Invite ${selectedUsers.size > 0 ? `(${selectedUsers.size})` : ''}`}
            </button>
          </>
        }
      >
        <div className="invite-users-modal-search">
          <div className="invite-users-search-row">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="invite-users-search-input"
            />
          </div>
          <div className="invite-users-search-row">
            <input
              type="text"
              placeholder="Search by city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="invite-users-search-input"
            />
          </div>
          <div className="invite-users-search-row">
            <input
              type="text"
              placeholder="Search by gym..."
              value={searchGym}
              onChange={(e) => setSearchGym(e.target.value)}
              className="invite-users-search-input"
            />
          </div>
        </div>

        <div className="invite-users-modal-results custom-scrollbar">
          {!searchCity.trim() && !searchGym.trim() && !searchName.trim() ? (
            <div className="invite-users-empty">Enter search criteria to find users to invite.</div>
          ) : searching ? (
            <div className="invite-users-loading">Searching users...</div>
          ) : searchResults.length === 0 ? (
            <div className="invite-users-empty">No users found. Try adjusting your search filters.</div>
          ) : (
            searchResults.map((user) => {
              const isSelected = selectedUsers.has(user.id)
              const firstName = user.username?.split(' ')[0] || user.username || 'User'

              return (
                <div
                  key={user.id}
                  className={`invite-users-result-item ${isSelected ? 'invite-users-result-item-selected' : ''}`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <div className="invite-users-result-avatar">
                    <Avatar
                      src={user.avatar_url || (user as any)?.photo}
                      alt={firstName}
                      fallback={AVATAR_PLACEHOLDER}
                    />
                  </div>
                  <div className="invite-users-result-info">
                    <div className="invite-users-result-name">{firstName}</div>
                    {user.city && (
                      <div className="invite-users-result-city">{user.city}</div>
                    )}
                  </div>
                  <div className="invite-users-result-checkbox">
                    {isSelected && (
                      <div className="invite-users-checkmark">✓</div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Modal>

      {/* Remove Participant Confirmation Modal */}
      <Modal
        open={removeModalOpen}
        onClose={cancelRemoveParticipant}
        title="Remove Member"
        size="sm"
        footer={
          <div className="report-modal-footer">
            <button
              type="button"
              className="report-modal-cancel"
              onClick={cancelRemoveParticipant}
              disabled={removingParticipant}
            >
              Cancel
            </button>
            <button
              type="button"
              className="report-modal-submit"
              onClick={confirmRemoveParticipant}
              disabled={removingParticipant}
            >
              {removingParticipant ? 'Removing...' : 'Remove'}
            </button>
          </div>
        }
      >
        <div className="report-modal-form">
          <p style={{ margin: 0, color: 'var(--color-text)', lineHeight: 1.5 }}>
            Are you sure you want to remove <strong>{participantToRemove?.name}</strong> from this crew?
          </p>
        </div>
      </Modal>

      <ReportModal
        open={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false)
          setReportTarget(null)
        }}
        reportedUserId={reportTarget?.userId}
        reportedUserName={reportTarget?.username}
        reportedMessageId={reportTarget?.messageId}
        reportedMessageBody={reportTarget?.messageBody}
      />

      <BlockConfirmModal
        open={blockConfirmOpen}
        onClose={() => {
          setBlockConfirmOpen(false)
          setBlockTarget(null)
        }}
        onConfirm={confirmBlockUser}
        userName={blockTarget?.username}
        blocking={blockingUser}
      />
    </div>
  )
}

export default function CrewDetailPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <CrewDetailContent />
      </Suspense>
    </RequireAuth>
  )
}

