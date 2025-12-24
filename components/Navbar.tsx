'use client';

import Link from 'next/link';
import Image from 'next/image';
import { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendRequests } from '@/contexts/FriendRequestsContext';
import { usePathname } from 'next/navigation';

function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { pendingCount } = useFriendRequests();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand" aria-label="LN Forever Home">
          <Image 
            src="/images/ln_logo_favicon.png" 
            alt="" 
            width={32} 
            height={32}
            className="navbar-logo"
            priority
          />
          <span className="hidden sm:inline" aria-label="LN Forever">LN Forever</span>
          <span className="sm:hidden" aria-label="LN Forever">LN</span>
        </Link>
        
        <div className="navbar-links">
          {user ? (
            <>
              <Link 
                href="/games" 
                className={`navbar-link ${isActive('/games') || isActive('/games/') ? 'active' : ''}`}
                aria-current={isActive('/games') ? 'page' : undefined}
              >
                Games
              </Link>
              <Link 
                href="/dashboard" 
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                aria-current={isActive('/dashboard') ? 'page' : undefined}
              >
                Dashboard
              </Link>
              <Link 
                href="/profile" 
                className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
                aria-current={isActive('/profile') ? 'page' : undefined}
              >
                Profile
                {pendingCount > 0 && (
                  <span className="navbar-notification-badge" aria-label={`${pendingCount} pending friend requests`}>
                    {pendingCount}
                  </span>
                )}
              </Link>
              <div className="navbar-user">
                <span className="navbar-email hidden sm:inline" aria-label="Current user">
                  {profile?.username || profile?.name || user.email?.split('@')[0] || 'User'}
                </span>
                <button 
                  onClick={signOut} 
                  className="navbar-btn text-xs sm:text-sm"
                  aria-label="Sign out"
                >
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
                aria-current={isActive('/login') ? 'page' : undefined}
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

export default memo(Navbar);
