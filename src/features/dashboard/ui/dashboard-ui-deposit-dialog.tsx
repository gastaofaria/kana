'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

export function DashboardUiDepositDialog() {
  const [depositAmount, setDepositAmount] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const { address } = useAccount()

  // TODO: Implement USDC balance query for Base
  const usdcBalance = 0
  const depositedBalance = 0

  const handleDeposit = async () => {
    if (!address || !isValidAmount()) {
      return
    }

    const amount = parseFloat(depositAmount)

    // TODO: Implement deposit logic
    console.log('Recording deposit:', {
      walletAddress: address,
      amount,
    })

    toast.success('Deposit recorded successfully')
    setIsDialogOpen(false)
    setDepositAmount('')
  }

  const handleWithdraw = async () => {
    if (!address || !isValidAmount()) {
      return
    }

    const amount = parseFloat(depositAmount)

    console.log('Processing withdrawal:', {
      walletAddress: address,
      amount,
    })

    toast.success('Withdrawal processed successfully')
    setIsDialogOpen(false)
    setDepositAmount('')
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
            disabled={!isValidAmount()}
            className="w-full"
          >
            {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
