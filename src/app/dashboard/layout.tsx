"use client";

import { UserAccountNav } from "@/components/auth/UserAccountNav";
import { PadelNavigation } from "@/components/layout/PadelNavigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import PadeligaLogo from "@/components/PadeligaLogo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-10">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center">
              <PadeligaLogo size="md" showTagline={false} />
            </Link>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto pt-5 pb-4 px-4">
            <PadelNavigation />
          </div>
          <div className="flex flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 justify-between items-center">
            {session?.user && (
              <UserAccountNav 
                user={{
                  name: session.user.name || null,
                  image: session.user.image || null,
                  email: session.user.email || "",
                }}
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center bg-white dark:bg-gray-800 px-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <Link href="/dashboard" className="flex items-center">
            <PadeligaLogo size="sm" showTagline={false} />
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

      {/* Subtle accent line at bottom */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-padeliga-teal/50 to-transparent absolute bottom-0 left-0 w-full" />
    </div>
  );
}
