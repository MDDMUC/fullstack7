'use client'

import React from 'react'

type ButtonDabProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const cx = (...classes: Array<string | undefined | null | false>) => classes.filter(Boolean).join(' ')

export default function ButtonDab({ className, type = 'button', ...rest }: ButtonDabProps) {
  return (
    <button type={type} className={cx('button-dab', className)} {...rest}>
      DAB
    </button>
  )
}


