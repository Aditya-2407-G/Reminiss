import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Search, User, Plus, X } from "lucide-react"
import api from "~/lib/api"

// Function to format Google Drive URLs for direct image access
const formatImageUrl = (url: string) => {
  if (!url) return '';
  
  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    // Use our custom backend proxy endpoint
    return `/api/images/proxy?url=${encodeURIComponent(url)}`;
  }
  
  return url;
}

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import Header from "~/components/Header/Header"

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
  activities: string[]
  ambition: string
  memories: string
  messageToClassmates: string
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
  const [filterOpen, setFilterOpen] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")

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
      // Find and scroll to the matched student
      setTimeout(() => {
        const element = document.querySelector(`[data-enrollment="${matchedEnrollment}"]`);
        element?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100); // Small delay to ensure elements are rendered
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-indigo-100 to-background dark:from-violet-950/20 dark:via-background dark:to-background">
      {/* Header */}
      <Header />

      <main>
        {/* Decorative blurred circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/40 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden ">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000"
              alt="Graduation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center space-y-8 p-4 max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white">Class of {batchInfo?.batchYear}</h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
              Memories and moments captured in time. Explore our digital yearbook.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" onClick={scrollToGrid} variant="default" className="bg-primary hover:bg-primary/90">
                Browse Yearbook
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                asChild
              >
                <Link to="/yearbook/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your Entry
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Yearbook Content */}
        <section className="py-12" ref={gridRef}>
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold">Yearbook Entries</h2>
                <p className="text-muted-foreground">Browse and explore entries from your classmates</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[200px] md:w-[260px]"
                  />
                  <button type="submit" className="sr-only">Search</button>
                </form>

                <Tabs defaultValue="grid" className="w-[180px]" onValueChange={(v) => setView(v as "grid" | "list")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all p-6">
              <CardContent className="p-0">
                {view === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
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
                            className={`cursor-pointer group ${isSelected ? 'ring-2 ring-violet-500 rounded-md' : ''}`}
                          >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
                              {entry ? (
                                <img 
                                  src={formatImageUrl(entry.imageUrl)}
                                  alt={entry.user.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user.name)}&background=random`;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-center">
                              <h3 className="font-medium text-sm">{entry ? entry.user.name : 'Not Uploaded'}</h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {entry?.message || enrollmentNumber}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-lg border">
                          <div className="h-12 w-12 bg-muted rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/10 cursor-pointer ${
                              isSelected ? 'ring-2 ring-violet-500' : ''
                            }`}
                            onClick={() => entry && setSelectedEntry(entry)}
                          >
                            <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                              {entry ? (
                                <img 
                                  src={formatImageUrl(entry.imageUrl)} 
                                  alt={entry.user.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user.name)}&background=random`;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium">{entry ? entry.user.name : 'Not Uploaded'}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {entry ? entry.message : enrollmentNumber}
                              </p>
                            </div>
                            {entry && (
                              <>
                                <div className="hidden md:block">
                                  <div className="flex flex-wrap gap-1">
                                    {entry.activities?.slice(0, 2).map((activity) => (
                                      <Badge key={activity} variant="secondary" className="text-xs">
                                        {activity}
                                      </Badge>
                                    ))}
                                    {entry.activities?.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{entry.activities.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground hidden md:block">{entry.degree}</div>
                              </>
                            )}
                            <Button variant="ghost" size="icon" disabled={!entry}>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Entry Detail Card */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div 
              className="w-full max-w-4xl bg-background rounded-lg overflow-hidden shadow-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Card className="border-0 shadow-2xl">
                <div className="grid md:grid-cols-2">
                  <div className="relative h-full">
                    <img
                      src={formatImageUrl(selectedEntry.imageUrl)}
                      alt={selectedEntry.user.name}
                      className="w-full h-full object-cover md:h-[600px]"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEntry.user.name)}&size=600&background=random`;
                      }}
                    />
                  </div>
                  <div className="p-6 flex flex-col">
                    <CardHeader className="pb-2 p-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">{selectedEntry.user.name}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedEntry(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        Class of {selectedEntry.batch.batchYear} • {selectedEntry.user.enrollmentNumber}
                      </CardDescription>
                    </CardHeader>

                    <ScrollArea className="flex-1 pr-4 my-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">Quote</h3>
                          <p className="italic text-muted-foreground">"{selectedEntry.message}"</p>
                        </div>

                        {selectedEntry.activities?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium">Activities</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedEntry.activities.map((activity) => (
                                <Badge key={activity} variant="secondary">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedEntry.ambition && (
                          <div>
                            <h3 className="text-lg font-medium">Ambition</h3>
                            <p className="text-muted-foreground">{selectedEntry.ambition}</p>
                          </div>
                        )}

                        {selectedEntry.memories && (
                          <div>
                            <h3 className="text-lg font-medium">Memories</h3>
                            <p className="text-muted-foreground">{selectedEntry.memories}</p>
                          </div>
                        )}

                        {selectedEntry.messageToClassmates && (
                          <div>
                            <h3 className="text-lg font-medium">Message to Classmates</h3>
                            <p className="text-muted-foreground">{selectedEntry.messageToClassmates}</p>
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-medium">College & Degree</h3>
                          <p className="text-muted-foreground">
                            {selectedEntry.college.name} • {selectedEntry.degree}
                          </p>
                        </div>
                      </div>
                    </ScrollArea>

                    <CardFooter className="flex items-center justify-between pt-4 border-t mt-auto p-0">
                      <Button asChild>
                        <Link to={`/messages/new?recipient=${selectedEntry.user._id}`}>Send Message</Link>
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}