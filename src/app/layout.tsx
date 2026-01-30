import "@/styles/globals.css"
import { EdenMarketBackendProvider } from "@/contexts/backend"
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
    <html lang="es" className={`${chewy.variable} ${nunito.variable}`}>
      <body className={nunito.variable}>
        <EdenMarketBackendProvider>
          <Toaster />
          {children}
        </EdenMarketBackendProvider>
      </body>
    </html>
  )
}
