This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase setup

The app will read live data from Supabase when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. Schema expectations:

- `gyms` table: `id uuid pk`, `name text`, `area text`, `crowd text`, `tags text[]`, `online_count int`, `image_url text` (public URL; defaults to `/fallback-gym.png` when empty).
- `gym_threads`: `id uuid pk`, `title text`, `last_message text`, `unread int`, `vibe text`, `members int`, `gym_id uuid fk gyms.id`.
- `gym_messages`: `id uuid pk`, `thread_id uuid fk gym_threads.id`, `author text`, `handle text`, `time text`, `role text`, `body text`, `reactions text[]`, `created_at timestamptz`.

Gym images: store a public URL in `gyms.image_url` (e.g., Supabase Storage public bucket or any HTTPS link). If absent, the UI falls back to `public/fallback-gym.png`.
