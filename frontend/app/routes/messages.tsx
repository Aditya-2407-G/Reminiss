"use client"

import { useState } from "react"
import { Link } from "react-router"
import {
  Bell,
  BookOpen,
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
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(0)
  const [composeOpen, setComposeOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ClassOf2024</span>
            </Link>
            <div className="hidden md:flex md:gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/yearbook">Yearbook</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/memories">Memories</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/messages">Messages</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search messages..."
                className="w-[200px] pl-8 md:w-[250px] lg:w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
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
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
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
      <main className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Whisper</h1>
              <p className="text-muted-foreground">Connect with your classmates through public or anonymous messages</p>
            </div>
            <Button onClick={() => setComposeOpen(true)}>
              <PenSquare className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card className="h-[calc(100vh-220px)]">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[120px]">
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
                    <Input type="search" placeholder="Search conversations..." className="pl-8" />
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-130px)] overflow-auto p-0">
                  <div className="space-y-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/50 ${selectedConversation === i ? "bg-muted" : ""}`}
                        onClick={() => setSelectedConversation(i)}
                      >
                        <Avatar className="h-10 w-10">
                          {i !== 2 ? (
                            <AvatarImage src={`/placeholder.svg?height=40&width=40&text=User${i + 1}`} />
                          ) : null}
                          <AvatarFallback>{i === 2 ? "?" : `U${i + 1}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{i === 2 ? "Anonymous" : `Student ${i + 1}`}</p>
                            <span className="text-xs text-muted-foreground">
                              {i === 0 ? "Just now" : i === 1 ? "2h ago" : i === 2 ? "Yesterday" : `${i} days ago`}
                            </span>
                          </div>
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {i === 0
                              ? "Hey! Can't wait to see you at graduation!"
                              : i === 1
                                ? "Are you going to the pre-graduation party?"
                                : i === 2
                                  ? "You've always been an inspiration to me..."
                                  : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
                          </p>
                        </div>
                        {i === 0 && (
                          <Badge className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0">1</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              {selectedConversation !== null ? (
                <Card className="h-[calc(100vh-220px)] flex flex-col">
                  <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {selectedConversation !== 2 ? (
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=User${selectedConversation + 1}`}
                          />
                        ) : null}
                        <AvatarFallback>
                          {selectedConversation === 2 ? "?" : `U${selectedConversation + 1}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {selectedConversation === 2 ? "Anonymous" : `Student ${selectedConversation + 1}`}
                        </CardTitle>
                        <CardDescription>{selectedConversation === 2 ? "Anonymous message" : "Online"}</CardDescription>
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
                  <Separator />
                  <CardContent className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="mt-1 h-8 w-8">
                          {selectedConversation !== 2 ? (
                            <AvatarImage
                              src={`/placeholder.svg?height=32&width=32&text=User${selectedConversation + 1}`}
                            />
                          ) : null}
                          <AvatarFallback>
                            {selectedConversation === 2 ? "?" : `U${selectedConversation + 1}`}
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-muted p-3">
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
                      {selectedConversation !== 2 && (
                        <div className="flex items-start justify-end gap-3">
                          <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                            <p className="text-sm">
                              {selectedConversation === 0
                                ? "Yes, definitely! I'll be there at 9 AM sharp. Do we need to bring anything specific?"
                                : "I'm planning to go! Do you know what time it starts?"}
                            </p>
                            <span className="mt-1 text-xs text-primary-foreground/70">
                              {selectedConversation === 0 ? "10:32 AM" : "Yesterday"}
                            </span>
                          </div>
                          <Avatar className="mt-1 h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {selectedConversation === 0 && (
                        <>
                          <div className="flex items-start gap-3">
                            <Avatar className="mt-1 h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=User${selectedConversation + 1}`}
                              />
                              <AvatarFallback>U{selectedConversation + 1}</AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg bg-muted p-3">
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
                  <Separator />
                  <CardFooter className="p-4">
                    <div className="flex w-full items-center gap-2">
                      <Input
                        placeholder={
                          selectedConversation === 2 ? "You cannot reply to anonymous messages" : "Type a message..."
                        }
                        disabled={selectedConversation === 2}
                        className="flex-1"
                      />
                      <Button size="icon" disabled={selectedConversation === 2}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex h-[calc(100vh-220px)] flex-col items-center justify-center rounded-lg border border-dashed">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">No Conversation Selected</h3>
                  <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
                    Select a conversation from the list or start a new one to begin messaging with your classmates.
                  </p>
                  <Button onClick={() => setComposeOpen(true)}>
                    <PenSquare className="mr-2 h-4 w-4" />
                    New Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
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
                <SelectTrigger>
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
              <Textarea placeholder="Write your message here..." className="min-h-[120px]" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="anonymous" className="rounded border-muted" />
              <label htmlFor="anonymous" className="text-sm">
                Send anonymously
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

