// React Router Future Flags Configuration
"use client";

if (typeof window !== 'undefined') {
  // Only run on client side
  try {
    // Dynamically access React Router's future flags
    const routerModule = window.ReactRouter || window.ReactRouterDOM;
    if (routerModule && routerModule.FUTURE_FLAGS) {
      routerModule.FUTURE_FLAGS.v7_startTransition = true;
      routerModule.FUTURE_FLAGS.v7_relativeSplatPath = true;
      console.log('React Router future flags enabled');
    }
  } catch (error) {
    console.error('Failed to set React Router future flags:', error);
  }
}

// This file is imported for its side effects only
export {};