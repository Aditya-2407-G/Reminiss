import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import api from "../lib/api";
import { Spinner } from "../components/ui/spinner";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import {
    Bell,
    BookOpen,
    Camera,
    ChevronRight,
    Film,
    ImageIcon,
    LogOut,
    Mail,
    MessageSquare,
    PlusCircle,
    Search,
    Settings,
    User,
    GraduationCap,
    Sparkles,
    BookMarked,
    Users,
    Clock,
    Heart,
    Share2,
    Calendar,
    Palette,
    Home,
    Menu,
    X,
    ArrowRight,
    BookmarkIcon,
    LayoutDashboard,
    BarChart3,
    Star,
    Bookmark,
    Layers,
    Compass,
    Zap,
    Plus,
} from "lucide-react";
import Header from "~/components/Header/Header";

// Yearbook slideshow component
const YearbookSlideshow = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const images = [
        "/images/yearbook-preview-1.jpg",
        "/images/yearbook-preview-2.jpg",
        "/images/yearbook-preview-3.jpg",
        "/images/yearbook-preview-4.jpg",
    ];
    
    // Fallback images in case the real ones aren't available
    const fallbackImages = [
        "https://placehold.co/300x400/7438dd/ffffff?text=Yearbook+Preview",
        "https://placehold.co/300x400/38dd74/ffffff?text=Class+Photos",
        "https://placehold.co/300x400/dd7438/ffffff?text=School+Events",
        "https://placehold.co/300x400/3874dd/ffffff?text=Memories",
    ];
    
    // Animation effects for each slide (zoom and pan directions)
    const slideEffects = [
        { scale: "scale-[1.1]", translate: "translate-x-[2%] translate-y-[1%]" },
        { scale: "scale-[1.08]", translate: "translate-x-[-1%] translate-y-[2%]" },
        { scale: "scale-[1.12]", translate: "translate-x-[1%] translate-y-[-2%]" },
        { scale: "scale-[1.09]", translate: "translate-x-[-2%] translate-y-[-1%]" },
    ];
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => 
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change image every 5 seconds to give animations time to play
        
        return () => clearInterval(interval);
    }, [images.length]);
    
    // Try to load the image, fall back to placeholders if it fails
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = fallbackImages[currentImageIndex];
    };
    
    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Film grain overlay for a vintage video effect */}
            <div className="absolute inset-0 opacity-[0.03] z-10 pointer-events-none bg-black/5 mix-blend-overlay"></div>
            
            {images.map((src, index) => {
                const effect = slideEffects[index];
                
                return (
                    <div 
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1500 overflow-hidden ${
                            index === currentImageIndex ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <img
                            src={src}
                            alt={`Yearbook preview ${index + 1}`}
                            className={`w-[110%] h-[110%] object-cover transition-transform duration-10000 ease-out ${
                                index === currentImageIndex 
                                    ? `${effect.scale} ${effect.translate}` 
                                    : "scale-100"
                            }`}
                            onError={handleImageError}
                            style={{
                                transformOrigin: index % 2 === 0 ? 'bottom left' : 'top right'
                            }}
                        />
                    </div>
                );
            })}
            
            {/* Adding a subtle vignette effect for a cinematic look */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/20 pointer-events-none"></div>
        </div>
    );
};

