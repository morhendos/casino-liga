"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";
import { validateEmail, validatePassword } from "@/lib/auth/validation";
import { registerUser } from "@/app/actions";
import { Section } from "@/components/common/Section";
import PadeligaLogo from "@/components/PadeligaLogo";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import GeometricBackground from "@/components/ui/GeometricBackground";
import { SkewedButton } from "@/components/ui/SkewedButton";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
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

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback(
    (email: string, password: string, confirmPassword: string): boolean => {
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

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
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
      const confirmPassword = formData.get("confirmPassword") as string;

      if (!validateForm(email, password, confirmPassword)) {
        setIsLoading(false);
        return;
      }

      const result = await registerUser(email, password);
      
      if (!result.success) {
        if (result.error?.code === "email_exists") {
          setErrors({
            email: result.error.message
          });
          return;
        }
        
        setErrors({
          general: result.error?.message || "Registration failed. Please try again."
        });
        return;
      }
      
      toast({
        title: "✨ Account created successfully",
        description: "You can now log in with your credentials",
        duration: 5000,
      });
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/login?registered=true");
    } catch (error) {
      setErrors({
        general: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const FormError = ({ message }: { message?: string }) =>
    message ? <p className="text-sm text-padeliga-red mt-1 animate-in fade-in-50 duration-200">{message}</p> : null;

  return (
    <div className="relative min-h-screen transition-all duration-500">
      {/* Add GeometricBackground with subtle variant */}
      <GeometricBackground variant="subtle" animated={true} />

      <main className="container mx-auto h-screen px-3 py-4 sm:px-4 sm:py-12 max-w-6xl relative flex items-center flex-col justify-center z-10">
        {/* Make the logo clickable and redirect to home page */}
        <Link href="/" className="mb-8 transition-transform hover:scale-105 duration-300">
          <PadeligaLogo size="lg" showTagline={true} />
        </Link>

        <Section title="" className="w-full max-w-[450px] bg-white dark:bg-gray-800 shadow-lg border-l-4 border-padeliga-purple">
          <div className="w-full mx-auto relative">
            <h2 className="heading-accent text-2xl font-bold mb-6">Crear Cuenta</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padeliga-purple focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    disabled={isLoading}
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
                    autoComplete="new-password"
                    required
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padeliga-purple focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    disabled={isLoading}
                  />
                  <FormError message={errors.password} />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-2"
                  >
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padeliga-purple focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    disabled={isLoading}
                  />
                  <FormError message={errors.confirmPassword} />
                </div>
              </div>

              {/* Register button using SkewedButton */}
              <SkewedButton
                type="submit"
                buttonVariant="ghost"
                buttonSize="lg"
                hoverEffectColor="purple"
                hoverEffectVariant="outline"
                className="w-full border border-padeliga-purple text-padeliga-purple hover:bg-padeliga-purple/10"
                disabled={isLoading}
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus
                      size={18}
                      className="transition-transform"
                      strokeWidth={1.5}
                    />
                  )}
                  <span>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </span>
                </span>
              </SkewedButton>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?
                </p>
                {/* Login button using SkewedButton */}
                <SkewedButton
                  buttonVariant="ghost"
                  buttonSize="sm"
                  hoverEffectColor="teal"
                  hoverEffectVariant="outline"
                  className="text-padeliga-teal border border-padeliga-teal hover:bg-padeliga-teal/10"
                  asChild
                >
                  <Link href="/login" className="flex items-center gap-1">
                    Iniciar Sesión
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </SkewedButton>
              </div>
            </form>
          </div>
        </Section>
      </main>
    </div>
  );
}