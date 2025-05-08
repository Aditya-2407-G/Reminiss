"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Separator } from "../components/ui/separator"
import { Textarea } from "../components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Spinner } from "../components/ui/spinner"
import { ThemeToggle } from "~/components/ui/theme-toggle"
import {
  Camera,
  LogOut,
  Mail,
  MessageSquare,
  MoreHorizontal,
  PenSquare,
  Search,
  Send,
  Settings,
  Trash2,
  User,
  Sparkles,
  BookMarked,
  Users,
  Palette,
  BookmarkIcon,
  LayoutDashboard,
  Layers,
} from "lucide-react"
import Header from "~/components/Header/Header"

interface Conversation {
  id: number
  name: string
  avatar: string | null
  lastMessage: string
  time: string
  unread: number
  isAnonymous: boolean
}

export default function Messages() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(0)
  const [composeOpen, setComposeOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isConversationsLoading, setIsConversationsLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(2)
  const navigate = useNavigate()

  // Force recheck auth if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Simulate API call with timeout
        setTimeout(() => {
          const mockConversations = Array.from({ length: 10 }).map((_, i) => ({
            id: i,
            name: i === 2 ? "Anonymous" : `Student ${i + 1}`,
            avatar: i !== 2 ? `/placeholder.svg?height=40&width=40&text=User${i + 1}` : null,
            lastMessage:
              i === 0
                ? "Hey! Can't wait to see you at graduation!"
                : i === 1
                  ? "Are you going to the pre-graduation party?"
                  : i === 2
                    ? "You've always been an inspiration to me..."
                    : "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            time: i === 0 ? "Just now" : i === 1 ? "2h ago" : i === 2 ? "Yesterday" : `${i} days ago`,
            unread: i === 0 ? 1 : 0,
            isAnonymous: i === 2,
          }))
          setConversations(mockConversations)
          setIsConversationsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
        setConversations([])
        setIsConversationsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchConversations()
    } else {
      setIsConversationsLoading(false)
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      navigate("/login")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will be redirected by the useEffect
  }

  const getInitials = (name: string | undefined): string => {
    if (!name || typeof name !== "string") return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-200 via-indigo-100 to-background dark:from-violet-950/20 dark:via-background dark:to-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1">
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
          {/* Decorative blurred circles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/40 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>
          </div>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Whispers</h1>
              <p className="text-muted-foreground">Connect with your classmates through public or anonymous messages</p>
            </div>
            <Button onClick={() => setComposeOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
              <PenSquare className="mr-2 h-4 w-4" />
              New Whisper
            </Button>
          </div>

          {/* Messages Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="md:col-span-1">
              <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all h-[calc(100vh-220px)]">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                      Conversations
                    </CardTitle>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[120px] border-violet-200 dark:border-violet-900/50">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="anonymous">Anonymous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search conversations..."
                      className="pl-8 border-violet-200 dark:border-violet-900/50"
                    />
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-130px)] overflow-auto p-0">
                  {isConversationsLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-0.5">
                      {conversations.map((conversation, i) => (
                        <div
                          key={i}
                          className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-violet-100/50 dark:hover:bg-violet-900/20 ${selectedConversation === i ? "bg-violet-100/80 dark:bg-violet-900/30" : ""}`}
                          onClick={() => setSelectedConversation(i)}
                        >
                          <Avatar className="h-10 w-10 border">
                            {!conversation.isAnonymous ? <AvatarImage src={conversation.avatar || undefined} /> : null}
                            <AvatarFallback>
                              {conversation.isAnonymous ? "?" : getInitials(conversation.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{conversation.name}</p>
                              <span className="text-xs text-muted-foreground">{conversation.time}</span>
                            </div>
                            <p className="line-clamp-1 text-sm text-muted-foreground">{conversation.lastMessage}</p>
                          </div>
                          {conversation.unread > 0 && (
                            <Badge className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 bg-violet-600">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center p-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="font-medium">No conversations yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start a new conversation to connect with your classmates
                      </p>
                      <Button
                        onClick={() => setComposeOpen(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        <PenSquare className="mr-2 h-4 w-4" />
                        New Whisper
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Display */}
            <div className="md:col-span-2">
              {selectedConversation !== null && conversations.length > 0 ? (
                <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all h-[calc(100vh-220px)] flex flex-col">
                  <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        {!conversations[selectedConversation]?.isAnonymous ? (
                          <AvatarImage src={conversations[selectedConversation]?.avatar || undefined} />
                        ) : null}
                        <AvatarFallback>
                          {conversations[selectedConversation]?.isAnonymous
                            ? "?"
                            : getInitials(conversations[selectedConversation]?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{conversations[selectedConversation]?.name}</CardTitle>
                        <CardDescription>
                          {conversations[selectedConversation]?.isAnonymous ? "Anonymous message" : "Online"}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!conversations[selectedConversation]?.isAnonymous && (
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>View Profile</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Mark as Unread</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Conversation</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <Separator className="bg-violet-100 dark:bg-violet-900/50" />
                  <CardContent className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="mt-1 h-8 w-8 border">
                          {!conversations[selectedConversation]?.isAnonymous ? (
                            <AvatarImage src={conversations[selectedConversation]?.avatar || undefined} />
                          ) : null}
                          <AvatarFallback>
                            {conversations[selectedConversation]?.isAnonymous
                              ? "?"
                              : getInitials(conversations[selectedConversation]?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-violet-100/80 dark:bg-violet-900/30 p-3">
                          <p className="text-sm">
                            {selectedConversation === 0
                              ? "Hey Jordan! Just wanted to check if you're coming to graduation rehearsal tomorrow?"
                              : selectedConversation === 1
                                ? "Are you going to the pre-graduation party this weekend? Everyone's going to be there!"
                                : selectedConversation === 2
                                  ? "I've always admired how you helped everyone in class. You're going to do great things after graduation."
                                  : "Hi there! How's your senior year going?"}
                          </p>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {selectedConversation === 0 ? "10:30 AM" : "Yesterday"}
                          </span>
                        </div>
                      </div>
                      {!conversations[selectedConversation]?.isAnonymous && (
                        <div className="flex items-start justify-end gap-3">
                          <div className="rounded-lg bg-violet-600 p-3 text-white">
                            <p className="text-sm">
                              {selectedConversation === 0
                                ? "Yes, definitely! I'll be there at 9 AM sharp. Do we need to bring anything specific?"
                                : "I'm planning to go! Do you know what time it starts?"}
                            </p>
                            <span className="mt-1 text-xs text-white/70">
                              {selectedConversation === 0 ? "10:32 AM" : "Yesterday"}
                            </span>
                          </div>
                          <Avatar className="mt-1 h-8 w-8 border">
                            <AvatarImage src={user?.profilePicture} alt={user?.name} />
                            <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {selectedConversation === 0 && !conversations[selectedConversation]?.isAnonymous && (
                        <>
                          <div className="flex items-start gap-3">
                            <Avatar className="mt-1 h-8 w-8 border">
                              <AvatarImage src={conversations[selectedConversation]?.avatar || undefined} />
                              <AvatarFallback>{getInitials(conversations[selectedConversation]?.name)}</AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg bg-violet-100/80 dark:bg-violet-900/30 p-3">
                              <p className="text-sm">
                                Just your cap and gown for a fitting! And maybe a pen to fill out some forms. See you
                                there!
                              </p>
                              <span className="mt-1 text-xs text-muted-foreground">10:35 AM</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Today</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <Separator className="bg-violet-100 dark:bg-violet-900/50" />
                  <CardFooter className="p-4">
                    <div className="flex w-full items-center gap-2">
                      <Input
                        placeholder={
                          conversations[selectedConversation]?.isAnonymous
                            ? "You cannot reply to anonymous messages"
                            : "Type a message..."
                        }
                        disabled={conversations[selectedConversation]?.isAnonymous}
                        className="flex-1 border-violet-200 dark:border-violet-900/50"
                      />
                      <Button
                        size="icon"
                        disabled={conversations[selectedConversation]?.isAnonymous}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex h-[calc(100vh-220px)] flex-col items-center justify-center rounded-lg border border-dashed border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20">
                  <div className="mb-4 rounded-full bg-violet-100 dark:bg-violet-900/30 p-4">
                    <MessageSquare className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">No Conversation Selected</h3>
                  <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
                    Select a conversation from the list or start a new one to begin messaging with your classmates.
                  </p>
                  <Button onClick={() => setComposeOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
                    <PenSquare className="mr-2 h-4 w-4" />
                    New Whisper
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* New Message Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20">
          <DialogHeader>
            <DialogTitle>New Whisper</DialogTitle>
            <DialogDescription>
              Send a message to one of your classmates. You can choose to send it anonymously.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Recipient
              </label>
              <Select>
                <SelectTrigger className="border-violet-200 dark:border-violet-900/50">
                  <SelectValue placeholder="Select a classmate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student1">Student 1</SelectItem>
                  <SelectItem value="student2">Student 2</SelectItem>
                  <SelectItem value="student3">Student 3</SelectItem>
                  <SelectItem value="student4">Student 4</SelectItem>
                  <SelectItem value="student5">Student 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                placeholder="Write your message here..."
                className="min-h-[120px] border-violet-200 dark:border-violet-900/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="anonymous" className="rounded border-muted" />
              <label htmlFor="anonymous" className="text-sm">
                Send anonymously
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
              Send Whisper
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