export default function Dashboard() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [entries, setEntries] = useState([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [isEntriesLoading, setIsEntriesLoading] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(3);
    const [unreadMessages, setUnreadMessages] = useState(2);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Force recheck auth if needed
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await api.get("/entries");

                // Safely access entries data with fallbacks
                let entriesData = [];
                if (
                    response?.data?.data &&
                    Array.isArray(response.data.data.entries)
                ) {
                    entriesData = response.data.data.entries;
                } else if (
                    response?.data?.data &&
                    Array.isArray(response.data.data)
                ) {
                    entriesData = response.data.data;
                } else if (Array.isArray(response?.data)) {
                    entriesData = response.data;
                }

                setEntries(entriesData);
            } catch (error) {
                console.error("Failed to fetch entries:", error);
                setEntries([]);
            } finally {
                setIsEntriesLoading(false);
            }
        };

        const fetchMessages = async () => {
            try {
                const response = await api.get("/messages");
                setMessages(response?.data?.data || []);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                setMessages([]);
            } finally {
                setIsMessagesLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchEntries();
            fetchMessages();
        } else {
            setIsEntriesLoading(false);
            setIsMessagesLoading(false);
        }
    }, [isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/login");
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will be redirected by the useEffect
    }

    const getInitials = (name: string | undefined | null): string => {
        if (!name || typeof name !== "string") return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-violet-200 via-indigo-100 to-background dark:from-violet-950/20 dark:via-background dark:to-background ">
            {/* Main Content */}
            <div className="flex-1">
                {/* Top Header */}
                <Header />

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
                    {/* Decorative blurred circles similar to login/home page */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/40 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="">


<section className="mb-12">
          <div className="rounded-xl bg-gradient-to-br from-violet-500/90 to-indigo-500/90 p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.7))]" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Digital Yearbook</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Preserve Your School Memories Forever</h1>
                <p className="text-lg text-white/80">
                  Create your digital yearbook entry and connect with classmates to share memories that last a lifetime.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/yearbook">
                      <BookOpen className="mr-2 h-5 w-5" />
                      View Yearbook
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    asChild
                  >
                    <Link to="/yearbook/new">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Entry
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/30 -rotate-6"></div>
                  <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/30 rotate-6"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/30">
                    <div className="aspect-[3/4] rounded-md overflow-hidden">
                      <YearbookSlideshow />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

                        {/* Memory Gallery */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Film className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                                                Reminiscence
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                Not just photos—snapshots of
                                                friendships, lessons, and
                                                dreams.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                                            asChild
                                        >
                                            <Link to="/montage">
                                                View all{" "}
                                                <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            {
                                                id: 1,
                                                title: "Graduation Day",
                                                image: "https://placehold.co/300x200/7438dd/ffffff?text=Graduation",
                                                likes: 24,
                                                year: "2024",
                                            },
                                            {
                                                id: 2,
                                                title: "Spring Break",
                                                image: "https://placehold.co/300x200/38dd74/ffffff?text=Spring+Break",
                                                likes: 18,
                                                year: "2024",
                                            },
                                            {
                                                id: 3,
                                                title: "Science Fair",
                                                image: "https://placehold.co/300x200/dd7438/ffffff?text=Science+Fair",
                                                likes: 12,
                                                year: "2023",
                                            },
                                            {
                                                id: 4,
                                                title: "Sports Day",
                                                image: "https://placehold.co/300x200/dd3874/ffffff?text=Sports+Day",
                                                likes: 32,
                                                year: "2023",
                                            },
                                            {
                                                id: 5,
                                                title: "Prom Night",
                                                image: "https://placehold.co/300x200/3874dd/ffffff?text=Prom+Night",
                                                likes: 45,
                                                year: "2024",
                                            },
                                            {
                                                id: 6,
                                                title: "Field Trip",
                                                image: "https://placehold.co/300x200/74dd38/ffffff?text=Field+Trip",
                                                likes: 16,
                                                year: "2023",
                                            },
                                        ].map((memory) => (
                                            <Link
                                                to={`/memories/${memory.id}`}
                                                key={memory.id}
                                                className="block"
                                            >
                                                <div className="group relative aspect-square rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all">
                                                    <img
                                                        src={memory.image}
                                                        alt={memory.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                                                        <div className="w-full">
                                                            <h3 className="text-sm font-medium text-white line-clamp-1">
                                                                {memory.title}
                                                            </h3>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3 text-white/70" />
                                                                    <span className="text-xs text-white/70">
                                                                        {
                                                                            memory.year
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Heart className="h-3 w-3 text-white/70" />
                                                                    <span className="text-xs text-white/70">
                                                                        {
                                                                            memory.likes
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Recent Messages */}
                            <Card className="space-y-6 h-full border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                                                Recent Whispers
                                            </CardTitle>
                                            <CardDescription>
                                                Connect with your classmates
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                                            asChild
                                        >
                                            <Link to="/messages">
                                                View all{" "}
                                                <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isMessagesLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner />
                                        </div>
                                    ) : messages && messages.length > 0 ? (
                                        <div className="space-y-3">
                                            {messages
                                                .slice(0, 3)
                                                .map((message, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                                                    >
                                                        <Avatar>
                                                            <AvatarFallback>
                                                                {getInitials(
                                                                    message?.sender ||
                                                                        "Anonymous"
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium">
                                                                    {typeof message?.sender ===
                                                                    "object"
                                                                        ? message
                                                                              ?.sender
                                                                              ?.name
                                                                        : message?.sender ||
                                                                          "Anonymous"}
                                                                </p>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {message?.date ||
                                                                        "Recently"}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {message?.content ||
                                                                    "No message content"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Mail className="h-8 w-8 text-muted-foreground mb-2" />
                                            <h3 className="font-medium">
                                                No whispers yet
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Stay in touch with a gentle
                                                whisper—send a message!
                                            </p>
                                            <Button asChild>
                                                <Link to="/messages/new">
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    New Whisper
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
