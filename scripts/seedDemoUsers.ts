import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key to bypass RLS and create users
const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface DemoUser {
  email: string
  password: string
  username: string
  age: number
  gender: string
  city: string
  bio: string
  styles: string[]
  grade: string
  availability: string[]
  interest: string
  goals: string
  lookingFor: string
  avatar_url?: string
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'alex.sender@demo.com',
    password: 'demo123456',
    username: 'Jakob',
    age: 28,
    gender: 'Male',
    city: 'Boulder, CO',
    bio: 'Trad partner for desert season, training for alpine this summer. Love multi-pitch and crack climbing!',
    styles: ['Sport', 'Trad'],
    grade: '5.11b',
    availability: ['Weekends', 'Some weeknights'],
    interest: 'Everyone',
    goals: 'Complete my first 5.12 and climb more multi-pitch routes',
    lookingFor: 'Partnership, Friendship',
    avatar_url: 'https://i.pravatar.cc/150?img=12'
  },
  {
    email: 'sarah.summit@demo.com',
    password: 'demo123456',
    username: 'Laura',
    age: 25,
    gender: 'Female',
    city: 'Los Angeles, CA',
    bio: 'Boulderer focused on projecting V7-V8. Love outdoor bouldering trips on weekends!',
    styles: ['Bouldering'],
    grade: 'V7',
    availability: ['Weekends'],
    interest: 'Women',
    goals: 'Send my first V8 outdoor project',
    lookingFor: 'Partnership, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=5'
  },
  {
    email: 'mike.crimp@demo.com',
    password: 'demo123456',
    username: 'Michael',
    age: 32,
    gender: 'Male',
    city: 'Seattle, WA',
    bio: 'Sport climber and coach. Always happy to belay and share beta. Let\'s project together!',
    styles: ['Sport', 'Lead'],
    grade: '5.12a',
    availability: ['Weeknights', 'Weekends'],
    interest: 'Everyone',
    goals: 'Help others improve their climbing technique',
    lookingFor: 'Partnership, Mentorship',
    avatar_url: 'https://i.pravatar.cc/150?img=15'
  },
  {
    email: 'emma.edge@demo.com',
    password: 'demo123456',
    username: 'Emma',
    age: 29,
    gender: 'Female',
    city: 'Denver, CO',
    bio: 'New to outdoor climbing but gym climbing for 2 years. Looking for patient partners!',
    styles: ['Sport'],
    grade: '5.9',
    availability: ['Weekends'],
    interest: 'Everyone',
    goals: 'Transition from gym to outdoor climbing confidently',
    lookingFor: 'Mentorship, Friendship',
    avatar_url: 'https://i.pravatar.cc/150?img=9'
  },
  {
    email: 'chris.crag@demo.com',
    password: 'demo123456',
    username: 'Christian',
    age: 35,
    gender: 'Male',
    city: 'Portland, OR',
    bio: 'Weekend warrior, love trad climbing and long alpine routes. Dad of two, climbing when I can!',
    styles: ['Trad', 'Alpine'],
    grade: '5.10d',
    availability: ['Weekends'],
    interest: 'Everyone',
    goals: 'Get back into shape and climb consistently',
    lookingFor: 'Partnership, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=33'
  },
  {
    email: 'lisa.limestone@demo.com',
    password: 'demo123456',
    username: 'Lisa',
    age: 27,
    gender: 'Female',
    city: 'Austin, TX',
    bio: 'Competition climber turned outdoor enthusiast. V5 boulderer, 5.11c sport climber.',
    styles: ['Bouldering', 'Sport'],
    grade: 'V5 / 5.11c',
    availability: ['Weeknights', 'Weekends'],
    interest: 'Women',
    goals: 'Send all the classics in my area',
    lookingFor: 'Partnership, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=10'
  },
  {
    email: 'tyler.traverse@demo.com',
    password: 'demo123456',
    username: 'Till',
    age: 24,
    gender: 'Non-binary',
    city: 'San Francisco, CA',
    bio: 'Gym rat and outdoor newbie. Love the social aspect of climbing and meeting new people!',
    styles: ['Bouldering', 'Sport'],
    grade: 'V4 / 5.10a',
    availability: ['Weeknights'],
    interest: 'Everyone',
    goals: 'Build a consistent climbing community',
    lookingFor: 'Friendship, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=18'
  },
  {
    email: 'rachel.rock@demo.com',
    password: 'demo123456',
    username: 'Rebecca',
    age: 31,
    gender: 'Female',
    city: 'Boulder, CO',
    bio: 'Professional climber and guidebook author. Love sharing local knowledge and finding new routes.',
    styles: ['Sport', 'Trad', 'Bouldering'],
    grade: '5.13a / V9',
    availability: ['Weekdays', 'Weekends'],
    interest: 'Everyone',
    goals: 'Establish new routes and foster the climbing community',
    lookingFor: 'Partnership, Mentorship, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=20'
  },
  // Munich-based demo users
  {
    email: 'lukas.mueller@demo.com',
    password: 'demo123456',
    username: 'Lukas',
    age: 29,
    gender: 'Male',
    city: 'Munich',
    bio: 'Boulderer at Boulderwelt München. Love the social vibe and trying new problems with friends!',
    styles: ['Bouldering'],
    grade: 'Intermediate',
    availability: ['Weeknights', 'Weekends'],
    interest: 'Everyone',
    goals: 'Meet new climbing partners and improve technique',
    lookingFor: 'Partnership, Friendship, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=13'
  },
  {
    email: 'sophia.weber@demo.com',
    password: 'demo123456',
    username: 'Sophia',
    age: 26,
    gender: 'Female',
    city: 'Munich',
    bio: 'Started climbing last year and totally hooked! Looking for patient partners to learn from.',
    styles: ['Sport', 'Bouldering'],
    grade: 'Beginner',
    availability: ['Weekends'],
    interest: 'Everyone',
    goals: 'Build confidence and climb outdoors for the first time',
    lookingFor: 'Mentorship, Friendship',
    avatar_url: 'https://i.pravatar.cc/150?img=23'
  },
  {
    email: 'maximilian.schmidt@demo.com',
    password: 'demo123456',
    username: 'Max',
    age: 33,
    gender: 'Male',
    city: 'Freising',
    bio: 'Advanced climber, happy to coach and share tips. Weekend trips to Frankenjura are my favorite!',
    styles: ['Sport', 'Lead', 'Trad'],
    grade: 'Advanced',
    availability: ['Weekends', 'Some weeknights'],
    interest: 'Everyone',
    goals: 'Help others progress and tackle harder outdoor routes',
    lookingFor: 'Partnership, Mentorship, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=32'
  },
  {
    email: 'anna.fischer@demo.com',
    password: 'demo123456',
    username: 'Anna',
    age: 28,
    gender: 'Female',
    city: 'Garching',
    bio: 'Intermediate boulderer, climb at DAV Kletterzentrum. Love finding new boulder problems and meeting people!',
    styles: ['Bouldering'],
    grade: 'Intermediate',
    availability: ['Weeknights'],
    interest: 'Women',
    goals: 'Progress to advanced level and explore outdoor bouldering',
    lookingFor: 'Partnership, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=27'
  },
  {
    email: 'jonas.hoffmann@demo.com',
    password: 'demo123456',
    username: 'Jonas',
    age: 24,
    gender: 'Male',
    city: 'Munich',
    bio: 'Gym climber transitioning to outdoor. Excited to learn rope skills and explore the Alps!',
    styles: ['Sport', 'Bouldering'],
    grade: 'Beginner',
    availability: ['Weeknights', 'Weekends'],
    interest: 'Everyone',
    goals: 'Get comfortable with outdoor climbing and multi-pitch',
    lookingFor: 'Mentorship, Friendship',
    avatar_url: 'https://i.pravatar.cc/150?img=51'
  },
  {
    email: 'lena.becker@demo.com',
    password: 'demo123456',
    username: 'Lena',
    age: 30,
    gender: 'Female',
    city: 'Starnberg',
    bio: 'Advanced sport climber, love long routes and beautiful mountain settings. Always up for a belay!',
    styles: ['Sport', 'Lead', 'Alpine'],
    grade: 'Advanced',
    availability: ['Weekends'],
    interest: 'Everyone',
    goals: 'Complete more alpine routes and find reliable partners',
    lookingFor: 'Partnership, Friendship',
    avatar_url: 'https://i.pravatar.cc/150?img=47'
  },
  {
    email: 'felix.wagner@demo.com',
    password: 'demo123456',
    username: 'Felix',
    age: 27,
    gender: 'Male',
    city: 'Gräfelfing',
    bio: 'Intermediate climber who loves the community aspect. Down for gym sessions or weekend outdoor trips!',
    styles: ['Bouldering', 'Sport'],
    grade: 'Intermediate',
    availability: ['Weeknights', 'Weekends'],
    interest: 'Everyone',
    goals: 'Make climbing friends and explore new areas around Munich',
    lookingFor: 'Friendship, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=68'
  },
  {
    email: 'marie.klein@demo.com',
    password: 'demo123456',
    username: 'Marie',
    age: 25,
    gender: 'Female',
    city: 'Munich',
    bio: 'Beginner climber, just joined Einstein Boulderhalle. Looking for friendly people to climb with!',
    styles: ['Bouldering'],
    grade: 'Beginner',
    availability: ['Weeknights'],
    interest: 'Women',
    goals: 'Get stronger and build a climbing community',
    lookingFor: 'Friendship, Community',
    avatar_url: 'https://i.pravatar.cc/150?img=44'
  }
]

