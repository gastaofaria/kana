'use client'

import { useSolana } from '@/components/solana/use-solana'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { address } from 'gill'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { useGetUsdcBalanceQuery } from '../data-access/use-get-usdc-balance-query'
import { useTransferUsdcMutation } from '../data-access/use-transfer-usdc-mutation'
import { useRecordDepositMutation } from '../data-access/use-record-deposit-mutation'
import { useGetUserDepositsQuery } from '../data-access/use-get-user-deposits-query'
import { useWithdrawMutation } from '../data-access/use-withdraw-mutation'

const DESTINATION_ADDRESS = address('E9y3X4EqLZuMj4zHvmULrihhPzZKiCzu2v98KkzrrQzb')

export function DashboardUiDepositDialog() {
  const [depositAmount, setDepositAmount] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const { account } = useSolana()

  const usdcBalanceQuery = useGetUsdcBalanceQuery({ address: account?.address! })
  const usdcBalance = usdcBalanceQuery.data?.value ? Number(usdcBalanceQuery.data.value) / 1_000_000 : 0

  const userDepositsQuery = useGetUserDepositsQuery({ walletAddress: account?.address })
  const depositedBalance = userDepositsQuery.data?.total_deposits || 0

  const transferUsdcMutation = useTransferUsdcMutation({ account: account!, address: account?.address! })
  const recordDepositMutation = useRecordDepositMutation()
  const withdrawMutation = useWithdrawMutation()

  const handleDeposit = async () => {
    if (!account?.address || !isValidAmount()) {
      return
    }

    const amount = parseFloat(depositAmount)

    try {
      // First, verify the backend is accessible by doing a pre-check
      const preCheckResponse = await fetch(`/api/deposits?walletAddress=${encodeURIComponent(account.address)}`)
      if (!preCheckResponse.ok) {
        toast.error('Backend service is unavailable. Please try again later.')
        return
      }

      // Now proceed with the blockchain transfer
      const signature = await transferUsdcMutation.mutateAsync({
        destination: DESTINATION_ADDRESS,
        amount,
      })

      // Record the deposit in the database
      await recordDepositMutation.mutateAsync({
        walletAddress: account.address,
        amount,
        transactionSignature: signature,
      })

      setIsDialogOpen(false)
      setDepositAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
      // Error toasts are already handled by the mutations
    }
  }

  const handleWithdraw = async () => {
    if (!account?.address || !isValidAmount()) {
      return
    }

    const amount = parseFloat(depositAmount)

    try {
      await withdrawMutation.mutateAsync({
        walletAddress: account.address,
        amount,
      })

      setIsDialogOpen(false)
      setDepositAmount('')
    } catch (error) {
      console.error('Withdrawal failed:', error)
      // Error toasts are already handled by the mutation
    }
  }

  const handleSubmit = async () => {
    if (activeTab === 'deposit') {
      await handleDeposit()
    } else {
      await handleWithdraw()
    }
  }

  const isValidAmount = () => {
    const amount = parseFloat(depositAmount)
    const maxAmount = activeTab === 'deposit' ? usdcBalance : depositedBalance
    return !isNaN(amount) && amount > 0 && amount <= maxAmount
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Manage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-4 relative">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`pb-2 font-medium transition-colors relative ${
                activeTab === 'deposit' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Deposit
              {activeTab === 'deposit' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`pb-2 font-medium transition-colors relative ${
                activeTab === 'withdraw' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Withdraw
              {activeTab === 'withdraw' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
              )}
            </button>
          </DialogTitle>
        </DialogHeader>
        {/* <div className="flex gap-8 border-b relative mb-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === 'deposit' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Deposit
            {activeTab === 'deposit' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === 'withdraw' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Withdraw
            {activeTab === 'withdraw' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
            )}
          </button>
        </div> */}
        <div className="py-4">
          <Input
            type="number"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            max={activeTab === 'deposit' ? usdcBalance : depositedBalance}
            min="0"
            className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="mb-4 rounded-md border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} />
            <span className="text-sm">{activeTab === 'deposit' ? 'Available' : 'Deposited'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              {activeTab === 'deposit' ? usdcBalance.toFixed(2) : depositedBalance.toFixed(2)} USDC
            </div>
            <span
              onClick={() =>
                setDepositAmount(activeTab === 'deposit' ? usdcBalance.toFixed(2) : depositedBalance.toFixed(2))
              }
              className="text-xs text-primary hover:text-green-700 font-medium cursor-pointer"
            >
              Max
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={
              !isValidAmount() ||
              transferUsdcMutation.isPending ||
              recordDepositMutation.isPending ||
              withdrawMutation.isPending
            }
            className="w-full"
          >
            {transferUsdcMutation.isPending || recordDepositMutation.isPending || withdrawMutation.isPending
              ? 'Processing...'
              : activeTab === 'deposit'
                ? 'Deposit'
                : 'Withdraw'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
