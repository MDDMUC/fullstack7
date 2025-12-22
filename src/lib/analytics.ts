/**
 * Analytics Event Tracking Library
 *
 * Purpose: Log user activity to analytics_events table for metrics dashboard
 * Usage: Import logEvent functions and call them after user actions
 *
 * See docs/EVENT_TAXONOMY.md for full event definitions
 */

import { requireSupabase } from './supabaseClient'

// ============================================================================
// Types
// ============================================================================

export interface BaseAnalyticsEvent {
  event_name: string
  user_id: string
  session_id: string
  properties?: Record<string, any>
  city_id?: string | null
  gym_id?: string | null
}

export interface SignupEventProperties {
  onboarding_step: number
  completion_time_seconds: number
  acquisition_source: 'organic' | 'invite' | 'gym_qr' | 'social'
  invite_token?: string
  gyms_count: number
  climbing_styles: string[]
  looking_for: string[]
}

export interface AppOpenEventProperties {
  page_path: string
  referrer: string
  is_first_session: boolean
  days_since_signup: number
}

export interface MatchCreatedEventProperties {
  match_id: string
  matched_user_id: string
  mutual_gyms_count: number
  mutual_styles_count: number
  match_score: number
  hours_since_signup: number
  is_first_match: boolean
}

export interface MessageSentEventProperties {
  thread_id: string
  thread_type: 'direct' | 'gym' | 'event' | 'crew'
  message_length: number
  is_first_message_in_thread: boolean
  is_first_message_ever: boolean
  hours_since_match?: number
  recipient_user_id?: string
}

export interface EventViewEventProperties {
  event_id: string
  event_title: string
  event_location: string
  event_start_at: string
  slots_open: number
  creator_user_id: string
  is_creator: boolean
  source: 'events_list' | 'notification' | 'chat' | 'direct_link'
}

export interface EventRsvpEventProperties {
  event_id: string
  event_title: string
  event_location: string
  event_start_at: string
  slots_open_before: number
  slots_open_after: number
  creator_user_id: string
  seconds_since_view: number
  is_first_rsvp: boolean
}

export interface InviteSentEventProperties {
  invite_token: string
  invite_channel: 'copy_link' | 'sms' | 'whatsapp' | 'instagram'
  inviter_match_count: number
  inviter_days_since_signup: number
}

export interface InviteAcceptedEventProperties {
  invite_token: string
  inviter_user_id: string
  hours_since_invite_sent: number
  acquisition_source: 'invite'
}

// ============================================================================
// Session ID Management
// ============================================================================

const STORAGE_KEY = 'dab_session_id'

/**
 * Get or create a session ID for this browser session
 * Session ID is stored in sessionStorage and persists until tab is closed
 */
export function getOrCreateSessionId(): string {
  // Server-side: generate a new UUID
  if (typeof window === 'undefined') {
    return crypto.randomUUID()
  }

  let sessionId = sessionStorage.getItem(STORAGE_KEY)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(STORAGE_KEY, sessionId)
  }

  return sessionId
}

/**
 * Clear the current session ID (for testing purposes only)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

// ============================================================================
// Core Logging Function
// ============================================================================

/**
 * Log an analytics event to the database
 * Events are immutable once created (no updates/deletes)
 *
 * @param event - Event data including name, user ID, session ID, and properties
 * @returns Promise<void> - Does not throw errors (analytics should not break app)
 */
export async function logEvent(event: BaseAnalyticsEvent): Promise<void> {
  try {
    const supabase = requireSupabase()

    const { error } = await supabase.from('analytics_events').insert({
      event_name: event.event_name,
      user_id: event.user_id,
      session_id: event.session_id,
      properties: event.properties || {},
      city_id: event.city_id || null,
      gym_id: event.gym_id || null,
      event_ts: new Date().toISOString(),
    })

    if (error) {
      console.error('[Analytics] Failed to log event:', event.event_name, error)
      // Don't throw - analytics should not break app flow
    } else {
      console.log('[Analytics] Event logged:', event.event_name)
    }
  } catch (err) {
    console.error('[Analytics] Exception while logging event:', err)
    // Don't throw - analytics should not break app flow
  }
}

// ============================================================================
// Typed Event Logging Functions
// ============================================================================

/**
 * Log a signup event (user completes onboarding)
 */
export async function logSignupEvent(
  userId: string,
  properties: SignupEventProperties,
  cityId?: string,
  gymId?: string
): Promise<void> {
  await logEvent({
    event_name: 'signup',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: gymId,
  })
}

/**
 * Log an app_open event (user starts a session)
 */
export async function logAppOpenEvent(
  userId: string,
  properties: AppOpenEventProperties,
  cityId?: string
): Promise<void> {
  await logEvent({
    event_name: 'app_open',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: null,
  })
}

/**
 * Log a match_created event (mutual like)
 */
export async function logMatchCreatedEvent(
  userId: string,
  properties: MatchCreatedEventProperties,
  cityId?: string,
  gymId?: string
): Promise<void> {
  await logEvent({
    event_name: 'match_created',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: gymId,
  })
}

/**
 * Log a message_sent event (user sends a chat message)
 */
export async function logMessageSentEvent(
  userId: string,
  properties: MessageSentEventProperties,
  cityId?: string,
  gymId?: string
): Promise<void> {
  await logEvent({
    event_name: 'message_sent',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: gymId,
  })
}

/**
 * Log an event_view event (user views event detail page)
 */
export async function logEventViewEvent(
  userId: string,
  properties: EventViewEventProperties,
  cityId?: string
): Promise<void> {
  await logEvent({
    event_name: 'event_view',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: null,
  })
}

/**
 * Log an event_rsvp event (user RSVPs to an event)
 */
export async function logEventRsvpEvent(
  userId: string,
  properties: EventRsvpEventProperties,
  cityId?: string
): Promise<void> {
  await logEvent({
    event_name: 'event_rsvp',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: null,
  })
}

/**
 * Log an invite_sent event (user generates a referral invite)
 */
export async function logInviteSentEvent(
  userId: string,
  properties: InviteSentEventProperties,
  cityId?: string
): Promise<void> {
  await logEvent({
    event_name: 'invite_sent',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: null,
  })
}

/**
 * Log an invite_accepted event (new user signs up via invite link)
 */
export async function logInviteAcceptedEvent(
  userId: string,
  properties: InviteAcceptedEventProperties,
  cityId?: string
): Promise<void> {
  await logEvent({
    event_name: 'invite_accepted',
    user_id: userId,
    session_id: getOrCreateSessionId(),
    properties,
    city_id: cityId,
    gym_id: null,
  })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate hours since a past timestamp
 */
export function hoursSince(pastDate: Date | string): number {
  const past = typeof pastDate === 'string' ? new Date(pastDate) : pastDate
  const now = new Date()
  const diffMs = now.getTime() - past.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60))
}

/**
 * Calculate days since a past timestamp
 */
export function daysSince(pastDate: Date | string): number {
  const past = typeof pastDate === 'string' ? new Date(pastDate) : pastDate
  const now = new Date()
  const diffMs = now.getTime() - past.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calculate seconds since a past timestamp
 */
export function secondsSince(pastDate: Date | string): number {
  const past = typeof pastDate === 'string' ? new Date(pastDate) : pastDate
  const now = new Date()
  const diffMs = now.getTime() - past.getTime()
  return Math.floor(diffMs / 1000)
}

