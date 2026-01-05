# Demo User Seeding Guide

This guide explains how to populate your app with demo users for testing and development.

## Overview

After removing the `profiles` table, all user data is now stored in `onboardingprofiles`. You have two options for seeding demo users:

1. **TypeScript Script** (Recommended) - Creates both auth users and profiles
2. **SQL Script** - Only creates profiles (requires auth users to exist)

---

## Option 1: TypeScript Script (Recommended)

This script creates complete demo users including both authentication and profile data.

### Prerequisites

1. Get your Supabase Service Role Key:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the `service_role` key (NOT the anon key)

2. Add it to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### Usage

```bash
# Install dependencies if needed
npm install

# Run the seeding script
npx tsx scripts/seedDemoUsers.ts
```

### What it does

- Creates 16 demo users with authentication
- Creates corresponding onboardingprofiles with realistic data
- Handles existing users gracefully (updates profiles if auth users exist)
- Provides detailed console output of progress

### Demo Users Created

#### US-Based Users (8)
| Email | Username | City | Grade | Styles |
|-------|----------|------|-------|--------|
| alex.sender@demo.com | Jakob | Boulder, CO | 5.11b | Sport, Trad |
| sarah.summit@demo.com | Laura | Los Angeles, CA | V7 | Bouldering |
| mike.crimp@demo.com | Michael | Seattle, WA | 5.12a | Sport, Lead |
| emma.edge@demo.com | Emma | Denver, CO | 5.9 | Sport |
| chris.crag@demo.com | Christian | Portland, OR | 5.10d | Trad, Alpine |
| lisa.limestone@demo.com | Lisa | Austin, TX | V5 / 5.11c | Bouldering, Sport |
| tyler.traverse@demo.com | Till | San Francisco, CA | V4 / 5.10a | Bouldering, Sport |
| rachel.rock@demo.com | Rebecca | Boulder, CO | 5.13a / V9 | Sport, Trad, Bouldering |

#### Munich-Based Users (8)
| Email | Username | City | Grade | Styles |
|-------|----------|------|-------|--------|
| lukas.mueller@demo.com | Lukas | Munich | Intermediate | Bouldering |
| sophia.weber@demo.com | Sophia | Munich | Beginner | Sport, Bouldering |
| maximilian.schmidt@demo.com | Max | Freising | Advanced | Sport, Lead, Trad |
| anna.fischer@demo.com | Anna | Garching | Intermediate | Bouldering |
| jonas.hoffmann@demo.com | Jonas | Munich | Beginner | Sport, Bouldering |
| lena.becker@demo.com | Lena | Starnberg | Advanced | Sport, Lead, Alpine |
| felix.wagner@demo.com | Felix | Gräfelfing | Intermediate | Bouldering, Sport |
| marie.klein@demo.com | Marie | Munich | Beginner | Bouldering |

**Default Password for all demo users:** `demo123456`

---

## Option 2: SQL Script

Use this if you already have auth users and only need to create/update their profiles.

### Prerequisites

- Auth users must already exist in Supabase with the UUIDs specified in the script
- Access to Supabase SQL Editor

### Usage

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `scripts/seedDemoUsers.sql`
3. Paste and run the script

### What it does

- Inserts or updates 16 demo user profiles
- Uses the existing demo user UUIDs from your previous setup
- Uses `ON CONFLICT` to update existing records safely

---

## Verification

### Check TypeScript Script Results

```bash
# List all demo users
npx tsx scripts/checkDemoUsers.ts
```

### Check via SQL

Run this in Supabase SQL Editor:

```sql
SELECT
  username,
  city,
  grade,
  array_to_string(styles, ', ') as styles,
  status
FROM onboardingprofiles
WHERE status = 'Demo User'
ORDER BY username;
```

---

## Troubleshooting

### "Supabase URL is required"

Make sure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### "User already registered"

The TypeScript script handles this automatically. It will:
1. Detect existing auth user
2. Update their onboardingprofile instead of creating new

### Permission Errors

Make sure you're using the `SUPABASE_SERVICE_ROLE_KEY`, not the anon key. The service role key bypasses RLS policies.

---

## Customization

### Add More Demo Users

Edit `scripts/seedDemoUsers.ts` and add entries to the `DEMO_USERS` array:

```typescript
{
  email: 'new.user@demo.com',
  password: 'demo123456',
  username: 'New User',
  age: 30,
  gender: 'Female',
  city: 'New York, NY',
  bio: 'Your bio here...',
  styles: ['Bouldering'],
  grade: 'V6',
  availability: ['Weekends'],
  interest: 'Everyone',
  goals: 'Your goals',
  lookingFor: 'Partnership',
  avatar_url: 'https://i.pravatar.cc/150?img=25'
}
```

### Modify Existing Users

Simply update the data in the `DEMO_USERS` array and rerun the script. The `upsert` operation will update existing records.

---

## Security Notes

1. **Never commit your service role key** to version control
2. Demo users have the password `demo123456` - change this in production
3. The service role key bypasses all RLS policies - use with caution
4. Consider deleting demo users before launching to production

---

## Related Scripts

- `checkDemoUsers.ts` - Verify demo users exist in database
- `createTestUsers.ts` - Create specific test users for QA
- `checkSupabase.ts` - General database health check
