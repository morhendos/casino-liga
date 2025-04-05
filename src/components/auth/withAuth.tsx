"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

// Fix the TypeScript error by specifying that T extends object (props are objects)
// and by using ComponentType properly
export default function withAuth<T extends object>(
  Component: React.ComponentType<T>
) {
  // Use proper type for props
  return function AuthenticatedComponent(props: Omit<T, keyof React.PropsWithChildren>) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      // If the user is not authenticated, redirect to login
      if (status === "unauthenticated") {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }, [status, router, pathname]);

    // Show loading state while checking authentication
    if (status === "loading") {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2 text-xl">Loading...</span>
        </div>
      );
    }

    // If authenticated, render the protected component
    // Cast props to avoid TypeScript errors with spreading
    if (status === "authenticated") {
      return <Component {...(props as T)} />;
    }

    // Return null while redirecting
    return null;
  };
}
