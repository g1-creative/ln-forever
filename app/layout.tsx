import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Couples Games Hub - Practice English Conversation',
  description: 'Play fun games together and practice English conversation. Perfect for couples learning English together.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const isLoginPage = pathname === '/login' || pathname === '/signup'

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {!isLoginPage && <Navbar />}
          <main className={isLoginPage ? '' : 'pt-20'}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
