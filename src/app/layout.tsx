import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { RegisterSW } from "./register-sw";
import { ReactNode, Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Customer Management Dashboard",
  description: "Manage your streaming service customers",
  generator: "v0.dev",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BT Admin",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.svg", sizes: "192x192" }],
  },
} as const;

export const viewport = {
  themeColor: "#0b0b0f",
} as const;

export default async function asyncRootLayout({ children }: { children: ReactNode }) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <NuqsAdapter>{children}</NuqsAdapter>
            </ThemeProvider>
          </Suspense>
          <Toaster />
          <RegisterSW />
        </body>
      </html>
    </ClerkProvider>
  );
}
