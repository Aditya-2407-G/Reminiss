import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Heart, ChevronDown, LogOut, Mail, Search, Settings, Sparkles, User } from "lucide-react"
import api from "~/lib/api"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Badge } from "~/components/ui/badge"

const getImageUrl = (url: string) => {
  if (url.includes('drive.google.com')) {
    // Handle different Google Drive URL formats
    let fileId;
    if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0]; // Handle potential additional parameters
    } else if (url.includes('/d/')) {
      fileId = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1].split('/')[0];
    }
    
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  }
  return url;
};

interface Entry {
  _id: string
  user: {
    _id: string
    name: string
    enrollmentNumber: string
    profilePicture: string
  }
  imageUrl: string
  message: string
  tags: string[]
  batch: {
    _id: string
    batchYear: string
    batchCode: string
  }
  college: {
    _id: string
    name: string
    code: string
  }
  degree: string
  createdAt: string
}

interface BatchInfo {
  totalStudents: number;
  batchYear: string;
  batchCode: string;
  enrollmentNumbers: string[];
}

export default function Yearbook() {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [entries, setEntries] = useState<(Entry | null)[]>([])
  const [loading, setLoading] = useState(true)
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const matchedStudentRef = useRef<HTMLDivElement>(null)
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null)

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matchedEnrollment = batchInfo?.enrollmentNumbers.find(
      (enroll) => enroll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entries.some(entry => 
        entry?.user.enrollmentNumber === enroll && 
        entry.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (matchedEnrollment) {
      setSelectedEnrollment(matchedEnrollment);
      // Directly scroll to the matched student
      const element = document.querySelector(`[data-enrollment="${matchedEnrollment}"]`);
      element?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await api.get('/entries')
      setEntries(response.data.data.entries)
      setBatchInfo(response.data.data.batchInfo)
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter entries based on search
  const filteredEntries = entries.filter((entry) => {
    if (!entry) return false;
    
    const searchLower = searchQuery.toLowerCase().trim();
    return (
      entry.user.name.toLowerCase().includes(searchLower) ||
      entry.user.enrollmentNumber.toLowerCase().includes(searchLower) ||
      entry.message.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-violet-100 dark:border-violet-900/50 bg-background/95 backdrop-blur">
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

          {/* Search bar in header */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" 
                onClick={handleSearch}
              />
              <Input
                placeholder="Search by name or enrollment number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  {[1, 2, 3].map((i) => (
                    <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3">
                      <div className="flex w-full items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {i === 1
                              ? "Alex tagged you in a memory"
                              : i === 2
                                ? "Sarah sent you a message"
                                : "Jordan added a new photo"}
                          </p>
                          <p className="text-xs text-muted-foreground">Just now</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center text-center">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Mail className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] text-white">
                    2
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Messages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  {[1, 2].map((i) => (
                    <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3">
                      <div className="flex w-full items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{i === 1 ? "Taylor Swift" : "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {i === 1
                              ? "Hey! Can't wait to see you at graduation!"
                              : "You were always the kindest person in class..."}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center text-center">
                  View all messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-transparent dark:from-violet-950/20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 p-4"
          >
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Class of {batchInfo?.batchYear}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Captured in time
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                onClick={scrollToGrid}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Open Yearbook
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Entries Grid Section */}
        <div className="min-h-screen bg-background py-16" ref={gridRef}>
          <div className="container">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="h-2 bg-muted rounded mt-2 w-2/3"></div>
                  </div>
                ))
              ) : (
                batchInfo?.enrollmentNumbers.map((enrollmentNumber) => {
                  const entry = entries.find(e => e?.user.enrollmentNumber === enrollmentNumber);
                  const isSelected = enrollmentNumber === selectedEnrollment;
                  
                  return (
                    <motion.div
                      key={enrollmentNumber}
                      data-enrollment={enrollmentNumber}
                      ref={isSelected ? matchedStudentRef : null}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        border: isSelected ? '2px solid rgb(139, 92, 246)' : 'none'
                      }}
                      transition={{ delay: 0.02 }}
                      onClick={() => entry && setSelectedEntry(entry)}
                      className={`cursor-pointer group space-y-1 ${isSelected ? 'ring-2 ring-violet-500 rounded-md' : ''}`}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-md border border-violet-100 dark:border-violet-900/50">
                        {entry ? (
                          <img 
                            src={getImageUrl(entry.imageUrl)}
                            alt={entry.user.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 text-center">
                        <p className="text-xs font-medium truncate">
                          {entry ? entry.user.name : 'Not Uploaded'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {entry?.message || enrollmentNumber}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Entry Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Yearbook Entry</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="aspect-[4/5] rounded-xl overflow-hidden">
                    <img
                      src={getImageUrl(selectedEntry.imageUrl)}
                      alt={selectedEntry.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedEntry.user.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback>{selectedEntry.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedEntry.user.name}</h2>
                      <p className="text-muted-foreground">{selectedEntry.college.name} • {selectedEntry.degree}</p>
                    </div>
                  </div>
                  <p className="text-lg">{selectedEntry.message}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Posted on {new Date(selectedEntry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
