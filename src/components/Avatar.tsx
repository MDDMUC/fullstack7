import React, { useState } from 'react'

const DEFAULT_PLACEHOLDER = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: number
  className?: string
  wrapperClassName?: string
  showPlaceholder?: boolean
}

/**
 * Avatar component for consistent user avatar rendering across the app
 * Handles fallback logic when avatar_url is null or image fails to load
 *
 * @param src - The avatar URL (can be null/undefined)
 * @param alt - Alt text for the image (defaults to empty string)
 * @param fallback - Fallback image URL when src is null or fails to load (defaults to Figma placeholder)
 * @param size - Width and height in pixels (optional, uses CSS if not provided)
 * @param className - CSS class for the img element
 * @param wrapperClassName - CSS class for the wrapper div (optional)
 * @param showPlaceholder - If false, renders nothing when src is null (defaults to true)
 */
export default function Avatar({
  src,
  alt = '',
  fallback = DEFAULT_PLACEHOLDER,
  size,
  className = '',
  wrapperClassName,
  showPlaceholder = true,
}: AvatarProps) {
  const [imgSrc, setImgSrc] = useState(src || (showPlaceholder ? fallback : null))
  const [hasError, setHasError] = useState(false)

  // Update imgSrc when src prop changes
  React.useEffect(() => {
    if (src) {
      setImgSrc(src)
      setHasError(false)
    } else if (showPlaceholder) {
      setImgSrc(fallback)
    } else {
      setImgSrc(null)
    }
  }, [src, fallback, showPlaceholder])

  const handleError = () => {
    if (!hasError && fallback) {
      setImgSrc(fallback)
      setHasError(true)
    }
  }

  // Don't render anything if no src and showPlaceholder is false
  if (!imgSrc) {
    return null
  }

  const imgElement = (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      style={size ? { width: size, height: size } : undefined}
    />
  )

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{imgElement}</div>
  }

  return imgElement
}

// Export the default placeholder for use in other components
export { DEFAULT_PLACEHOLDER }

