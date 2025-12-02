/**
 * Script to add 'outside' to Yara's gym array in Supabase
 * Run with: npx tsx scripts/update-yara-outside.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateYaraProfile() {
  try {
    // Find Yara's profile - username contains "Yara" and homebase/city contains "Hamburg"
    const { data: profiles, error: searchError } = await supabase
      .from('onboardingprofiles')
      .select('id, username, homebase, city, gym')
      .or('username.ilike.%Yara%,homebase.ilike.%Hamburg%,city.ilike.%Hamburg%')
      .limit(10)

    if (searchError) {
      console.error('Error searching for Yara:', searchError)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profile found matching Yara in Hamburg')
      console.log('Trying with known demo user ID...')
      
      // Try with known demo user ID from profiles.ts
      const yaraId = '1a518ec3-83f4-4c0b-a279-9195a983f4c1'
      const { data: profile, error: fetchError } = await supabase
        .from('onboardingprofiles')
        .select('id, username, homebase, city, gym')
        .eq('id', yaraId)
        .single()

      if (fetchError || !profile) {
        console.error('Could not find Yara profile:', fetchError)
        return
      }

      await updateGymArray(profile)
      return
    }

    // Find the best match (username Yara and Hamburg location)
    const yaraProfile = profiles.find(p => 
      p.username?.toLowerCase().includes('yara') && 
      (p.homebase?.toLowerCase().includes('hamburg') || p.city?.toLowerCase().includes('hamburg'))
    ) || profiles[0]

    console.log('Found profile:', {
      id: yaraProfile.id,
      username: yaraProfile.username,
      homebase: yaraProfile.homebase,
      city: yaraProfile.city,
      currentGym: yaraProfile.gym
    })

    await updateGymArray(yaraProfile)
  } catch (error) {
    console.error('Error updating Yara profile:', error)
  }
}

async function updateGymArray(profile: any) {
  const currentGym = Array.isArray(profile.gym) ? profile.gym : []
  
  // Check if 'outside' is already in the array
  if (currentGym.includes('outside')) {
    console.log('✅ "outside" is already in Yara\'s gym array:', currentGym)
    return
  }

  // Add 'outside' to the array
  const updatedGym = [...currentGym, 'outside']

  console.log('Updating gym array:')
  console.log('  Before:', currentGym)
  console.log('  After:', updatedGym)

  const { data, error } = await supabase
    .from('onboardingprofiles')
    .update({ gym: updatedGym })
    .eq('id', profile.id)
    .select()

  if (error) {
    console.error('❌ Error updating profile:', error)
    return
  }

  console.log('✅ Successfully updated Yara\'s profile!')
  console.log('Updated profile:', data?.[0])
}

updateYaraProfile()

