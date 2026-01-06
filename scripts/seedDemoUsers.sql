-- SQL Script to seed demo users into onboardingprofiles
-- NOTE: This assumes auth.users already exist for these UUIDs
-- If you need to create auth users too, use seedDemoUsers.ts instead

-- Demo User 1: Alex Sender (Boulder, CO - Sport/Trad climber)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  '1a518ec3-83f4-4c0b-a279-9195a983f4c1',
  'Alex Sender',
  28,
  'Male',
  'Boulder, CO',
  'Trad partner for desert season, training for alpine this summer. Love multi-pitch and crack climbing!',
  ARRAY['Sport', 'Trad'],
  '5.11b',
  ARRAY['Weekends', 'Some weeknights'],
  'Everyone',
  'Complete my first 5.12 and climb more multi-pitch routes',
  'Partnership, Friendship',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=12',
  ARRAY['https://i.pravatar.cc/150?img=12'],
  ARRAY['Sport', 'Trad', 'pref:Everyone'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  styles = EXCLUDED.styles,
  grade = EXCLUDED.grade,
  updated_at = NOW();

-- Demo User 2: Sarah Summit (LA - Boulderer)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  '266a5e75-89d9-407d-a1d8-0cc8dc6d6196',
  'Sarah Summit',
  25,
  'Female',
  'Los Angeles, CA',
  'Boulderer focused on projecting V7-V8. Love outdoor bouldering trips on weekends!',
  ARRAY['Bouldering'],
  'V7',
  ARRAY['Weekends'],
  'Women',
  'Send my first V8 outdoor project',
  'Partnership, Community',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=5',
  ARRAY['https://i.pravatar.cc/150?img=5'],
  ARRAY['Bouldering', 'pref:Women'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Demo User 3: Mike Crimp (Seattle - Sport/Lead coach)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  '618fbbfa-1032-4bc3-a282-15755d2479df',
  'Mike Crimp',
  32,
  'Male',
  'Seattle, WA',
  'Sport climber and coach. Always happy to belay and share beta. Let''s project together!',
  ARRAY['Sport', 'Lead'],
  '5.12a',
  ARRAY['Weeknights', 'Weekends'],
  'Everyone',
  'Help others improve their climbing technique',
  'Partnership, Mentorship',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=15',
  ARRAY['https://i.pravatar.cc/150?img=15'],
  ARRAY['Sport', 'Lead', 'pref:Everyone'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Demo User 4: Emma Edge (Denver - Outdoor beginner)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  '9530fc24-bbed-4724-9a5c-b4d66d198f2a',
  'Emma Edge',
  29,
  'Female',
  'Denver, CO',
  'New to outdoor climbing but gym climbing for 2 years. Looking for patient partners!',
  ARRAY['Sport'],
  '5.9',
  ARRAY['Weekends'],
  'Everyone',
  'Transition from gym to outdoor climbing confidently',
  'Mentorship, Friendship',
  'https://i.pravatar.cc/150?img=9',
  'https://i.pravatar.cc/150?img=9',
  ARRAY['https://i.pravatar.cc/150?img=9'],
  ARRAY['Sport', 'pref:Everyone'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Demo User 5: Chris Crag (Portland - Trad/Alpine weekend warrior)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  '9886aaf9-8bd8-4cd7-92e1-72962891eace',
  'Chris Crag',
  35,
  'Male',
  'Portland, OR',
  'Weekend warrior, love trad climbing and long alpine routes. Dad of two, climbing when I can!',
  ARRAY['Trad', 'Alpine'],
  '5.10d',
  ARRAY['Weekends'],
  'Everyone',
  'Get back into shape and climb consistently',
  'Partnership, Community',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=33',
  ARRAY['https://i.pravatar.cc/150?img=33'],
  ARRAY['Trad', 'Alpine', 'pref:Everyone'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Demo User 6: Lisa Limestone (Austin - Competition climber)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  'd63497aa-a038-49e7-b393-aeb16f5c52be',
  'Lisa Limestone',
  27,
  'Female',
  'Austin, TX',
  'Competition climber turned outdoor enthusiast. V5 boulderer, 5.11c sport climber.',
  ARRAY['Bouldering', 'Sport'],
  'V5 / 5.11c',
  ARRAY['Weeknights', 'Weekends'],
  'Women',
  'Send all the classics in my area',
  'Partnership, Community',
  'https://i.pravatar.cc/150?img=10',
  'https://i.pravatar.cc/150?img=10',
  ARRAY['https://i.pravatar.cc/150?img=10'],
  ARRAY['Bouldering', 'Sport', 'pref:Women'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Demo User 7: Tyler Traverse (SF - Social climber)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  'dba824e8-04d8-48ab-81b1-bdb8f7360287',
  'Tyler Traverse',
  24,
  'Non-binary',
  'San Francisco, CA',
  'Gym rat and outdoor newbie. Love the social aspect of climbing and meeting new people!',
  ARRAY['Bouldering', 'Sport'],
  'V4 / 5.10a',
  ARRAY['Weeknights'],
  'Everyone',
  'Build a consistent climbing community',
  'Friendship, Community',
  'https://i.pravatar.cc/150?img=18',
  'https://i.pravatar.cc/150?img=18',
  ARRAY['https://i.pravatar.cc/150?img=18'],
  ARRAY['Bouldering', 'Sport', 'pref:Everyone'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Demo User 8: Rachel Rock (Boulder - Professional climber)
INSERT INTO onboardingprofiles (
  id, username, age, gender, city, bio, styles, grade, availability,
  interest, goals, "lookingFor", avatar_url, photo, photos, tags, status
) VALUES (
  'e5d0e0da-a9d7-4a89-ad61-e5bc7641905f',
  'Rachel Rock',
  31,
  'Female',
  'Boulder, CO',
  'Professional climber and guidebook author. Love sharing local knowledge and finding new routes.',
  ARRAY['Sport', 'Trad', 'Bouldering'],
  '5.13a / V9',
  ARRAY['Weekdays', 'Weekends'],
  'Everyone',
  'Establish new routes and foster the climbing community',
  'Partnership, Mentorship, Community',
  'https://i.pravatar.cc/150?img=20',
  'https://i.pravatar.cc/150?img=20',
  ARRAY['https://i.pravatar.cc/150?img=20'],
  ARRAY['Sport', 'Trad', 'Bouldering', 'pref:Everyone'],
  'Demo User'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  age = EXCLUDED.age,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Verify inserted users
SELECT
  username,
  city,
  grade,
  status,
  created_at
FROM onboardingprofiles
WHERE status = 'Demo User'
ORDER BY username;
