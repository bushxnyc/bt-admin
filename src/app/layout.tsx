import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Customer Management Dashboard",
  description: "Manage your streaming service customers",
  generator: "v0.dev",
};

import { ReactNode, Suspense } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="resize-observer-error-handler" strategy="beforeInteractive">
          {`
            window.addEventListener('error', function(e) {
              if (e.message.includes('ResizeObserver') || e.message.includes('ResizeObserver loop')) {
                e.stopImmediatePropagation();
                console.warn('ResizeObserver error suppressed');
                return false;
              }
            });
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <NuqsAdapter>{children}</NuqsAdapter>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
