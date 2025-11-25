# Troubleshooting Onboarding Data Save Issues

## Common Issues and Solutions

### Issue: Data not saving to Supabase

#### 1. Check User Authentication
**Problem**: User might not be authenticated when completing onboarding.

**Solution**: 
- Users must be logged in before completing onboarding
- If not authenticated, the flow should redirect to `/signup`
- Check browser console for "No authenticated user found" message

**How to verify**:
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

#### 2. Check Supabase Configuration
**Problem**: Environment variables not set correctly.

**Solution**:
- Verify `.env.local` exists with:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
  ```
- Restart dev server after adding env variables
- Check browser console for "Supabase is not configured" error

#### 3. Check Database Table Exists
**Problem**: `profiles` table might not exist.

**Solution**:
- Run the migration SQL in Supabase SQL Editor
- File: `supabase/migrations/001_profiles_table.sql`
- Verify table exists in Supabase Table Editor

#### 4. Check Row Level Security (RLS) Policies
**Problem**: RLS policies might be blocking the insert.

**Solution**:
- Verify RLS policies are set up correctly
- Check that "Users can insert own profile" policy exists
- Test in Supabase SQL Editor:
  ```sql
  -- Should return your policies
  SELECT * FROM pg_policies WHERE tablename = 'profiles';
  ```

#### 5. Check Data Types Match Schema
**Problem**: Data types might not match the database schema.

**Common issues**:
- `tags` must be TEXT[] (array), not a string
- `age` must be INTEGER, not string
- `photos` is TEXT (JSON string), not array

**How to verify**:
- Check browser console for "Profile data attempted:" log
- Compare with database schema in Supabase

#### 6. Check Browser Console
**Problem**: Errors might be logged but not displayed.

**Solution**:
- Open browser DevTools (F12)
- Check Console tab for errors
- Look for:
  - "Error saving profile:"
  - "Authentication error:"
  - "Supabase is not configured"

## Debugging Steps

1. **Check if user is authenticated**:
   - Complete onboarding flow
   - Check browser console for user ID
   - If no user, you need to sign up/login first

2. **Check if Supabase is connected**:
   - Look for "Supabase is not configured" in console
   - Verify `.env.local` file exists and has correct values

3. **Check if table exists**:
   - Go to Supabase Dashboard → Table Editor
   - Verify `profiles` table exists

4. **Check RLS policies**:
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify policies for `profiles` table

5. **Test direct insert**:
   - Try inserting a profile manually in Supabase SQL Editor:
   ```sql
   INSERT INTO profiles (id, username) 
   VALUES (auth.uid(), 'Test User');
   ```

## Expected Console Logs

When working correctly, you should see:
```
Checking user authentication...
User authenticated: [user-id]
Saving profile data: {...}
Profile saved successfully: [{...}]
```

When there's an issue, you'll see:
```
Error getting user: [error message]
OR
No authenticated user found
OR
Error saving profile: [error message]
```

## Quick Fix Checklist

- [ ] User is logged in (check auth state)
- [ ] `.env.local` file exists with correct values
- [ ] Dev server restarted after adding env variables
- [ ] `profiles` table exists in Supabase
- [ ] RLS policies are set up correctly
- [ ] Browser console shows no errors
- [ ] Network tab shows successful POST to Supabase


