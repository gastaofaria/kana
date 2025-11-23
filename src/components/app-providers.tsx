'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import React from 'react'
import { WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { ReactQueryProvider } from './react-query-provider'

const config = getDefaultConfig({
  appName: 'Kana',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [base],
  ssr: true,
})

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <WagmiProvider config={config}>
      <ReactQueryProvider>
        <RainbowKitProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </ReactQueryProvider>
    </WagmiProvider>
  )
}
