import { ClientRoleGuard } from '@/components/guards/role-check';
import '@/lib/globals.css';
import type { Metadata } from 'next';
import { Sidebar } from './_components/dashboard-sidebar';
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
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex justify-end">
        <UserDropdown />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ClientRoleGuard>{children}</ClientRoleGuard>
      </div>
    </div>
  );
}
