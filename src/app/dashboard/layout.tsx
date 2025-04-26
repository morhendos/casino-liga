"use client";

import { UserAccountNav } from "@/components/auth/UserAccountNav";
import { PadelNavigation } from "@/components/layout/PadelNavigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import PadeligaLogo from "@/components/PadeligaLogo";
import { GeometricBackground } from "@/components/ui/GeometricBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Background geometric shapes - subtle variant */}
      <GeometricBackground variant="subtle" animated={true} />
      
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-10">
        <div className="flex flex-col flex-grow bg-paper border-r border-border">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center">
              <PadeligaLogo size="md" showTagline={true} sloganPosition="below" />
            </Link>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto pt-5 pb-4 px-4">
            <PadelNavigation />
          </div>
          <div className="flex flex-shrink-0 p-4 border-t border-border">
            <div className="flex flex-1 items-center">
              {session?.user && (
                <UserAccountNav 
                  user={{
                    name: session.user.name || null,
                    image: session.user.image || null,
                    email: session.user.email || "",
                  }}
                />
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center bg-paper px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center">
            <PadeligaLogo size="sm" showTagline={false} />
            <span className="text-xs text-muted-foreground italic ml-2">Tu liga. Tu juego.</span>
          </Link>
          <div className="flex flex-1 justify-end items-center space-x-4">
            <ThemeToggle />
            {session?.user && (
              <UserAccountNav 
                user={{
                  name: session.user.name || null,
                  image: session.user.image || null,
                  email: session.user.email || "",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Footer border - brand accent */}
      <div className="h-1 bg-padeliga-teal absolute bottom-0 left-0 w-full opacity-30" />
    </div>
  );
}
