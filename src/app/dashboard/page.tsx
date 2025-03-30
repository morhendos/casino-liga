"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";

function DashboardPage() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen transition-colors duration-200">
      <main className="container mx-auto px-3 py-4 sm:px-4 max-w-7xl">
        <PageHeader />
        
        <div className="mt-8">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to Your SaaS Dashboard!</h1>
            
            <div className="space-y-4">
              <p className="text-lg">
                Hello{session?.user?.name ? `, ${session.user.name}` : ''}! 👋
              </p>
              
              <p>
                This is your personalized dashboard where you can access all the features of our application.
                Your account is now active and ready to use.
              </p>
              
              <div className="bg-muted p-4 rounded-lg mt-6">
                <h2 className="font-semibold text-lg mb-2">Getting Started</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Explore the features in the navigation menu</li>
                  <li>Complete your profile settings</li>
                  <li>Set up your preferences for a better experience</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Export the protected version of the page
export default withAuth(DashboardPage);
