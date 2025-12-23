'use client';

import Link from 'next/link';
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
          Role-Play Roulette
        </Link>
        
        <div className="navbar-links">
          {user ? (
            <>
              <Link 
                href="/play" 
                className={`navbar-link ${isActive('/play') ? 'active' : ''}`}
              >
                Play
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
