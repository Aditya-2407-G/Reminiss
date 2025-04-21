import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router"
import { Bell, BookOpen, Heart, LogOut, Mail, MessageSquare, Search, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination"

// Mock data for students
const generateMockStudents = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    name: `Student Name ${i + 1}`,
    major:
      i % 5 === 0
        ? "Computer Science"
        : i % 5 === 1
          ? "Business"
          : i % 5 === 2
            ? "Arts"
            : i % 5 === 3
              ? "Engineering"
              : "Mathematics",
    quote:
      i % 3 === 0
        ? "The future belongs to those who believe in the beauty of their dreams."
        : i % 3 === 1
          ? "Life is what happens when you're busy making other plans."
          : "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    likes: 10 + i,
    activities:
      i % 2 === 0
        ? ["Student Council", "Debate Team", "Chess Club"]
        : ["Basketball Team", "Drama Club", "Yearbook Committee"],
    futurePlans:
      i % 4 === 0
        ? "Attending Stanford University to study Computer Science"
        : i % 4 === 1
          ? "Gap year to travel across Europe before attending NYU"
          : i % 4 === 2
            ? "Working at my family's business while attending community college"
            : "Joining the military before pursuing higher education",
    photoUrl: `/placeholder.svg?height=300&width=225&text=Student${i + 1}`,
  }))
}

export default function Yearbook() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMajor, setFilterMajor] = useState("all")
  const [sortOrder, setSortOrder] = useState("asc")
  const [viewMode, setViewMode] = useState("grid")

  // Mock data - in a real app, this would come from an API
  const totalStudents = 500
  const studentsPerPage = 20
  const totalPages = Math.ceil(totalStudents / studentsPerPage)

  const [allStudents] = useState(() => generateMockStudents(totalStudents))
  const [displayedStudents, setDisplayedStudents] = useState(allStudents.slice(0, studentsPerPage))

  // Filter and paginate students
  useEffect(() => {
    let filtered = [...allStudents]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (student) => student.name.toLowerCase().includes(query) || student.major.toLowerCase().includes(query),
      )
    }

    // Apply major filter
    if (filterMajor !== "all") {
      filtered = filtered.filter((student) => student.major === filterMajor)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name)
      } else {
        return b.name.localeCompare(a.name)
      }
    })

    // Calculate pagination
    const startIndex = (currentPage - 1) * studentsPerPage
    const paginatedStudents = filtered.slice(startIndex, startIndex + studentsPerPage)

    setDisplayedStudents(paginatedStudents)
  }, [allStudents, currentPage, searchQuery, filterMajor, sortOrder])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterMajor(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle sort order change
  const handleSortChange = (value: string) => {
    setSortOrder(value)
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue // Skip first and last page as they're always shown

      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

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
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Class of 2024 Yearbook</h1>
                <p className="text-muted-foreground">
                  Browse through your classmates' profiles and leave messages for them
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or major..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterMajor} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Major" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Majors</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Alphabetical (A-Z)</SelectItem>
                    <SelectItem value="desc">Alphabetical (Z-A)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid View</SelectItem>
                    <SelectItem value="list">List View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Results Stats */}
            <div className="text-sm text-muted-foreground">
              Showing {displayedStudents.length} students
              {searchQuery && ` matching "${searchQuery}"`}
              {filterMajor !== "all" && ` in ${filterMajor}`}
            </div>

            {/* Student Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "flex flex-col gap-4"
              }
            >
              {displayedStudents.map((student) =>
                viewMode === "grid" ? (
                  <Card key={student.id} className="overflow-hidden">
                    <div
                      className="relative aspect-[3/4] w-full cursor-pointer"
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <img
                        src={student.photoUrl || "/placeholder.svg"}
                        alt={student.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">{student.major}</p>
                      <p className="mt-2 text-xs italic line-clamp-2">"{student.quote}"</p>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0">
                      <Button variant="ghost" size="sm">
                        <Heart className="mr-1 h-4 w-4" />
                        <span className="text-xs">{student.likes}</span>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            <span className="text-xs">Message</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send a message to {student.name}</DialogTitle>
                            <DialogDescription>
                              Your message will be delivered to their yearbook inbox.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={student.photoUrl} />
                                <AvatarFallback>S{student.id}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{student.name}</h4>
                                <p className="text-sm text-muted-foreground">{student.major}</p>
                              </div>
                            </div>
                            <Textarea placeholder="Write your message here..." className="min-h-[120px]" />
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
                    </CardFooter>
                  </Card>
                ) : (
                  <Card key={student.id} className="overflow-hidden">
                    <div className="flex p-4">
                      <div
                        className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-md"
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        <img
                          src={student.photoUrl || "/placeholder.svg"}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{student.name}</h3>
                            <p className="text-xs text-muted-foreground">{student.major}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Heart className="mr-1 h-4 w-4" />
                              <span className="text-xs">{student.likes}</span>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="mr-1 h-4 w-4" />
                                  <span className="text-xs">Message</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Send a message to {student.name}</DialogTitle>
                                  <DialogDescription>
                                    Your message will be delivered to their yearbook inbox.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={student.photoUrl} />
                                      <AvatarFallback>S{student.id}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="font-medium">{student.name}</h4>
                                      <p className="text-sm text-muted-foreground">{student.major}</p>
                                    </div>
                                  </div>
                                  <Textarea placeholder="Write your message here..." className="min-h-[120px]" />
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
                        </div>
                        <p className="mt-2 text-sm italic line-clamp-2">"{student.quote}"</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {student.activities.map((activity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ),
              )}
            </div>

            {/* Pagination */}
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </main>

      {selectedStudent !== null && (
        <Dialog open={selectedStudent !== null} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Student Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <img
                    src={allStudents[selectedStudent - 1]?.photoUrl || "/placeholder.svg"}
                    alt={allStudents[selectedStudent - 1]?.name || "Student"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Heart className="mr-2 h-4 w-4" />
                    Like Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{allStudents[selectedStudent - 1]?.name}</h2>
                  <p className="text-muted-foreground">{allStudents[selectedStudent - 1]?.major}</p>
                </div>
                <div>
                  <h3 className="font-medium">Quote</h3>
                  <p className="italic">"{allStudents[selectedStudent - 1]?.quote}"</p>
                </div>
                <div>
                  <h3 className="font-medium">Activities</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allStudents[selectedStudent - 1]?.activities.map((activity, index) => (
                      <Badge key={index}>{activity}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Future Plans</h3>
                  <p className="text-sm text-muted-foreground">{allStudents[selectedStudent - 1]?.futurePlans}</p>
                </div>
                <div>
                  <h3 className="font-medium">Photo Gallery</h3>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-md">
                        <img
                          src={`/placeholder.svg?height=80&width=80&text=Photo${i}`}
                          alt={`Photo ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
