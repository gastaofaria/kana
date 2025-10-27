'use client'

import { DashboardUiSolYieldDisplay } from './dashboard-ui-sol-yield-display'
import { DashboardUiUsdcYieldDisplay } from './dashboard-ui-usdc-yield-display'
import { DashboardUiYieldCard } from './dashboard-ui-yield-card'

interface DashboardUiYieldCardsProps {
  depositedBalance: number
  isLoading: boolean
}

export function DashboardUiYieldCards({ depositedBalance, isLoading }: DashboardUiYieldCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DashboardUiYieldCard
        tokenSymbol="USDC"
        tokenIcon="/tokens/usdc.png"
        yieldDisplay={<DashboardUiUsdcYieldDisplay />}
        depositedBalance={depositedBalance}
        isLoading={isLoading}
      />

      <DashboardUiYieldCard
        tokenSymbol="SOL"
        tokenIcon="/tokens/sol.png"
        yieldDisplay={<DashboardUiSolYieldDisplay />}
        disabled
      />
    </div>
  )
}
