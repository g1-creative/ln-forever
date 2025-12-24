'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getFriendRequests, FriendRequestWithProfile } from '@/lib/db/friends';

interface FriendRequestsContextType {
  friendRequests: {
    sent: FriendRequestWithProfile[];
    received: FriendRequestWithProfile[];
  };
  pendingCount: number;
  loading: boolean;
  refreshFriendRequests: () => Promise<void>;
}

const FriendRequestsContext = createContext<FriendRequestsContextType | undefined>(undefined);

export function FriendRequestsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<{
    sent: FriendRequestWithProfile[];
    received: FriendRequestWithProfile[];
  }>({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshFriendRequests = async () => {
    if (!user || !mounted.current) return;

    setLoading(true);
    try {
      const requests = await getFriendRequests();
      if (mounted.current) {
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;

    if (user) {
      // Load friend requests immediately
      refreshFriendRequests();

      // Refresh friend requests every 30 seconds
      refreshIntervalRef.current = setInterval(() => {
        refreshFriendRequests();
      }, 30000);
    } else {
      setFriendRequests({ sent: [], received: [] });
    }

    return () => {
      mounted.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user]);

  const pendingCount = friendRequests.received.length;

  return (
    <FriendRequestsContext.Provider
      value={{
        friendRequests,
        pendingCount,
        loading,
        refreshFriendRequests,
      }}
    >
      {children}
    </FriendRequestsContext.Provider>
  );
}

export function useFriendRequests() {
  const context = useContext(FriendRequestsContext);
  if (context === undefined) {
    throw new Error('useFriendRequests must be used within a FriendRequestsProvider');
  }
  return context;
}

