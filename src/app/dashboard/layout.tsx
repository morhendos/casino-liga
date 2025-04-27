"use client";

import { PadelNavigation } from "@/components/layout/PadelNavigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from 'next/image';
import { GeometricBackground } from "@/components/ui/GeometricBackground";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen relative">
      {/* Background geometric shapes - subtle variant */}
      <GeometricBackground variant="subtle" animated={true} />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-10">
        <div className="flex flex-col flex-grow bg-background dark:bg-slate-900 border-r border-border">
          <div className="flex h-14 flex-shrink-0 items-center justify-center px-3 border-b border-border">
            {/* Larger logo */}
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo.png" alt="Padeliga" width={140} height={40} className="max-h-10" />
            </Link>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto pt-5 pb-4 px-4">
            <PadelNavigation />
          </div>
        </div>
      </div>

      {/* Content area with topbar */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top Bar - Desktop and mobile */}
        <DashboardTopBar />

        {/* Mobile menu toggle */}
        <div className="md:hidden fixed top-0 left-0 z-30 h-14 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-3"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div 
              className="absolute inset-0 bg-black/60" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-40 bg-background dark:bg-slate-900 w-64 h-full border-r border-border">
              <div className="flex flex-col h-full">
                <div className="flex h-14 items-center justify-center px-4 border-b border-border">
                  <Link href="/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <Image src="/logo.png" alt="Padeliga" width={140} height={40} className="max-h-10" />
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-4">
                  <PadelNavigation onSelect={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        )}

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