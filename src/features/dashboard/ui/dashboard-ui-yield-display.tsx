'use client'

import Image from 'next/image'
import { useYieldComparisonQuery } from '../data-access/use-yield-comparison-query'

export function DashboardUiYieldDisplay() {
  const { data, isLoading, isError } = useYieldComparisonQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 text-2xl font-bold">Loading...</div>
        <div className="text-sm text-muted-foreground">APY</div>
        <div className="text-sm text-muted-foreground">Protocol</div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 text-2xl font-bold text-destructive">Error loading rates</div>
        <div className="text-sm text-muted-foreground">APY</div>
        <div className="text-sm text-muted-foreground">Protocol</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <div className="text-xs text-muted-foreground mt-1">
            Natural: {data[data.bestProtocol.toLowerCase() as 'jupiter' | 'kamino'].naturalAPY.toFixed(2)}% +
            Incentives: {data[data.bestProtocol.toLowerCase() as 'jupiter' | 'kamino'].incentivesAPY.toFixed(2)}% APY
          </div>
          <div className="text-3xl font-bold text-green-600">APY: {data.bestTotalAPY.toFixed(2)}%</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Best Protocol</div>
          <div className="flex items-center gap-2 font-semibold">
            <Image
              src={data.bestProtocol === 'Jupiter' ? '/tokens/jupiter.png' : '/tokens/kamino.png'}
              alt={data.bestProtocol}
              width={20}
              height={20}
              className="rounded-full"
            />
            {data.bestProtocol}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Advantage</div>
          <div className="font-semibold text-green-600">+{data.difference.toFixed(2)}%</div>
        </div>
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">Comparison</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Image src="/tokens/jupiter.png" alt="Jupiter" width={16} height={16} className="rounded-full" />
            <span className="text-xs text-muted-foreground">Jupiter:</span>
            <span className="font-mono">{data.jupiter.totalAPY.toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/tokens/kamino.png" alt="Kamino" width={16} height={16} className="rounded-full" />
            <span className="text-xs text-muted-foreground">Kamino:</span>
            <span className="font-mono">{data.kamino.totalAPY.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
