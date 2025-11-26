'use client'

import { useEffect, useState } from 'react'
import { fetchProfiles, Profile } from '@/lib/profiles'

export default function ClimberList() {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProfiles()
        setProfiles(data)
      } catch (error) {
        console.error(error)
      }
    }
    load()
  }, [])

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">Find your climbing partner</h1>
      <button className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg">Log in</button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {profiles.map(p => (
          <div key={p.id} className="space-y-4">
            <img
              src={p.avatar_url ?? '/default-avatar.png'}
              alt={p.username}
              className="mx-auto w-32 h-32 object-cover rounded-full"
            />
            <h2 className="text-xl font-semibold">@{p.username}</h2>
            <p className="text-gray-700">{p.bio}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
