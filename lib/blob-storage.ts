// lib/blob-storage.ts
"use client"

interface StoredBlob {
  id: string;
  url: string;
  originalName: string;
  type: string;
  size: number;
  timestamp: number;
}

class BlobStorageManager {
  private static instance: BlobStorageManager;
  private storage = new Map<string, StoredBlob>();
  private readonly STORAGE_KEY = 'campaign_blob_storage';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): BlobStorageManager {
    if (!BlobStorageManager.instance) {
      BlobStorageManager.instance = new BlobStorageManager();
    }
    return BlobStorageManager.instance;
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          // Restore blob URLs
          Object.entries(data).forEach(([id, blob]: [string, any]) => {
            this.storage.set(id, blob);
          });
        }
      } catch (error) {
        console.error('Error loading blob storage:', error);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        const data = Object.fromEntries(this.storage);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving blob storage:', error);
      }
    }
  }

  storeFile(file: File): string {
    const id = `blob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = URL.createObjectURL(file);
    
    const storedBlob: StoredBlob = {
      id,
      url,
      originalName: file.name,
      type: file.type,
      size: file.size,
      timestamp: Date.now()
    };

    this.storage.set(id, storedBlob);
    this.saveToStorage();
    
    return url; // Return the blob URL for immediate use
  }

  storeUrl(imageUrl: string, name?: string): string {
    const id = `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const storedBlob: StoredBlob = {
      id,
      url: imageUrl,
      originalName: name || 'image',
      type: 'image/unknown',
      size: 0,
      timestamp: Date.now()
    };

    this.storage.set(id, storedBlob);
    this.saveToStorage();
    
    return imageUrl;
  }

  getBlob(url: string): StoredBlob | null {
    for (const blob of this.storage.values()) {
      if (blob.url === url) {
        return blob;
      }
    }
    return null;
  }

  getAllBlobs(): StoredBlob[] {
    return Array.from(this.storage.values());
  }

  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now();
    let cleaned = 0;

    for (const [id, blob] of this.storage.entries()) {
      if (now - blob.timestamp > maxAge) {
        if (blob.url.startsWith('blob:')) {
          URL.revokeObjectURL(blob.url);
        }
        this.storage.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.saveToStorage();
      console.log(`Cleaned up ${cleaned} old blob(s)`);
    }

    return cleaned;
  }

  // Enhanced method to handle both files and URLs
  processImage(input: File | string, name?: string): string {
    if (input instanceof File) {
      return this.storeFile(input);
    } else {
      return this.storeUrl(input, name);
    }
  }

  // Validate that a blob URL is still accessible
  validateBlobUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!url.startsWith('blob:')) {
        resolve(true); // Regular URLs are assumed valid
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Get stats
  getStats() {
    return {
      totalBlobs: this.storage.size,
      totalSize: Array.from(this.storage.values()).reduce((acc, blob) => acc + blob.size, 0),
      oldestTimestamp: Math.min(...Array.from(this.storage.values()).map(blob => blob.timestamp)),
      newestTimestamp: Math.max(...Array.from(this.storage.values()).map(blob => blob.timestamp))
    };
  }
}

// Export singleton instance
export const blobStorage = BlobStorageManager.getInstance();

// Utility functions
export const storeImageBlob = (input: File | string, name?: string): string => {
  return blobStorage.processImage(input, name);
};

export const validateImageUrl = (url: string): Promise<boolean> => {
  return blobStorage.validateBlobUrl(url);
};

export const cleanupOldBlobs = (maxAge?: number): number => {
  return blobStorage.cleanup(maxAge);
};

// Auto cleanup on app start
if (typeof window !== 'undefined') {
  // Cleanup old blobs when the app loads
  setTimeout(() => {
    cleanupOldBlobs();
  }, 1000);
}