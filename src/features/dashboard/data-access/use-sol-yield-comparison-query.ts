import { useQuery } from '@tanstack/react-query'

interface YieldData {
  protocol: 'Jupiter' | 'Kamino'
  naturalAPY: number
  incentivesAPY: number
  totalAPY: number
}

interface YieldComparison {
  jupiter: YieldData
  kamino: YieldData
  bestProtocol: 'Jupiter' | 'Kamino'
  bestTotalAPY: number
  difference: number
}

interface JupiterToken {
  address: string
  chainId: string
  name: string
  symbol: string
  decimals: number
  logoUrl: string
  price: string
  coingeckoId: string
  supplyRate: number
  rewardsRate: number
  totalRate: number
}

async function fetchJupiterRate() {
  const response = await fetch('https://lite-api.jup.ag/lend/v1/earn/tokens')
  if (!response.ok) {
    throw new Error('Failed to fetch Jupiter rates')
  }

  const data = (await response.json()) as JupiterToken[]
  const wsolToken = data.find((token) => token.symbol === 'WSOL' || token.name.includes('WSOL'))

  if (!wsolToken) {
    throw new Error('WSOL token not found in Jupiter API')
  }

  return {
    protocol: 'Jupiter' as const,
    naturalAPY: wsolToken.supplyRate / 100,
    incentivesAPY: wsolToken.rewardsRate / 100,
    totalAPY: wsolToken.totalRate / 100,
  }
}

async function fetchKaminoRate() {
  const response = await fetch('https://api.kamino.finance/kvaults/QAYtEKciq4gc42K683rTaWu3JxqceA7JkEkZxwWUWBo/metrics')
  if (!response.ok) {
    throw new Error('Failed to fetch Kamino rates')
  }

  const data = await response.json()
  const naturalAPY = Number((data.apy * 100).toFixed(2))
  const incentivesAPY = Number((data.apyReservesIncentives * 100).toFixed(2))

  return {
    protocol: 'Kamino' as const,
    naturalAPY,
    incentivesAPY,
    totalAPY: naturalAPY + incentivesAPY,
  }
}

export function useSolYieldComparisonQuery() {
  return useQuery({
    queryKey: ['sol-yield-comparison'],
    queryFn: async (): Promise<YieldComparison> => {
      const [jupiter, kamino] = await Promise.all([fetchJupiterRate(), fetchKaminoRate()])

      const bestProtocol = jupiter.totalAPY > kamino.totalAPY ? 'Jupiter' : 'Kamino'
      const bestTotalAPY = Math.max(jupiter.totalAPY, kamino.totalAPY)
      const difference = Math.abs(jupiter.totalAPY - kamino.totalAPY)

      return {
        jupiter,
        kamino,
        bestProtocol,
        bestTotalAPY,
        difference,
      }
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  })
}
