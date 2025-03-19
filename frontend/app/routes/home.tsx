import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { buttonVariants } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import { cn } from '../lib/utils';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Reminiss</h1>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/login" 
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={cn(buttonVariants())}
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Reminiss
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Share and preserve your college memories with your batch mates
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link 
              to="/register" 
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Reminiss. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 