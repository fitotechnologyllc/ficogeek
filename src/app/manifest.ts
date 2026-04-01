import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FICO Geek - Smart Credit Dispute Tools',
    short_name: 'FICO Geek',
    description: 'Sovereign credit dispute and document workspace for professionals and individuals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000615',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      }
    ],
  }
}
