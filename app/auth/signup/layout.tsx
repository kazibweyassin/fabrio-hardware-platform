import { buildPageMetadata } from '@/lib/seo'

export const metadata = buildPageMetadata({
  title: 'Create B2B Account',
  description:
    'Open a Fabrio Hardware business account for volume pricing, quotations, net terms, and dedicated industrial supply support in Uganda.',
  path: '/auth/signup',
  keywords: ['B2B account Uganda', 'wholesale hardware account', 'contractor supply account'],
})

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children
}