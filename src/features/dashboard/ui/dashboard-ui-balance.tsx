import { DashboardUiBalanceUsdc } from './dashboard-ui-balance-usdc'

export function DashboardUiBalance({ address }: { address: string }) {
  // TODO: Implement USDC balance query for Base
  const balance = 0n

  return (
    <div className="text-2xl font-bold cursor-pointer">
      $<DashboardUiBalanceUsdc balance={balance} />
    </div>
  )
}
