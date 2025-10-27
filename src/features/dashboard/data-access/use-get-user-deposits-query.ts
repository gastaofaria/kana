import { useQuery } from '@tanstack/react-query'

interface UseGetUserDepositsQueryParams {
  walletAddress?: string
}

export function useGetUserDepositsQuery({ walletAddress }: UseGetUserDepositsQueryParams) {
  return useQuery({
    queryKey: ['user-deposits', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      const response = await fetch(`/api/deposits?walletAddress=${encodeURIComponent(walletAddress)}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch deposits')
      }

      const result = await response.json()
      return result.data
    },
    enabled: !!walletAddress,
    refetchInterval: 30000,
  })
}
