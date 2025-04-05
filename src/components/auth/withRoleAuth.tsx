"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";
import { hasAnyRole } from "@/lib/auth/role-utils";
import { ROLES } from "@/lib/auth/role-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Higher-order component for protecting routes based on user roles
 * 
 * @param Component The component to wrap with role-based authentication
 * @param requiredRoles Array of role IDs that are allowed to access this component
 * @param redirectUrl Where to redirect unauthorized users
 * @returns A new component that includes role-based auth checks
 */
export default function withRoleAuth<T>(
  Component: ComponentType<T>,
  requiredRoles: string[] = [ROLES.ADMIN],
  redirectUrl: string = "/dashboard"
) {
  return function ProtectedComponent(props: T) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isLoading = status === "loading";
    const isAuthorized = hasAnyRole(session, requiredRoles);

    useEffect(() => {
      // Check authorization once loaded
      if (!isLoading && !isAuthorized) {
        // Redirect to dashboard for unauthorized users
        router.push(redirectUrl);
      }
    }, [isLoading, isAuthorized, router]);

    // Show loading state while checking session
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-pulse text-center">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        </div>
      );
    }

    // Display unauthorized message instead of redirecting immediately (improves user experience)
    if (!isAuthorized) {
      return (
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Unauthorized Access</CardTitle>
              <CardDescription>
                You don't have permission to view this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // User is authorized, render the protected component
    return <Component {...props} />;
  };
}
