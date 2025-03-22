"use client";

import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { buttonVariants } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { cn } from "../lib/utils";
import {
    ArrowRight,
    BookOpen,
    Users,
    Image,
    Shield,
    Sparkles,
    GraduationCap,
    Heart,
} from "lucide-react";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel";
import { Header } from "~/components/layout/Header";

export default function Home() {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
<div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-200 via-indigo-100 to-background dark:from-violet-950/20 dark:via-background dark:to-background">


            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-28 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/40 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
<div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>

                    </div>

                    <div className="container max-w-6xl px-6 mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left md:pr-8">
                            <div className="inline-flex items-center rounded-full border border-violet-200 dark:border-violet-800 bg-background/30 px-3 py-1 text-sm text-muted-foreground mb-6">
                                <Sparkles className="mr-2 h-3.5 w-3.5 text-violet-500" />
                                <span>The ultimate memory keeper</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 leading-tight">
                                Preserve Your{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
                                    College Memories
                                </span>{" "}
                                Forever
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0 dark:text-muted-foreground/90">
                                Share and relive your most cherished college
                                moments with your batch mates in one beautiful,
                                organized space.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link
                                    to="/register"
                                    className="group relative px-6 py-3 rounded-lg overflow-hidden bg-background shadow-md hover:shadow-lg"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 ease-out group-hover:scale-105"></div>
                                    <span className="relative z-10 text-white font-medium text-sm flex items-center">
                                        Get Started{" "}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="absolute -inset-10 rounded-lg bg-gradient-to-r from-violet-500/30 via-indigo-500/20 to-purple-500/10 blur-xl opacity-70 dark:from-violet-700/30 dark:via-indigo-700/20 dark:to-purple-700/10 animate-pulse"></div>
                            <Card className="relative p-0 flow-hidden border-violet-100 dark:border-violet-900/50 shadow-xl bg-background/95 dark:bg-background/80">
                                <CardContent className="p-0">
                                    <Carousel className="w-full">
                                        <CarouselContent>
                                            {[
                                                "https://as1.ftcdn.net/v2/jpg/03/22/92/08/1000_F_322920841_zMG8AGtZJEJUrbh9BjmSrFMESRjGlFUa.jpg",
                                                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000",
                                                "https://images.unsplash.com/photo-1627556704290-2b1f5c70a0ff?q=80&w=1000",
                                            ].map((image, index) => (
                                                <CarouselItem key={index}>
                                                    <div className="h-full w-full overflow-hidden rounded-lg">
                                                        <img
                                                            src={image}
                                                            alt={`College memories ${
                                                                index + 1
                                                            }`}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-2" />
                                        <CarouselNext className="right-2" />
                                    </Carousel>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 relative z-1">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-50/90 to-transparent dark:from-violet-950/10 dark:to-transparent"></div>

                    <div className="container max-w-6xl px-6 mx-auto relative z-10">
                        <div className="text-center mb-12">
                            <Badge
                                variant="outline"
                                className="mb-4 px-3 py-1 text-sm bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800"
                            >
                                Features
                            </Badge>
                            <h2 className="text-3xl font-bold mb-4">
                                Everything you need to preserve memories
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto dark:text-muted-foreground/90">
                                Our platform provides all the tools you need to
                                create a beautiful digital yearbook
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: (
                                        <GraduationCap className="h-10 w-10 text-violet-500 dark:text-violet-400" />
                                    ),
                                    title: "Digital Yearbook",
                                    description:
                                        "Create a beautiful digital yearbook that lasts forever and is accessible anywhere.",
                                },
                                {
                                    icon: (
                                        <Users className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                                    ),
                                    title: "Connect with Batchmates",
                                    description:
                                        "Find and reconnect with your college friends and share memories together.",
                                },
                                {
                                    icon: (
                                        <Image className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                                    ),
                                    title: "Photo Collections",
                                    description:
                                        "Upload and organize photos from events, trips, and special moments.",
                                },
                                {
                                    icon: (
                                        <Shield className="h-10 w-10 text-fuchsia-500 dark:text-fuchsia-400" />
                                    ),
                                    title: "Private & Secure",
                                    description:
                                        "Your memories are private and only shared with the people you choose.",
                                },
                            ].map((feature, index) => (
                                <Card
                                    key={index}
                                    className="relative overflow-hidden border-none bg-gradient-to-br from-background to-violet-50/50 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all group"
                                >
                                    <div
                                        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                                        aria-hidden="true"
                                    >
                                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-violet-300 to-indigo-300 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                                    </div>

                                    <CardHeader>
                                        <div className="mb-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 w-fit group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                                            {feature.icon}
                                        </div>
                                        <CardTitle className="text-xl">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground dark:text-muted-foreground/90">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-violet-300/50 via-indigo-200/40 to-background dark:from-violet-900/20 dark:via-background dark:to-background -z-10"></div>


                    <div className="container max-w-6xl px-6 mx-auto">
                        <Card className="border-none overflow-hidden bg-gradient-to-br from-violet-500/5 to-indigo-500/5 dark:from-violet-900/10 dark:to-indigo-900/10">
                            <CardContent className="p-8 md:p-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
                                            Ready to preserve your college
                                            memories?
                                        </h2>
                                        <p className="text-xl text-muted-foreground mb-8 dark:text-muted-foreground/90">
                                            Join thousands of students who are
                                            already creating their digital
                                            yearbooks.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Link
                                                to="/register"
                                                className="group relative px-8 py-3 rounded-lg overflow-hidden bg-background shadow-md hover:shadow-lg"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 ease-out group-hover:scale-105"></div>
                                                <span className="relative z-10 text-white font-medium text-sm flex items-center justify-center">
                                                    Get Started for Free
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="relative hidden md:block">
                                        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-violet-500/20 to-indigo-500/20 blur-lg"></div>
                                        <div className="relative h-64 overflow-hidden rounded-lg">
                                            <img
                                                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000"
                                                alt="College graduation"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12 bg-gradient-to-b from-violet-100 to-indigo-100/70 dark:from-muted/10 dark:to-muted/20 dark:border-border/40">

                <div className="container max-w-6xl px-6 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
                                    Reminiss
                                </h2>
                            </div>
                            <p className="text-muted-foreground dark:text-muted-foreground/90">
                                Preserving college memories for generations to
                                come.
                            </p>
                            <div className="flex gap-4 mt-4">
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-violet-500 dark:hover:text-violet-400"
                                >
                                    <span className="sr-only">Twitter</span>
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </Link>
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-indigo-500 dark:hover:text-indigo-400"
                                >
                                    <span className="sr-only">Instagram</span>
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-purple-500 dark:hover:text-purple-400"
                                >
                                    <span className="sr-only">Facebook</span>
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                                <Link
                                    to="#"
                                    className="text-muted-foreground hover:text-pink-500 dark:hover:text-pink-400"
                                >
                                    <span className="sr-only">GitHub</span>
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-violet-600 dark:text-violet-400">
                                Product
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="#"
                                        className="text-muted-foreground hover:text-violet-500 dark:text-muted-foreground/90 dark:hover:text-violet-400 transition-colors"
                                    >
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="#"
                                        className="text-muted-foreground hover:text-violet-500 dark:text-muted-foreground/90 dark:hover:text-violet-400 transition-colors"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="#"
                                        className="text-muted-foreground hover:text-violet-500 dark:text-muted-foreground/90 dark:hover:text-violet-400 transition-colors"
                                    >
                                        FAQ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="#"
                                        className="text-muted-foreground hover:text-indigo-500 dark:text-muted-foreground/90 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="#"
                                        className="text-muted-foreground hover:text-indigo-500 dark:text-muted-foreground/90 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-violet-100 dark:border-violet-900/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">
                            &copy; {new Date().getFullYear()} Reminiss. All
                            rights reserved.
                        </p>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <span className="text-s text-muted-foreground dark:text-muted-foreground/70">
                                Made with
                            </span>
                            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                            <span className="text-s text-muted-foreground dark:text-muted-foreground/70">
                                and the wisdom of midnight snacks
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
