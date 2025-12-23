import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'LN Forever - Practice English Conversation',
  description: 'Play fun games together and practice English conversation. Perfect for couples learning English together.',
  icons: {
    icon: [
      { url: '/images/ln_logo_favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/images/ln_logo_favicon.png',
    apple: '/images/ln_logo_favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}