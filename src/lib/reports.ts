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
