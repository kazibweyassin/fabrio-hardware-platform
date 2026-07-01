'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'default' | 'sidebar'
  className?: string
}

export default function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('fabrio-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex items-center justify-center rounded-xl border transition-colors touch-target',
        variant === 'sidebar'
          ? 'w-10 h-10 border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent/60'
          : 'w-11 h-11 border-border bg-surface hover:bg-muted text-foreground focus-ring',
        className
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}