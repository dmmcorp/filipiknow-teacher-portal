import { ConvexClientProvider } from '@/components/auth/convex-client-provider';
import { Toaster } from '@/components/ui/sonner';
import '@/lib/globals.css';
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FilipiKnow',
  description: 'This is the teacher dashboard for the FilipiKnow game',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ConvexAuthNextjsServerProvider>
        <ConvexClientProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased h-dvh bg-white`}
          >
            <Toaster />
            {children}
          </body>
        </ConvexClientProvider>
      </ConvexAuthNextjsServerProvider>
    </html>
  );
}
