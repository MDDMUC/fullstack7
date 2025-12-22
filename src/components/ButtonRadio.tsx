'use client'

import React from 'react'

type ButtonRadioProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const ICON_DEFAULT = 'https://www.figma.com/api/mcp/asset/afee668a-3cc6-449b-b728-6424e7ad2d64'
const ICON_HOVER = 'https://www.figma.com/api/mcp/asset/5fd8706e-7dda-418c-b75e-67e9d4d6e3f9'
const ICON_FOCUS = 'https://www.figma.com/api/mcp/asset/9d845333-1f45-490f-b0f9-e5119bec8faf'

const cx = (...classes: Array<string | undefined | null | false>) => classes.filter(Boolean).join(' ')

export default function ButtonRadio({ className, children, type = 'button', ...rest }: ButtonRadioProps) {
  return (
    <button type={type} className={cx('button-radio', className)} {...rest}>
      <span className="button-radio-icon" aria-hidden="true">
        <img src={ICON_DEFAULT} alt="" className="button-radio-icon-default" />
        <img src={ICON_HOVER} alt="" className="button-radio-icon-hover" />
        <img src={ICON_FOCUS} alt="" className="button-radio-icon-focus" />
      </span>
      <span className="button-radio-label">{children}</span>
    </button>
  )
}


