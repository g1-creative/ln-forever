import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import LayoutWrapper from '@/components/LayoutWrapper'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'LN Forever - Practice English Conversation',
  description: 'Play fun games together and practice English conversation. Perfect for couples learning English together.',
  manifest: '/manifest.json',
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
                    console.log('Service Worker registered successfully:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available, prompt user to refresh
                            console.log('New version available!');
                          }
                        });
                      }
                    });
                  })
                  .catch((registrationError) => {
                    console.log('Service Worker registration failed:', registrationError);
                  });
              });
            }
          `}
        </Script>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}