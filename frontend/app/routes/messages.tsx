"use client"

import { useState, useEffect, useCallback } from "react"
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
import api from "../lib/api"
import { formatDistanceToNow } from "date-fns"

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    profilePicture?: string
  } | null
  recipient: {
    _id: string
    name: string
    profilePicture?: string
  } | string
  message: string
  isRead: boolean
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
  fromMe?: boolean  // Flag indicating if the current user sent this message
}

interface Conversation {
  id: string
  recipientId?: string  // Added to store actual recipient ID for anonymous messages
  name: string
  avatar: string | null
  lastMessage: string
  time: string
  unread: number
  isAnonymous: boolean
  messages: Message[]
}

export default function Messages() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isConversationsLoading, setIsConversationsLoading] = useState(true)
  const [recipients, setRecipients] = useState<Array<{id: string, name: string, enrollmentNumber?: string}>>([])
  const [messageText, setMessageText] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dropdownKey, setDropdownKey] = useState(0)
  const navigate = useNavigate()

  // Helper function to get a consistent conversation ID between two users
  const getConversationId = (user1Id: string, user2Id: string, isAnonymous: boolean) => {
    if (isAnonymous) {
      // Each anonymous thread gets a completely unique ID
      // with no connection to the actual sender
      return `anon-${crypto.randomUUID()}`
    }
    // The smaller ID will be first for consistency
    return [user1Id, user2Id].sort().join("-")
  }

  // Add a handler for search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setDropdownKey(prev => prev + 1); // Increment key to force re-render
  };

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
      
      // Mark received messages (these are sent by others)
      const taggedReceivedMessages = receivedMessages.map((msg: Message) => ({
        ...msg,
        fromMe: false
      }))
      
      // Get sent messages
      const sentResponse = await api.get("/messages/sent")
      const sentMessages = sentResponse?.data?.data || []
      
      // Mark sent messages (these are sent by current user)
      const taggedSentMessages = sentMessages.map((msg: Message) => ({
        ...msg,
        fromMe: true
      }))
      
      // Combine and organize by conversation
      const conversationMap = new Map<string, Conversation>()
      
      // Process received messages
      taggedReceivedMessages.forEach((message: Message) => {
        // CRITICAL FIX: For anonymous messages, ALWAYS create a unique thread ID using the message ID
        // This ensures complete isolation of each anonymous message
        const conversationId = message.isAnonymous 
          ? `anon-received-${message._id}` // Unique ID per received anonymous message
          : getConversationId(user?._id || "", message.sender?._id || "", false)
        
        const otherPersonId = message.sender?._id
        
        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: message.isAnonymous ? conversationId : otherPersonId || "", // Store unique ID for anonymous
            recipientId: message.isAnonymous ? otherPersonId || "" : otherPersonId || "",
            name: message.isAnonymous ? "Anonymous" : message.sender?.name || "Unknown",
            avatar: message.isAnonymous ? null : message.sender?.profilePicture || null,
            lastMessage: message.message,
            time: formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }),
            unread: message.isRead ? 0 : 1,
            isAnonymous: message.isAnonymous,
            messages: [message]
          })
        } else {
          // For non-anonymous messages only - add to existing conversation
          // This should never happen for anonymous messages now
          const conversation = conversationMap.get(conversationId)!
          conversation.messages.push(message)
          
          // Update conversation metadata with the most recent message
          conversation.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          const mostRecent = conversation.messages[0]
          conversation.lastMessage = mostRecent.message
          conversation.time = formatDistanceToNow(new Date(mostRecent.createdAt), { addSuffix: true })
          
          // Calculate unread count
          conversation.unread = conversation.messages.filter(msg => !msg.isRead && msg.sender !== null).length
        }
      })
      
      // Process sent messages to add to conversations
      taggedSentMessages.forEach((message: Message) => {
        // Handle recipient which could be an object or string ID
        let recipientId: string;
        let recipientName = "User";
        let recipientAvatar: string | null = null;
        
        // Check if recipient is an object with _id property or just a string ID
        if (typeof message.recipient === 'object' && message.recipient !== null) {
          recipientId = message.recipient._id;
          recipientName = message.recipient.name;
          recipientAvatar = message.recipient.profilePicture || null;
        } else {
          recipientId = message.recipient as string;
        }
        
        // CRITICAL FIX: For anonymous messages, ALWAYS create a unique thread ID using the message ID
        // This ensures no correlation between anonymous messages
        const conversationId = message.isAnonymous 
          ? `anon-sent-${message._id}` // Unique ID per sent anonymous message
          : getConversationId(user?._id || "", recipientId, false)
        
        if (!conversationMap.has(conversationId)) {
          // Create a new conversation entry
          conversationMap.set(conversationId, {
            id: message.isAnonymous ? conversationId : recipientId, // For anon messages, store thread ID
            recipientId: recipientId, // Always store actual recipient ID separately
            name: message.isAnonymous ? `Anonymous to ${recipientName}` : recipientName, // Label anonymous messages clearly
            avatar: recipientAvatar, // Use the recipient's avatar if available
            lastMessage: message.message,
            time: formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }),
            unread: 0,
            isAnonymous: message.isAnonymous,
            messages: [message]
          })
        } else {
          // For non-anonymous messages only - add to existing conversation
          // This should never happen for anonymous messages now
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
      // This should already be the case, but double-check
      conversationsArray.forEach(conv => {
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

  const fetchClassmates = async () => {
    try {
      console.log("Fetching classmates...");
      const response = await api.get("/users/classmates");
      console.log("Classmates response status:", response.status);
      
      const classmates = response?.data?.data || [];
      console.log(`Found ${classmates.length} classmates:`, classmates);
      
      if (classmates.length > 0) {
        setRecipients(classmates.map((user: any) => ({
          id: user._id,
          name: user.name,
          enrollmentNumber: user.enrollmentNumber
        })));
      } else {
        console.warn("No classmates found in the response");
        setRecipients([]);
      }
    } catch (error) {
      console.error("Failed to fetch classmates:", error);
      setRecipients([]);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
      fetchClassmates()
    } else {
      setIsConversationsLoading(false)
    }
  }, [isAuthenticated, fetchConversations])

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    
    try {
      setIsSending(true)
      
      // Block any attempt to send a message while in an anonymous conversation
      // Force users to use the "Create new message" button instead
      if (selectedConversation !== null && conversations[selectedConversation]?.isAnonymous) {
        console.error("Cannot send message from anonymous conversation");
        setIsSending(false);
        return;
      }
      
      // Determine if we're sending an anonymous message
      const sendAsAnonymous = selectedConversation === null ? isAnonymous : false;
      
      // Get recipient ID - either from the selected conversation or the compose dialog
      let actualRecipientId = "";
      if (selectedConversation !== null) {
        // For existing conversations, use the recipientId field if available (for anon messages)
        // otherwise fall back to the id field
        actualRecipientId = conversations[selectedConversation].recipientId || conversations[selectedConversation].id;
      } else {
        actualRecipientId = recipientId;
      }
      
      if (!actualRecipientId) return
      
      // Get recipient name (for display in UI)
      let recipientName = "";
      let recipientAvatar = null;
      
      if (selectedConversation !== null) {
        recipientName = conversations[selectedConversation].name;
        recipientAvatar = conversations[selectedConversation].avatar;
      } else if (recipientId) {
        const foundRecipient = recipients.find(r => r.id === recipientId);
        recipientName = foundRecipient?.name || "User";
      }
      
      // ALWAYS create a new thread for anonymous messages, even when replying
      if (sendAsAnonymous) {
        // Generate a completely unique thread ID
        const uniqueThreadId = `anon-${crypto.randomUUID()}`;
        
        // Create a temporary message object for UI updates
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          sender: user ? { _id: user._id, name: user.name, profilePicture: user.profilePicture } : null,
          recipient: {
            _id: actualRecipientId,
            name: recipientName
          },
          message: messageText,
          isRead: true,
          isAnonymous: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fromMe: true // Mark as sent by current user
        };
        
        // Always create a new anonymous conversation with its own unique thread ID
        const newAnonymousConversation = {
          id: uniqueThreadId, // Use unique thread ID
          recipientId: actualRecipientId, // Store actual recipient ID separately
          name: recipientName,
          avatar: recipientAvatar,
          lastMessage: messageText,
          time: formatDistanceToNow(new Date(), { addSuffix: true }),
          unread: 0,
          isAnonymous: true,
          messages: [tempMessage]
        };
        
        // Add new anonymous conversation to the beginning of the list
        setConversations(prev => [newAnonymousConversation, ...prev]);
        
        // Send message to server
        await api.post("/messages", {
          recipientId: actualRecipientId,
          message: messageText,
          isAnonymous: true
        });
        
        setMessageText("");
        
        // Reset compose dialog fields if opened
        if (selectedConversation === null) {
          setRecipientId("");
          setIsAnonymous(false);
          setComposeOpen(false);
        }
      }
      // Handle non-anonymous messages (existing logic)
      else if (selectedConversation !== null) {
        // Create a temporary message object for UI updates
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          sender: user ? { _id: user._id, name: user.name, profilePicture: user.profilePicture } : null,
          recipient: {
            _id: actualRecipientId,
            name: recipientName
          },
          message: messageText,
          isRead: true,
          isAnonymous: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fromMe: true // Mark as sent by current user
        }
        
        // Update the conversation with the new message
        setConversations(prev => 
          prev.map((conv, index) => 
            index === selectedConversation 
              ? {
                  ...conv,
                  lastMessage: messageText,
                  time: formatDistanceToNow(new Date(), { addSuffix: true }),
                  messages: [...conv.messages, tempMessage]
                }
              : conv
          )
        )
        
        // Send message to server
        await api.post("/messages", {
          recipientId: actualRecipientId,
          message: messageText,
          isAnonymous: false
        });
        
        setMessageText("");
      }
      // Non-anonymous message from compose dialog
      else {
        // Helper to create a consistent conversation ID
        const createConversationId = (uid1: string, uid2: string) => {
          return [uid1, uid2].sort().join("-")
        }
        
        const tempConversationId = createConversationId(user?._id || "", actualRecipientId);
        
        // Check if we already have a non-anonymous conversation with this recipient
        const existingConvIndex = conversations.findIndex(conv => 
          !conv.isAnonymous && conv.recipientId === actualRecipientId
        );
        
        if (existingConvIndex !== -1) {
          // Update existing non-anonymous conversation
          const tempMessage = {
            _id: `temp-${Date.now()}`,
            sender: user ? { _id: user._id, name: user.name, profilePicture: user.profilePicture } : null,
            recipient: {
              _id: actualRecipientId,
              name: recipientName
            },
            message: messageText,
            isRead: true,
            isAnonymous: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fromMe: true // Mark as sent by current user
          };
          
          setConversations(prev => 
            prev.map((conv, index) => 
              index === existingConvIndex
                ? {
                    ...conv,
                    lastMessage: messageText,
                    time: formatDistanceToNow(new Date(), { addSuffix: true }),
                    messages: [...conv.messages, tempMessage]
                  }
                : conv
            )
          );
        } else {
          // Create new non-anonymous conversation
          const tempMessage = {
            _id: `temp-${Date.now()}`,
            sender: user ? { _id: user._id, name: user.name, profilePicture: user.profilePicture } : null,
            recipient: {
              _id: actualRecipientId,
              name: recipientName
            },
            message: messageText,
            isRead: true,
            isAnonymous: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fromMe: true // Mark as sent by current user
          };
          
          const newConversation = {
            id: actualRecipientId,
            recipientId: actualRecipientId,
            name: recipientName,
            avatar: recipientAvatar,
            lastMessage: messageText,
            time: formatDistanceToNow(new Date(), { addSuffix: true }),
            unread: 0,
            isAnonymous: false,
            messages: [tempMessage]
          };
          
          setConversations(prev => [newConversation, ...prev]);
        }
        
        // Send message to server
        await api.post("/messages", {
          recipientId: actualRecipientId,
          message: messageText,
          isAnonymous: false
        });
        
        setMessageText("");
        setRecipientId("");
        setIsAnonymous(false);
        setComposeOpen(false);
      }
      
      // Refetch conversations to include the new message with proper IDs
      await fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
      
      // Update local state to reflect the change
      setConversations(prev => 
        prev.map(conv => ({
          ...conv,
          unread: conv.messages.reduce((count, msg) => 
            msg._id === messageId ? 0 : (msg.isRead ? 0 : count + 1)
          , 0),
          messages: conv.messages.map(msg => 
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        }))
      );
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

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

  const filteredRecipients = recipients.filter(recipient => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase().trim();
    return (
      recipient.name.toLowerCase().includes(term) || 
      (recipient.enrollmentNumber && recipient.enrollmentNumber.toLowerCase().includes(term))
    );
  });

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
                          key={conversation.id}
                          className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-violet-100/50 dark:hover:bg-violet-900/20 ${selectedConversation === i ? "bg-violet-100/80 dark:bg-violet-900/30" : ""}`}
                          onClick={() => {
                            setSelectedConversation(i)
                            // Mark unread messages as read
                            if (conversation.unread > 0) {
                              conversation.messages
                                .filter(msg => !msg.isRead && msg.sender !== null)
                                .forEach(msg => markMessageAsRead(msg._id))
                            }
                          }}
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
                      <h3 className="font-medium">No messages yet</h3>
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
                          <AvatarImage src={conversations[selectedConversation]?.avatar || undefined} alt={conversations[selectedConversation]?.name} />
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
                          {conversations[selectedConversation]?.isAnonymous ? "Anonymous message" : ""}
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
                      {conversations[selectedConversation]?.messages
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((message, index) => {
                          const isFromMe = message.fromMe ?? (message.sender && message.sender._id === user?._id);
                          
                          return (
                            <div key={`msg-${message._id}-${index}`} className={`flex items-start ${!isFromMe ? 'gap-3' : 'justify-end gap-3'}`}>
                              {!isFromMe && (
                                <Avatar className="mt-1 h-8 w-8 border">
                                  {!conversations[selectedConversation]?.isAnonymous ? (
                                    <AvatarImage src={conversations[selectedConversation]?.avatar || undefined} alt={conversations[selectedConversation]?.name} />
                                  ) : null}
                                  <AvatarFallback>
                                    {conversations[selectedConversation]?.isAnonymous
                                      ? "?"
                                      : getInitials(conversations[selectedConversation]?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`rounded-lg p-3 ${!isFromMe 
                                ? 'bg-violet-100/80 dark:bg-violet-900/30' 
                                : 'bg-violet-600 text-white'}`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <span className={`mt-1 text-xs ${!isFromMe 
                                  ? 'text-muted-foreground' 
                                  : 'text-white/70'}`}
                                >
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {isFromMe && (
                                <Avatar className="mt-1 h-8 w-8 border">
                                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                                  <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                  <Separator className="bg-violet-100 dark:bg-violet-900/50" />
                  <CardFooter className="p-4">
                    <div className="flex w-full items-center gap-2">
                      {conversations[selectedConversation]?.isAnonymous ? (
                        <>
                          <div className="flex-1 text-center p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              This is an anonymous message. You cannot reply directly.
                            </p>
                            <Button 
                              onClick={() => {
                                setSelectedConversation(null);
                                setComposeOpen(true);
                                
                                // Optionally pre-select the recipient if we know who it is
                                if (conversations[selectedConversation]?.recipientId) {
                                  setRecipientId(conversations[selectedConversation]?.recipientId || "");
                                }
                              }}
                              variant="link" 
                              className="text-xs text-violet-600 dark:text-violet-400 p-0 h-auto mt-1"
                            >
                              Create new message instead
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Input
                            placeholder="Type a message..."
                            className="flex-1 border-violet-200 dark:border-violet-900/50"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            disabled={!messageText.trim()}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                            onClick={handleSendMessage}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
      <Dialog open={composeOpen} onOpenChange={(open) => {
        setComposeOpen(open);
        // Fetch classmates again when dialog opens
        if (open) {
          fetchClassmates();
        }
      }}>
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
                        {recipient.enrollmentNumber ? ` (${recipient.enrollmentNumber})` : ''}
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
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="anonymous" 
                className="rounded border-muted" 
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label htmlFor="anonymous" className="text-sm">
                Send anonymously
              </label>
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
                  <>
                    Sending as: {user.name}
                  </>
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

