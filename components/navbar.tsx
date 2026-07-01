'use client'

import { useSession, signOut } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { ShoppingCart, Menu, X, Search, User, ChevronDown, Heart } from 'lucide-react'
import Image from 'next/image'
import MiniCart from '@/components/cart/mini-cart'
import ThemeToggle from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/products', label: 'Catalog' },
  { href: '/products?category=safety-&-ppe', label: 'Safety & PPE' },
  { href: '/products?category=power-tools', label: 'Power Tools' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setIsOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-border/60" style={{ boxShadow: 'var(--shadow-nav)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.25rem] gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <Image
                src="/fabrio-logo.png"
                alt="Fabrio Hardware"
                width={44}
                height={44}
                className="w-11 h-11 transition-transform group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-none tracking-tight text-foreground">Fabrio</div>
              <div className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase mt-0.5">
                Industrial Supply
              </div>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, SKU, categories..."
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-surface text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/40"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent/80 px-3 py-1.5 rounded-lg bg-accent/10"
              >
                Admin
              </Link>
            )}

            {session?.user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{session.user.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="gradient-brand text-brand-foreground border-0 shadow-sm font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {session?.user && (
              <Link
                href="/wishlist"
                className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-surface hover:bg-muted transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 text-foreground" />
              </Link>
            )}

            <ThemeToggle className="hidden sm:flex" />

            <MiniCart />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-surface focus-ring"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-5 pt-2 border-t border-border/60 animate-fade-in max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-surface text-sm"
                />
              </div>
            </form>
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              {session?.user ? (
                <>
                  <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  <Link href="/account" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted">
                    My Account
                  </Link>
                  {session.user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground text-center mt-2">
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}