import type { Metadata } from "next";
import "@/lib/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/auth/convex-client-provider";

export const metadata: Metadata = {
  title: "FilipiKnow-Authentication",
  description: "Authentication Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased flex`} suppressHydrationWarning>
              {children}
            </body>
        </html>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
