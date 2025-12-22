'use client'

import Link from 'next/link'
import React from 'react'

type ButtonCtaLinkProps = {
  href: string
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children' | 'type'>

type ButtonCtaButtonProps = {
  href?: undefined
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export type ButtonCtaProps = ButtonCtaLinkProps | ButtonCtaButtonProps

const cx = (...classes: Array<string | undefined | null | false>) => classes.filter(Boolean).join(' ')

const isLinkProps = (props: ButtonCtaProps): props is ButtonCtaLinkProps => 'href' in props && !!props.href

export default function ButtonCta(props: ButtonCtaProps) {
  if (isLinkProps(props)) {
    const { href, className, children, ...rest } = props
    return (
      <Link href={href} className={cx('button-cta', className)} {...rest}>
        {children}
      </Link>
    )
  }

  const { className, children, type = 'button', ...rest } = props
  return (
    <button type={type} className={cx('button-cta', className)} {...rest}>
      {children}
    </button>
  )
}


