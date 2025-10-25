'use client'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { ReactNode } from 'react'
import { DashboardUiDepositDialog } from './dashboard-ui-deposit-dialog'
import { DashboardUiEarningsDisplay } from './dashboard-ui-earnings-display'

interface DashboardUiYieldCardProps {
  tokenSymbol: string
  tokenIcon: string
  yieldDisplay: ReactNode
  usdcBalance: number
  disabled?: boolean
}

export function DashboardUiYieldCard({
  tokenSymbol,
  tokenIcon,
  yieldDisplay,
  usdcBalance,
  disabled = false,
}: DashboardUiYieldCardProps) {
  console.log('yieldDisplay', yieldDisplay)
  return (
    <Card className={disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}>
      <CardHeader>
        <CardTitle
          className={
            disabled ? 'flex items-center gap-2' : 'group-hover:text-primary transition-colors flex items-center gap-2'
          }
        >
          <Image src={tokenIcon} alt={tokenSymbol} width={24} height={24} />
          {tokenSymbol}
        </CardTitle>
        <CardAction>
          <DashboardUiDepositDialog usdcBalance={usdcBalance} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-4">
          {yieldDisplay}
          <div className="ml-auto">
            <DashboardUiEarningsDisplay />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
