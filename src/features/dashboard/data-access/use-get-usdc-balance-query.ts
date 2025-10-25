import type { Address } from 'gill'
import { address } from 'gill'
import { useQuery } from '@tanstack/react-query'
import { useSolana } from '@/components/solana/use-solana'
import { useGetUsdcBalanceQueryKey } from './use-get-usdc-balance-query-key'

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

export function useGetUsdcBalanceQuery({ address: ownerAddress }: { address: Address }) {
  const { client } = useSolana()

  return useQuery({
    retry: false,
    queryKey: useGetUsdcBalanceQueryKey({ address: ownerAddress }),
    queryFn: async () => {
      const tokenAccounts = await client.rpc
        .getTokenAccountsByOwner(
          ownerAddress,
          { mint: USDC_MINT },
          { commitment: 'confirmed', encoding: 'jsonParsed' },
        )
        .send()

      if (!tokenAccounts.value.length) {
        return { value: 0n }
      }

      const balance = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.amount
      return { value: BigInt(balance ?? 0) }
    },
  })
}
