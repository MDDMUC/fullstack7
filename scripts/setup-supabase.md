# Quick Supabase Setup Script

## For Supabase Cloud (Easiest)

### 1. Create Project
- Go to https://supabase.com
- Create new project
- Wait for setup (~2 minutes)

### 2. Get Credentials
- Settings → API
- Copy Project URL and anon key

### 3. Create .env.local
```bash
cp .env.local.example .env.local
# Then edit .env.local with your values
```

### 4. Run Database Migration
- Go to SQL Editor in Supabase dashboard
- Copy contents of `supabase/migrations/001_profiles_table.sql`
- Paste and run

### 5. Create Storage Bucket
- Go to Storage
- Create bucket named `avatars`
- Make it Public
- Run SQL from `supabase/storage_policies.sql` in SQL Editor

### 6. Test
```bash
npm run dev
# Navigate to /onboarding and complete the flow
```

## For Local Supabase (Docker)

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Start Local Supabase
```bash
supabase init
supabase start
```

### 3. Copy Credentials
After `supabase start`, copy the:
- API URL
- anon key

### 4. Create .env.local
```bash
cp .env.local.example .env.local
# Add the local credentials
```

### 5. Run Migration
```bash
supabase db reset
# Or manually run the SQL migration
```

### 6. Create Storage Bucket
```sql
-- In Supabase Studio (http://localhost:54323)
-- Go to Storage, create 'avatars' bucket, make it public
-- Then run storage_policies.sql
```

## Verify Setup

Check that these work:
- ✅ Environment variables loaded
- ✅ Profiles table exists
- ✅ Storage bucket exists
- ✅ Can save onboarding data
- ✅ Photos upload successfully





