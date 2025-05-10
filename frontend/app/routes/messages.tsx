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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Spinner } from "../components/ui/spinner"
import {
  Mail,
  MessageSquare,
  PenSquare,
  Search,
  Send,
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
  }
  message: string
  isRead: boolean
  isAnonymous: boolean
  anonymousThreadId?: string
  createdAt: string
  updatedAt: string
}

interface Conversation {
  conversationId: string
  otherUser: {
    _id: string
    name: string
    profilePicture?: string
  } | null
  messages: Message[]
  lastMessage: Message
  lastMessageTime: string
  unreadCount: number
  isAnonymous: boolean
  anonymousThreadId?: string
}

export default function Messages() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isConversationsLoading, setIsConversationsLoading] = useState(true)
  const [recipients, setRecipients] = useState<Array<{id: string, name: string, enrollmentNumber?: string}>>([])
  const [messageText, setMessageText] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  // Force recheck auth if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isLoading, isAuthenticated, navigate])

  const fetchConversations = useCallback(async () => {
    try {
      setIsConversationsLoading(true)
      
      const response = await api.get("/messages/conversations")
      const conversationsData = response?.data?.data || []
      
      setConversations(conversationsData)
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
      setConversations([])
    } finally {
      setIsConversationsLoading(false)
    }
  }, [])

  const fetchClassmates = async () => {
    try {
      const response = await api.get("/users/classmates");
      const classmates = response?.data?.data || [];
      
      setRecipients(classmates.map((user: any) => ({
        id: user._id,
        name: user.name,
        enrollmentNumber: user.enrollmentNumber
      })));
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
      
      const selectedConv = conversations.find(c => c.conversationId === selectedConversation)
      
      // Prepare the message payload
      const payload: any = {
        message: messageText,
        isAnonymous: composeOpen ? isAnonymous : false,
      }
      
      // If we're in a conversation
      if (selectedConv && !composeOpen) {
        // For anonymous conversations, we need to reply to the thread
        if (selectedConv.isAnonymous) {
          payload.isAnonymous = true
          payload.replyToAnonymousId = selectedConv.anonymousThreadId
          
          // Determine the recipient for the reply
          const lastMessageFromOther = selectedConv.messages.find(msg => 
            msg.sender && msg.sender._id !== user?._id
          )
          
          if (lastMessageFromOther) {
            payload.recipientId = lastMessageFromOther.sender._id
          } else {
            // We're the original sender, replying to the recipient
            const lastMessage = selectedConv.messages[selectedConv.messages.length - 1]
            payload.recipientId = lastMessage.recipient._id
          }
        } else {
          // Regular conversation
          payload.recipientId = selectedConv.otherUser?._id
        }
      } else {
        // New message from compose dialog
        payload.recipientId = recipientId
      }
      
      await api.post("/messages", payload)
      
      // Clear the message input
      setMessageText("")
      
      // Close compose dialog if open
      if (composeOpen) {
        setRecipientId("")
        setIsAnonymous(false)
        setComposeOpen(false)
      }
      
      // Refresh conversations
      await fetchConversations()
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
      // Refresh conversations to update read status
      await fetchConversations()
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-200 via-indigo-100 to-background dark:from-violet-950/20 dark:via-background dark:to-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1">
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
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.conversationId}
                          className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-violet-100/50 dark:hover:bg-violet-900/20 ${selectedConversation === conversation.conversationId ? "bg-violet-100/80 dark:bg-violet-900/30" : ""}`}
                          onClick={() => {
                            setSelectedConversation(conversation.conversationId)
                            // Mark unread messages as read
                            if (conversation.unreadCount > 0) {
                              conversation.messages
                                .filter(msg => !msg.isRead && msg.recipient._id === user?._id)
                                .forEach(msg => markMessageAsRead(msg._id))
                            }
                          }}
                        >
                          <Avatar className="h-10 w-10 border">
                            {conversation.otherUser && !conversation.isAnonymous ? (
                              <AvatarImage src={conversation.otherUser.profilePicture} />
                            ) : null}
                            <AvatarFallback>
                              {conversation.isAnonymous ? "?" : getInitials(conversation.otherUser?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">
                                {conversation.isAnonymous ? "Anonymous" : conversation.otherUser?.name || "Unknown"}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {conversation.lastMessage.message}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 bg-violet-600">
                              {conversation.unreadCount}
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
              {selectedConversation !== null ? (
                <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all h-[calc(100vh-220px)] flex flex-col">
                  {(() => {
                    const conversation = conversations.find(c => c.conversationId === selectedConversation)
                    if (!conversation) return null

                    return (
                      <>
                        <CardHeader className="flex-row items-center justify-between space-y-0 p-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border">
                              {conversation.otherUser && !conversation.isAnonymous ? (
                                <AvatarImage src={conversation.otherUser.profilePicture} />
                              ) : null}
                              <AvatarFallback>
                                {conversation.isAnonymous ? "?" : getInitials(conversation.otherUser?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {conversation.isAnonymous ? "Anonymous" : conversation.otherUser?.name || "Unknown"}
                              </CardTitle>
                              {conversation.isAnonymous && (
                                <CardDescription className="text-xs">
                                  Anonymous conversation
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <Separator className="bg-violet-100 dark:bg-violet-900/50" />
                        <CardContent className="flex-1 overflow-auto p-3">
                          <div className="space-y-3">
                            {conversation.messages.map((message, index) => {
                              const isFromMe = message.sender?._id === user?._id;
                              
                              return (
                                <div key={`msg-${message._id}-${index}`} className={`flex items-start ${isFromMe ? 'justify-end gap-2' : 'gap-2'}`}>
                                  {!isFromMe && (
                                    <Avatar className="mt-1 h-6 w-6 border">
                                      {conversation.otherUser && !conversation.isAnonymous ? (
                                        <AvatarImage src={conversation.otherUser.profilePicture} />
                                      ) : null}
                                      <AvatarFallback>
                                        {conversation.isAnonymous ? "?" : getInitials(conversation.otherUser?.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div className={`rounded-lg p-2 max-w-[80%] ${isFromMe 
                                    ? 'bg-violet-600 text-white' 
                                    : 'bg-violet-100/80 dark:bg-violet-900/30'}`}
                                  >
                                    <p className="text-sm break-words">{message.message}</p>
                                    <span className={`mt-0.5 text-[10px] ${isFromMe 
                                      ? 'text-white/70' 
                                      : 'text-muted-foreground'}`}
                                    >
                                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                  {isFromMe && (
                                    <Avatar className="mt-1 h-6 w-6 border">
                                      <AvatarImage src={user?.profilePicture} />
                                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
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
                            <Input
                              placeholder={conversation.isAnonymous ? "Type an anonymous reply..." : "Type a message..."}
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
                              disabled={!messageText.trim() || isSending}
                              className="bg-violet-600 hover:bg-violet-700 text-white"
                              onClick={handleSendMessage}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                          {conversation.isAnonymous && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Your replies in this conversation will also be anonymous
                            </p>
                          )}
                        </CardFooter>
                      </>
                    )
                  })()}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={recipientId} onValueChange={setRecipientId}>
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