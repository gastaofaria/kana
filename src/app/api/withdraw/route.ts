import { sql, initializeDatabase } from '@/lib/db-postgres'
import { NextRequest, NextResponse } from 'next/server'
import { address, createTransaction } from 'gill'

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const TOKEN_PROGRAM_ID = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const USDC_DECIMALS = 6
const DESTINATION_ADDRESS = address('E9y3X4EqLZuMj4zHvmULrihhPzZKiCzu2v98KkzrrQzb')

// Initialize database on first request
let dbInitialized = false
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase()
    dbInitialized = true
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized()

    const { walletAddress, amount } = await request.json()

    if (!walletAddress || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Check if user has enough shares and calculate withdrawable amount
    const userResult = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `
    const user = userResult[0] as
      | {
          wallet_address: string
          total_deposits: number
          shares: number
        }
      | undefined

    if (!user || Number(user.shares) === 0) {
      return NextResponse.json({ error: 'No shares to withdraw' }, { status: 400 })
    }

    // Get pool state to calculate withdrawable amount
    const poolStateResult = await sql`
      SELECT * FROM pool_state WHERE id = 1
    `
    const poolState = poolStateResult[0] as {
      total_shares: number
      total_assets: number
    }

    // Calculate maximum withdrawable amount based on shares
    // withdrawableAmount = userShares * totalAssets / totalShares
    const maxWithdrawable = (Number(user.shares) * Number(poolState.total_assets)) / Number(poolState.total_shares)

    if (amount > maxWithdrawable) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          maxWithdrawable,
        },
        { status: 400 },
      )
    }

    // Get private key from environment
    const privateKeyString = process.env.NEXT_PRIVATE_KEY
    if (!privateKeyString) {
      console.error('NEXT_PRIVATE_KEY not found in environment')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Import required modules
    const { createSolanaRpc, createKeyPairSignerFromBytes } = await import('gill')

    // Create RPC client using environment variable or fallback to mainnet
    const rpcUrl = process.env.NEXT_PUBLIC_RPC || 'https://api.mainnet-beta.solana.com'
    const client = createSolanaRpc(rpcUrl)

    // Decode base58 private key from Phantom and create keypair signer
    const bs58 = await import('bs58')
    const privateKeyBytes = bs58.default.decode(privateKeyString)

    // Create signer with the keypair bytes (should be 64 bytes for ed25519)
    const signer = await createKeyPairSignerFromBytes(privateKeyBytes, true)

    // Get the source token account (destination address's USDC account)
    const sourceTokenAccounts = await client
      .getTokenAccountsByOwner(
        DESTINATION_ADDRESS,
        { mint: USDC_MINT },
        { commitment: 'confirmed', encoding: 'jsonParsed' },
      )
      .send()

    if (!sourceTokenAccounts.value.length) {
      return NextResponse.json({ error: 'No USDC token account found for destination address' }, { status: 500 })
    }

    const sourceTokenAccount = sourceTokenAccounts.value[0]?.pubkey
    if (!sourceTokenAccount) {
      return NextResponse.json({ error: 'Invalid source token account' }, { status: 500 })
    }

    // Get the destination token account (user's USDC account)
    const userAddress = address(walletAddress)
    const destinationTokenAccounts = await client
      .getTokenAccountsByOwner(userAddress, { mint: USDC_MINT }, { commitment: 'confirmed', encoding: 'jsonParsed' })
      .send()

    if (!destinationTokenAccounts.value.length) {
      return NextResponse.json({ error: 'User does not have a USDC token account' }, { status: 400 })
    }

    const destinationTokenAccount = destinationTokenAccounts.value[0]?.pubkey
    if (!destinationTokenAccount) {
      return NextResponse.json({ error: 'Invalid destination token account' }, { status: 500 })
    }

    const { value: latestBlockhash } = await client.getLatestBlockhash({ commitment: 'confirmed' }).send()

    // Convert amount to atomic units (USDC has 6 decimals)
    const amountInAtomicUnits = BigInt(Math.round(amount * Math.pow(10, USDC_DECIMALS)))

    // Create transfer checked instruction
    const transferCheckedDiscriminator = new Uint8Array([12])
    const amountBytes = new Uint8Array(8)
    new DataView(amountBytes.buffer).setBigUint64(0, amountInAtomicUnits, true)
    const decimalsBytes = new Uint8Array([USDC_DECIMALS])

    const data = new Uint8Array([...transferCheckedDiscriminator, ...amountBytes, ...decimalsBytes])

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

    // Sign the transaction
    const { signTransactionMessageWithSigners } = await import('gill')
    const signedTransaction = await signTransactionMessageWithSigners(transaction)

    // Send the signed transaction
    const { getBase64EncodedWireTransaction } = await import('gill')
    const encodedTransaction = getBase64EncodedWireTransaction(signedTransaction)

    const sendResult = await client
      .sendTransaction(encodedTransaction, {
        encoding: 'base64',
        skipPreflight: false,
        maxRetries: 3n,
      })
      .send()

    const signature = sendResult

    // Update database - burn shares, update pool state, and record withdrawal
    // Get current pool state
    const currentPoolStateResult = await sql`
      SELECT * FROM pool_state WHERE id = 1
    `
    const currentPoolState = currentPoolStateResult[0] as { total_shares: number; total_assets: number }

    // Calculate shares to burn
    // sharesToBurn = amount * totalShares / totalAssets
    const sharesToBurn = Math.floor(
      (amount * Number(currentPoolState.total_shares)) / Number(currentPoolState.total_assets),
    )

    // Update pool state
    const newTotalShares = Number(currentPoolState.total_shares) - sharesToBurn
    const newTotalAssets = Number(currentPoolState.total_assets) - amount

    await sql`
      UPDATE pool_state
      SET total_shares = ${newTotalShares}, total_assets = ${newTotalAssets}
      WHERE id = 1
    `

    // Update user
    await sql`
      UPDATE users
      SET total_deposits = total_deposits - ${amount},
          shares = shares - ${sharesToBurn},
          updated_at = EXTRACT(EPOCH FROM NOW())
      WHERE wallet_address = ${walletAddress}
    `

    // Insert withdrawal record (negative amount to indicate withdrawal)
    await sql`
      INSERT INTO deposits (wallet_address, amount, transaction_signature)
      VALUES (${walletAddress}, ${-amount}, ${signature})
    `

    return NextResponse.json({
      success: true,
      signature,
    })
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
