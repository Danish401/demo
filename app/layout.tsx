import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import ZohoTokenLoader from './components/ZohoTokenLoader'

export const metadata: Metadata = {
  title: 'Quotation - WMW Metal Fabrics Ltd',
  description: 'Quotation document',
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
