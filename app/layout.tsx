import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'BlackRoad AI - Agent Network',
  description: '9 AI agents working together across distributed Raspberry Pi devices — BlackRoad OS, Inc.',
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{margin: 0, padding: 0, background: '#000', color: '#fff'}}>{children}</body>
    </html>
  )
}
