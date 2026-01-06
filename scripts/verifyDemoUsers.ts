import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, anonKey)

async function main() {
  console.log('🔍 Checking demo users in onboardingprofiles...\n')

  const { data, error } = await supabase
    .from('onboardingprofiles')
    .select('*')
    .eq('status', 'Demo User')
    .order('username', { ascending: true })

  if (error) {
    console.error('❌ Error fetching demo users:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No demo users found in onboardingprofiles.')
    return
  }

  console.log(`✅ Found ${data.length} demo users:\n`)
  console.log('┌─────────────────────┬──────────────────┬───────────┬─────────────────────┐')
  console.log('│ Username            │ City             │ Grade     │ Styles              │')
  console.log('├─────────────────────┼──────────────────┼───────────┼─────────────────────┤')

  data.forEach(user => {
    const username = (user.username || '').padEnd(19)
    const city = (user.city || '').padEnd(16)
    const grade = (user.grade || '').padEnd(9)
    const styles = (user.styles?.join(', ') || '').padEnd(19)
    console.log(`│ ${username} │ ${city} │ ${grade} │ ${styles} │`)
  })

  console.log('└─────────────────────┴──────────────────┴───────────┴─────────────────────┘')
  console.log(`\n📧 You can log in with any of these emails using password: demo123456`)
}

main()
