"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback, Suspense } from "react";
import { validateEmail, validatePassword } from "@/lib/auth/validation";
import { Section } from "@/components/common/Section";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";
import PadeligaLogo from "@/components/PadeligaLogo";
import GeometricBackground from "@/components/ui/GeometricBackground";
import { Button } from "@/components/ui/button";
import ButtonHoverEffect from "@/components/ui/ButtonHoverEffect";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="bg-padeliga-red/10 border-l-4 border-padeliga-red p-4 animate-in fade-in-50 duration-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle
            className="h-5 w-5 text-padeliga-red"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-padeliga-red">{message}</p>
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
      <p className="text-sm text-padeliga-red mt-1 animate-in fade-in-50 duration-200">
        {message}
      </p>
    ) : null;

  return (
    <div
      className={`relative min-h-screen transition-all duration-500 ${
        isRedirecting ? "opacity-50 blur-sm" : ""
      }`}
    >
      {/* Add GeometricBackground with subtle variant */}
      <GeometricBackground variant="subtle" animated={true} />

      <main className="container mx-auto h-screen px-3 py-4 sm:px-4 sm:py-12 max-w-6xl relative flex flex-col items-center justify-center z-10">
        <div className="mb-8">
          <PadeligaLogo size="lg" showTagline={true} />
        </div>

        <Section title="" className="w-full max-w-[450px] bg-white dark:bg-gray-800 shadow-lg border-l-4 border-padeliga-teal">
          <div className="w-full mx-auto relative">
            {isRedirecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
                <Loader2 className="h-8 w-8 animate-spin text-padeliga-teal" />
              </div>
            )}

            <h2 className="heading-accent text-2xl font-bold mb-6">Iniciar Sesión</h2>

            <form
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {errors.general && <ErrorAlert message={errors.general} />}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padeliga-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    disabled={isLoading || isRedirecting}
                  />
                  <FormError message={errors.email} />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padeliga-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    disabled={isLoading || isRedirecting}
                  />
                  <FormError message={errors.password} />
                </div>
              </div>

              {/* Login button with ButtonHoverEffect and explicit skew transform */}
              <div className="relative overflow-hidden group" style={{ transform: "skewX(354deg)" }}>
                <Button
                  type="submit"
                  disabled={isLoading || isRedirecting}
                  variant="teal"
                  size="lg"
                  className="w-full relative z-10"
                >
                  <span>
                    {isRedirecting
                      ? "Redirigiendo..."
                      : isLoading
                      ? "Iniciando sesión..."
                      : "Iniciar Sesión"}
                  </span>
                </Button>
                <ButtonHoverEffect variant="solid" color="teal" />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes una cuenta?
                </p>
                {/* Register button with ButtonHoverEffect and opposite skew for visual interest */}
                <div className="relative overflow-hidden group" style={{ transform: "skewX(354deg)" }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-padeliga-orange border-padeliga-orange hover:bg-transparent bg-transparent relative z-10"
                    asChild
                  >
                    <Link href="/signup" className="flex items-center gap-1">
                      Registrarse
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <ButtonHoverEffect variant="outline" color="orange" />
                </div>
              </div>
            </form>
          </div>
        </Section>
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