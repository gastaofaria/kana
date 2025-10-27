'use client'

import { useSolana } from '@/components/solana/use-solana'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { address } from 'gill'
import Image from 'next/image'
import { useState } from 'react'
import { useGetUsdcBalanceQuery } from '../data-access/use-get-usdc-balance-query'
import { useTransferUsdcMutation } from '../data-access/use-transfer-usdc-mutation'

const DESTINATION_ADDRESS = address('E9y3X4EqLZuMj4zHvmULrihhPzZKiCzu2v98KkzrrQzb')

export function DashboardUiDepositDialog() {
  const [depositAmount, setDepositAmount] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const { account } = useSolana()

  const usdcBalanceQuery = useGetUsdcBalanceQuery({ address: account?.address! })
  const usdcBalance = usdcBalanceQuery.data?.value ? Number(usdcBalanceQuery.data.value) / 1_000_000 : 0

  const transferUsdcMutation = useTransferUsdcMutation({ account: account!, address: account?.address! })

  const handleDeposit = async () => {
    if (!account?.address || !isValidAmount()) {
      return
    }

    const amount = parseFloat(depositAmount)

    await transferUsdcMutation.mutateAsync({
      destination: DESTINATION_ADDRESS,
      amount,
    })

    setIsDialogOpen(false)
    setDepositAmount('')
  }

  const isValidAmount = () => {
    const amount = parseFloat(depositAmount)
    return !isNaN(amount) && amount > 0 && amount <= usdcBalance
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
            max={usdcBalance}
            min="0"
            className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="mb-4 rounded-md border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} />
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{usdcBalance.toFixed(2)} USDC</div>
            <span
              onClick={() => setDepositAmount(usdcBalance.toFixed(2))}
              className="text-xs text-primary hover:text-green-700 font-medium cursor-pointer"
            >
              Max
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleDeposit}
            disabled={!isValidAmount() || transferUsdcMutation.isPending}
            className="w-full"
          >
            {transferUsdcMutation.isPending ? 'Processing...' : activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
