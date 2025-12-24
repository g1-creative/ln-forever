'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PWAInstaller from '@/components/PWAInstaller';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <PWAInstaller />
      <main className={isLoginPage ? '' : 'pt-20'}>{children}</main>
    </>
  );
}
