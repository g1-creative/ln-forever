'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand">
          <Image 
            src="/images/ln_logo_favicon.png" 
            alt="LN Forever" 
            width={32} 
            height={32}
            className="navbar-logo"
          />
          <span>LN Forever</span>
        </Link>
        
        <div className="navbar-links">
          {user ? (
            <>
              <Link 
                href="/games" 
                className={`navbar-link ${isActive('/games') || isActive('/games/') ? 'active' : ''}`}
              >
                Games
              </Link>
              <Link 
                href="/dashboard" 
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <div className="navbar-user">
                <span className="navbar-email">{user.email}</span>
                <button onClick={signOut} className="navbar-btn">
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="navbar-btn primary"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
