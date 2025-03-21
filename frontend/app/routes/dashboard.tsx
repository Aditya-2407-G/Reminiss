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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import api from "../lib/api";
import { Spinner } from "../components/ui/spinner";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import {
    BookOpen,
    Film,
    MessageSquare,
    PlusCircle,
    User,
    LogOut,
    GraduationCap,
    Sparkles
} from "lucide-react";

export default function Dashboard() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [entries, setEntries] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isEntriesLoading, setIsEntriesLoading] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
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
                if (response.data.data && Array.isArray(response.data.data.entries)) {
                    entriesData = response.data.data.entries;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    entriesData = response.data.data;
                } else if (Array.isArray(response.data)) {
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
                setMessages(response.data.data || []);
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

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar - Using shadcn styling */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-card">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500">Reminiss</h1>
                            <p className="text-xs text-muted-foreground">Your Digital Yearbook</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-3 py-4 space-y-1">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                            Main Features
                        </h2>
                        <div className="space-y-1">
                            <Button 
                                variant={activeTab === "yearbook" ? "secondary" : "ghost"} 
                                className="w-full justify-start" 
                                onClick={() => setActiveTab("yearbook")}
                            >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Yearbook
                            </Button>
                            <Button 
                                variant={activeTab === "memories" ? "secondary" : "ghost"} 
                                className="w-full justify-start"
                                onClick={() => setActiveTab("memories")}
                            >
                                <Film className="mr-2 h-4 w-4" />
                                Memories
                            </Button>
                            <Button 
                                variant={activeTab === "whisper" ? "secondary" : "ghost"} 
                                className="w-full justify-start"
                                onClick={() => setActiveTab("whisper")}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Whisper
                            </Button>
                        </div>
                    </div>
                    
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                            Actions
                        </h2>
                        <div className="space-y-1">
                            <Button 
                                variant={activeTab === "entries" ? "ghost" : "ghost"} 
                                className="w-full justify-start"
                                onClick={() => navigate("/entries/new")}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Entry
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start"
                                onClick={() => navigate("/profile")}
                            >
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/50">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src={user?.profilePicture} />
                            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.enrollmentNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                {/* Mobile Header */}
                <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur md:hidden">
                    <div className="container flex h-16 items-center justify-between">
                        <h1 className="text-xl font-bold">Reminiss</h1>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Button variant="outline" size="icon" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                Welcome, {user?.name}
                            </h2>
                            <p className="text-muted-foreground">
                                Create memories and connect with your batch
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>
                    </div>

                    <Tabs defaultValue="featured" className="mb-8">
                        <TabsList className="mb-6">
                            <TabsTrigger value="featured">Featured</TabsTrigger>
                            <TabsTrigger value="latest">Latest</TabsTrigger>
                            <TabsTrigger value="friends">Friends</TabsTrigger>
                        </TabsList>

                        <TabsContent value="featured" className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                            {/* Yearbook Feature Card */}
                            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center">
                                        <GraduationCap className="mr-2 h-5 w-5" />
                                        Yearbook
                                    </CardTitle>
                                    <CardDescription>
                                        Browse all entries from your batch
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <p className="text-sm">
                                        View and explore the digital yearbook with entries from all students in your batch.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link to="/entries">Explore Yearbook</Link>
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Memories Feature Card */}
                            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center">
                                        <Film className="mr-2 h-5 w-5" />
                                        Memories
                                    </CardTitle>
                                    <CardDescription>
                                        Create montages and photo collages
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <p className="text-sm">
                                        Upload photos and create beautiful video montages or photo collages to capture your memories.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link to="/montage">Create Memory</Link>
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Whisper Feature Card */}
                            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center">
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        Whisper
                                    </CardTitle>
                                    <CardDescription>
                                        Send messages to your classmates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <p className="text-sm">
                                        Exchange memories with friends through public or anonymous messages.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link to="/messages">Send Whisper</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="latest">
                            {/* Latest entries content */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Latest Yearbook Entries</h3>
                                {isEntriesLoading ? (
                                    <div className="flex justify-center p-8">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {entries.slice(0, 6).map((entry) => (
                                            <Card key={entry._id} className="overflow-hidden">
                                                {entry.imageUrl && (
                                                    <div className="aspect-square w-full overflow-hidden">
                                                        <img 
                                                            src={entry.imageUrl} 
                                                            alt={entry.title || "Entry"} 
                                                            className="h-full w-full object-cover transition-all hover:scale-105"
                                                        />
                                                    </div>
                                                )}
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback>{getInitials(entry.user?.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <CardTitle className="text-base">
                                                            {entry.user?.name || "Anonymous"}
                                                        </CardTitle>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="line-clamp-3 text-sm text-muted-foreground">
                                                        {entry.message || "No message"}
                                                    </p>
                                                    {/* {entry.tags && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {entry.tags.split(',').map((tag, i) => (
                                                                <Badge key={i} variant="secondary" className="text-xs">
                                                                    {tag.trim()}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )} */}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-center mt-4">
                                    <Button variant="outline" asChild>
                                        <Link to="/entries">View All Entries</Link>
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="friends">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Your Friends</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Find Classmates</CardTitle>
                                            <CardDescription>
                                                Search and connect with your classmates
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button asChild>
                                                <Link to="/friends/find">Find Friends</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Your Whispers</CardTitle>
                                            <CardDescription>
                                                View messages from your classmates
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button asChild variant="outline">
                                                <Link to="/messages">View Whispers</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}