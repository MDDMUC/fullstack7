import type { NextConfig } from 'next'

if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables for production build.')
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Anchor the workspace root to this project to avoid picking up parent lockfiles.
    root: __dirname,
  },
}

export default nextConfig
