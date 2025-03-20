"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "../../contexts/ThemeContext"
import { Switch } from "./switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  const isChecked = theme === "dark"
  
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