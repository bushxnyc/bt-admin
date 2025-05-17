import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Customer Management Dashboard",
  description: "Manage your streaming service customers",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
