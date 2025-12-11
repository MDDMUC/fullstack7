'use client'

import React from 'react'

type ButtonDabProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const IMG_DEFAULT = 'https://www.figma.com/api/mcp/asset/e81702c8-3827-4b22-8f9e-b00469a24e8d'
const IMG_HOVER = 'https://www.figma.com/api/mcp/asset/d8ce190e-692f-48e3-b842-dbf79aece79d'

const cx = (...classes: Array<string | undefined | null | false>) => classes.filter(Boolean).join(' ')

export default function ButtonDab({ className, type = 'button', ...rest }: ButtonDabProps) {
  return (
    <button type={type} className={cx('button-dab', className)} {...rest}>
      <img src={IMG_DEFAULT} alt="" className="button-dab-img button-dab-default" />
      <img src={IMG_HOVER} alt="" className="button-dab-img button-dab-hover" />
      <img src={IMG_DEFAULT} alt="" className="button-dab-img button-dab-focus" />
    </button>
  )
}

