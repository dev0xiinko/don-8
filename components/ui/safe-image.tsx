// components/ui/safe-image.tsx
"use client"

import { useState } from 'react'
import { validateImageUrl } from '@/lib/blob-storage'

interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  fallback?: string
}

export function SafeImage({ src, alt, className = "", fallback = "/placeholder.svg" }: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src || fallback)
  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setImageSrc(fallback)
    }
  }

  const handleLoad = () => {
    setImageError(false)
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  )
}