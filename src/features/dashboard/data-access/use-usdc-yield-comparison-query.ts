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

async function fetchJupiterRate() {
  const response = await fetch('https://lite-api.jup.ag/lend/v1/earn/tokens')
  if (!response.ok) {
    throw new Error('Failed to fetch Jupiter rates')
  }

  const data = await response.json()
  const usdcToken = data.find((token: any) => token.symbol === 'USDC' || token.name.includes('USDC'))

  if (!usdcToken) {
    throw new Error('USDC token not found in Jupiter API')
  }

  return {
    protocol: 'Jupiter' as const,
    naturalAPY: usdcToken.supplyRate / 100,
    incentivesAPY: usdcToken.rewardsRate / 100,
    totalAPY: usdcToken.totalRate / 100,
  }
}

async function fetchKaminoRate() {
  const response = await fetch(
    'https://api.kamino.finance/kvaults/HDsayqAsDWy3QvANGqh2yNraqcD8Fnjgh73Mhb3WRS5E/metrics'
  )
  if (!response.ok) {
    throw new Error('Failed to fetch Kamino rates')
  }

  const data = await response.json()
  const naturalAPY = Number((data.apy * 100).toFixed(2))
  const incentivesAPY = Number((data.apyIncentives * 100).toFixed(2))

  return {
    protocol: 'Kamino' as const,
    naturalAPY,
    incentivesAPY,
    totalAPY: naturalAPY + incentivesAPY,
  }
}

export function useUsdcYieldComparisonQuery() {
  return useQuery({
    queryKey: ['usdc-yield-comparison'],
    queryFn: async (): Promise<YieldComparison> => {
      const [jupiter, kamino] = await Promise.all([
        fetchJupiterRate(),
        fetchKaminoRate(),
      ])

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
