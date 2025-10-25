'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSolYieldComparisonQuery } from '../data-access/use-sol-yield-comparison-query'

export function DashboardUiSolYieldDisplay() {
  const { data, isLoading, isError } = useSolYieldComparisonQuery()

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
          <div>APY</div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-3xl font-bold text-primary cursor-help w-fit">{data.bestTotalAPY.toFixed(2)}%</div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="text-xs">
                  SOL APY: {data[data.bestProtocol.toLowerCase() as 'jupiter' | 'kamino'].naturalAPY.toFixed(2)}%
                </div>
                <div className="text-xs">
                  {data.bestProtocol === 'Jupiter' ? 'SOL' : 'KMNO'} Rewards:{' '}
                  {data[data.bestProtocol.toLowerCase() as 'jupiter' | 'kamino'].incentivesAPY.toFixed(2)}%
                </div>
                <hr className="border-t border-background/20 my-1" />
                <div className="text-xs font-semibold">Total: {data.bestTotalAPY.toFixed(2)}%</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
