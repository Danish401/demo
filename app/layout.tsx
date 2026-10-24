import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import ZohoTokenLoader from './components/ZohoTokenLoader'

export const metadata: Metadata = {
  title: 'Quotation',
  description: 'Quotation document',
}

export const viewport: Viewport = {
  width: 800,
  minimumScale: 0.2,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={null}>
          <ZohoTokenLoader />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
