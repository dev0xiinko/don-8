// components/ui/safe-image.tsx
"use client"

import { useState, useEffect } from 'react'
import { getCampaignImage, getDefaultCampaignImage } from '@/lib/image-utils'

interface SafeImageProps {
  src?: string
  alt: string
  className?: string
  fallback?: string
  campaign?: any // For campaign-specific image handling
}

export function SafeImage({ 
  src, 
  alt, 
  className = "", 
  fallback = "/a02tw0.jpg",
  campaign 
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState<string>("")
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let finalSrc = "";
    
    if (campaign) {
      // Use campaign-specific image utility
      finalSrc = getCampaignImage(campaign);
      
      // Debug: Log image resolution for campaigns
      if (campaign.id) {
        console.log(`SafeImage for campaign ${campaign.id}:`, {
          originalImageUrl: campaign.imageUrl,
          originalImage: campaign.image,
          resolvedSrc: finalSrc,
          imageType: campaign.imageType,
          storageKeys: campaign.imageStorageKeys
        });
      }
    } else if (src) {
      // Handle direct src
      if (src.startsWith('campaign_image_')) {
        // It's a localStorage key
        try {
          const storedImage = localStorage.getItem(src);
          if (storedImage) {
            finalSrc = storedImage;
            console.log('Retrieved image from localStorage:', src.substring(0, 30) + '...');
          } else {
            console.warn('localStorage key not found:', src);
            finalSrc = fallback;
          }
        } catch (error) {
          console.warn('Error retrieving image from localStorage:', error);
          finalSrc = fallback;
        }
      } else {
        // It's a direct URL or path
        finalSrc = src;
      }
    } else {
      finalSrc = fallback;
    }
    
    setImageSrc(finalSrc);
    setImageError(false);
  }, [src, campaign, fallback]);

  const handleError = () => {
    if (!imageError) {
      setImageError(true);
      
      // Try fallbacks in order
      if (campaign) {
        const defaultImg = getDefaultCampaignImage(campaign.category || campaign.tags?.[0]);
        setImageSrc(defaultImg);
      } else {
        setImageSrc(fallback);
      }
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