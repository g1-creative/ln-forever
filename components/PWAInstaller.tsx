'use client';

import { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if dismissed this session
  if (showInstallPrompt && sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  if (!showInstallPrompt) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">📱</div>
        <div className="pwa-install-text">
          <strong>Install LN Forever</strong>
          <span>Add to your home screen for quick access!</span>
        </div>
      </div>
      <div className="pwa-install-actions">
        <button className="pwa-install-btn" onClick={handleInstallClick}>
          Install
        </button>
        <button className="pwa-dismiss-btn" onClick={handleDismiss}>
          ×
        </button>
      </div>
    </div>
  );
}

