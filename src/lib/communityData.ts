import { requireSupabase, supabase } from './supabaseClient'

export type Thread = {
  id: string
  title: string
  lastMessage: string
  unread?: number
  vibe: string
  members: number
  gym_id?: string
}

export type Message = {
  id: string
  threadId: string
  author: string
  handle: string
  time: string
  role?: 'admin' | 'member'
  body: string
  reactions?: string[]
}

export type GymRoom = {
  id: string
  name: string
  area: string
  crowd: 'Chill' | 'Busy' | 'Peaking'
  tags: string[]
  online: number
  imageUrl?: string
  popularTimes?: Array<{ hour: number; level: number }>
  liveLevel?: number
  liveStatus?: string
  threads: Thread[]
  messages: Message[]
}

export type Session = {
  id: string
  host: string
  gym: string
  location: string
  day: string
  time: string
  style: 'Bouldering' | 'Lead' | 'Toprope' | 'Trad'
  grade: string
  belayVerified: boolean
  availability: string
  partners: number
  tags: string[]
  note: string
}

export type Event = {
  id: string
  title: string
  host: string
  date: string
  time: string
  location: string
  type: 'Gym meetup' | 'Outdoor trip' | 'Cleanup' | 'Comp night'
  description: string
  attendees: number
  capacity: number
  tags: string[]
}

export type CheckIn = {
  id: string
  name: string
  gym: string
  status: 'Here now' | 'On my way' | 'Leaving soon'
  since: string
  plan: string
  grade: string
  tags: string[]
}

const fallbackGyms: GymRoom[] = [
  {
    id: 'boulderwest',
    name: 'Boulderwelt West',
    area: 'Munich, Germany',
    crowd: 'Peaking',
    tags: ['Comp Wall', 'Spray Wall', 'Cafe'],
    online: 48,
    imageUrl: '/gym-boulderwelt.jpg',
    popularTimes: [
      { hour: 9, level: 2 },
      { hour: 11, level: 3 },
      { hour: 13, level: 4 },
      { hour: 15, level: 6 },
      { hour: 17, level: 8 },
      { hour: 19, level: 9 },
      { hour: 21, level: 6 },
    ],
    liveLevel: 6,
    liveStatus: 'Not too busy',
    threads: [
      { id: 'tonight', title: 'Who is in tonight?', lastMessage: "Let's hit comp wall 7pm", unread: 8, vibe: 'Flash crew', members: 133 },
      { id: 'beta', title: 'Beta requests', lastMessage: 'Blue 6C slab beta?', unread: 3, vibe: 'Kind beta only', members: 87 },
      { id: 'partner', title: 'Partner up', lastMessage: 'Lead + belay swap 7-9?', unread: 0, vibe: 'Belay verified', members: 102 },
    ],
    messages: [
      { id: 'm1', threadId: 'tonight', author: 'Lena', handle: '@lenascends', time: '6:02p', body: 'Heading to comp wall, 7pm. Warm-up laps first.', reactions: ['fire', 'climb'] },
      { id: 'm2', threadId: 'tonight', author: 'Marco', handle: '@marcok', time: '6:05p', body: 'Bringing a tension board warmup if anyone wants.', reactions: ['strong'] },
      { id: 'm3', threadId: 'tonight', author: 'Yara', handle: '@yaraw', time: '6:08p', role: 'admin', body: 'Friendly reminder: spot when you film, and wipe holds if chalky please.' },
      { id: 'm4', threadId: 'beta', author: 'Finn', handle: '@finnish', time: '5:55p', body: 'Blue 6C slab: left palm press on start, bump R to crimp, stand on smear.' },
      { id: 'm5', threadId: 'beta', author: 'Timo', handle: '@timosends', time: '5:57p', body: 'Same problem: mono undercling is a decoy, go high left toe.', reactions: ['smart'] },
      { id: 'm6', threadId: 'partner', author: 'Ava', handle: '@ava.belays', time: '5:40p', body: 'Need a safe belay for orange 7a circuit, 7-9pm. GriGri + backup.', reactions: ['safe'] },
    ],
  },
  {
    id: 'thalkirchen',
    name: 'Thalkirchen',
    area: 'Munich, Germany',
    crowd: 'Busy',
    tags: ['Lead', 'Moonboard', 'Cafe'],
    online: 33,
    imageUrl: '/gym-thalkirchen.jpg',
    popularTimes: [
      { hour: 9, level: 3 },
      { hour: 11, level: 4 },
      { hour: 13, level: 5 },
      { hour: 15, level: 7 },
      { hour: 17, level: 8 },
      { hour: 19, level: 7 },
      { hour: 21, level: 4 },
    ],
    liveLevel: 7,
    liveStatus: 'Starting to peak',
    threads: [
      { id: 'lead', title: 'Lead partners', lastMessage: 'Looking for 6b-7a laps', unread: 5, vibe: 'Belay check', members: 90 },
      { id: 'outdoor', title: 'Outdoor trip', lastMessage: 'Kochel Saturday?', unread: 1, vibe: 'Carpool', members: 64 },
    ],
    messages: [
      { id: 'm7', threadId: 'lead', author: 'Jonas', handle: '@jonas', time: '4:22p', body: 'In for 6b/6c laps from 6pm. Can lead, need catch.', reactions: ['up'] },
      { id: 'm8', threadId: 'outdoor', author: 'Rami', handle: '@rami', time: '4:30p', body: 'Kochel on Sat, 2 seats from Sendlinger Tor. Meet 8:30.', reactions: ['drive', 'climb'] },
    ],
  },
  {
    id: 'freimann',
    name: 'Freimann',
    area: 'Munich, Germany',
    crowd: 'Chill',
    tags: ['Spray Wall', 'Campus', 'Sauna'],
    online: 21,
    imageUrl: '/gym-freimann.jpg',
    popularTimes: [
      { hour: 9, level: 2 },
      { hour: 11, level: 3 },
      { hour: 13, level: 4 },
      { hour: 15, level: 5 },
      { hour: 17, level: 6 },
      { hour: 19, level: 5 },
      { hour: 21, level: 3 },
    ],
    liveLevel: 4,
    liveStatus: 'Steady',
    threads: [
      { id: 'spray', title: 'Spray wall meet', lastMessage: 'Circuit reset today', unread: 0, vibe: 'Training', members: 44 },
      { id: 'beta-freimann', title: 'Beta requests', lastMessage: 'New yellow comp set', unread: 0, vibe: 'Share beta', members: 31 },
    ],
    messages: [
      { id: 'm9', threadId: 'spray', author: 'Mara', handle: '@mara', time: '2:50p', body: 'Spray wall set is fresh. Anyone for repeaters session 6pm?' },
      { id: 'm10', threadId: 'beta-freimann', author: 'Phil', handle: '@phil', time: '3:10p', body: 'Yellow comp: drop knee on start, pogo to right pinch.' },
    ],
  },
]

