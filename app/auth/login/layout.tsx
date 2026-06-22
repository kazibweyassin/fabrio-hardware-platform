import { buildPageMetadata } from '@/lib/seo'

export const metadata = buildPageMetadata({
  title: 'Sign In',
  description: 'Sign in to your Fabrio Hardware B2B account to manage orders, quotes, and bulk pricing.',
  path: '/auth/login',
  noIndex: true,
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}