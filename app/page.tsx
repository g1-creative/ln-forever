'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { getFeaturedGames, getAvailableGames } from '@/lib/games';
import GameCard from '@/components/GameCard';

export default function Home() {
  const { user } = useAuth();
  const featuredGames = getFeaturedGames();
  const availableGames = getAvailableGames();

  return (
    <div className="container">
      <div className="landing-hero">
        <h1>Couples Games Hub</h1>
        <p className="hero-subtitle">
          Play fun games together and practice English conversation
        </p>
        <p className="hero-description">
          A collection of interactive games designed for couples learning English together. 
          Practice speaking, build vocabulary, and have fun while improving your language skills.
        </p>

        {user ? (
          <div className="hero-actions">
            <Link href="/games" className="hero-btn primary">
              Browse Games
            </Link>
            <Link href="/dashboard" className="hero-btn secondary">
              View Dashboard
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link href="/signup" className="hero-btn primary">
              Get Started
            </Link>
            <Link href="/login" className="hero-btn secondary">
              Sign In
            </Link>
          </div>
        )}
      </div>

      {featuredGames.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span>Featured Games</span>
          </div>
          <div className="games-grid">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {availableGames.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span>Available Now</span>
          </div>
          <div className="games-grid">
            {availableGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <div className="section-footer">
            <Link href="/games" className="hero-btn secondary">
              View All Games →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
