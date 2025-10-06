// lib/image-utils.ts
export function getCampaignImage(campaign: any): string {
  // Priority order for image retrieval
  
  // 1. Check if imageUrl is a localStorage key (starts with 'campaign_image_')
  if (campaign.imageUrl && campaign.imageUrl.startsWith('campaign_image_')) {
    try {
      const storedImage = localStorage.getItem(campaign.imageUrl);
      if (storedImage) {
        return storedImage; // Return base64 data URL
      }
    } catch (error) {
      console.warn('Error retrieving image from localStorage:', error);
    }
  }
  
  // 2. Check direct imageUrl (HTTP/HTTPS)
  if (campaign.imageUrl && (campaign.imageUrl.startsWith('http') || campaign.imageUrl.startsWith('data:'))) {
    return campaign.imageUrl;
  }
  
  // 3. Check legacy image field
  if (campaign.image && (campaign.image.startsWith('http') || campaign.image.startsWith('data:'))) {
    return campaign.image;
  }
  
  // 4. Check imageStorageKeys array for fallbacks
  if (campaign.imageStorageKeys && Array.isArray(campaign.imageStorageKeys)) {
    for (const key of campaign.imageStorageKeys) {
      if (key.startsWith('http') || key.startsWith('data:')) {
        return key;
      }
      if (key.startsWith('campaign_image_')) {
        try {
          const storedImage = localStorage.getItem(key);
          if (storedImage) {
            return storedImage;
          }
        } catch (error) {
          console.warn('Error retrieving fallback image:', error);
        }
      }
    }
  }
  
  // 5. Check images array
  if (campaign.images && Array.isArray(campaign.images)) {
    for (const img of campaign.images) {
      if (img && (img.startsWith('http') || img.startsWith('data:'))) {
        return img;
      }
      if (img && img.startsWith('campaign_image_')) {
        try {
          const storedImage = localStorage.getItem(img);
          if (storedImage) {
            return storedImage;
          }
        } catch (error) {
          console.warn('Error retrieving image from images array:', error);
        }
      }
    }
  }
  
  // 6. Default fallback image
  return getDefaultCampaignImage(campaign.category || campaign.tags?.[0] || 'default');
}

export function getDefaultCampaignImage(category?: string): string {
  const defaultImages = {
    'emergency': '/earthquake.png',
    'urgent': '/flood.png',
    'disaster': '/earthquake.png',
    'flood': '/flood.png',
    'earthquake': '/earthquake.png',
    'relief': '/earthquake.png',
    'default': '/a02tw0.jpg'
  };
  
  const categoryLower = category?.toLowerCase() || 'default';
  
  // Find matching category or use default
  for (const [key, image] of Object.entries(defaultImages)) {
    if (categoryLower.includes(key)) {
      return image;
    }
  }
  
  return defaultImages.default;
}

export function preloadCampaignImages(campaigns: any[]): void {
  // Preload images for better performance
  campaigns.forEach(campaign => {
    const imageUrl = getCampaignImage(campaign);
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
      const img = new Image();
      img.src = imageUrl;
    }
  });
}

// Clean up old localStorage image entries (call periodically)
export function cleanupOldImages(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('campaign_image_')) {
        // Extract timestamp from key
        const timestampMatch = key.match(/campaign_image_(\d+)_/);
        if (timestampMatch) {
          const timestamp = parseInt(timestampMatch[1]);
          if (now - timestamp > maxAge) {
            keysToRemove.push(key);
          }
        }
      }
    }
    
    // Remove old entries
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} old campaign images`);
    }
  } catch (error) {
    console.warn('Error cleaning up old images:', error);
  }
}