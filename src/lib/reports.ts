import { requireSupabase } from './supabaseClient'

export type ReportType = 'harassment' | 'inappropriate' | 'spam' | 'fraud' | 'other'

export type Report = {
  id: string
  reporter_id: string
  reported_user_id?: string | null
  reported_message_id?: string | null
  report_type: ReportType
  reason: string
  status: string
  created_at: string
}

export async function reportUser(
  reportedUserId: string,
  reportType: ReportType,
  reason: string
): Promise<Report> {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = userData.user?.id
  if (!userId) throw new Error('Not authenticated')
  if (userId === reportedUserId) throw new Error('Cannot report yourself')

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: userId,
      reported_user_id: reportedUserId,
      report_type: reportType,
      reason,
    })
    .select()
    .single()

  if (error) throw error
  return data as Report
}

export async function reportMessage(
  messageId: string,
  reportType: ReportType,
  reason: string
): Promise<Report> {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = userData.user?.id
  if (!userId) throw new Error('Not authenticated')

  // Verify the message exists and the user has access to it
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .select('id, thread_id, sender_id')
    .eq('id', messageId)
    .maybeSingle()

  if (messageError) throw messageError
  if (!message) throw new Error('Message not found or you do not have access to it')

  // Verify the user is a participant in the thread (can see the message)
  const { data: participant, error: participantError } = await supabase
    .from('thread_participants')
    .select('user_id')
    .eq('thread_id', message.thread_id)
    .eq('user_id', userId)
    .maybeSingle()

  if (participantError) throw participantError
  if (!participant) throw new Error('You do not have access to this message')

  // Prevent self-reporting
  if (message.sender_id === userId) throw new Error('Cannot report your own message')

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: userId,
      reported_message_id: messageId,
      report_type: reportType,
      reason,
    })
    .select()
    .single()

  if (error) throw error
  return data as Report
}

