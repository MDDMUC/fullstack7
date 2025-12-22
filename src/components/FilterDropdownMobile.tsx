'use client'

import React, { useEffect, useRef, useState } from 'react'
import ButtonFilterMobile, { ButtonFilterMobileProps } from './ButtonFilterMobile'

type Option = string

export type FilterDropdownMobileProps = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  buttonProps?: Omit<ButtonFilterMobileProps, 'label' | 'description' | 'onClick' | 'state'>
}

export default function FilterDropdownMobile({ label, value, options, onChange, buttonProps }: FilterDropdownMobileProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = value !== 'All'
  const buttonState: ButtonFilterMobileProps['state'] = open || isActive ? 'focus' : 'default'

  return (
    <div className="button-filter-mobile-wrapper" ref={wrapperRef}>
      <ButtonFilterMobile
        label={label}
        description={value === 'All' ? label : value}
        state={buttonState}
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        {...buttonProps}
      />
      {open && (
        <div className="button-filter-mobile-menu" role="listbox">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className={`button-filter-mobile-option ${opt === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
            >
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


