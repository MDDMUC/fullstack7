import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, anonKey)

async function createTestUser(email: string, password: string, username: string) {
  console.log(`Creating test user: ${email}...`)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  })
  
  if (error) {
    console.error(`Error creating user ${email}:`, error.message)
    return null
  }
  
  console.log(`✅ User ${email} created (ID: ${data.user?.id})`)
  return data.user
}

async function main() {
  const userA = await createTestUser('qa-test-a-dab-2026@gmail.com', 'password123', 'QA_User_A')
  const userB = await createTestUser('qa-test-b-dab-2026@gmail.com', 'password123', 'QA_User_B')
  
  if (userA && userB) {
    console.log('Both test users created successfully.')
  }
}

main()
