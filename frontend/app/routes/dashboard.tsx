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
} from "lucide-react";

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
                if (response?.data?.data && Array.isArray(response.data.data.entries)) {
                    entriesData = response.data.data.entries;
                } else if (response?.data?.data && Array.isArray(response.data.data)) {
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
            {/* Sidebar - Component */}
            <aside className={`fixed inset-y-0 z-50 flex flex-col w-64 border-r border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
            <div className="p-4 h-16 flex items-center justify-between border-b border-violet-100 dark:border-violet-900/50">
            <Link to="/" className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                        <span className="text-xl font-bold">Reminiss</span>
                    </Link>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                {/* User Profile Section */}
                <div className="p-4 border-b border-violet-100 dark:border-violet-900/50">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profilePicture} alt={user?.name || "User"} />
                            <AvatarFallback>
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user?.name || "Student"}</p>
                            <p className="text-xs text-muted-foreground"> Class of {user?.batch && typeof user.batch === 'object' ? (user.batch as {batchYear?: string}).batchYear : user?.batch || "Unknown"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>148 Classmates</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>73 Memories</span>
                        </div>
                    </div>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2">
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/yearbook" className="flex items-center gap-3 px-3 py-2">
                                <BookmarkIcon className="h-4 w-4" />
                                <span>Yearbook</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/montage" className="flex items-center gap-3 px-3 py-2">
                                <Layers className="h-4 w-4" />
                                <span>Memories</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/messages" className="flex items-center gap-3 px-3 py-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>Whispers
                                </span>
                                {unreadMessages > 0 && (
                                    <Badge className="ml-auto">{unreadMessages}</Badge>
                                )}
                            </Link>
                        </Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-3 py-1">Create</p>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/entries/new" className="flex items-center gap-3 px-3 py-2">
                                <BookMarked className="h-4 w-4" />
                                <span>New Entry</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/montage/create" className="flex items-center gap-3 px-3 py-2">
                                <Palette className="h-4 w-4" />
                                <span>New Montage</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/messages/new" className="flex items-center gap-3 px-3 py-2">
                                <Mail className="h-4 w-4" />
                                <span>New Whisper</span>
                            </Link>
                        </Button>
                    </div>
                </nav>
                
                {/* Bottom Actions */}
                <div className="p-4 border-t border-border">
                    <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/profile" className="flex items-center gap-3">
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link to="/settings" className="flex items-center gap-3">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-3" />
                            <span>Log out</span>
                        </Button>
                    </div>
                </div>
            </aside>
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-violet-100 dark:border-violet-900/50 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:border-t-0">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 flex items-center gap-4 md:gap-8">
                        <div className="relative flex-1 max-w-md ml-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search memories, classmates..."
                                className="pl-8 w-full border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
                    {/* Decorative blurred circles similar to login/home page */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/40 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>
                    </div>
                    
                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Digital Yearbook Card (full width) */}
                        <div className="lg:col-span-3">
                            <div className="relative overflow-hidden rounded-xl border border-violet-100 dark:border-violet-900/50 shadow-xl">
                                <div className="h-64 w-full">
                                    <img 
                                        src="https://placehold.co/1000x400/7438dd/ffffff?text=Digital+Yearbook" 
                                        alt="Yearbook Cover" 
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                                        <div className="max-w-md">
                                            <Badge className="mb-2 bg-violet-600/80 hover:bg-violet-600 text-white">
                                                Class of {new Date().getFullYear()}
                                            </Badge>
                                            <h2 className="text-2xl font-bold text-white mb-1">
                                                Digital Yearbook
                                            </h2>
                                            <p className="text-white/80 text-sm mb-4">
                                                Capture your high school journey with photos, quotes, and memories that will last a lifetime.
                                            </p>
                                            <div className="flex gap-3">
                                                <Button 
                                                    className="bg-white text-violet-600 hover:bg-white/90" 
                                                    asChild
                                                >
                                                    <Link to={entries.length > 0 ? "/entries/me" : "/entries/new"}>
                                                        {entries.length > 0 ? "View My Entry" : "Create Entry"}
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                    asChild
                                                >
                                                    <Link to="/entries">
                                                        Browse Entries
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                            Not just photos—snapshots of friendships, lessons, and dreams.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                                            asChild
                                        >
                                            <Link to="/montage">
                                                View all <ChevronRight className="h-3 w-3" />
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
                                                year: "2024"
                                            },
                                            {
                                                id: 2,
                                                title: "Spring Break",
                                                image: "https://placehold.co/300x200/38dd74/ffffff?text=Spring+Break",
                                                likes: 18,
                                                year: "2024"
                                            },
                                            {
                                                id: 3,
                                                title: "Science Fair",
                                                image: "https://placehold.co/300x200/dd7438/ffffff?text=Science+Fair",
                                                likes: 12,
                                                year: "2023"
                                            },
                                            {
                                                id: 4,
                                                title: "Sports Day",
                                                image: "https://placehold.co/300x200/dd3874/ffffff?text=Sports+Day",
                                                likes: 32,
                                                year: "2023"
                                            },
                                            {
                                                id: 5,
                                                title: "Prom Night",
                                                image: "https://placehold.co/300x200/3874dd/ffffff?text=Prom+Night",
                                                likes: 45,
                                                year: "2024"
                                            },
                                            {
                                                id: 6,
                                                title: "Field Trip",
                                                image: "https://placehold.co/300x200/74dd38/ffffff?text=Field+Trip",
                                                likes: 16,
                                                year: "2023"
                                            }
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
                                                                        {memory.year}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Heart className="h-3 w-3 text-white/70" />
                                                                    <span className="text-xs text-white/70">
                                                                        {memory.likes}
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
                                                View all <ChevronRight className="h-3 w-3" />
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
                                            {messages.slice(0, 3).map((message, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {getInitials(message?.sender || "Anonymous")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium">
                                                                {typeof message?.sender === "object"
                                                                    ? message?.sender?.name
                                                                    : message?.sender || "Anonymous"}
                                                            </p>
                                                            <span className="text-xs text-muted-foreground">
                                                                {message?.date || "Recently"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {message?.content || "No message content"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Mail className="h-8 w-8 text-muted-foreground mb-2" />
                                            <h3 className="font-medium">No whispers yet</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                            Stay in touch with a gentle whisper—send a message!
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
