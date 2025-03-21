import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Spinner } from '../components/ui/spinner';
import api from '../lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, GraduationCap, UserPlus } from 'lucide-react';
import { Header } from '~/components/layout/Header';

// Define the validation schema with Zod
const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  enrollmentNumber: z.string().min(1, { message: 'Enrollment number is required' }),
  batchCode: z.string().min(1, { message: 'BatchCode is required' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Define the type based on the schema
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [serverError, setServerError] = React.useState('');
  const { register: registerUser, isLoading, isAuthenticated } = useAuth();
  
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      enrollmentNumber: '',
      batchCode: '',
    }
  });

  const onSubmit = async (formData: RegisterFormValues) => {
    setServerError('');

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enrollmentNumber: formData.enrollmentNumber,
        batchCode: formData.batchCode,
      };
      
      await registerUser(userData);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 via-slate-50 to-background dark:from-violet-950/20 dark:via-background dark:to-background">
      <Header showAuthButtons={false}/>

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
                  <UserPlus className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
                Join Reminiss
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground/90">
                Create an account to preserve your college memories
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
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="John Doe"
                    aria-invalid={errors.name ? "true" : "false"}
                    className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="name@example.com"
                    aria-invalid={errors.email ? "true" : "false"}
                    className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enrollmentNumber" className="text-foreground flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-violet-500" />
                    Enrollment Number
                  </Label>
                  <Input
                    id="enrollmentNumber"
                    {...register('enrollmentNumber')}
                    placeholder="e.g., 2020UIT1234"
                    aria-invalid={errors.enrollmentNumber ? "true" : "false"}
                    className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  {errors.enrollmentNumber && (
                    <p className="text-sm text-destructive">{errors.enrollmentNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchCode" className="text-foreground">Batch Code</Label>
                  <Input
                    id="batchCode"
                    {...register('batchCode')}
                    placeholder="Enter the batch code provided by admin"
                    aria-invalid={errors.batchCode ? "true" : "false"}
                    className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  {errors.batchCode && (
                    <p className="text-sm text-destructive">{errors.batchCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
                    Register
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                    Login
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