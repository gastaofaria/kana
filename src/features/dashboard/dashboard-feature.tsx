'use client'

import { AppHero } from '@/components/app-hero'
import { useSolana } from '@/components/solana/use-solana'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { DashboardUiYieldCards } from './ui/dashboard-ui-yield-cards'

export default function DashboardFeature() {
  const { connected } = useSolana()

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
                <CardTitle className="group-hover:text-primary transition-colors text-2xl font-bold cursor-pointer">
                  $0
                </CardTitle>
                <CardDescription>
                  You&apos;ve earned <span className="text-primary font-semibold">$0</span> so far
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <DashboardUiYieldCards />
          </div>
        </>
      )}
    </>
  )
}
