"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "../../contexts/ThemeContext"
import { Switch } from "./switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  const [effectiveTheme, setEffectiveTheme] = React.useState<"dark" | "light">(
    theme === "system"
      ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme as "dark" | "light"
  )
  
  // Update effective theme when theme changes or system preference changes
  React.useEffect(() => {
    if (theme !== "system") {
      setEffectiveTheme(theme as "dark" | "light")
      return
    }
    
    // Handle system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const updateTheme = () => {
      setEffectiveTheme(mediaQuery.matches ? "dark" : "light")
    }
    
    updateTheme()
    mediaQuery.addEventListener("change", updateTheme)
    return () => mediaQuery.removeEventListener("change", updateTheme)
  }, [theme])
  
  const isChecked = effectiveTheme === "dark"
  
  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <Switch 
        checked={isChecked}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
      <Moon className="h-[1.2rem] w-[1.2rem]" />
    </div>
  )
} 