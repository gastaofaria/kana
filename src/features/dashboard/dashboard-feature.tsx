'use client'

import { AppHero } from '@/components/app-hero'
import { useAccount } from 'wagmi'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import { DashboardUiYieldCards } from './ui/dashboard-ui-yield-cards'

export default function DashboardFeature() {
  const { isConnected } = useAccount()
  const depositedBalance = 0
  const isLoading = false

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
      {!isConnected ? (
        <div className="flex justify-center py-16">
          <ConnectButton />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              {isLoading ? (
                <CardTitle className="group-hover:text-primary transition-colors text-2xl font-bold cursor-pointer">
                  {/* <Spinner className="size-6" /> */}
                </CardTitle>
              ) : (
                <>
                  <CardTitle className="group-hover:text-primary transition-colors text-2xl font-bold cursor-pointer">
                    {/* {isLoading ? 
                    <Spinner className="size-6" /> 
                    : */}
                    {`$${depositedBalance.toFixed(2)}`}
                  </CardTitle>
                  <CardDescription>
                    You&apos;ve earned <span className="text-primary font-semibold">$0</span> so far
                  </CardDescription>
                </>
              )}
            </CardHeader>
          </Card>
          <div className="mt-8">
            <DashboardUiYieldCards depositedBalance={depositedBalance} isLoading={isLoading} />
          </div>
        </div>
      )}
    </>
  )
}
