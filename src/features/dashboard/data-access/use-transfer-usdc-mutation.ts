import { Address, address, createTransaction, getBase58Decoder, signAndSendTransactionMessageWithSigners } from 'gill'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { toastTx } from '@/components/toast-tx'
import { useSolana } from '@/components/solana/use-solana'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useInvalidateGetUsdcBalanceQuery } from './use-invalidate-get-usdc-balance-query'

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const TOKEN_PROGRAM_ID = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const USDC_DECIMALS = 6

export function useTransferUsdcMutation({ account, address: ownerAddress }: { account: UiWalletAccount; address: Address }) {
  const { client } = useSolana()
  const signer = useWalletUiSigner({ account })
  const invalidateUsdcBalanceQuery = useInvalidateGetUsdcBalanceQuery({ address: ownerAddress })

  return useMutation({
    mutationFn: async (input: { destination: Address; amount: number }) => {
      try {
        // Get the source token account (user's USDC account)
        const sourceTokenAccounts = await client.rpc
          .getTokenAccountsByOwner(
            ownerAddress,
            { mint: USDC_MINT },
            { commitment: 'confirmed', encoding: 'jsonParsed' },
          )
          .send()

        if (!sourceTokenAccounts.value.length) {
          throw new Error('No USDC token account found')
        }

        const sourceTokenAccount = sourceTokenAccounts.value[0]?.pubkey
        if (!sourceTokenAccount) {
          throw new Error('Invalid source token account')
        }

        // Get the destination token account
        const destinationTokenAccounts = await client.rpc
          .getTokenAccountsByOwner(
            input.destination,
            { mint: USDC_MINT },
            { commitment: 'confirmed', encoding: 'jsonParsed' },
          )
          .send()

        if (!destinationTokenAccounts.value.length) {
          throw new Error('Destination does not have a USDC token account')
        }

        const destinationTokenAccount = destinationTokenAccounts.value[0]?.pubkey
        if (!destinationTokenAccount) {
          throw new Error('Invalid destination token account')
        }

        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

        // Convert amount to atomic units (USDC has 6 decimals)
        const amountInAtomicUnits = BigInt(Math.round(input.amount * Math.pow(10, USDC_DECIMALS)))

        // Create transfer checked instruction manually for Gill
        // Instruction discriminator for TransferChecked is 12
        const transferCheckedDiscriminator = new Uint8Array([12])
        const amountBytes = new Uint8Array(8)
        new DataView(amountBytes.buffer).setBigUint64(0, amountInAtomicUnits, true) // little-endian
        const decimalsBytes = new Uint8Array([USDC_DECIMALS])

        const data = new Uint8Array([
          ...transferCheckedDiscriminator,
          ...amountBytes,
          ...decimalsBytes,
        ])

        const transferInstruction = {
          programAddress: TOKEN_PROGRAM_ID,
          accounts: [
            { address: sourceTokenAccount, role: 1 }, // source (writable)
            { address: USDC_MINT, role: 0 }, // mint (readonly)
            { address: destinationTokenAccount, role: 1 }, // destination (writable)
            { address: signer.address, role: 3 }, // owner (signer + readonly)
          ],
          data,
        }

        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [transferInstruction],
        })

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const signature = getBase58Decoder().decode(signatureBytes)

        console.log('USDC transfer signature:', signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `USDC transfer failed! ${error}`)
        throw error
      }
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateUsdcBalanceQuery()
    },
    onError: (error) => {
      toast.error(`USDC transfer failed! ${error}`)
    },
  })
}
