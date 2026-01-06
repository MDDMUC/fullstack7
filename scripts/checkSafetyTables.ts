import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, anonKey)

async function main() {
  console.log('Checking safety tables accessibility...')
  
  const tables = ['blocks', 'reports', 'moderators']
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`❌ ${table}: ${error.message} (expected if RLS is tight and no auth)`)
    } else {
      console.log(`✅ ${table}: reachable (${data?.length ?? 0} rows sample)`)
    }
  }
}

main()
