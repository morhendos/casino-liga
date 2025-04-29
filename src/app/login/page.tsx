"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback, Suspense } from "react";
import { validateEmail, validatePassword } from "@/lib/auth/validation";
import { AlertCircle, Loader2, ArrowRight, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import PadeligaLogo from "@/components/PadeligaLogo";
import { SkewedButton } from "@/components/ui/SkewedButton";
import { cn } from "@/lib/utils";
import GeometricBackground from "@/components/ui/GeometricBackground";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-md animate-in fade-in duration-300">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-500 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Map technical error codes to user-friendly messages
const getErrorMessage = (errorCode: string | null | undefined): string => {
  if (!errorCode) return "An unexpected error occurred. Please try again.";
  
  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please check your credentials and try again.",
    Default: "An error occurred during authentication. Please try again.",
    OAuthSignin: "Error starting the sign-in process. Please try again.",
    OAuthCallback: "Error during the sign-in process. Please try again.",
    OAuthCreateAccount: "Error creating an account. Please try again.",
    EmailCreateAccount: "Error creating an account. Please try again.",
    Callback: "Error during the sign-in process. Please try again.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    EmailSignin: "Error sending the sign-in email. Please try again.",
    SessionRequired: "Please sign in to access this page.",
    AccessDenied: "Access denied. You do not have permission to access this resource."
  };

  return errorMessages[errorCode] || errorMessages.Default;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"; // Default to dashboard
  // Check for error in URL (e.g., redirected from protected page)
  const urlError = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(() => {
    // Initialize with URL error if present
    return urlError ? { general: getErrorMessage(urlError) } : {};
  });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validateForm = useCallback(
    (email: string, password: string): boolean => {
      const newErrors: FormErrors = {};

      if (!email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(email)) {
        newErrors.email = "Invalid email format";
      }

      if (!password) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(password)) {
        newErrors.password = "Password must be at least 6 characters";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (!validateForm(email, password)) {
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.ok) {
        setErrors({
          general: getErrorMessage(result?.error),
        });
        return;
      }

      setIsRedirecting(true);
      await new Promise((resolve) => setTimeout(resolve, 200));
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    } finally {
      if (!isRedirecting) {
        setIsLoading(false);
      }
    }
  };

  const FormError = ({ message }: { message?: string }) =>
    message ? (
      <p className="text-sm text-red-500 mt-1.5 flex items-center animate-in fade-in-50 duration-200">
        <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
        {message}
      </p>
    ) : null;

  return (
    <div className={`relative min-h-screen transition-all duration-500 ${
      isRedirecting ? "opacity-50 blur-sm" : ""
    }`}>
      {/* Replace gradient background with GeometricBackground */}
      <GeometricBackground variant="subtle" animated={true} />

      <main className="container mx-auto min-h-screen px-4 py-8 sm:px-6 max-w-screen-xl relative z-10 flex flex-col lg:flex-row items-center justify-center">
        {/* Left side: Branding and info */}
        <div className="lg:w-1/2 flex flex-col items-center lg:items-start mb-10 lg:mb-0 lg:pr-12">
          <Link href="/" className="mb-12 transform transition-transform hover:scale-105 duration-300">
            <PadeligaLogo size="xl" showTagline={true} />
          </Link>
          
          <div className="text-center lg:text-left max-w-md">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Bienvenido a Padeliga
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Inicia sesión para acceder a tu dashboard y gestionar tus ligas y torneos de pádel.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              <div className="px-4 py-2 rounded-full bg-padeliga-purple/20 border border-padeliga-purple/30 text-padeliga-purple text-sm">
                Gestión de Ligas
              </div>
              <div className="px-4 py-2 rounded-full bg-padeliga-teal/20 border border-padeliga-teal/30 text-padeliga-teal text-sm">
                Clasificaciones en Vivo
              </div>
              <div className="px-4 py-2 rounded-full bg-padeliga-orange/20 border border-padeliga-orange/30 text-padeliga-orange text-sm">
                Estadísticas de Jugador
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side: Login Form */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-2xl">
            {/* Gradient accent line at top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-teal to-padeliga-blue"></div>
            
            {/* Decorative background elements */}
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-blue-500/5 blur-xl"></div>
            <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-purple-500/5 blur-xl"></div>
            
            {/* Loading overlay */}
            {isRedirecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-padeliga-teal mb-3" />
                  <p className="text-padeliga-teal animate-pulse">Redirigiendo...</p>
                </div>
              </div>
            )}
            
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Iniciar Sesión
              </h2>
              <p className="text-gray-400 mb-6">Ingresa tus credenciales para acceder</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && <ErrorAlert message={errors.general} />}
                
                <div className="space-y-4">
                  {/* Email field with floating label and icon */}
                  <div className="relative">
                    <div className={cn(
                      "absolute left-3 top-0 h-full flex items-center transition-all duration-200",
                      (emailFocused || email) ? "text-padeliga-teal" : "text-gray-500"
                    )}>
                      <Mail size={18} />
                    </div>
                    
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className={cn(
                        "w-full bg-gray-800/50 border rounded-md py-3 pl-10 pr-3 transition-all duration-200",
                        "text-white placeholder-gray-500 shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-padeliga-teal focus:border-transparent",
                        errors.email ? "border-red-500" : emailFocused ? "border-padeliga-teal" : "border-gray-700"
                      )}
                      placeholder="Email"
                      required
                      disabled={isLoading || isRedirecting}
                    />
                    
                    <label 
                      htmlFor="email" 
                      className={cn(
                        "absolute text-xs font-medium transition-all duration-200",
                        (emailFocused || email) ? "top-0 left-10 text-padeliga-teal -translate-y-1/2 px-1 bg-gray-900" : "sr-only"
                      )}
                    >
                      Email
                    </label>
                  </div>
                  <FormError message={errors.email} />

                  {/* Password field with floating label and icon */}
                  <div className="relative mt-4">
                    <div className={cn(
                      "absolute left-3 top-0 h-full flex items-center transition-all duration-200",
                      (passwordFocused || password) ? "text-padeliga-teal" : "text-gray-500"
                    )}>
                      <Lock size={18} />
                    </div>
                    
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className={cn(
                        "w-full bg-gray-800/50 border rounded-md py-3 pl-10 pr-3 transition-all duration-200",
                        "text-white placeholder-gray-500 shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-padeliga-teal focus:border-transparent",
                        errors.password ? "border-red-500" : passwordFocused ? "border-padeliga-teal" : "border-gray-700"
                      )}
                      placeholder="Contraseña"
                      required
                      disabled={isLoading || isRedirecting}
                    />
                    
                    <label 
                      htmlFor="password" 
                      className={cn(
                        "absolute text-xs font-medium transition-all duration-200",
                        (passwordFocused || password) ? "top-0 left-10 text-padeliga-teal -translate-y-1/2 px-1 bg-gray-900" : "sr-only"
                      )}
                    >
                      Contraseña
                    </label>
                  </div>
                  <FormError message={errors.password} />
                </div>
                
                {/* Login button - REPLACED WITH THE EXACT STYLE FROM HEADER */}
                <div className="w-full">
                  <SkewedButton
                    type="submit"
                    disabled={isLoading || isRedirecting}
                    buttonVariant="outline"
                    hoverEffectColor="teal"
                    hoverEffectVariant="outline"
                    fullWidth
                    className={cn(
                      "text-padeliga-teal border border-padeliga-teal",
                      "disabled:opacity-70 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          <span>Iniciando sesión...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          <span>Iniciar Sesión</span>
                        </>
                      )}
                    </div>
                  </SkewedButton>
                </div>
                
                {/* Forgot password and register links */}
                <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link href="#" className="text-sm text-padeliga-teal hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                  
                  <Link 
                    href="/signup" 
                    className={cn(
                      "flex items-center rounded-md px-4 py-2 text-sm font-medium",
                      "bg-gray-800 text-padeliga-orange border border-padeliga-orange/30",
                      "hover:bg-padeliga-orange/10 transition-colors"
                    )}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrarse
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </form>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Al iniciar sesión, aceptas nuestros <Link href="#" className="text-padeliga-teal hover:underline">Términos de Servicio</Link> y <Link href="#" className="text-padeliga-teal hover:underline">Política de Privacidad</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-padeliga-teal mb-3" />
            <p className="text-padeliga-teal animate-pulse">Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}