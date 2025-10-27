import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface WithdrawParams {
  walletAddress: string
  amount: number
}

export function useWithdrawMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['withdraw'],
    mutationFn: async ({ walletAddress, amount }: WithdrawParams) => {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          amount,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process withdrawal')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-deposits'] })
      queryClient.invalidateQueries({ queryKey: ['get-usdc-balance'] })
      toast.success('Withdrawal processed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process withdrawal')
    },
  })
}
