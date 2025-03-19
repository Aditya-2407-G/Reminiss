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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {serverError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="John Doe"
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
                <Input
                  id="enrollmentNumber"
                  {...register('enrollmentNumber')}
                  placeholder="e.g., 2020UIT1234"
                  aria-invalid={errors.enrollmentNumber ? "true" : "false"}
                />
                {errors.enrollmentNumber && (
                  <p className="text-sm text-destructive">{errors.enrollmentNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchCode">Batch Code</Label>
                <Input
                  id="batchCode"
                  {...register('batchCode')}
                  placeholder="Enter the batch code provided by admin"
                  aria-invalid={errors.batchCode ? "true" : "false"}
                />
                {errors.batchCode && (
                  <p className="text-sm text-destructive">{errors.batchCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
                Register
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}