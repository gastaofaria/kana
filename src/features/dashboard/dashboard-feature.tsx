'use client'

import { AppHero } from '@/components/app-hero'
import { useSolana } from '@/components/solana/use-solana'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { WalletDropdown } from '@/components/wallet-dropdown'
import Image from 'next/image'
import { useGetUserDepositsQuery } from './data-access/use-get-user-deposits-query'
import { DashboardUiYieldCards } from './ui/dashboard-ui-yield-cards'

export default function DashboardFeature() {
  const { connected, account } = useSolana()
  const userDepositsQuery = useGetUserDepositsQuery({ walletAddress: account?.address })
  const depositedBalance = userDepositsQuery.data?.total_deposits || 0
  const isLoading = userDepositsQuery.isLoading

  return (
    <>
      <AppHero
        title={
          <div className="flex flex-col items-center gap-4">
            <Image src="/mascot.jpg" alt="Kana Mascot" width={200} height={200} className="rounded-full" />
          </div>
        }
        subtitle="Maximize your investments with one click"
      />
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
                {isLoading ? (
                  <CardTitle className="group-hover:text-primary transition-colors text-2xl font-bold cursor-pointer">
                    <Spinner className="size-6" />
                  </CardTitle>
                ) : (
                  <>
                    <CardTitle className="group-hover:text-primary transition-colors text-2xl font-bold cursor-pointer">
                      {isLoading ? <Spinner className="size-6" /> : `$${depositedBalance.toFixed(2)}`}
                    </CardTitle>
                    <CardDescription>
                      You&apos;ve earned <span className="text-primary font-semibold">$0</span> so far
                    </CardDescription>
                  </>
                )}
              </CardHeader>
            </Card>
          </div>
          <div className="mt-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <DashboardUiYieldCards depositedBalance={depositedBalance} isLoading={isLoading} />
          </div>
        </>
      )}
    </>
  )
}
