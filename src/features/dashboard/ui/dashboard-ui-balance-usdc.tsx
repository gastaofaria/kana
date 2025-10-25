export function DashboardUiBalanceUsdc({ balance }: { balance: bigint }) {
  const usdcAmount = Number(balance) / 1_000_000

  return <span>{usdcAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
}
