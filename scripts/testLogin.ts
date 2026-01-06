import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, anonKey)

async function main() {
  const email = 'qa-test-a-dab-2026@gmail.com'
  const password = 'password123'
  
  console.log(`Logging in as ${email}...`)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error(`Login failed:`, error.message)
    return
  }
  
  console.log(`✅ Login successful!`)
  console.log(`User ID: ${data.user?.id}`)
  console.log(`Session present: ${!!data.session}`)
}

main()
