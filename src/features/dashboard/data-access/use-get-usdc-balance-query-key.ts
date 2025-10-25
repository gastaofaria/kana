import type { Address } from 'gill'
import { useSolana } from '@/components/solana/use-solana'

export function useGetUsdcBalanceQueryKey({ address }: { address: Address }) {
  const { cluster } = useSolana()

  return ['get-usdc-balance', { cluster, address }]
}
