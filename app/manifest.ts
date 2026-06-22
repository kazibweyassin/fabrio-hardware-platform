import type { MetadataRoute } from 'next'
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Fabrio',
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a3a6b',
    icons: [
      {
        src: '/fabrio-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}