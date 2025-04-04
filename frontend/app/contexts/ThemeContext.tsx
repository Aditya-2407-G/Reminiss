"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "reminiss-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  
  // Initialize theme from localStorage only after component mounts (client-side)
  useEffect(() => {
    const savedTheme = typeof window !== "undefined" 
      ? localStorage.getItem(storageKey) as Theme 
      : null
    
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const root = window.document.documentElement
    
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      
      root.classList.add(systemTheme)
      return
    }
    
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, theme)
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}