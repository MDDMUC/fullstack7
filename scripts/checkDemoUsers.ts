import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, anonKey)

const DEMO_USER_IDS = [
  '1a518ec3-83f4-4c0b-a279-9195a983f4c1',
  '266a5e75-89d9-407d-a1d8-0cc8dc6d6196',
  '618fbbfa-1032-4bc3-a282-15755d2479df',
  '9530fc24-bbed-4724-9a5c-b4d66d198f2a',
  '9886aaf9-8bd8-4cd7-92e1-72962891eace',
  'd63497aa-a038-49e7-b393-aeb16f5c52be',
  'dba824e8-04d8-48ab-81b1-bdb8f7360287',
  'e5d0e0da-a9d7-4a89-ad61-e5bc7641905f',
]

async function main() {
  console.log('Checking demo users in onboardingprofiles...')
  
  const { data, error } = await supabase
    .from('onboardingprofiles')
    .select('*')
    .in('id', DEMO_USER_IDS)
  
  if (error) {
    console.error('Error fetching demo users:', error)
    return
  }
  
  if (!data || data.length === 0) {
    console.log('No demo users found in onboardingprofiles.')
    return
  }
  
  console.log(`Found ${data.length} demo users:`)
  data.forEach(user => {
    console.log(`- ${user.username} (ID: ${user.id}, City: ${user.city || user.homebase})`)
  })
}

main()
