import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import api from "../lib/api";

// Define interfaces for our data types
interface User {
    _id: string;
    name: string;
    email?: string;
    enrollmentNumber?: string;
    profilePicture?: string;
}

interface Message {
    _id: string;
    sender: string | User | null;
    recipient: string | User;
    message: string;
    isRead: boolean;
    isAnonymous: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function Messages() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch users on component mount
    useEffect(() => {
        if (user?._id) {
            fetchUsers();
            fetchSentMessages();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            // Get all users
            const response = await api.get("/users/me");
            const currentUser = response.data.data;
            
            // For demo purposes, we'll use entries API to get users to message
            const entriesResponse = await api.get("/entries");
            const entries = entriesResponse.data.data.entries || [];
            
            // Extract unique users from entries
            const uniqueUsers = new Map<string, User>();
            entries.forEach((entry: any) => {
                if (entry.user && entry.user._id !== currentUser._id) {
                    uniqueUsers.set(entry.user._id, entry.user);
                }
            });
            
            const usersList = Array.from(uniqueUsers.values());
            setUsers(usersList);
            setFilteredUsers(usersList);
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(
                u => 
                    u.name.toLowerCase().includes(query) || 
                    (u.enrollmentNumber && u.enrollmentNumber.toLowerCase().includes(query))
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchSentMessages = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/messages/sent");
            setMessages(response.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch sent messages.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReceivedMessages = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/messages");
            setMessages(response.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch received messages.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            await api.post("/messages", {
                recipientId: selectedUser._id,
                message: newMessage,
                isAnonymous: isAnonymous,
            });

            setNewMessage("");
            setIsComposeOpen(false);
            // Refresh the sent messages list after sending
            fetchSentMessages();
            setActiveTab("sent");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send message.");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleTabChange = (tab: "sent" | "received") => {
        setActiveTab(tab);
        setSelectedUser(null);
        setIsComposeOpen(false);
        
        if (tab === "sent") {
            fetchSentMessages();
        } else if (tab === "received") {
            fetchReceivedMessages();
        }
    };

    const openComposeForm = (user: User) => {
        setSelectedUser(user);
        setIsComposeOpen(true);
    };

    const getSenderName = (message: Message): string => {
        if (message.isAnonymous) {
            return "Anonymous";
        }
        
        if (!message.sender) {
            return "Anonymous";
        }
        
        if (typeof message.sender === 'object') {
            return message.sender.name;
        }
        
        if (message.sender === user?._id) {
            return "You";
        }
        
        const senderUser = users.find(u => u._id === message.sender);
        return senderUser?.name || "Unknown User";
    };

    const getRecipientName = (message: Message): string => {
        if (typeof message.recipient === 'object') {
            return message.recipient.name;
        }
        
        if (message.recipient === user?._id) {
            return "You";
        }
        
        const recipientUser = users.find(u => u._id === message.recipient);
        return recipientUser?.name || "Unknown User";
    };

    if (isLoading && !isComposeOpen) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">Reminiss</h1>
                    </div>
                    <Button asChild>
                        <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </header>

            <main className="container py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Private Messages
                    </h2>
                    <p className="text-muted-foreground">
                        Connect with your batch mates through private messages
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-4 border-b">
                        <button
                            className={`px-4 py-2 ${activeTab === "sent" ? "border-b-2 border-primary font-semibold" : ""}`}
                            onClick={() => handleTabChange("sent")}
                        >
                            Sent Messages
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === "received" ? "border-b-2 border-primary font-semibold" : ""}`}
                            onClick={() => handleTabChange("received")}
                        >
                            Received Messages
                        </button>
                    </div>
                    <Button onClick={() => setIsComposeOpen(!isComposeOpen)}>
                        {isComposeOpen ? "Close" : "New Message"}
                    </Button>
                </div>

                {isComposeOpen ? (
                    <div className="grid gap-6 mb-8 lg:grid-cols-[350px_1fr]">
                        <Card className="overflow-hidden h-[calc(100vh-20rem)]">
                            <CardHeader>
                                <CardTitle>Find Users</CardTitle>
                                <div className="pt-2">
                                    <Input
                                        placeholder="Search by name or enrollment number"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="h-full overflow-auto">
                                {filteredUsers.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground p-4">
                                        No users found
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredUsers.map((u) => (
                                            <button
                                                key={u._id}
                                                onClick={() => setSelectedUser(u)}
                                                className={`flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-muted/50 ${
                                                    selectedUser?._id === u._id ? "bg-muted" : ""
                                                }`}
                                            >
                                                <div className="h-10 w-10 flex-none rounded-full bg-primary/10 text-center leading-10">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{u.name}</p>
                                                    {u.enrollmentNumber && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {u.enrollmentNumber}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex flex-col h-[calc(100vh-20rem)]">
                            {selectedUser ? (
                                <>
                                    <CardHeader className="border-b">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 text-center leading-10">
                                                {selectedUser.name.charAt(0)}
                                            </div>
                                            <div>
                                                <CardTitle>
                                                    {selectedUser.name}
                                                </CardTitle>
                                                {selectedUser.enrollmentNumber && (
                                                    <CardDescription>
                                                        {selectedUser.enrollmentNumber}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-4 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="mb-4 text-muted-foreground">
                                                Send a message to {selectedUser.name}
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t p-4">
                                        <form
                                            onSubmit={handleSendMessage}
                                            className="w-full"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Checkbox
                                                    id="anonymous"
                                                    checked={isAnonymous}
                                                    onCheckedChange={(checked: boolean) => 
                                                        setIsAnonymous(checked)
                                                    }
                                                />
                                                <Label htmlFor="anonymous">Send anonymously</Label>
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newMessage}
                                                    onChange={(e) =>
                                                        setNewMessage(e.target.value)
                                                    }
                                                    placeholder="Type a message..."
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={!newMessage.trim()}
                                                >
                                                    Send
                                                </Button>
                                            </div>
                                        </form>
                                    </CardFooter>
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center p-4">
                                    <div className="text-center">
                                        <h3 className="mb-2 text-lg font-medium">
                                            Select a recipient
                                        </h3>
                                        <p className="mb-4 text-muted-foreground">
                                            Choose a user from the list to send a message
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                ) : (
                    // Sent or Received Messages View
                    <Card className="min-h-[calc(100vh-22rem)]">
                        <CardHeader>
                            <CardTitle>
                                {activeTab === "sent" ? "Sent Messages" : "Received Messages"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center my-8">
                                    <Spinner size="lg" />
                                </div>
                            ) : messages.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    No messages found
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message: Message) => (
                                        <div key={message._id} className="border rounded-lg p-4">
                                            <div className="flex justify-between mb-2">
                                                <div>
                                                    {activeTab === "sent" ? (
                                                        <p className="font-medium">
                                                            To: {getRecipientName(message)}
                                                        </p>
                                                    ) : (
                                                        <p className="font-medium">
                                                            From: {getSenderName(message)}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="my-2">{message.message}</p>
                                            {message.isAnonymous && (
                                                <p className="text-sm italic text-muted-foreground">
                                                    {activeTab === "sent" ? "Sent anonymously" : "Received anonymously"}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
