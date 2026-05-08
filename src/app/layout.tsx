import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maya Bar à Senteurs — 1er Bar à Parfums du Togo',
  description: 'Créez votre parfum unique sur mesure. Inspirations de grandes marques ou mélange personnalisé. Livraison à Lomé.',
  keywords: 'parfum togo, parfum lomé, bar à parfums, maya bar, personnalisé, sur mesure',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
