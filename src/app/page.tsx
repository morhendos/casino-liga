"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserAccountNav } from "@/components/auth/UserAccountNav";

export default function Home() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Casino Liga
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-4">
              <Link href="/features" className="text-sm hover:underline">
                Features
              </Link>
              <Link href="/pricing" className="text-sm hover:underline">
                Pricing
              </Link>
              <Link href="/about" className="text-sm hover:underline">
                About
              </Link>
            </nav>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {session?.user ? (
                <div className="flex items-center space-x-2">
                  <Button asChild>
                    <Link href="/dashboard">
                      Dashboard
                    </Link>
                  </Button>
                  <UserAccountNav
                    user={{
                      name: session.user.name || null,
                      image: session.user.image || null,
                      email: session.user.email || "",
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" asChild>
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden px-4 py-2 border-t">
            <nav className="flex flex-col space-y-2 py-2">
              <Link href="/features" className="py-1 hover:underline">
                Features
              </Link>
              <Link href="/pricing" className="py-1 hover:underline">
                Pricing
              </Link>
              <Link href="/about" className="py-1 hover:underline">
                About
              </Link>
            </nav>
            
            <div className="flex flex-col space-y-2 py-2 border-t">
              <ThemeToggle />
              {session?.user ? (
                <>
                  <Button asChild>
                    <Link href="/dashboard">
                      Dashboard
                    </Link>
                  </Button>
                  <div className="py-1">
                    <UserAccountNav
                      user={{
                        name: session.user.name || null,
                        image: session.user.image || null,
                        email: session.user.email || "",
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Manage Your Padel League Like a Pro
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-muted-foreground">
            Organize leagues, schedule matches, track results, and keep rankings up-to-date with our all-in-one padel league management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={session ? "/dashboard" : "/signup"}>
                {session ? "Go to Dashboard" : "Get Started"}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need for Your Padel League</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"></path>
                  <path d="M10 10V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6"></path>
                  <path d="M8 10V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4"></path>
                  <path d="M18 18v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Player Profiles</h3>
              <p className="text-muted-foreground">
                Create detailed player profiles with skill levels, preferred positions, and match history.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              <p className="text-muted-foreground">
                Form teams, invite players, and organize your padel partnerships for tournaments and leagues.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"></path>
                  <path d="M15 3v4"></path>
                  <path d="M9 3v4"></path>
                  <path d="M3 9h18"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">League Scheduling</h3>
              <p className="text-muted-foreground">
                Automatically generate balanced schedules for your leagues with fair matchups and time slots.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Match Results</h3>
              <p className="text-muted-foreground">
                Record match results, track scores, and maintain a complete history of all competitions.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path>
                  <path d="M2 20h20"></path>
                  <path d="M14 12v.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rankings & Statistics</h3>
              <p className="text-muted-foreground">
                Generate automatic rankings based on match results with points, set differentials, and more.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
              <p className="text-muted-foreground">
                Get started in minutes with a user-friendly interface designed for padel enthusiasts, not tech experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Organize Your Padel League?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-muted-foreground">
            Join thousands of padel players and organizers who trust Casino Liga to run their competitions.
          </p>
          <Button size="lg" asChild>
            <Link href={session ? "/dashboard" : "/signup"}>
              {session ? "Go to Dashboard" : "Sign Up Now - It's Free"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Casino Liga. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
