import db from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, amount, transactionSignature } = await request.json()

    if (!walletAddress || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const insertDeposit = db.prepare(`
      INSERT INTO deposits (wallet_address, amount, transaction_signature)
      VALUES (?, ?, ?)
    `)

    const upsertUser = db.prepare(`
      INSERT INTO users (wallet_address, total_deposits)
      VALUES (?, ?)
      ON CONFLICT(wallet_address)
      DO UPDATE SET
        total_deposits = total_deposits + excluded.total_deposits,
        updated_at = strftime('%s', 'now')
    `)

    const transaction = db.transaction((walletAddress: string, amount: number, transactionSignature: string) => {
      upsertUser.run(walletAddress, amount)
      insertDeposit.run(walletAddress, amount, transactionSignature)
    })

    transaction(walletAddress, amount, transactionSignature)

    const user = db.prepare('SELECT * FROM users WHERE wallet_address = ?').get(walletAddress)

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error recording deposit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const user = db.prepare('SELECT * FROM users WHERE wallet_address = ?').get(walletAddress) as
      | {
          wallet_address: string
          total_deposits: number
          created_at: number
          updated_at: number
        }
      | undefined

    const deposits = db
      .prepare('SELECT * FROM deposits WHERE wallet_address = ? ORDER BY created_at DESC')
      .all(walletAddress)

    if (!user) {
      return NextResponse.json({
        data: {
          wallet_address: walletAddress,
          total_deposits: 0,
          deposits: [],
        },
      })
    }

    return NextResponse.json({
      data: {
        ...user,
        deposits,
      },
    })
  } catch (error) {
    console.error('Error fetching deposits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
