import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  batch: string;
  profilePicture?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  enrollmentNumber: string;
  batchCode: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values to prevent null checks
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
    console.warn('Auth provider not initialized');
  },
  register: async () => {
    console.warn('Auth provider not initialized');
  },
  logout: async () => {
    console.warn('Auth provider not initialized');
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/me');
      console.log('Auth check response:', response.data);
      
      // Handle different response structures
      if (response.data.success && response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
        console.log('User data:', response.data.data.user);
        
      } else if (response.data.success && response.data.data) {
        // If user data is directly in data object
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Auth check failed, clearing user state:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      console.log('Login response:', response.data);
      
      // Handle different response structures
      if (response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
      } else if (response.data.data) {
        setUser(response.data.data);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/users/register', userData);
      console.log('Register response:', response.data);
      
      // After successful registration, automatically log in the user
      await login(userData.email, userData.password);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user data even if logout API fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
}; 