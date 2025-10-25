'use client'

export function DashboardUiEarningsDisplay() {
  // const { data, isLoading, isError } = useUsdcYieldComparisonQuery()

  // if (isLoading) {
  //   return (
  //     <div className="grid grid-cols-2 gap-4">
  //       <div className="col-span-2 text-2xl font-bold">Loading...</div>
  //       <div className="text-sm text-muted-foreground">APY</div>
  //       <div className="text-sm text-muted-foreground">Protocol</div>
  //     </div>
  //   )
  // }

  // if (isError || !data) {
  //   return (
  //     <div className="grid grid-cols-2 gap-4">
  //       <div className="col-span-2 text-2xl font-bold text-destructive">Error loading rates</div>
  //       <div className="text-sm text-muted-foreground">APY</div>
  //       <div className="text-sm text-muted-foreground">Protocol</div>
  //     </div>
  //   )
  // }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <div>Earnings</div>
          <div className="text-3xl font-bold cursor-help w-fit">None</div>
        </div>
      </div>
    </div>
  )
}
