"use client"

import { useEffect } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import { buttonVariants } from "../components/ui/button"
import { Spinner } from "../components/ui/spinner"
import { cn } from "../lib/utils"
import { ArrowRight, BookOpen, Users, Image, Shield } from "lucide-react"
import { ThemeToggle } from "~/components/ui/theme-toggle"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background/95 to-background/90 dark:from-background dark:via-background/95 dark:to-background/90">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md dark:bg-background/60 dark:border-border/40">
        <div className="container max-w-6xl px-6 mx-auto flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500">
              Reminiss
            </h1>
          </div>
          <ThemeToggle/>
          <div className="flex gap-4 mx-4">
            <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hover:bg-violet-500/10 hover:text-violet-500 dark:hover:text-violet-400")}>
              Login
            </Link>
            <Link to="/register" className={cn(buttonVariants({ size: "sm" }), "bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white border-none")}>
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-indigo-500/5 dark:from-violet-900/10 dark:to-indigo-900/10 -z-10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-400/20 dark:bg-indigo-700/20 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-violet-400/20 dark:bg-violet-700/20 rounded-full filter blur-3xl"></div>
          
          <div className="container max-w-6xl px-6 mx-auto flex flex-col md:flex-row items-center">
            <div className="flex-1 text-center md:text-left md:pr-8">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 leading-tight">
                Preserve Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">College Memories</span> Forever
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0 dark:text-muted-foreground/90">
                Share and relive your most cherished college moments with your batch mates in one beautiful, organized
                space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/register" className={cn("group px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center")}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/login" className={cn("px-6 py-3 rounded-lg border border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700 bg-background/80 hover:bg-violet-50 dark:bg-background/20 dark:hover:bg-violet-900/20 font-medium text-sm transition-all")}>
                  Login
                </Link>
              </div>
            </div>
            <div className="flex-1 mt-12 md:mt-0">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-violet-500/30 via-indigo-500/20 to-purple-500/10 blur-xl opacity-70 dark:from-violet-700/30 dark:via-indigo-700/20 dark:to-purple-700/10"></div>
                <div className="relative aspect-video rounded-lg bg-card dark:bg-card/80 border border-violet-100 dark:border-violet-900/50 shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 dark:from-violet-900/10 dark:to-indigo-900/10"></div>
                  <img
                    src="https://as1.ftcdn.net/v2/jpg/03/22/92/08/1000_F_322920841_zMG8AGtZJEJUrbh9BjmSrFMESRjGlFUa.jpg"
                    alt="College memories collage"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-violet-50/50 to-indigo-50/50 dark:from-violet-950/30 dark:to-indigo-950/30">
          <div className="container max-w-6xl px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <BookOpen className="h-10 w-10 text-violet-500 dark:text-violet-400" />,
                  title: "Digital Yearbook",
                  description: "Create a beautiful digital yearbook that lasts forever and is accessible anywhere.",
                },
                {
                  icon: <Users className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />,
                  title: "Connect with Batchmates",
                  description: "Find and reconnect with your college friends and share memories together.",
                },
                {
                  icon: <Image className="h-10 w-10 text-purple-500 dark:text-purple-400" />,
                  title: "Photo Collections",
                  description: "Upload and organize photos from events, trips, and special moments.",
                },
                {
                  icon: <Shield className="h-10 w-10 text-fuchsia-500 dark:text-fuchsia-400" />,
                  title: "Private & Secure",
                  description: "Your memories are private and only shared with the people you choose.",
                },
              ].map((feature, index) => (
                <div key={index} className="bg-card/80 dark:bg-card/20 rounded-lg p-6 shadow-sm border border-violet-100 dark:border-violet-900/50 hover:shadow-md transition-shadow hover:border-violet-200 dark:hover:border-violet-800 group">
                  <div className="mb-4 transform transition-transform group-hover:scale-110">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground/90">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 dark:from-violet-900/20 dark:to-indigo-900/20 -z-10"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-400/10 dark:bg-purple-700/20 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-700/20 rounded-full filter blur-3xl"></div>
          
          <div className="container max-w-6xl px-6 mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">Ready to preserve your college memories?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto dark:text-muted-foreground/90">
              Join thousands of students who are already creating their digital yearbooks.
            </p>
            <Link to="/register" className="px-8 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg inline-block">
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-gradient-to-b from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20 dark:border-border/40">
        <div className="container max-w-6xl px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">Reminiss</h2>
              </div>
              <p className="text-muted-foreground dark:text-muted-foreground/90">Preserving college memories for generations to come.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-violet-600 dark:text-violet-400">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-violet-500 dark:text-muted-foreground/90 dark:hover:text-violet-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-violet-500 dark:text-muted-foreground/90 dark:hover:text-violet-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-violet-500 dark:text-muted-foreground/90 dark:hover:text-violet-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-indigo-500 dark:text-muted-foreground/90 dark:hover:text-indigo-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-indigo-500 dark:text-muted-foreground/90 dark:hover:text-indigo-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-indigo-500 dark:text-muted-foreground/90 dark:hover:text-indigo-400 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-purple-500 dark:text-muted-foreground/90 dark:hover:text-purple-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-purple-500 dark:text-muted-foreground/90 dark:hover:text-purple-400 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-purple-500 dark:text-muted-foreground/90 dark:hover:text-purple-400 transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-violet-100 dark:border-violet-900/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">
              &copy; {new Date().getFullYear()} Reminiss. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-violet-500 dark:text-muted-foreground/90 dark:hover:text-violet-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-indigo-500 dark:text-muted-foreground/90 dark:hover:text-indigo-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-purple-500 dark:text-muted-foreground/90 dark:hover:text-purple-400 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}