"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// Define the props type manually since next-themes does not export ThemeProviderProps
import type { ReactNode } from "react"

import type { ThemeProviderProps as NextThemeProviderProps } from "next-themes/dist/types"

interface ThemeProviderProps extends Omit<NextThemeProviderProps, "children"> {
  children: ReactNode
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
