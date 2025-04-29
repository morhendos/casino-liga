"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback, Suspense } from "react";
import { validateEmail, validatePassword } from "@/lib/auth/validation";
import { AlertCircle, Loader2, ArrowRight, Mail, Lock, LogIn, ChevronRight, UserPlus } from "lucide-react";
import PadeligaLogo from "@/components/PadeligaLogo";
import { SkewedButton } from "@/components/ui/SkewedButton";
import { cn } from "@/lib/utils";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-red-500/10 border border-red-500/30 shadow-sm pl-4 pr-3 py-3 animate-in fade-in-50 duration-200">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-rose-600"></div>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
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
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

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
      <p className="text-sm text-red-500 mt-1 animate-in fade-in-50 duration-200 flex items-center">
        <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
        {message}
      </p>
    ) : null;

  return (
    <div
      className={`relative min-h-screen transition-all duration-500 ${
        isRedirecting ? "opacity-50 blur-sm" : ""
      }`}
    >
      {/* Geometric background elements */}
      <div className="fixed inset-0 -z-10 opacity-5 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-padeliga-purple rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-12 w-72 h-72 bg-padeliga-teal rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-padeliga-orange rounded-full blur-3xl"></div>
      </div>
      
      <main className="container mx-auto h-screen px-3 py-4 sm:px-4 sm:py-12 max-w-6xl relative flex flex-col items-center justify-center z-10">
        {/* Logo with enhanced hover effect */}
        <Link 
          href="/" 
          className="mb-12 transition-all duration-300 hover:scale-105 relative"
        >
          <div className="absolute inset-0 -z-10 opacity-0 hover:opacity-20 bg-padeliga-teal rounded-full blur-xl transition-opacity duration-300"></div>
          <PadeligaLogo size="lg" showTagline={true} />
        </Link>

        {/* Enhanced login container */}
        <div className="w-full max-w-[450px] relative">
          {/* Loading overlay */}
          {isRedirecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50 rounded-xl">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-padeliga-teal mb-3" />
                <p className="text-padeliga-teal animate-pulse">Redirecting...</p>
              </div>
            </div>
          )}
          
          {/* Login card with modern design */}
          <div className="relative overflow-hidden rounded-xl bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl">
            {/* Gradient accent line at top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-teal to-blue-500"></div>
            
            {/* Decorative background elements */}
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-teal-500/5 blur-xl"></div>
            <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-blue-500/5 blur-xl"></div>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-padeliga-teal/10 relative">
                  <LogIn className="h-5 w-5 text-padeliga-teal" />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-padeliga-teal/20 rounded-full blur-md animate-pulse-slow"></div>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Iniciar Sesión
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && <ErrorAlert message={errors.general} />}
                
                <div className="space-y-5">
                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="flex items-center text-base mb-2 text-gray-300"
                    >
                      <Mail className="h-4 w-4 mr-2 text-padeliga-teal" />
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-padeliga-teal/20 to-transparent rounded-md blur-sm opacity-50"></div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={cn(
                          "flex h-12 w-full px-4 py-2 text-base relative",
                          "bg-gray-800/70 text-white border border-gray-700 rounded-md",
                          "focus:outline-none focus:ring-2 focus:ring-padeliga-teal focus:border-transparent",
                          "placeholder:text-gray-500 transition-all duration-300",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          errors.email ? "border-red-500 focus:ring-red-500" : ""
                        )}
                        placeholder="your.email@example.com"
                        disabled={isLoading || isRedirecting}
                      />
                    </div>
                    <FormError message={errors.email} />
                  </div>
                  
                  {/* Password field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="flex items-center text-base mb-2 text-gray-300"
                    >
                      <Lock className="h-4 w-4 mr-2 text-padeliga-teal" />
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-padeliga-teal/20 to-transparent rounded-md blur-sm opacity-50"></div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={cn(
                          "flex h-12 w-full px-4 py-2 text-base relative",
                          "bg-gray-800/70 text-white border border-gray-700 rounded-md",
                          "focus:outline-none focus:ring-2 focus:ring-padeliga-teal focus:border-transparent",
                          "placeholder:text-gray-500 transition-all duration-300",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          errors.password ? "border-red-500 focus:ring-red-500" : ""
                        )}
                        placeholder="••••••••••"
                        disabled={isLoading || isRedirecting}
                      />
                    </div>
                    <FormError message={errors.password} />
                  </div>
                </div>
                
                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading || isRedirecting}
                  className={cn(
                    "relative w-full overflow-hidden group",
                    "bg-gradient-to-r from-padeliga-teal to-blue-500 rounded-md",
                    "shadow-lg shadow-padeliga-teal/20",
                    "transform transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
                    "h-12 px-6 text-white font-medium"
                  )}
                >
                  {/* Background effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  
                  {/* Shine effect */}
                  <div 
                    className="absolute -inset-full top-0 block w-1/2 h-full z-5 transform -skew-x-20 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"
                  ></div>
                  
                  {/* Button content */}
                  <div className="relative z-10 flex items-center justify-center">
                    {isRedirecting ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        <span>Redirigiendo...</span>
                      </div>
                    ) : isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <LogIn className="h-5 w-5 mr-2" />
                        <span>Iniciar Sesión</span>
                      </div>
                    )}
                  </div>
                </button>
                
                {/* Registration link */}
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400">
                      ¿No tienes una cuenta?
                    </p>
                    <Link 
                      href="/signup"
                      className={cn(
                        "group flex items-center gap-2 px-4 py-2",
                        "bg-gray-800/70 hover:bg-gray-800 text-padeliga-orange",
                        "rounded-md transition-colors",
                        "border border-padeliga-orange/30 hover:border-padeliga-orange/60"
                      )}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Registrarse</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </form>
            </div>
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-padeliga-teal" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}