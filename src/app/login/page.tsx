'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import PadeligaLogo from '@/components/PadeligaLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SkewedButton } from '@/components/ui/SkewedButton';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;
    
    if (!email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Por favor, introduce un email válido';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });
      
      if (result?.error) {
        setAuthError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setAuthError('Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md mt-20 mb-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <PadeligaLogo size="md" />
          </Link>
          <h1 className="text-3xl font-bold mt-6 text-center">Iniciar Sesión</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
            Bienvenido de nuevo a Padeliga
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full">
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-padeliga-teal hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            <div className="pt-2">
              <SkewedButton 
                buttonVariant="purple" 
                buttonSize="lg"
                className="w-full font-semibold"
                hoverEffectColor="purple"
                hoverEffectVariant="solid"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </SkewedButton>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              ¿No tienes una cuenta?{' '}
              <Link href="/signup" className="text-padeliga-teal hover:underline font-medium">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Support section at the bottom */}
      <div className="w-full max-w-md mb-10 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ¿Necesitas ayuda?{' '}
          <Link href="/support" className="text-padeliga-teal hover:underline">
            Contacta con soporte
          </Link>
        </p>
      </div>
    </div>
  );
}