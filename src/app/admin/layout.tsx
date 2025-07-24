
import "@/lib/globals.css";
import type { Metadata } from "next";
import { UserDropdown } from "./_components/user-dropdown";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/auth/convex-client-provider";
import { Toaster } from "@/components/ui/sonner";

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
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex justify-end w-full bg-blue-200 px-10 py-2">
          <UserDropdown />
        </div>
        <div className="flex-1 flex flex-col">
          {children}
          <Toaster />
        </div>
      </div>
     </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
