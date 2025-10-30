'use client'
import { ThemeSelect } from '@/components/theme-select'
import { Button } from '@/components/ui/button'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

// const ClusterDropdown = dynamic(() => import('@/components/cluster-dropdown').then((m) => m.ClusterDropdown), {
//   ssr: false,
// })

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="relative z-50 px-4 py-2">
      <div className="mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/1.-Logo-Website-min.webp"
            alt="Kana Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <div className="hidden md:flex items-center gap-4">
          <WalletDropdown />
          {/* <ClusterDropdown /> */}
          {/* <ThemeSelect /> */}
        </div>

        {showMenu && (
          <div className="md:hidden fixed inset-x-0 top-[52px] bottom-0 bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur-sm">
            <div className="flex flex-col p-4 gap-4 border-t dark:border-neutral-800">
              <div className="flex justify-end items-center gap-4">
                <WalletDropdown />
                {/* <ClusterDropdown /> */}
                {/* <ThemeSelect /> */}
              </div>
              <ul className="flex flex-col gap-4">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      className={`block text-lg py-2  ${isActive(path) ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground`}
                      href={path}
                      onClick={() => setShowMenu(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
