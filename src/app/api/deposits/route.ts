import { sql, initializeDatabase } from '@/lib/db-postgres'
import { NextRequest, NextResponse } from 'next/server'

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

    const { walletAddress, amount, transactionSignature } = await request.json()

    if (!walletAddress || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Get current pool state
    const poolStateResult = await sql`
      SELECT * FROM pool_state WHERE id = 1
    `
    const poolState = poolStateResult[0] as { total_shares: number; total_assets: number }

    // Calculate shares to mint
    // Scale by 1e6 to handle decimal amounts (same as USDC decimals)
    let sharesToMint: number
    if (Number(poolState.total_shares) === 0) {
      // First depositor gets shares equal to deposit amount (scaled)
      sharesToMint = Math.floor(amount * 1e6)
    } else {
      // shares = amount * totalShares / totalAssets
      sharesToMint = Math.floor((amount * Number(poolState.total_shares)) / Number(poolState.total_assets))
    }

    // Update pool state
    const newTotalShares = Number(poolState.total_shares) + sharesToMint
    const newTotalAssets = Number(poolState.total_assets) + amount

    await sql`
      UPDATE pool_state
      SET total_shares = ${newTotalShares}, total_assets = ${newTotalAssets}
      WHERE id = 1
    `

    // Upsert user
    await sql`
      INSERT INTO users (wallet_address, total_deposits, shares)
      VALUES (${walletAddress}, ${amount}, ${sharesToMint})
      ON CONFLICT(wallet_address)
      DO UPDATE SET
        total_deposits = users.total_deposits + ${amount},
        shares = users.shares + ${sharesToMint},
        updated_at = EXTRACT(EPOCH FROM NOW())
    `

    // Insert deposit record
    await sql`
      INSERT INTO deposits (wallet_address, amount, transaction_signature)
      VALUES (${walletAddress}, ${amount}, ${transactionSignature})
    `

    // Fetch updated user data
    const userResult = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `
    const user = userResult[0] as {
      wallet_address: string
      total_deposits: number | string
      shares: number | string
      created_at: number
      updated_at: number
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        total_deposits: Number(user.total_deposits),
        shares: Number(user.shares),
      },
    })
  } catch (error) {
    console.error('Error recording deposit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized()

    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const userResult = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `
    const user = userResult[0] as
      | {
          wallet_address: string
          total_deposits: number
          shares: number
          created_at: number
          updated_at: number
        }
      | undefined

    const depositsResult = await sql`
      SELECT * FROM deposits WHERE wallet_address = ${walletAddress} ORDER BY created_at DESC
    `
    const deposits = (
      depositsResult as Array<{
        wallet_address: string
        amount: number | string
        transaction_signature: string
        created_at: number
      }>
    ).map((deposit) => ({
      ...deposit,
      amount: Number(deposit.amount),
    }))

    if (!user) {
      return NextResponse.json({
        data: {
          wallet_address: walletAddress,
          total_deposits: 0,
          shares: 0,
          deposits: [],
        },
      })
    }

    return NextResponse.json({
      data: {
        ...user,
        total_deposits: Number(user.total_deposits),
        shares: Number(user.shares),
        deposits,
      },
    })
  } catch (error) {
    console.error('Error fetching deposits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