const fallbackSessions: Session[] = [
  {
    id: 's1',
    host: 'Sofia',
    gym: 'Boulderwelt West',
    location: 'Munich',
    day: 'Today',
    time: '18:30-20:00',
    style: 'Bouldering',
    grade: 'V3-V6',
    belayVerified: false,
    availability: '2 spots',
    partners: 3,
    tags: ['Comp wall', 'New set'],
    note: 'Working the blue comp set; happy to film beta.',
  },
  {
    id: 's2',
    host: 'Tomas',
    gym: 'Thalkirchen',
    location: 'Munich',
    day: 'Today',
    time: '19:00-21:00',
    style: 'Lead',
    grade: '6b-7a',
    belayVerified: true,
    availability: '1 spot',
    partners: 2,
    tags: ['Belay verified', 'Endurance laps'],
    note: 'Lead/belay swap on orange circuit. GriGri, soft catches.',
  },
  {
    id: 's3',
    host: 'Mara',
    gym: 'Freimann',
    location: 'Munich',
    day: 'Tomorrow',
    time: '07:15-08:30',
    style: 'Bouldering',
    grade: 'V2-V4',
    belayVerified: false,
    availability: '3 spots',
    partners: 1,
    tags: ['Morning crew', 'Spray wall'],
    note: 'Early spray wall mileage. Coffee after?',
  },
  {
    id: 's4',
    host: 'Rami',
    gym: 'Thalkirchen',
    location: 'Munich',
    day: 'Saturday',
    time: 'Outdoor - Kochel',
    style: 'Trad',
    grade: '5c-6b',
    belayVerified: true,
    availability: '2 spots',
    partners: 4,
    tags: ['Carpool', 'Gear share'],
    note: 'Weather holding. Rack covered, need competent second.',
  },
]

