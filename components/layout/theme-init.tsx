'use client'

import { useEffect } from 'react'

export default function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('fabrio-theme')
    const prefersDark =
      stored === 'dark' ||
      (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  return null
}