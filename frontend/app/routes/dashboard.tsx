import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import api from "../lib/api";
import { Spinner } from "../components/ui/spinner";

export default function Dashboard() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [entries, setEntries] = useState([]);
    const [isEntriesLoading, setIsEntriesLoading] = useState(true);
    const navigate = useNavigate();

    // Force recheck auth if needed
    useEffect(() => {
        console.log("Dashboard auth check:", {
            isLoading,
            isAuthenticated,
            user,
        });

        if (!isLoading && !isAuthenticated) {
            console.log("User not authenticated, redirecting to login");
            navigate("/login");
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await api.get("/entries");
                console.log("Entries response:", response.data);

                // Safely access entries data with fallbacks
                let entriesData = [];
                if (
                    response.data.data &&
                    Array.isArray(response.data.data.entries)
                ) {
                    entriesData = response.data.data.entries;
                } else if (
                    response.data.data &&
                    Array.isArray(response.data.data)
                ) {
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

        if (isAuthenticated) {
            fetchEntries();
        } else {
            setIsEntriesLoading(false);
        }
    }, [isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Force navigation to login even if logout API fails
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
        console.log("Not authenticated, should have redirected already");
        return null; // Will be redirected by the useEffect
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">Reminiss</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="text-sm">
                                <span className="font-medium">{user.name}</span>
                            </div>
                        )}
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Welcome, {user?.name}
                    </h2>
                    <p className="text-muted-foreground">
                        This is your personal dashboard where you can manage
                        your reminiscences.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Entry</CardTitle>
                            <CardDescription>
                                Share a new memory or experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link to="/entries/new">Create Entry</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>View Montage</CardTitle>
                            <CardDescription>
                                See your memories as a montage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link to="/montage">View Montage</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Private Messages</CardTitle>
                            <CardDescription>
                                View your private messages
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link to="/messages">View Messages</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-10">
                    <h3 className="mb-6 text-2xl font-bold tracking-tight">
                        Recent Entries
                    </h3>

                    {isEntriesLoading ? (
                        <div className="flex justify-center p-8">
                            <Spinner />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="rounded-lg border p-8 text-center">
                            <h4 className="mb-2 text-lg font-medium">
                                No entries yet
                            </h4>
                            <p className="mb-4 text-muted-foreground">
                                Create your first memory entry to see it here.
                            </p>
                            <Button asChild>
                                <Link to="/entries/new">Create Entry</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {entries.map((entry: any) => (
                                <Card key={entry._id}>
                                    <CardHeader>
                                        <CardTitle>
                                            {" "}
                                            {entry.user?.name ||
                                                "Unknown"},{" "}
                                            {entry.user?.enrollmentNumber || ""}
                                        </CardTitle>
                                        <CardDescription>
                                            {entry.imageUrl && (
                                                <img
                                                    src={entry.imageUrl}
                                                    alt={entry.title || "Entry"}
                                                />
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="line-clamp-3 text-muted-foreground">
                                            {entry.message || "No content"}
                                        </p>
                                        <p>{entry.tags || ""}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
