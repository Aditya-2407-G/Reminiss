import { useState } from "react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export interface HeaderProps {
    showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-10 border-b border-violet-200 bg-background/40 backdrop-blur-md dark:bg-background/60 dark:border-violet-900/50">
            <div className="container max-w-6xl px-4 py-2 mx-auto flex h-20 items-center justify-between">
                <div 
                className="flex-shrink-0 w-48">
                    <Link to="/" className="flex items-center gap-2">
                    <h1  
                    
                    className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500">
                        
                        Reminiss
                    </h1>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-6">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    to="#"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Features
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                Explore our amazing features
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    to="#"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    About
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                Learn about our story
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {showAuthButtons && (
                        <div className="hidden md:flex gap-3">
                            <Link
                                to="/login"
                                className={cn(
                                    buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                    }),
                                    "hover:bg-violet-500/10 hover:text-violet-500 dark:hover:text-violet-400"
                                )}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className={cn(
                                    buttonVariants({ size: "sm" }),
                                    "relative group overflow-hidden"
                                )}
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-indigo-500 group-hover:from-violet-500 group-hover:to-indigo-400"></span>
                                <span className="relative text-white">
                                    Register
                                </span>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            {mobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 8h16M4 16h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background/90 dark:bg-background/90">
                    <nav className="px-4 py-2 flex flex-col gap-2">
                        <Link
                            to="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            to="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            About
                        </Link>
                        {showAuthButtons && (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}