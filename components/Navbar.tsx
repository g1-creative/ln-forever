'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendRequests } from '@/contexts/FriendRequestsContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { pendingCount } = useFriendRequests();
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
          <span className="hidden sm:inline">LN Forever</span>
          <span className="sm:hidden">LN</span>
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
              <Link 
                href="/profile" 
                className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
                {pendingCount > 0 && (
                  <span className="navbar-notification-badge">{pendingCount}</span>
                )}
              </Link>
              <div className="navbar-user">
                <span className="navbar-email hidden sm:inline">
                  {profile?.username || profile?.name || user.email?.split('@')[0] || 'User'}
                </span>
                <button onClick={signOut} className="navbar-btn text-xs sm:text-sm">
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
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
