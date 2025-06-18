import type { Metadata } from "next";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/auth/convex-client-provider";
import SideBarNav from "@/components/side-bar-nav";
import { TeacherSideNav } from "@/components/side-nav";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
          <body className={`antialiased flex max-h-screen`} suppressHydrationWarning>
            <SidebarProvider>
              <TeacherSideNav/>
              {children}
            </SidebarProvider>
          </body>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
