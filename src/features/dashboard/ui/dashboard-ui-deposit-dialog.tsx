'use client'

import { useSolana } from '@/components/solana/use-solana'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useState } from 'react'
import { useGetUsdcBalanceQuery } from '../data-access/use-get-usdc-balance-query'

export function DashboardUiDepositDialog() {
  const [depositAmount, setDepositAmount] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { account } = useSolana()

  const usdcBalanceQuery = useGetUsdcBalanceQuery({ address: account?.address! })
  const usdcBalance = usdcBalanceQuery.data?.value ? Number(usdcBalanceQuery.data.value) / 1_000_000 : 0

  const handleDeposit = () => {
    // TODO: Implement deposit logic
    console.log('Depositing:', depositAmount)
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
        <Button>Deposit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
        </DialogHeader>
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
          <div className="text-sm font-medium">{usdcBalance.toFixed(2)} USDC</div>
        </div>
        <DialogFooter>
          <Button onClick={handleDeposit} disabled={!isValidAmount()} className="w-full">
            Deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
