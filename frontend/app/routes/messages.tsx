"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
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
import { MessageSquare, MoreHorizontal, PenSquare, Search, Send, Trash2, User, EyeOff, Reply } from "lucide-react"
import Header from "~/components/Header/Header"
import api from "../lib/api"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { toast } from "sonner"

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    profilePicture?: string
  } | null
  recipient:
    | {
        _id: string
        name: string
        profilePicture?: string
      }
    | string
  message: string
  isRead: boolean
  isAnonymous: boolean
  anonymousThreadId?: string
  isReplyToAnonymous?: boolean
  createdAt: string
  updatedAt: string
  fromMe?: boolean
}

interface Conversation {
  id: string
  recipientId: string
  name: string
  avatar: string | null
  lastMessage: string
  time: string
  unread: number
  isAnonymous: boolean
  anonymousThreadId?: string
  messages: Message[]
}

interface AnonymousThread {
  threadId: string
  messages: Message[]
  messageCount: number
  lastActivity: string
}

export default function Messages() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("regular")
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [selectedAnonymousThread, setSelectedAnonymousThread] = useState<number | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [anonymousThreads, setAnonymousThreads] = useState<AnonymousThread[]>([])
  const [isConversationsLoading, setIsConversationsLoading] = useState(true)
  const [isAnonymousThreadsLoading, setIsAnonymousThreadsLoading] = useState(true)
  const [recipients, setRecipients] = useState<Array<{ id: string; name: string; enrollmentNumber?: string }>>([])
  const [messageText, setMessageText] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [conversationFilter, setConversationFilter] = useState("all")
  const [dropdownKey, setDropdownKey] = useState(0)
  const navigate = useNavigate()

  // Helper function to get a consistent conversation ID between two users
  const getConversationId = (user1Id: string, user2Id: string) => {
    // The smaller ID will be first for consistency
    return [user1Id, user2Id].sort().join("-")
  }

  // Add a handler for search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setDropdownKey((prev) => prev + 1) // Increment key to force re-render
  }

  // Force recheck auth if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isLoading, isAuthenticated, navigate])

  const fetchConversations = useCallback(async () => {
    try {
      setIsConversationsLoading(true)

      // Get received messages
      const receivedResponse = await api.get("/messages")
      const receivedMessages = receivedResponse?.data?.data || []

      // Filter out messages that belong to anonymous threads
      const regularReceivedMessages = receivedMessages.filter((msg) => !msg.isAnonymous && !msg.anonymousThreadId)

      // Mark received messages (these are sent by others)
      const taggedReceivedMessages = regularReceivedMessages.map((msg: Message) => ({
        ...msg,
        fromMe: false,
      }))

      // Get sent messages
      const sentResponse = await api.get("/messages/sent")
      const sentMessages = sentResponse?.data?.data || []

      // Filter out messages that belong to anonymous threads
      const regularSentMessages = sentMessages.filter((msg) => !msg.isAnonymous && !msg.anonymousThreadId && !msg.isReplyToAnonymous)

      // Mark sent messages (these are sent by current user)
      const taggedSentMessages = regularSentMessages.map((msg: Message) => ({
        ...msg,
        fromMe: true,
      }))

      // Combine and organize by conversation
      const conversationMap = new Map<string, Conversation>()

      // Process received messages
      taggedReceivedMessages.forEach((message: Message) => {
        const otherPersonId = message.sender?._id || ""
        const conversationId = getConversationId(user?._id || "", otherPersonId)

        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            recipientId: otherPersonId,
            name: message.sender?.name || "Unknown",
            avatar: message.sender?.profilePicture || null,
            lastMessage: message.message,
            time: formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }),
            unread: message.isRead ? 0 : 1,
            isAnonymous: false,
            messages: [message],
          })
        } else {
          const conversation = conversationMap.get(conversationId)!
          conversation.messages.push(message)

          // Update conversation metadata with the most recent message
          conversation.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          const mostRecent = conversation.messages[0]
          conversation.lastMessage = mostRecent.message
          conversation.time = formatDistanceToNow(new Date(mostRecent.createdAt), { addSuffix: true })

          // Calculate unread count
          conversation.unread = conversation.messages.filter((msg) => !msg.isRead && msg.sender !== null).length
        }
      })

      // Process sent messages to add to conversations
      taggedSentMessages.forEach((message: Message) => {
        // Handle recipient which could be an object or string ID
        let recipientId: string
        let recipientName = "User"
        let recipientAvatar: string | null = null

        // Check if recipient is an object with _id property or just a string ID
        if (typeof message.recipient === "object" && message.recipient !== null) {
          recipientId = message.recipient._id
          recipientName = message.recipient.name
          recipientAvatar = message.recipient.profilePicture || null
        } else {
          recipientId = message.recipient as string
        }

        const conversationId = getConversationId(user?._id || "", recipientId)

        if (!conversationMap.has(conversationId)) {
          // Create a new conversation entry
          conversationMap.set(conversationId, {
            id: conversationId,
            recipientId: recipientId,
            name: recipientName,
            avatar: recipientAvatar,
            lastMessage: message.message,
            time: formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }),
            unread: 0,
            isAnonymous: false,
            messages: [message],
          })
        } else {
          const conversation = conversationMap.get(conversationId)!
          conversation.messages.push(message)

          // Update conversation metadata with the most recent message
          conversation.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          const mostRecent = conversation.messages[0]
          conversation.lastMessage = mostRecent.message
          conversation.time = formatDistanceToNow(new Date(mostRecent.createdAt), { addSuffix: true })
        }
      })

      // Convert to array and sort by most recent message
      const conversationsArray = Array.from(conversationMap.values())

      // Ensure each conversation only contains its own messages
      conversationsArray.forEach((conv) => {
        // Ensure messages are sorted by date for display (oldest first)
        conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      })

      // Sort conversations by most recent message (newest first)
      conversationsArray.sort((a, b) => {
        const dateA = new Date(a.messages[a.messages.length - 1].createdAt)
        const dateB = new Date(b.messages[b.messages.length - 1].createdAt)
        return dateB.getTime() - dateA.getTime()
      })

      setConversations(conversationsArray)
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
      setConversations([])
    } finally {
      setIsConversationsLoading(false)
    }
  }, [user?._id])

  const fetchAnonymousThreads = useCallback(async () => {
    try {
      setIsAnonymousThreadsLoading(true)

      // Get anonymous threads
      const response = await api.get("/messages/anonymous-threads")
      const threads = response?.data?.data || []

      setAnonymousThreads(threads)
    } catch (error) {
      console.error("Failed to fetch anonymous threads:", error)
      setAnonymousThreads([])
    } finally {
      setIsAnonymousThreadsLoading(false)
    }
  }, [])

  const fetchClassmates = async () => {
    try {
      const response = await api.get("/users/classmates")

      const classmates = response?.data?.data || []

      if (classmates.length > 0) {
        setRecipients(
          classmates.map((user: any) => ({
            id: user._id,
            name: user.name,
            enrollmentNumber: user.enrollmentNumber,
          })),
        )
      } else {
        console.warn("No classmates found in the response")
        setRecipients([])
      }
    } catch (error) {
      console.error("Failed to fetch classmates:", error)
      setRecipients([])
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
      fetchAnonymousThreads()
      fetchClassmates()
    } else {
      setIsConversationsLoading(false)
      setIsAnonymousThreadsLoading(false)
    }
  }, [isAuthenticated, fetchConversations, fetchAnonymousThreads])

  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    try {
      setIsSending(true)

      // Handle sending a regular message
      if (activeTab === "regular") {
        // Get recipient ID - either from the selected conversation or the compose dialog
        let actualRecipientId = ""
        if (selectedConversation !== null) {
          actualRecipientId = conversations[selectedConversation].recipientId
        } else {
          actualRecipientId = recipientId
        }

        if (!actualRecipientId) return

        // Get recipient name (for display in UI)
        let recipientName = ""
        let recipientAvatar = null

        if (selectedConversation !== null) {
          recipientName = conversations[selectedConversation].name
          recipientAvatar = conversations[selectedConversation].avatar
        } else if (recipientId) {
          const foundRecipient = recipients.find((r) => r.id === recipientId)
          recipientName = foundRecipient?.name || "User"
        }

        // Create a temporary message object for UI updates
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          sender: user ? { _id: user._id, name: user.name, profilePicture: user.profilePicture } : null,
          recipient: {
            _id: actualRecipientId,
            name: recipientName,
          },
          message: messageText,
          isRead: true,
          isAnonymous: isAnonymous,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fromMe: true,
        }

        // If sending an anonymous message from compose dialog
        if (isAnonymous && selectedConversation === null) {
          // Send message to server
          const response = await api.post("/messages", {
            recipientId: actualRecipientId,
            message: messageText,
            isAnonymous: true,
          })

          // Refresh anonymous threads to include the new message
          await fetchAnonymousThreads()

          toast.success("Anonymous message sent", {
            description: "Your message has been sent anonymously.",
          })
        }
        // If sending a regular message
        else {
          const conversationId = getConversationId(user?._id || "", actualRecipientId)
          const existingConvIndex = conversations.findIndex((conv) => conv.id === conversationId)

          if (existingConvIndex !== -1) {
            // Update existing conversation
            setConversations((prev) =>
              prev.map((conv, index) =>
                index === existingConvIndex
                  ? {
                      ...conv,
                      lastMessage: messageText,
                      time: formatDistanceToNow(new Date(), { addSuffix: true }),
                      messages: [...conv.messages, tempMessage],
                    }
                  : conv,
              ),
            )
          } else {
            // Create new conversation
            const newConversation = {
              id: conversationId,
              recipientId: actualRecipientId,
              name: recipientName,
              avatar: recipientAvatar,
              lastMessage: messageText,
              time: formatDistanceToNow(new Date(), { addSuffix: true }),
              unread: 0,
              isAnonymous: false,
              messages: [tempMessage],
            }

            setConversations((prev) => [newConversation, ...prev])
          }

          // Send message to server
          await api.post("/messages", {
            recipientId: actualRecipientId,
            message: messageText,
            isAnonymous: false,
          })
        }
      }
      // Handle replying to an anonymous message
      else if (activeTab === "anonymous" && selectedAnonymousThread !== null) {
        const thread = anonymousThreads[selectedAnonymousThread]

        // Send reply to anonymous message
        await api.post("/messages/reply-anonymous", {
          anonymousThreadId: thread.threadId,
          message: messageText,
        })

        // Refresh anonymous threads to include the reply
        await fetchAnonymousThreads()

        toast.success("Reply sent", {
          description: "Your reply to the anonymous message has been sent.",
        })
      }

      setMessageText("")

      // Reset compose dialog fields if opened
      if (selectedConversation === null && selectedAnonymousThread === null) {
        setRecipientId("")
        setIsAnonymous(false)
        setComposeOpen(false)
      }

      // Refresh conversations and threads
      if (activeTab === "regular") {
        await fetchConversations()
      } else {
        await fetchAnonymousThreads()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message. Please try again.", {
        description: "Please check your internet connection and try again.",
      })
    } finally {
      setIsSending(false)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      await api.patch(`/messages/${messageId}/read`)

      // Update local state to reflect the change
      if (activeTab === "regular") {
        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            unread: conv.messages.reduce((count, msg) => (msg._id === messageId ? 0 : msg.isRead ? 0 : count + 1), 0),
            messages: conv.messages.map((msg) => (msg._id === messageId ? { ...msg, isRead: true } : msg)),
          })),
        )
      } else {
        setAnonymousThreads((prev) =>
          prev.map((thread) => ({
            ...thread,
            messages: thread.messages.map((msg) => (msg._id === messageId ? { ...msg, isRead: true } : msg)),
          })),
        )
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

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

  const filteredRecipients = recipients.filter((recipient) => {
    if (!searchTerm.trim()) return true

    const term = searchTerm.toLowerCase().trim()
    return (
      recipient.name.toLowerCase().includes(term) ||
      (recipient.enrollmentNumber && recipient.enrollmentNumber.toLowerCase().includes(term))
    )
  })

  // Filter conversations based on the selected filter
  const filteredConversations = conversations.filter((conv) => {
    if (conversationFilter === "all") return true
    if (conversationFilter === "unread") return conv.unread > 0
    return false
  })

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
            {/* Tabs for Regular and Anonymous Messages */}
            <div className="md:col-span-1">
              <Tabs defaultValue="regular" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="regular">Regular</TabsTrigger>
                  <TabsTrigger value="anonymous">Anonymous</TabsTrigger>
                </TabsList>

                <TabsContent value="regular" className="mt-0">
                  <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all h-[calc(100vh-280px)]">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                          Conversations
                        </CardTitle>
                        <Select value={conversationFilter} onValueChange={setConversationFilter}>
                          <SelectTrigger className="w-[120px] border-violet-200 dark:border-violet-900/50">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Messages</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
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
                      ) : filteredConversations.length > 0 ? (
                        <div className="space-y-0.5">
                          {filteredConversations.map((conversation, i) => (
                            <div
                              key={conversation.id}
                              className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-violet-100/50 dark:hover:bg-violet-900/20 ${selectedConversation === i ? "bg-violet-100/80 dark:bg-violet-900/30" : ""}`}
                              onClick={() => {
                                setSelectedConversation(i)
                                setSelectedAnonymousThread(null)
                                // Mark unread messages as read
                                if (conversation.unread > 0) {
                                  conversation.messages
                                    .filter((msg) => !msg.isRead && msg.sender !== null)
                                    .forEach((msg) => markMessageAsRead(msg._id))
                                }
                              }}
                            >
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={conversation.avatar || undefined} />
                                <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
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
                          <h3 className="font-medium">No messages yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Start a new conversation to connect with your classmates
                          </p>
                          <Button
                            onClick={() => setComposeOpen(true)}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                          >
                            <PenSquare className="mr-2 h-4 w-4" />
                            New Message
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="anonymous" className="mt-0">
                  <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all h-[calc(100vh-280px)]">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <EyeOff className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                          Anonymous Threads
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)] overflow-auto p-0">
                      {isAnonymousThreadsLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner />
                        </div>
                      ) : anonymousThreads.length > 0 ? (
                        <div className="space-y-0.5">
                          {anonymousThreads.map((thread, i) => {
                            const lastMessage = thread.messages[thread.messages.length - 1]
                            const isFromMe = lastMessage.sender && lastMessage.sender._id === user?._id
                            // Always display as "Anonymous" for threads that started anonymously
                            const displayName = isFromMe ? "To: Anonymous" : "Anonymous"

                            return (
                              <div
                                key={thread.threadId}
                                className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-violet-100/50 dark:hover:bg-violet-900/20 ${selectedAnonymousThread === i ? "bg-violet-100/80 dark:bg-violet-900/30" : ""}`}
                                onClick={() => {
                                  setSelectedAnonymousThread(i)
                                  setSelectedConversation(null)
                                  // Mark unread messages as read
                                  thread.messages
                                    .filter((msg) => !msg.isRead && msg.recipient._id === user?._id)
                                    .forEach((msg) => markMessageAsRead(msg._id))
                                }}
                              >
                                <Avatar className="h-10 w-10 border bg-violet-200 dark:bg-violet-800">
                                  <AvatarFallback>
                                    <EyeOff className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">{displayName}</p>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="line-clamp-1 text-sm text-muted-foreground">{lastMessage.message}</p>
                                </div>
                                {thread.messages.some((msg) => !msg.isRead && msg.recipient._id === user?._id) && (
                                  <Badge className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 bg-violet-600">
                                    !
                                  </Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center p-4">
                          <EyeOff className="h-8 w-8 text-muted-foreground mb-2" />
                          <h3 className="font-medium">No anonymous messages</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Send an anonymous message to start a private conversation
                          </p>
                          <Button
                            onClick={() => {
                              setComposeOpen(true)
                              setIsAnonymous(true)
                            }}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                          >
                            <PenSquare className="mr-2 h-4 w-4" />
                            New Anonymous Message
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Message Display */}
            <div className="md:col-span-2">
              {activeTab === "regular" && selectedConversation !== null && conversations.length > 0 ? (
                <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all h-[calc(100vh-280px)] flex flex-col">
                  <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={filteredConversations[selectedConversation]?.avatar || undefined}
                          alt={filteredConversations[selectedConversation]?.name}
                        />
                        <AvatarFallback>
                          {getInitials(filteredConversations[selectedConversation]?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{filteredConversations[selectedConversation]?.name}</CardTitle>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
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
                      {filteredConversations[selectedConversation]?.messages
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((message, index) => {
                          const isFromMe = message.fromMe ?? (message.sender && message.sender._id === user?._id)

                          return (
                            <div
                              key={`msg-${message._id}-${index}`}
                              className={`flex items-start ${!isFromMe ? "gap-3" : "justify-end gap-3"}`}
                            >
                              {!isFromMe && (
                                <Avatar className="mt-1 h-8 w-8 border">
                                  <AvatarImage
                                    src={filteredConversations[selectedConversation]?.avatar || undefined}
                                    alt={filteredConversations[selectedConversation]?.name}
                                  />
                                  <AvatarFallback>
                                    {getInitials(filteredConversations[selectedConversation]?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`rounded-lg p-3 ${
                                  !isFromMe ? "bg-violet-100/80 dark:bg-violet-900/30" : "bg-violet-600 text-white"
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <span
                                  className={`mt-1 text-xs ${!isFromMe ? "text-muted-foreground" : "text-white/70"}`}
                                >
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {isFromMe && (
                                <Avatar className="mt-1 h-8 w-8 border">
                                  <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name} />
                                  <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                  <Separator className="bg-violet-100 dark:bg-violet-900/50" />
                  <CardFooter className="p-4">
                    <div className="flex w-full items-center gap-2">
                      <Input
                        placeholder="Type a message..."
                        className="flex-1 border-violet-200 dark:border-violet-900/50"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        disabled={!messageText.trim() || isSending}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={handleSendMessage}
                      >
                        {isSending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : activeTab === "anonymous" && selectedAnonymousThread !== null && anonymousThreads.length > 0 ? (
                <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all h-[calc(100vh-280px)] flex flex-col">
                  <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border bg-violet-200 dark:bg-violet-800">
                        <AvatarFallback>
                          <EyeOff className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>Anonymous Thread</CardTitle>
                        <CardDescription>
                          {anonymousThreads[selectedAnonymousThread].messages.length} messages
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
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Thread</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <Separator className="bg-violet-100 dark:bg-violet-900/50" />
                  <CardContent className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      {anonymousThreads[selectedAnonymousThread].messages
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((message, index) => {
                          // For anonymous messages, we need to determine if the current user is the sender or recipient
                          const isFromMe = message.sender && message.sender._id === user?._id
                          const isAnonymousToMe = message.isAnonymous && message.recipient._id === user?._id

                          return (
                            <div
                              key={`msg-${message._id}-${index}`}
                              className={`flex items-start ${!isFromMe ? "gap-3" : "justify-end gap-3"}`}
                            >
                              {!isFromMe && (
                                <Avatar className="mt-1 h-8 w-8 border bg-violet-200 dark:bg-violet-800">
                                  <AvatarFallback>
                                    {isAnonymousToMe ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      getInitials(message.sender?.name || "")
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`rounded-lg p-3 ${
                                  !isFromMe ? "bg-violet-100/80 dark:bg-violet-900/30" : "bg-violet-600 text-white"
                                }`}
                              >
                                {message.isAnonymous && (
                                  <div className="mb-1 text-xs font-medium text-violet-500 dark:text-violet-400 flex items-center gap-1">
                                    <EyeOff className="h-3 w-3" />
                                    Anonymous
                                  </div>
                                )}
                                {message.isReplyToAnonymous && (
                                  <div className="mb-1 text-xs font-medium text-violet-500 dark:text-violet-400 flex items-center gap-1">
                                    <Reply className="h-3 w-3" />
                                    Reply to Anonymous
                                  </div>
                                )}
                                <p className="text-sm">{message.message}</p>
                                <span
                                  className={`mt-1 text-xs ${!isFromMe ? "text-muted-foreground" : "text-white/70"}`}
                                >
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {isFromMe && (
                                <Avatar className="mt-1 h-8 w-8 border">
                                  <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name} />
                                  <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                  <Separator className="bg-violet-100 dark:bg-violet-900/50" />
                  <CardFooter className="p-4">
                    <div className="flex w-full items-center gap-2">
                      <Input
                        placeholder="Reply to this thread..."
                        className="flex-1 border-violet-200 dark:border-violet-900/50"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        disabled={!messageText.trim() || isSending}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={handleSendMessage}
                      >
                        {isSending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex h-[calc(100vh-280px)] flex-col items-center justify-center rounded-lg border border-dashed border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20">
                  <div className="mb-4 rounded-full bg-violet-100 dark:bg-violet-900/30 p-4">
                    {activeTab === "regular" ? (
                      <MessageSquare className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <EyeOff className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-medium">
                    {activeTab === "regular" ? "No Conversation Selected" : "No Anonymous Thread Selected"}
                  </h3>
                  <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
                    {activeTab === "regular"
                      ? "Select a conversation from the list or start a new one to begin messaging with your classmates."
                      : "Select an anonymous thread or create a new anonymous message to start a private conversation."}
                  </p>
                  <Button
                    onClick={() => {
                      setComposeOpen(true)
                      setIsAnonymous(activeTab === "anonymous")
                    }}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <PenSquare className="mr-2 h-4 w-4" />
                    {activeTab === "regular" ? "New Message" : "New Anonymous Message"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* New Message Dialog */}
      <Dialog
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open)
          // Fetch classmates again when dialog opens
          if (open) {
            fetchClassmates()
          } else {
            // Reset form when dialog closes
            setMessageText("")
            setRecipientId("")
            // Keep isAnonymous state if we're in anonymous tab
            if (activeTab !== "anonymous") {
              setIsAnonymous(false)
            }
          }
        }}
      >
        <DialogContent className="border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20">
          <DialogHeader>
            <DialogTitle>{isAnonymous ? "New Anonymous Whisper" : "New Whisper"}</DialogTitle>
            <DialogDescription>
              {isAnonymous
                ? "Send an anonymous message to one of your classmates. Your identity will be hidden."
                : "Send a message to one of your classmates."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Recipient
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or enrollment number..."
                  className="pl-8 border-violet-200 dark:border-violet-900/50 mb-2"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Select value={recipientId} onValueChange={setRecipientId} key={dropdownKey}>
                <SelectTrigger className="border-violet-200 dark:border-violet-900/50">
                  <SelectValue placeholder="Select a classmate" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.name}
                        {recipient.enrollmentNumber ? ` (${recipient.enrollmentNumber})` : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {recipients.length > 0 ? "No matches found" : "No classmates found"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {filteredRecipients.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {recipients.length > 0
                    ? `No matches found for "${searchTerm}". Try a different search term.`
                    : "No classmates found. Please make sure other users have registered with the same batch code."}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                placeholder="Write your message here..."
                className="min-h-[120px] border-violet-200 dark:border-violet-900/50"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor="anonymous">Send anonymously</Label>
            </div>
            {user && (
              <div className="text-xs text-muted-foreground mt-2">
                {isAnonymous ? (
                  <>
                    <span className="font-medium text-amber-600">Sending anonymously</span>
                    <br />
                    <span className="italic">Recipient won't see your name or info</span>
                  </>
                ) : (
                  <>Sending as: {user.name}</>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              disabled={!recipientId || !messageText.trim() || isSending}
              onClick={handleSendMessage}
            >
              {isSending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Send Whisper
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
