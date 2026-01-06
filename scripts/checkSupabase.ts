import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const testThreadId = 'cfcdc224-3979-4129-af5e-95ab0e76cfc0'

if (!url || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

async function main() {
  console.log('Checking Supabase connection…')

  const { data: auth } = await supabase.auth.getSession()
  console.log('Auth session:', auth.session ? 'present' : 'none')

  const tables = ['threads', 'messages', 'thread_participants', 'profiles', 'onboardingprofiles', 'gyms', 'crews', 'events']
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.error(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: reachable (${data?.length ?? 0} rows sample)`)
    }
  }

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) {
    console.log('Insert test skipped: no authenticated user (anon cannot insert under RLS).')
    return
  }

  const { error: insertErr } = await supabase.from('messages').insert({
    thread_id: testThreadId,
    user_id: userId,
    body: 'Supabase connectivity check',
  })
  if (insertErr) console.error('Insert test failed (RLS likely blocking):', insertErr.message)
  else console.log('✅ Inserted test message into messages')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
