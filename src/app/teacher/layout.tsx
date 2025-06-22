import { ConvexClientProvider } from "@/components/auth/convex-client-provider";
import { ClientRoleGuard } from "@/components/guards/role-check";
import { TeacherSideNav } from "@/components/side-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";

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
    <SidebarProvider>
      <TeacherSideNav />
      <ClientRoleGuard>{children}</ClientRoleGuard>
    </SidebarProvider>
  );
}
