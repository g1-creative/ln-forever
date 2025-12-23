'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <main className={isLoginPage ? '' : 'pt-20'}>{children}</main>
    </>
  );
}
