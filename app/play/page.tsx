'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/games/role-play-roulette');
  }, [router]);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Redirecting...</h1>
        <p>Taking you to the game...</p>
      </div>
    </div>
  );
}
