import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, Search, Settings, Sparkles, User } from "lucide-react"
import api from "~/lib/api"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { ThemeToggle } from "~/components/ui/theme-toggle"
import { UserNav } from "./UserNav"

const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-violet-200 bg-background/40 dark:bg-background/60 dark:border-violet-900/50 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:border-t-0">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-500 dark:text-violet-400" />
            <span className="text-xl font-bold text-foreground">Reminiss</span>
          </Link>
          <div className="hidden md:flex md:gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/yearbook">Yearbook</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/memories">Memories</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/messages">Messages</Link>
            </Button>
          </div>
        </div>


        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}

export default Header