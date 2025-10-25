'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUsdcYieldComparisonQuery } from '../data-access/use-usdc-yield-comparison-query'

export function DashboardUiUsdcYieldDisplay() {
  const { data, isLoading, isError } = useUsdcYieldComparisonQuery()

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
                  USDC APY: {data[data.bestProtocol.toLowerCase() as 'jupiter' | 'kamino'].naturalAPY.toFixed(2)}%
                </div>
                <div className="text-xs">
                  {data.bestProtocol === 'Jupiter' ? 'USDC' : 'KMNO'} Rewards:{' '}
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

{
  /* <div className="space-y-1">
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
        </div> */
}

{
  /* <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Advantage</div>
          <div className="font-semibold text-primary">+{data.difference.toFixed(2)}%</div>
        </div> */
}

{
  /* <div className="pt-4 border-t space-y-2">
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
      </div> */
}