const fallbackEvents: Event[] = [
  {
    id: 'e1',
    title: 'Friday Night Boulder Jam',
    host: 'Boulderwelt West',
    date: 'This Friday',
    time: '18:30',
    location: 'Munich - Boulderwelt West',
    type: 'Gym meetup',
    description: 'Flash crew on the new comp set. Film, share beta, and sip espresso between attempts.',
    attendees: 42,
    capacity: 80,
    tags: ['Comp set', 'Open beta'],
  },
  {
    id: 'e2',
    title: 'Outdoor Kochel day trip',
    host: 'Ava + Rami',
    date: 'Saturday',
    time: '08:30',
    location: 'Kochel am See',
    type: 'Outdoor trip',
    description: 'Carpool from Sendlinger Tor, mix of 6a-7b. Weather looking clear - pack layers.',
    attendees: 12,
    capacity: 18,
    tags: ['Carpool', 'Lead only'],
  },
  {
    id: 'e3',
    title: 'Crag Cleanup x Dab',
    host: 'Dab Community',
    date: 'Sunday',
    time: '10:00',
    location: 'Boulderwelt Freimann -> Isar',
    type: 'Cleanup',
    description: 'Trash sweep plus a chill climb after. We bring bags and gloves; you bring stoke.',
    attendees: 27,
    capacity: 60,
    tags: ['Give back', 'Prizes'],
  },
  {
    id: 'e4',
    title: 'Lead Progression Session',
    host: 'Thalkirchen Coaches',
    date: 'Next Tuesday',
    time: '19:00',
    location: 'Thalkirchen',
    type: 'Comp night',
    description: 'Structured 90-minute block: warm-up, falls practice, controlled catches, 6b-7a mileage.',
    attendees: 18,
    capacity: 24,
    tags: ['Belay verified', 'Coached'],
  },
]

const fallbackCheckins: CheckIn[] = [
  {
    id: 'c1',
    name: 'Lena',
    gym: 'Boulderwelt West',
    status: 'Here now',
    since: '18:05',
    plan: 'Comp wall until 19:30, then campus.',
    grade: 'V4-V6',
    tags: ['Looking to film', 'Open to meet'],
  },
  {
    id: 'c2',
    name: 'Nico',
    gym: 'Thalkirchen',
    status: 'On my way',
    since: 'ETA 18:45',
    plan: 'Lead laps, 6b-6c. Soft catches welcome.',
    grade: '6b-6c',
    tags: ['Belay verified', 'Lead swap'],
  },
  {
    id: 'c3',
    name: 'Ava',
    gym: 'Freimann',
    status: 'Leaving soon',
    since: 'In 40 min',
    plan: 'Finishing spray wall circuit. Down for a coffee.',
    grade: 'V3-V5',
    tags: ['Chill session'],
  },
  {
    id: 'c4',
    name: 'Sam',
    gym: 'Boulderwelt West',
    status: 'Here now',
    since: '17:50',
    plan: 'Moonboard doubles, then stretching.',
    grade: '7a+',
    tags: ['Training', 'No filming'],
  },
]

const crowdFromString = (crowd?: string): GymRoom['crowd'] => {
  if (!crowd) return 'Chill'
  const normalized = crowd.toLowerCase()
  if (normalized.includes('peak')) return 'Peaking'
  if (normalized.includes('busy')) return 'Busy'
  return 'Chill'
}

const imageFromGym = (gym: { name?: string; image_url?: string | null }) => {
  if (gym.image_url) return gym.image_url
  const name = (gym.name || '').toLowerCase()
  if (name.includes('boulderwelt')) return '/gym-boulderwelt.jpg'
  if (name.includes('thalkirchen')) return '/gym-thalkirchen.jpg'
  if (name.includes('freimann')) return '/gym-freimann.jpg'
  return '/fallback-gym.png'
}

