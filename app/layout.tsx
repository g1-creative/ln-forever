import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { FriendRequestsProvider } from '@/contexts/FriendRequestsContext'
import LayoutWrapper from '@/components/LayoutWrapper'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'LN Forever - Practice English Conversation',
  description: 'Play fun games together and practice English conversation. Perfect for couples learning English together.',
  manifest: '/manifest.json',
  keywords: ['English learning', 'conversation practice', 'couples games', 'language learning', 'fun games'],
  authors: [{ name: 'LN Forever' }],
  creator: 'LN Forever',
  publisher: 'LN Forever',
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LN Forever',
  },
  icons: {
    icon: [
      { url: '/images/ln_logo_favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/ln_logo_favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/ln_logo_favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/images/ln_logo_favicon.png',
    apple: [
      { url: '/images/ln_logo_favicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FF6FAE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#FF6FAE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LN Forever" />
      </head>
      <body>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && typeof window !== 'undefined') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then((registration) => {
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            if (typeof window !== 'undefined' && 'Notification' in window) {
                              console.log('New version available!');
                            }
                          }
                        });
                      }
                    });
                  })
                  .catch((err) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Service Worker registration failed:', err);
                    }
                  });
              });
            }
          `}
        </Script>
        <AuthProvider>
          <FriendRequestsProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </FriendRequestsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}