import { createSolanaMainnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react'
import { WalletUiGillProvider } from '@wallet-ui/react-gill'
import { ReactNode } from 'react'
import { solanaMobileWalletAdapter } from './solana-mobile-wallet-adapter'

const config = createWalletUiConfig({
  clusters: [createSolanaMainnet(process.env.NEXT_PUBLIC_RPC)],
})

solanaMobileWalletAdapter({ clusters: config.clusters })

export function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <WalletUi config={config}>
      <WalletUiGillProvider>{children}</WalletUiGillProvider>
    </WalletUi>
  )
}
