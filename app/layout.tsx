import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SiteChrome from '@/components/layout/site-chrome'
import ThemeInit from '@/components/layout/theme-init'
import { getAppUrl } from '@/lib/env'
import {
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
} from '@/lib/seo'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  ...buildPageMetadata({
    title: SITE_TAGLINE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    keywords: DEFAULT_KEYWORDS,
  }),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  icons: {
    icon: '/fabrio-logo.png',
    apple: '/fabrio-logo.png',
  },
  manifest: '/manifest.webmanifest',
  category: 'shopping',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeInit />
        <SiteChrome>
          <main className="min-h-screen">{children}</main>
        </SiteChrome>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-sm font-medium',
            style: {
              borderRadius: '12px',
              border: '1px solid oklch(0.91 0.008 250)',
              boxShadow: '0 8px 24px oklch(0.2 0.02 250 / 0.1)',
            },
            success: {
              iconTheme: { primary: 'oklch(0.55 0.15 145)', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: 'oklch(0.55 0.2 25)', secondary: 'white' },
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}