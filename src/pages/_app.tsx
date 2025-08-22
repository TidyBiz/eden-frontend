import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { EdenMarketBackendProvider } from '@/contexts/backend'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EdenMarketBackendProvider>
      <Toaster />
      <Component {...pageProps} />
    </EdenMarketBackendProvider>
  )
}
