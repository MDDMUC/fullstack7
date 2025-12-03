'use client'

import { FormEvent, useMemo, useState, useRef, useEffect } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

const COUNTRY_CODES = [
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: '+1', label: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: '+33', label: 'France', flag: '🇫🇷' },
  { code: '+39', label: 'Italy', flag: '🇮🇹' },
  { code: '+34', label: 'Spain', flag: '🇪🇸' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+64', label: 'New Zealand', flag: '🇳🇿' },
  { code: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: '+52', label: 'Mexico', flag: '🇲🇽' },
  { code: '+55', label: 'Brazil', flag: '🇧🇷' },
  { code: '+65', label: 'Singapore', flag: '🇸🇬' },
  { code: '+27', label: 'South Africa', flag: '🇿🇦' },
  { code: '+41', label: 'Switzerland', flag: '🇨🇭' },
  { code: '+82', label: 'South Korea', flag: '🇰🇷' },
]

export default function PhoneStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [search, setSearch] = useState('')
  const [countryCode, setCountryCode] = useState(() => {
    if (data.phone && data.phone.startsWith('+')) {
      const match = COUNTRY_CODES.find(c => data.phone?.startsWith(c.code))
      return match?.code || '+49'
    }
    return '+49'
  })
  const [nationalNumber, setNationalNumber] = useState(() => {
    if (data.phone && data.phone.startsWith('+')) {
      const stripped = data.phone.replace(/^\+\d+/, '').trim()
      return stripped.replace(/\D/g, '')
    }
    return ''
  })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLFormElement>(null)
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open) return
      const target = event.target as Node
      if (
        wrapperRef.current &&
        dropdownRef.current &&
        !wrapperRef.current.contains(target) &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return COUNTRY_CODES.filter(c => c.code.includes(q) || c.label.toLowerCase().includes(q))
  }, [search])

  const normalizedDigits = (value: string) => value.replace(/\D/g, '')

  const formatDisplay = (value: string) =>
    value.replace(/(\d{3})(\d{3})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))

  const selectedFlag = useMemo(
    () => COUNTRY_CODES.find(c => c.code === countryCode)?.flag || '🌐',
    [countryCode]
  )

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const digits = normalizedDigits(nationalNumber)
    if (!digits || digits.length < 6) return
    const full = `${countryCode}${digits}`
    setLoading(true)
    updateData({ phone: full })
    setTimeout(() => {
      setLoading(false)
      setCurrentStep(2)
    }, 300)
  }

  return (
    <div
      className="onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full relative"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
          <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)' }}>
            Add your phone
          </h1>
        </div>
        
        <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
          Only real people.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md" ref={wrapperRef}>
          <div className="w-full flex flex-col gap-2">
            <div
              className="h-14 relative rounded-[12px] flex items-center gap-2"
              style={{
                background: '#0f131d',
                border: `1px solid ${(focused || open) ? 'var(--accent)' : 'var(--stroke)'}`,
                padding: '0 8px',
                boxShadow: (focused || open) ? '0 0 0 2px rgba(92,225,230,0.2)' : 'none',
                transition: 'border-color 120ms ease, box-shadow 120ms ease',
              }}
            >
              <div className="relative" ref={dropdownRef} style={{ width: '260px' }}>
                <button
                  type="button"
                  onClick={() => setOpen(o => !o)}
                  className="w-full h-12 px-3 text-left rounded-[10px]"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    outline: 'none',
                    boxShadow: 'none',
                  }}
                >
                  <span>{selectedFlag}</span>
                  <span>{countryCode}</span>
                </button>
                {open && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-[12px] overflow-hidden shadow-lg z-20" style={{ background: '#0f131d', border: '1px solid var(--stroke)', maxHeight: '260px', overflowY: 'auto', minWidth: '280px' }}>
                    <div style={{ padding: '8px' }}>
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 px-3 rounded-[10px] text-sm"
                        style={{ background: '#0f131d', border: '1px solid var(--stroke)', color: 'var(--text)' }}
                        placeholder="Search code or country"
                      />
                    </div>
                    {filtered.map(option => (
                      <button
                        key={option.code}
                        type="button"
                        className="w-full px-3 py-2 hover:bg-[#131826]"
                        onClick={() => {
                          setCountryCode(option.code)
                          setSearch('')
                          setOpen(false)
                        }}
                        style={{ color: 'var(--text)', fontSize: '13px', whiteSpace: 'nowrap' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '32px 64px 1fr', alignItems: 'center', gap: '8px' }}>
                          <span style={{ minWidth: '20px' }}>{option.flag || '🌐'}</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: '46px' }}>{option.code}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                value={formatDisplay(nationalNumber)}
                onChange={(e) => setNationalNumber(normalizedDigits(e.target.value))}
                className="flex-1 h-12 px-3 bg-transparent border-none outline-none text-base rounded-[10px]"
                style={{ color: 'var(--text)', outline: 'none', boxShadow: 'none' }}
                placeholder="415 555 1234"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required
              />
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Add digits only; we'll verify later. You control when to share.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || normalizedDigits(nationalNumber).length < 6}
            className="onb-cta-btn"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

