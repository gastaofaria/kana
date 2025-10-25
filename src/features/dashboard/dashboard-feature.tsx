'use client'

import { AppHero } from '@/components/app-hero'
import { useSolana } from '@/components/solana/use-solana'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { useGetUsdcBalanceQuery } from './data-access/use-get-usdc-balance-query'
import { DashboardUiBalance } from './ui/dashboard-ui-balance'
import { DashboardUiYieldCards } from './ui/dashboard-ui-yield-cards'

export default function DashboardFeature() {
  const { account, connected } = useSolana()

  const usdcBalanceQuery = useGetUsdcBalanceQuery({ address: account?.address! })
  const usdcBalance = usdcBalanceQuery.data?.value ? Number(usdcBalanceQuery.data.value) / 1_000_000 : 0

  return (
    <>
      <AppHero title="Kana 🌱" subtitle="Maximize yield with one click" />
      {!connected ? (
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <WalletDropdown />
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {account?.address ? <DashboardUiBalance address={account.address} /> : '$0'}
                </CardTitle>
                <CardDescription>You&apos;ve earned $funds so far</CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <DashboardUiYieldCards usdcBalance={usdcBalance} />
          </div>
        </>
      )}
    </>
  )
}
