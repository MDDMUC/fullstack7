// Shared utility functions used across multiple components

export const FALLBACK_MALE = '/fallback-male.jpg'
export const FALLBACK_FEMALE = '/fallback-female.jpg'

export type ProfileLike = {
  pronouns?: string | null
  gender?: string | null
  bio?: string | null
}

export const fallbackAvatarFor = (profile?: ProfileLike | null): string => {
  const hint = (profile?.pronouns || profile?.gender || profile?.bio || '').toString().toLowerCase()
  if (hint.includes('she') || hint.includes('her') || hint.includes('woman') || hint.includes('female')) {
    return FALLBACK_FEMALE
  }
  return FALLBACK_MALE
}

export const firstName = (name?: string | null): string => {
  return (name || '').trim().split(/\s+/)[0] || (name ?? '')
}

export const stripPrivateTags = (tags?: string[]): string[] => {
  return (tags || []).filter(tag => {
    const lower = (tag || '').toLowerCase()
    if (lower.startsWith('gender:')) return false
    if (lower.startsWith('pref:')) return false
    return true
  })
}

export const isSpecialChip = (tag: string): boolean => {
  const lower = tag.toLowerCase()
  return lower.includes('founder') || lower.includes('crew') || lower.includes('belay') || lower.includes('certified')
}

