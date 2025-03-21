import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Spinner } from '../components/ui/spinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, LogIn } from 'lucide-react';
import { Header } from '~/components/layout/Header';

// Define the validation schema with Zod
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Define the type based on the schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [serverError, setServerError] = React.useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');

    try {
      console.log('Attempting login with:', data.email);
      await login(data.email, data.password);
      console.log('Login successful, redirecting to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setServerError(err.message || err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 via-slate-50 to-background dark:from-violet-950/20 dark:via-background dark:to-background">
      <Header showAuthButtons={false} />
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/30 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-background to-violet-50/50 dark:from-background dark:to-violet-950/20 hover:shadow-md transition-all">
            <CardHeader className="space-y-1 border-b border-violet-100 dark:border-violet-900/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <LogIn className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground/90">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 pt-6">
                {serverError && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {serverError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    aria-invalid={errors.email ? "true" : "false"}
                    className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    aria-invalid={errors.password ? "true" : "false"}
                    className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t border-violet-100 dark:border-violet-900/50">
                <Button 
                  className="w-full group relative overflow-hidden" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 ease-out group-hover:scale-105"></span>
                  <span className="relative z-10 text-white flex items-center justify-center">
                    {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
                    Login
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                    Register
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}