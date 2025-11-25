# Supabase Storage Setup Guide for User Images

This guide will help you set up a storage bucket in Supabase for user-uploaded images (avatars, photos, etc.).

## Quick Setup (Recommended)

### Option 1: Using SQL (Fastest)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/user_images_bucket.sql`
4. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. You should see a success message confirming the bucket was created

### Option 2: Using Supabase UI

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** or **"Create a new bucket"**
4. Fill in the form:
   - **Name**: `user-images`
   - **Public bucket**: ✅ Check this box (enables public access)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif`
5. Click **"Create bucket"**
6. Go to **SQL Editor** and run the policies section from `supabase/user_images_bucket.sql` (Step 2 and Step 3)

## What Gets Created

### Bucket Configuration
- **Bucket ID**: `user-images`
- **Public Access**: Enabled (images can be accessed via public URLs)
- **File Size Limit**: 10MB per file
- **Allowed File Types**: JPEG, PNG, WebP, GIF, HEIC, HEIF

### Storage Structure
Images are stored in folders named after the user's ID:
```
user-images/
  ├── {user-id-1}/
  │   ├── 1234567890_abc123.jpg
  │   ├── 1234567891_def456.png
  │   └── ...
  ├── {user-id-2}/
  │   ├── 1234567892_ghi789.jpg
  │   └── ...
  └── ...
```

### Security (RLS Policies)
- ✅ Authenticated users can upload images to their own folder
- ✅ Anyone can view images (public read access)
- ✅ Users can update/delete only their own images
- ❌ Users cannot access other users' folders

## How to Use in Your Code

### Upload an Image

```typescript
import { supabase } from '@/lib/supabaseClient'

async function uploadUserImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  const filePath = `${userId}/${timestamp}_${randomId}.${fileExt}`

  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from('user-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return null
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-images')
    .getPublicUrl(filePath)

  return publicUrl
}
```

### Get Image URL

```typescript
// Get public URL for an existing image
const { data: { publicUrl } } = supabase.storage
  .from('user-images')
  .getPublicUrl('user-id/filename.jpg')

console.log(publicUrl) // https://your-project.supabase.co/storage/v1/object/public/user-images/user-id/filename.jpg
```

### Delete an Image

```typescript
async function deleteUserImage(filePath: string) {
  const { error } = await supabase.storage
    .from('user-images')
    .remove([filePath])

  if (error) {
    console.error('Delete error:', error)
  }
}
```

### List User's Images

```typescript
async function listUserImages(userId: string) {
  const { data, error } = await supabase.storage
    .from('user-images')
    .list(userId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('List error:', error)
    return []
  }

  return data || []
}
```

## Updating Existing Code

If your code currently uses the `avatars` bucket, you have two options:

### Option A: Keep using `avatars` bucket
- The existing `supabase/storage_setup.sql` file already sets up the `avatars` bucket
- No code changes needed

### Option B: Switch to `user-images` bucket
- Update your code to use `'user-images'` instead of `'avatars'`
- Example: Change `supabase.storage.from('avatars')` to `supabase.storage.from('user-images')`

## Troubleshooting

### "Bucket not found" error
- Make sure you've run the SQL script in Supabase SQL Editor
- Check that the bucket name matches exactly: `user-images`
- Verify in Supabase dashboard: **Storage** → Check if `user-images` bucket exists

### "new row violates row-level security policy" error
- Make sure you've run the RLS policies section of the SQL script
- Verify the user is authenticated: `await supabase.auth.getUser()`
- Check that the file path starts with the user's ID: `${userId}/filename.ext`

### "File size exceeds limit" error
- Default limit is 10MB
- To increase, update the bucket: Go to **Storage** → Click on `user-images` → Edit → Increase file size limit

### Images not loading (404)
- Make sure the bucket is set to **Public**
- Check the file path is correct
- Verify the image was uploaded successfully

## Testing

1. **Test Upload**:
   ```typescript
   const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
   const url = await uploadUserImage(file, 'test-user-id')
   console.log('Uploaded to:', url)
   ```

2. **Test in Supabase Dashboard**:
   - Go to **Storage** → `user-images`
   - You should see folders named after user IDs
   - Click on a folder to see uploaded images

3. **Test Public URL**:
   - Copy the public URL from the upload response
   - Paste it in a browser
   - The image should load

## Next Steps

- ✅ Bucket created
- ✅ RLS policies configured
- ✅ Ready to upload images!

Update your code to use the `user-images` bucket and start uploading!


