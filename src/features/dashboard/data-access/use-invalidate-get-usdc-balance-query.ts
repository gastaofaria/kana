import type { Address } from 'gill'
import { useQueryClient } from '@tanstack/react-query'
import { useGetUsdcBalanceQueryKey } from './use-get-usdc-balance-query-key'

export function useInvalidateGetUsdcBalanceQuery({ address }: { address: Address }) {
  const queryClient = useQueryClient()
  const queryKey = useGetUsdcBalanceQueryKey({ address })
  return async () => {
    await queryClient.invalidateQueries({ queryKey })
  }
}
