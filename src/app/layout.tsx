import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode, Suspense } from "react";
import { auth } from "@clerk/nextjs/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Customer Management Dashboard",
  description: "Manage your streaming service customers",
  generator: "v0.dev",
};

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
        </body>
      </html>
    </ClerkProvider>
  );
}
