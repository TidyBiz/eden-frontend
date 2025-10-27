import "@/styles/globals.css"
import { EdenMarketBackendProvider } from "@/contexts/backend"
import { Toaster } from "react-hot-toast"
import type { ReactNode } from "react"
import { Chewy } from "next/font/google"

const chewy = Chewy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chewy",
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={chewy.variable}>
      <body>
        <EdenMarketBackendProvider>
          <Toaster />
          {children}
        </EdenMarketBackendProvider>
      </body>
    </html>
  )
}
