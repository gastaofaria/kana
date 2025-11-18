'use client'

import { DashboardUiUsdcYieldDisplay } from './dashboard-ui-usdc-yield-display'
import { DashboardUiYieldCard } from './dashboard-ui-yield-card'

interface DashboardUiYieldCardsProps {
  depositedBalance: number
  isLoading: boolean
}

export function DashboardUiYieldCards({ depositedBalance, isLoading }: DashboardUiYieldCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <DashboardUiYieldCard
        tokenSymbol="USDC"
        tokenIcon="/tokens/usdc.png"
        yieldDisplay={<DashboardUiUsdcYieldDisplay />}
        depositedBalance={depositedBalance}
        isLoading={isLoading}
      />
    </div>
  )
}
