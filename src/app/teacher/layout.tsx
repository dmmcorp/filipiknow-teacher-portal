import { ConvexClientProvider } from "@/components/auth/convex-client-provider";
import { ClientRoleGuard } from "@/components/guards/role-check";
import { TeacherSideNav } from "@/components/side-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Sidebar } from "./_components/dashboard-sidebar";

export const metadata: Metadata = {
  title: "FilipiKnow-Teacher-Portal",
  description: "Teacher Portal Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ClientRoleGuard>{children}</ClientRoleGuard>
      </div>
    </div>
  );
}
