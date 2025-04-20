'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/GradientBackground';
import Link from 'next/link';

interface ValidationError {
  message: string;
  path: string[];
}

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<{ email: string; nickname: string } | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Validate the invitation token
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidationMessage('No invitation token provided');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/auth/invite?token=${token}`);
        const data = await response.json();
        
        if (data.valid) {
          setIsValid(true);
          setPlayerInfo(data.playerInfo);
          
          // Pre-populate the name field with the player's nickname
          if (data.playerInfo?.nickname) {
            setName(data.playerInfo.nickname);
          }
        } else {
          setValidationMessage(data.message || 'Invalid invitation');
        }
      } catch (error) {
        setValidationMessage('Error validating invitation');
        console.error('Error validating token:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    validateToken();
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setFormErrors({});
    
    // Client-side validations
    const newErrors: Record<string, string> = {};
    
    if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name,
          password,
          confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error && typeof data.error === 'object') {
          // Handle Zod validation errors
          const newFormErrors: Record<string, string> = {};
          Object.entries(data.error).forEach(([field, error]) => {
            if (field !== '_errors' && error && typeof error === 'object' && Array.isArray((error as any)._errors)) {
              newFormErrors[field] = (error as any)._errors[0] || 'Invalid input';
            }
          });
          setFormErrors(newFormErrors);
        } else {
          setError(data.error || 'Failed to register account');
        }
        return;
      }
      
      // Registration successful, redirect to login
      router.push(`/login?registered=true&email=${encodeURIComponent(data.email || '')}`);
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <GradientBackground>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-6 bg-white bg-opacity-90 dark:bg-gray-800 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? 'Validating Invitation...' : isValid ? 'Complete Registration' : 'Invalid Invitation'}
            </h1>
            {playerInfo && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                You've been invited to join Padeliga!
              </p>
            )}
          </div>
          
          {!isLoading && !isValid && (
            <div className="text-center">
              <p className="text-red-500">{validationMessage}</p>
              <Button className="mt-4" asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          )}
          
          {!isLoading && isValid && playerInfo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="mb-2">
                  <span className="font-medium">Email:</span> {playerInfo.email}
                </p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={formErrors.name ? 'border-red-500' : ''}
                  placeholder="Your name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={formErrors.password ? 'border-red-500' : ''}
                  placeholder="Create a password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                  placeholder="Confirm your password"
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              {error && (
                <div className="p-3 text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 rounded">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Complete Registration'}
              </Button>
              
              <div className="text-center text-sm mt-4">
                <p>
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </Card>
      </div>
    </GradientBackground>
  );
}
