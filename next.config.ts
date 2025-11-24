import type { NextConfig } from 'next'

if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables for production build.')
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default nextConfig
