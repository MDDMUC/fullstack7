'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import MobileNavbar from '@/components/MobileNavbar'
import { supabase } from '@/lib/supabaseClient'

type CrewRow = {
  id: string
  title: string
  location: string | null
  description: string | null
  image_url?: string | null
  created_at?: string | null
}

type ThreadRow = {
  id: string
  crew_id: string | null
  last_message: string | null
  last_message_at: string | null
}

export default function CrewScreen() {
  const [crews, setCrews] = React.useState<
    Array<
      CrewRow & {
        thread?: ThreadRow | null
      }
    >
  >([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchCrews = async () => {
      const client = supabase
      if (!client) return
      setLoading(true)
      const { data: crewsData, error: crewsError } = await client
        .from('crews')
        .select('id,title,location,description,image_url,created_at')
        .order('created_at', { ascending: false, nullsFirst: false })

      if (crewsError || !crewsData) {
        setCrews([])
        setLoading(false)
        return
      }

      const crewIds = crewsData.map(c => c.id)
      let threadsMap: Record<string, ThreadRow> = {}
      if (crewIds.length > 0) {
        const { data: threadsData } = await client
          .from('threads')
          .select('id,crew_id,last_message,last_message_at')
          .eq('type', 'crew')
          .in('crew_id', crewIds)
        threadsMap =
          threadsData?.reduce<Record<string, ThreadRow>>((acc, t) => {
            if (t.crew_id) acc[t.crew_id] = t
            return acc
          }, {}) ?? {}
      }

      const combined = crewsData.map(crew => ({
        ...crew,
        thread: threadsMap[crew.id] ?? null,
      }))
      setCrews(combined)
      setLoading(false)
    }

    fetchCrews()
  }, [])

  return (
    <RequireAuth>
      <div className="events-screen" data-name="/ crew">
        <div className="events-content">
            <div className="events-card custom-scrollbar">
            <Link href="/crew/create" className="events-createbar" data-name="create-crew-mobile" data-node-id="636:2102">
              <div className="events-createbar-left">
                <div className="events-createbar-plus" data-name="plus" data-node-id="636:2101">
                  <div className="events-createbar-plus-inner" data-name="plus" data-node-id="636:2099">
                    <div className="events-createbar-icon" data-name="Icon" data-node-id="I636:2099;633:7054">
                      <div className="events-createbar-stroke">
                        <img src="/icons/plus.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="events-createbar-center" data-name="name" data-node-id="636:2092">
                <p className="events-createbar-text">create crew</p>
              </div>
              <div className="events-createbar-right" data-name="Auto Layout Horizontal" data-node-id="636:2094">
                <div className="events-createbar-ghost">
                  <div className="events-createbar-ghost-inner">
                    <div className="events-createbar-ghost-frame">
                      <div className="events-createbar-ghost-img">
                        <img src="/icons/dots.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {loading && <p className="events-loading">Loading crews…</p>}
            {!loading &&
              crews.map(crew => (
                <Link key={crew.id} href={`/crew/detail?crewId=${crew.id}`} className="events-tile">
                  <div className="events-tile-img">
                    <img
                      src={crew.image_url || '/icons/event-placeholder.svg'}
                      alt=""
                      className="events-tile-img-el"
                    />
                  </div>
                  <div className="events-tile-overlay" />
                  <div className="events-tile-text">
                    <p className="events-tile-title">{crew.title}</p>
                    <p className="events-tile-subtitle">{crew.location || ''}</p>
                  </div>
                </Link>
              ))}
          </div>

          <MobileNavbar active="crew" />
        </div>
      </div>
    </RequireAuth>
  )
}