async function createDemoUser(user: DemoUser) {
  console.log(`\n📝 Creating demo user: ${user.email}`)

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        username: user.username
      }
    })

    if (authError) {
      // Check if user already exists
      const errorMsg = authError.message?.toLowerCase() || ''
      if (errorMsg.includes('already') && errorMsg.includes('registered')) {
        console.log(`⚠️  User ${user.email} already exists, fetching existing user...`)
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === user.email)
        if (!existingUser) {
          console.error(`❌ Could not find existing user ${user.email}`)
          return false
        }
        // Use existing user ID
        console.log(`✅ Updating profile for ${user.username} (ID: ${existingUser.id})`)
        await createProfile(existingUser.id, user)
        return true
      }
      console.error(`❌ Auth error for ${user.email}:`, authError.message)
      return false
    }

    if (!authData.user) {
      console.error(`❌ No user data returned for ${user.email}`)
      return false
    }

    console.log(`✅ Auth user created (ID: ${authData.user.id})`)

    // 2. Create onboardingprofile
    await createProfile(authData.user.id, user)

    return true
  } catch (error: any) {
    console.error(`❌ Error creating ${user.email}:`, error.message)
    return false
  }
}

async function createProfile(userId: string, user: DemoUser) {
  const { error: profileError } = await supabase
    .from('onboardingprofiles')
    .upsert({
      id: userId,
      username: user.username,
      age: user.age,
      gender: user.gender,
      city: user.city,
      bio: user.bio,
      styles: user.styles,
      grade: user.grade,
      availability: user.availability,
      interest: user.interest,
      goals: user.goals,
      lookingFor: user.lookingFor,
      avatar_url: user.avatar_url,
      photo: user.avatar_url,
      photos: user.avatar_url ? [user.avatar_url] : [],
      tags: [...user.styles, `pref:${user.interest}`],
      status: 'Demo User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (profileError) {
    console.error(`❌ Profile error:`, profileError.message)
    throw profileError
  }

  console.log(`✅ Profile created for ${user.username}`)
}

async function main() {
  console.log('🚀 Starting demo user seeding...\n')
  console.log(`📊 Total users to create: ${DEMO_USERS.length}\n`)

  let successCount = 0
  let failCount = 0

  for (const user of DEMO_USERS) {
    const success = await createDemoUser(user)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📈 Seeding Summary:')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('='.repeat(50))

  if (successCount > 0) {
    console.log('\n✨ Demo users created! You can now log in with:')
    console.log('   Email: <any demo email above>')
    console.log('   Password: demo123456')
  }
}

main().catch(console.error)