export async function loadGymRooms(): Promise<GymRoom[]> {
  if (!supabase) return fallbackGyms

  try {
    const client = requireSupabase()
    const { data: gyms, error: gymErr } = await client
      .from('gyms')
      .select('id, name, area, crowd, tags, online_count, image_url, popular_times, live_level, live_status')
    if (gymErr) throw gymErr

    const { data: threads, error: threadErr } = await client
      .from('gym_threads')
      .select('id, title, last_message, unread, vibe, members, gym_id')
    if (threadErr) throw threadErr

    const { data: messages, error: msgErr } = await client
      .from('gym_messages')
      .select('id, thread_id, author, handle, time, role, body, reactions')
      .order('created_at', { ascending: true })
    if (msgErr) throw msgErr

    const threadByGym = new Map<string, Thread[]>()
    ;(threads ?? []).forEach(t => {
      const gymId = (t as any).gym_id
      if (!threadByGym.has(gymId)) threadByGym.set(gymId, [])
      threadByGym.get(gymId)!.push({
        id: t.id,
        title: t.title ?? 'Thread',
        lastMessage: t.last_message ?? '',
        unread: t.unread ?? 0,
        vibe: t.vibe ?? '',
        members: t.members ?? 0,
        gym_id: gymId,
      })
    })

    const messagesByThread = new Map<string, Message[]>()
    ;(messages ?? []).forEach(m => {
      const threadId = (m as any).thread_id
      if (!messagesByThread.has(threadId)) messagesByThread.set(threadId, [])
      messagesByThread.get(threadId)!.push({
        id: m.id,
        threadId,
        author: m.author ?? 'Climber',
        handle: m.handle ?? '',
        time: m.time ?? '',
        role: m.role,
        body: m.body ?? '',
        reactions: (m.reactions as string[]) ?? [],
      })
    })

    const resolved = (gyms ?? []).map(gym => ({
      id: gym.id,
      name: gym.name ?? 'Gym',
      area: gym.area ?? '',
      crowd: crowdFromString((gym as any).crowd),
      tags: (gym.tags as string[]) ?? [],
      online: (gym as any).online_count ?? 0,
      imageUrl: imageFromGym(gym as any),
      popularTimes: (gym as any).popular_times as GymRoom['popularTimes'],
      liveLevel: (gym as any).live_level ?? undefined,
      liveStatus: (gym as any).live_status ?? undefined,
      threads: threadByGym.get(gym.id) ?? [],
      messages: (threadByGym.get(gym.id) ?? []).flatMap(thread => messagesByThread.get(thread.id) ?? []),
    }))

    return resolved.length ? resolved : fallbackGyms
  } catch (error) {
    console.warn('Falling back to local gym chat data:', error)
    return fallbackGyms
  }
}

export async function loadSessions(): Promise<Session[]> {
  if (!supabase) return fallbackSessions
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('sessions')
      .select('id, host, gym, location, day, time, style, grade, belayVerified:belay_verified, availability, partners, tags, note')
      .order('created_at', { ascending: false })
    if (error) throw error
    const resolved = (data ?? []).map(session => ({
      id: session.id,
      host: (session as any).host ?? 'Climber',
      gym: session.gym ?? 'Gym',
      location: session.location ?? '',
      day: session.day ?? 'Today',
      time: session.time ?? '',
      style: (session.style as Session['style']) ?? 'Bouldering',
      grade: session.grade ?? '',
      belayVerified: Boolean((session as any).belayVerified),
      availability: session.availability ?? 'Spots open',
      partners: session.partners ?? 0,
      tags: (session.tags as string[]) ?? [],
      note: session.note ?? '',
    }))
    return resolved.length ? resolved : fallbackSessions
  } catch (error) {
    console.warn('Falling back to local sessions data:', error)
    return fallbackSessions
  }
}

export async function loadEvents(): Promise<Event[]> {
  if (!supabase) return fallbackEvents
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('events')
      .select('id, title, host, date, time, location, type, description, attendees, capacity, tags')
      .order('date', { ascending: true })
    if (error) throw error
    const resolved = (data ?? []).map(evt => ({
      id: evt.id,
      title: evt.title ?? 'Event',
      host: evt.host ?? '',
      date: evt.date ?? '',
      time: evt.time ?? '',
      location: evt.location ?? '',
      type: (evt.type as Event['type']) ?? 'Gym meetup',
      description: evt.description ?? '',
      attendees: evt.attendees ?? 0,
      capacity: evt.capacity ?? 0,
      tags: (evt.tags as string[]) ?? [],
    }))
    return resolved.length ? resolved : fallbackEvents
  } catch (error) {
    console.warn('Falling back to local events data:', error)
    return fallbackEvents
  }
}

export async function loadCheckIns(): Promise<CheckIn[]> {
  if (!supabase) return fallbackCheckins
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('checkins')
      .select('id, name, gym, status, since, plan, grade, tags')
      .order('created_at', { ascending: false })
    if (error) throw error
    const resolved = (data ?? []).map(checkin => ({
      id: checkin.id,
      name: checkin.name ?? 'Climber',
      gym: checkin.gym ?? 'Gym',
      status: (checkin.status as CheckIn['status']) ?? 'Here now',
      since: checkin.since ?? '',
      plan: checkin.plan ?? '',
      grade: checkin.grade ?? '',
      tags: (checkin.tags as string[]) ?? [],
    }))
    return resolved.length ? resolved : fallbackCheckins
  } catch (error) {
    console.warn('Falling back to local check-ins data:', error)
    return fallbackCheckins
  }
}
