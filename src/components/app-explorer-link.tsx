import { useChainId } from 'wagmi'
import { ArrowUpRightFromSquare } from 'lucide-react'

type ExplorerLinkProps = {
  className?: string
  label: string
  path: string
  type: 'address' | 'tx' | 'block'
}

function getExplorerUrl(chainId: number, type: string, path: string): string {
  const explorers: Record<number, string> = {
    8453: 'https://basescan.org',
  }

  const baseUrl = explorers[chainId] || 'https://basescan.org'
  return `${baseUrl}/${type}/${path}`
}

export function AppExplorerLink({
  className,
  label = '',
  path,
  type,
}: ExplorerLinkProps) {
  const chainId = useChainId()

  return (
    <a
      href={getExplorerUrl(chainId, type, path)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono inline-flex gap-1`}
    >
      {label}
      <ArrowUpRightFromSquare size={12} />
    </a>
  )
}
