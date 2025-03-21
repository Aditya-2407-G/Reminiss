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
    // Add optional custom props here if needed
    showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
    return (
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md dark:bg-background/60 dark:border-border/40">
            <div className="container max-w-6xl px-6 mx-auto flex h-20 items-center">
                <div className="flex-shrink-0 w-48">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500">
                        Reminiss
                    </h1>
                </div>

                <div className="flex-1 flex justify-end gap-6 items-center">
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

                    <ThemeToggle />

                    {showAuthButtons && (
                        <div className="flex gap-3">
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
                </div>
            </div>
        </header>
    );
}