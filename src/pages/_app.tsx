import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { EdenMarketBackendProvider } from '@/contexts/backend'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EdenMarketBackendProvider>
      <Component {...pageProps} />
    </EdenMarketBackendProvider>
  )
}
