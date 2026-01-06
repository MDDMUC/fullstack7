import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, anonKey)

async function main() {
  console.log('🔍 Checking ALL profiles in onboardingprofiles...\n')

  const { data, error, count } = await supabase
    .from('onboardingprofiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('❌ Error fetching profiles:', error)
    return
  }

  console.log(`📊 Total profiles: ${count}`)
  console.log(`📋 Showing latest ${data?.length || 0} profiles:\n`)

  if (!data || data.length === 0) {
    console.log('⚠️  No profiles found in onboardingprofiles table.')
    return
  }

  data.forEach((user, i) => {
    console.log(`${i + 1}. ${user.username}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   City: ${user.city || 'N/A'}`)
    console.log(`   Grade: ${user.grade || 'N/A'}`)
    console.log(`   Status: ${user.status || 'N/A'}`)
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
    console.log()
  })
}

main()
