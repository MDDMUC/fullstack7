# Testing Photo Upload in Onboarding

## Prerequisites

Before testing, make sure you have:

1. **Storage bucket created in Supabase**
   - The code currently uses the `avatars` bucket
   - You can either:
     - **Option A**: Create the `avatars` bucket (run `supabase/storage_setup.sql`)
     - **Option B**: Update the code to use `user-images` bucket (run `supabase/user_images_bucket.sql`)

2. **User must be authenticated**
   - Photo upload only works for logged-in users
   - If not logged in, photos are saved to localStorage but won't upload until you sign up/login

## Step-by-Step Testing

### 1. Set Up the Storage Bucket

**If using `avatars` bucket (current code):**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run the SQL from `supabase/storage_setup.sql`
3. Verify: Go to **Storage** → Check if `avatars` bucket exists

**If using `user-images` bucket (recommended):**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run the SQL from `supabase/user_images_bucket.sql`
3. Update the code in `LocationStep.tsx` to use `'user-images'` instead of `'avatars'`
4. Verify: Go to **Storage** → Check if `user-images` bucket exists

### 2. Test the Photo Upload Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Go to the **Console** tab
   - Keep it open to see upload logs

3. **Navigate to onboarding:**
   - Go to `http://localhost:3000/onboarding`
   - Complete the steps until you reach the **Photos** step (step 6/7)

4. **Upload photos:**
   - Click on an empty photo slot (says "+ Add photo")
   - Select one or more image files (JPEG, PNG, WebP, etc.)
   - You can upload up to 4 photos
   - Photos should appear as previews immediately

5. **Continue to Location step:**
   - Click "CONTINUE 6/7"
   - Fill in location information
   - Click "CONTINUE 7/7" or submit

6. **Watch the console:**
   - Look for messages like:
     - `"Successfully uploaded photo 1: https://..."`
     - `"Error uploading photo 1: ..."` (if there's an error)
     - `"Avatars bucket not found"` (if bucket doesn't exist)

### 3. Verify Upload in Supabase

1. **Go to Supabase Dashboard:**
   - Navigate to **Storage** → `avatars` (or `user-images` if you switched)

2. **Check for uploaded files:**
   - You should see folders named after user IDs (e.g., `abc123-def456-...`)
   - Inside each folder, you'll see uploaded images with timestamps
   - Example: `1234567890_abc123.jpg`

3. **Verify public URLs:**
   - Click on an image file
   - Copy the public URL
   - Paste it in a new browser tab - the image should load

### 4. Verify in Database

1. **Go to Supabase Dashboard:**
   - Navigate to **Table Editor** → `onboardingprofiles`

2. **Find your profile:**
   - Look for the profile you just created
   - Check the `avatar_url` column - should contain the first photo's URL
   - Check the `photos` column - should contain a JSON array of all photo URLs

3. **Example data:**
   ```json
   {
     "avatar_url": "https://your-project.supabase.co/storage/v1/object/public/avatars/user-id/1234567890_abc123.jpg",
     "photos": "[\"https://...\", \"https://...\"]"
   }
   ```

## Troubleshooting

### "Avatars bucket not found"
- **Solution**: Run `supabase/storage_setup.sql` in SQL Editor
- Or update code to use `user-images` bucket

### "new row violates row-level security policy"
- **Solution**: Make sure RLS policies are set up correctly
- Run the storage policies SQL from `supabase/storage_setup.sql` or `supabase/user_images_bucket.sql`

### Photos not uploading
- **Check console errors**: Look for specific error messages
- **Verify authentication**: Make sure you're logged in
- **Check file size**: Max 5MB for `avatars`, 10MB for `user-images`
- **Check file type**: Only images (JPEG, PNG, WebP, GIF, etc.)

### Photos upload but URLs are wrong
- **Check bucket name**: Make sure code uses the same bucket name as created
- **Verify bucket is public**: Go to Storage → Bucket settings → Should be "Public"

### Photos saved but not visible
- **Check `photos` column**: Should be a JSON string array
- **Check `avatar_url`**: Should be a single URL string
- **Verify URLs**: Copy URL from database and test in browser

## Quick Test Checklist

- [ ] Storage bucket created (`avatars` or `user-images`)
- [ ] RLS policies set up
- [ ] User is authenticated (logged in)
- [ ] Browser console open
- [ ] Photos selected in Photos step
- [ ] Location step completed
- [ ] Console shows "Successfully uploaded photo" messages
- [ ] Files visible in Supabase Storage
- [ ] URLs work when pasted in browser
- [ ] Database shows `avatar_url` and `photos` populated

## Testing Without Authentication

If you want to test the UI without authentication:
1. Photos will be saved to `localStorage` (as File objects can't be serialized, only metadata)
2. When you sign up/login later, photos won't be automatically uploaded
3. You'll need to re-select photos after authentication

## Next Steps After Testing

If everything works:
- ✅ Photos are uploaded to Supabase Storage
- ✅ URLs are saved in the database
- ✅ Images are accessible via public URLs

If something doesn't work:
- Check the console for specific error messages
- Verify bucket and policies are set up correctly
- Make sure user is authenticated
- Check file size and type restrictions


