# Demo Users Migration Guide

This guide will help you migrate the 8 demo users from the `profiles` table to the `onboardingprofiles` table.

## Overview

Currently, your app has two tables storing user data:
- `profiles` - Contains 8 demo users for seeding/testing
- `onboardingprofiles` - Contains real user data from onboarding flow

This migration will consolidate everything into `onboardingprofiles` with an `is_demo` flag to distinguish demo users.

## Prerequisites

- Supabase credentials in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Migration Steps

### 1. Add `is_demo` Column to Onboarding Profiles

Run this SQL in your Supabase SQL Editor:

```bash
# The SQL file is located at:
supabase/add_is_demo_column.sql
```

Or run it directly in Supabase:
1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/add_is_demo_column.sql`
3. Paste and execute

### 2. Run the Migration Script

```bash
npx tsx scripts/migrateDemoUsers.ts
```

This will:
- ✅ Fetch all 8 demo users from `profiles` table
- ✅ Transform data to match `onboardingprofiles` schema
- ✅ Insert into `onboardingprofiles` with `is_demo = true`
- ✅ Skip users that already exist
- ✅ Provide detailed summary of migration results

### 3. Verify the Migration

Check that demo users are now in `onboardingprofiles`:

```bash
npx tsx scripts/checkDemoUsers.ts
```

You should see all 8 demo users listed.

### 4. Test Your App

1. Start the dev server: `npm run dev`
2. Navigate to `/home` to see if demo users display correctly
3. Check that swipe functionality works with demo users
4. Verify demo user profiles display properly

### 5. (Optional) Drop the Profiles Table

⚠️ **ONLY do this after you've verified everything works!**

Once you've confirmed the migration is successful and the app works correctly:

```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS profiles;
```

### 6. Update Code (Future Cleanup)

After dropping the `profiles` table, you can simplify your code:

- Update `src/lib/profiles.ts` - Remove profiles table queries
- Simplify `fetchProfiles()` to only query `onboardingprofiles`
- Remove the synthesis logic that merges both tables

## Demo User IDs

The following 8 users will be migrated:

1. `1a518ec3-83f4-4c0b-a279-9195a983f4c1`
2. `266a5e75-89d9-407d-a1d8-0cc8dc6d6196`
3. `618fbbfa-1032-4bc3-a282-15755d2479df`
4. `9530fc24-bbed-4724-9a5c-b4d66d198f2a`
5. `9886aaf9-8bd8-4cd7-92e1-72962891eace`
6. `d63497aa-a038-49e7-b393-aeb16f5c52be`
7. `dba824e8-04d8-48ab-81b1-bdb8f7360287`
8. `e5d0e0da-a9d7-4a89-ad61-e5bc7641905f`

## Rollback

If something goes wrong:

1. Demo users in `onboardingprofiles` can be deleted:
   ```sql
   DELETE FROM onboardingprofiles WHERE is_demo = true;
   ```

2. Original data is still in the `profiles` table (until you drop it)

## Troubleshooting

**Error: "duplicate key value violates unique constraint"**
- Some demo users already exist in `onboardingprofiles`
- The script will skip these automatically
- This is safe and expected

**Error: "column is_demo does not exist"**
- You need to run step 1 first (add the column)
- Run the SQL from `supabase/add_is_demo_column.sql`

**Demo users not showing in app**
- Verify migration with `npx tsx scripts/checkDemoUsers.ts`
- Check that `fetchProfiles()` is working correctly
- Clear your browser cache and reload

## Questions?

If you encounter issues, check:
1. Supabase credentials are correct
2. `is_demo` column was added successfully
3. Migration script completed without errors
4. Demo users are visible in Supabase table editor
