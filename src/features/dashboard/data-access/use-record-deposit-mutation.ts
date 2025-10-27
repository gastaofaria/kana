import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface RecordDepositParams {
  walletAddress: string
  amount: number
  transactionSignature?: string
}

export function useRecordDepositMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['record-deposit'],
    mutationFn: async ({ walletAddress, amount, transactionSignature }: RecordDepositParams) => {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          amount,
          transactionSignature,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to record deposit')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-deposits'] })
      toast.success('Deposit recorded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record deposit')
    },
  })
}
