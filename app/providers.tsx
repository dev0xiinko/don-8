"use client"

import React, { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/contexts/WalletProvider"
import { ProfileProvider } from "@/contexts/ProfileProvider"
import "./router-config"

// Fix for Sentry errors with null body status and AbortSignal error
if (typeof window !== 'undefined') {
  // Fix for null body status error
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      // Add safety check for response with null body status
      const originalJson = response.json;
      response.json = function() {
        if (response.status === 204 || response.status === 205) {
          return Promise.resolve(null);
        }
        return originalJson.call(this);
      };
      return response;
    });
  };
  
  // Fix for AbortSignal error
  const originalAddEventListener = AbortSignal.prototype.addEventListener;
  AbortSignal.prototype.addEventListener = function(type, listener, options) {
    if (!this || typeof listener !== 'function') {
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <WalletProvider>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </WalletProvider>
    </ThemeProvider>
  )
}