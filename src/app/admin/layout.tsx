import { ConvexClientProvider } from '@/components/auth/convex-client-provider';
import { AdminGuard } from '@/components/guards/admin-guard';
import { Toaster } from '@/components/ui/sonner';
import '@/lib/globals.css';
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import type { Metadata } from 'next';
import { UserDropdown } from './_components/user-dropdown';

export const metadata: Metadata = {
  title: 'FilipiKnow-Teacher-Portal',
  description: 'Teacher Portal Page',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <AdminGuard>
          <div className="flex flex-col min-h-screen ">
            <div className="flex justify-end w-full bg-blue-200 px-10 py-2">
              <UserDropdown />
            </div>
            <div className="flex-1 flex flex-col bg-gray-100">
              {children}
              <Toaster />
            </div>
          </div>
        </AdminGuard>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
