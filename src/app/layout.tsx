import "@/styles/globals.css"
import { EdenMarketBackendProvider } from "@/contexts/backend"
import { ThemeProvider } from "@/contexts/theme"
import { Toaster } from "react-hot-toast"
import type { ReactNode } from "react"
import { Chewy, Nunito } from "next/font/google"
import type { Metadata } from "next"

const chewy = Chewy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chewy",
})

const nunito = Nunito({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${chewy.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              var key = 'eden-theme';
              var stored = localStorage.getItem(key);
              var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              document.documentElement.classList.toggle('dark', dark);
            })();
            `.trim(),
          }}
        />
      </head>
      <body className={nunito.variable}>
        <ThemeProvider>
          <EdenMarketBackendProvider>
            <Toaster />
            {children}
          </EdenMarketBackendProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
