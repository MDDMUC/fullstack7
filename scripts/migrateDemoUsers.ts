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
  console.log('Starting migration of demo users from profiles to onboardingprofiles...\n')

  // 1. Fetch demo users from profiles table
  console.log('Step 1: Fetching demo users from profiles table...')
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', DEMO_USER_IDS)

  if (profilesError) {
    console.error('Error fetching from profiles:', profilesError)
    return
  }

  if (!profilesData || profilesData.length === 0) {
    console.log('No demo users found in profiles table.')
    return
  }

  console.log(`Found ${profilesData.length} demo users in profiles table.\n`)

  // 2. Check which users already exist in onboardingprofiles
  console.log('Step 2: Checking existing users in onboardingprofiles...')
  const { data: existingData, error: existingError } = await supabase
    .from('onboardingprofiles')
    .select('id, username')
    .in('id', DEMO_USER_IDS)

  if (existingError) {
    console.error('Error checking onboardingprofiles:', existingError)
    return
  }

  const existingIds = new Set((existingData || []).map(u => u.id))
  console.log(`Found ${existingIds.size} users already in onboardingprofiles.\n`)

  // 3. Transform and migrate users
  console.log('Step 3: Migrating users to onboardingprofiles...')

  const migrated = []
  const skipped = []
  const errors = []

  for (const profile of profilesData) {
    if (existingIds.has(profile.id)) {
      console.log(`⏭️  Skipping ${profile.username} (${profile.id}) - already exists`)
      skipped.push(profile.username)
      continue
    }

    // Transform profile data to match onboardingprofiles schema
    const onboardingProfile = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      age: profile.age,
      gender: profile.gender,
      photo: profile.photo || profile.avatar_url,
      avatar_url: profile.avatar_url || profile.photo,
      city: profile.city,
      homebase: profile.homebase,
      styles: profile.style ? profile.style.split(',').map((s: string) => s.trim()) : [],
      availability: profile.availability ? profile.availability.split(',').map((a: string) => a.trim()) : [],
      grade: profile.grade,
      bio: profile.bio,
      pronouns: profile.pronouns,
      tags: profile.tags || [],
      status: profile.status,
      goals: profile.goals,
      lookingfor: profile.lookingFor,
      gym: profile.gym || [],
      created_at: profile.created_at,
      is_demo: true, // Mark as demo user
    }

    try {
      const { error: insertError } = await supabase
        .from('onboardingprofiles')
        .insert(onboardingProfile)

      if (insertError) {
        console.error(`❌ Error migrating ${profile.username}:`, insertError.message)
        errors.push(`${profile.username}: ${insertError.message}`)
      } else {
        console.log(`✅ Migrated ${profile.username} (${profile.id})`)
        migrated.push(profile.username)
      }
    } catch (err) {
      console.error(`❌ Exception migrating ${profile.username}:`, err)
      errors.push(`${profile.username}: ${err}`)
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60))
  console.log('MIGRATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully migrated: ${migrated.length}`)
  if (migrated.length > 0) {
    migrated.forEach(name => console.log(`   - ${name}`))
  }

  console.log(`\n⏭️  Skipped (already exist): ${skipped.length}`)
  if (skipped.length > 0) {
    skipped.forEach(name => console.log(`   - ${name}`))
  }

  console.log(`\n❌ Errors: ${errors.length}`)
  if (errors.length > 0) {
    errors.forEach(err => console.log(`   - ${err}`))
  }

  console.log('\n' + '='.repeat(60))

  // 5. Verify migration
  console.log('\nStep 4: Verifying migration...')
  const { data: verifyData, error: verifyError } = await supabase
    .from('onboardingprofiles')
    .select('id, username, city, is_demo')
    .in('id', DEMO_USER_IDS)

  if (verifyError) {
    console.error('Error verifying migration:', verifyError)
    return
  }

  console.log(`\nVerification: Found ${verifyData?.length || 0} demo users in onboardingprofiles`)
  verifyData?.forEach(user => {
    console.log(`   ✓ ${user.username} (${user.city || 'no city'}) - is_demo: ${user.is_demo}`)
  })

  console.log('\n✅ Migration complete!')
  console.log('\nNext steps:')
  console.log('1. Verify the migrated data looks correct')
  console.log('2. Test that demo users display properly in the app')
  console.log('3. Once verified, you can drop the profiles table')
}

main()
