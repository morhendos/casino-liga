"use client";

import { UserAccountNav } from "@/components/auth/UserAccountNav";
import { PadelNavigation } from "@/components/layout/PadelNavigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from 'next/image';
import { GeometricBackground } from "@/components/ui/GeometricBackground";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Function to extract page name from pathname
  const getPageTitle = () => {
    // Get the last segment after the last slash
    const path = pathname.split('/').filter(Boolean).pop();
    
    // If path is undefined (we're at /dashboard), return "Dashboard"
    if (!path || path === "dashboard") return "Dashboard";
    
    // Convert kebab case to title case (e.g., "player-profile" to "Player Profile")
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Background geometric shapes - subtle variant */}
      <GeometricBackground variant="subtle" animated={true} />
      
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-10">
        <div className="flex flex-col flex-grow bg-card/90 backdrop-blur-sm border-r border-border">
          <div className="flex h-14 flex-shrink-0 items-center px-4 border-b border-border">
            {/* Smaller, simplified logo without tagline */}
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo.png" alt="Padeliga" width={100} height={32} className="max-h-8" />
            </Link>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto pt-5 pb-4 px-4">
            <PadelNavigation />
          </div>
        </div>
      </div>

      {/* Content area with topbar */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top Bar - shown on all pages */}
        <DashboardTopBar />

        {/* Mobile header */}
        <div className="md:hidden flex flex-col flex-1">
          <div className="sticky top-0 z-10 flex h-14 flex-shrink-0 items-center bg-card/90 backdrop-blur-sm px-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo.png" alt="Padeliga" width={90} height={28} className="max-h-7" />
            </Link>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 bg-background/60 dark:bg-background/40">
          {children}
        </main>
      </div>

      {/* Footer border - brand accent */}
      <div className="h-1 bg-padeliga-teal absolute bottom-0 left-0 w-full opacity-30" />
    </div>
  );
}
