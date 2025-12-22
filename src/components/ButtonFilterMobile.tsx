'use client'

import React from 'react'

type ButtonFilterMobileState = 'default' | 'hover' | 'focus'

export type ButtonFilterMobileProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: ButtonFilterMobileState
  label?: string
  description?: string
}

const ICON_DEFAULT = 'https://www.figma.com/api/mcp/asset/7460a7f0-607d-4ab4-8833-cac5390f7a1a'
const ICON_HOVER = 'https://www.figma.com/api/mcp/asset/61359721-aa60-4dba-8512-c9e2ffaebcee'
const ICON_FOCUS = 'https://www.figma.com/api/mcp/asset/1bfd7130-fc2a-46d6-934f-2017592e2661'

export default function ButtonFilterMobile({
  state = 'default',
  label = 'Get Started',
  description,
  className,
  type = 'button',
  ...rest
}: ButtonFilterMobileProps) {
  const isHover = state === 'hover'
  const isFocus = state === 'focus'

  const iconSrc = isFocus ? ICON_FOCUS : isHover ? ICON_HOVER : ICON_DEFAULT
  const textClass =
    isFocus ? 'button-filter-mobile-text focus' : isHover ? 'button-filter-mobile-text hover' : 'button-filter-mobile-text'
  const buttonClass = [
    'button-filter-mobile',
    isHover ? 'hover' : '',
    isFocus ? 'focus' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={buttonClass} {...rest}>
      <span className={textClass}>{description ?? label}</span>
      <img src={iconSrc} alt="" className="button-filter-mobile-icon" />
    </button>
  )
}


