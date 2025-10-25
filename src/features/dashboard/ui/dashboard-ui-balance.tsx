import { Address } from 'gill'
import { useGetUsdcBalanceQuery } from '../data-access/use-get-usdc-balance-query'
import { DashboardUiBalanceUsdc } from './dashboard-ui-balance-usdc'

export function DashboardUiBalance({ address }: { address: Address }) {
  const query = useGetUsdcBalanceQuery({ address })

  return (
    <div className="text-2xl font-bold cursor-pointer" onClick={() => query.refetch()}>
      {query.data?.value !== undefined ? (
        <>
          $<DashboardUiBalanceUsdc balance={query.data.value} />
        </>
      ) : (
        '...'
      )}
    </div>
  )
}
