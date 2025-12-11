'use client'

import Link from 'next/link'
import React from 'react'

type ButtonGhostLinkProps = {
  href: string
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'>

type ButtonGhostButtonProps = {
  href?: undefined
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export type ButtonGhostProps = ButtonGhostLinkProps | ButtonGhostButtonProps

const cx = (...classes: Array<string | undefined | null | false>) => classes.filter(Boolean).join(' ')

export default function ButtonGhost(props: ButtonGhostProps) {
  if ('href' in props && props.href) {
    const { href, className, children, ...rest } = props
    return (
      <Link href={href} className={cx('button-ghost', className)} {...rest}>
        {children}
      </Link>
    )
  }

  const { className, children, type = 'button', ...rest } = props
  return (
    <button type={type} className={cx('button-ghost', className)} {...rest}>
      {children}
    </button>
  )
}

