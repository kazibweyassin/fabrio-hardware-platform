'use client'

import { useEffect } from 'react'

export default function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('fabrio-theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return null
}