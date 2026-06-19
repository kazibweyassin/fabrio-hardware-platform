'use client'

import { usePathname } from 'next/navigation'
import AnnouncementBar from '@/components/layout/announcement-bar'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isAuth = pathname.startsWith('/auth')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      {!isAuth && <AnnouncementBar />}
      {!isAuth && <Navbar />}
      {children}
      {!isAuth && <Footer />}
    </>
  )
}