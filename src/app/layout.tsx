import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import GradientBackground from '@/components/GradientBackground';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Casino Liga - Padel League Management',
  description: 'Organize, manage, and track your padel leagues with ease',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground relative`}>
        <Providers session={session}>
          <GradientBackground />
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
