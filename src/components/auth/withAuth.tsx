"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function withAuth<T>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
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
    if (status === "authenticated") {
      return <Component {...props} />;
    }

    // Return null while redirecting
    return null;
  };
}
