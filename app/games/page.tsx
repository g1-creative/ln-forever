'use client';

import { games, getFeaturedGames, getAvailableGames } from '@/lib/games';
import GameCard from '@/components/GameCard';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function GamesPage() {
  const { user } = useAuth();
  const featuredGames = getFeaturedGames();
  const availableGames = getAvailableGames();
  const comingSoonGames = games.filter(game => !game.available);

  const categories = Array.from(new Set(games.map(game => game.category)));

  return (
    <div className="container">
      <div className="page-header">
        <h1>Couples Games Hub</h1>
        <p>Play fun games together and practice English conversation</p>
      </div>

      {!user && (
        <div className="section info-banner">
          <p>
            <strong>Sign up</strong> to track your progress and unlock achievements across all games!
          </p>
          <div className="info-banner-actions">
            <Link href="/signup" className="hero-btn primary">
              Get Started
            </Link>
            <Link href="/login" className="hero-btn secondary">
              Sign In
            </Link>
          </div>
        </div>
      )}

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
            <span>All Games</span>
          </div>
          <div className="games-grid">
            {availableGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {comingSoonGames.length > 0 && (
        <div className="section">
          <div className="section-title">
            <span>Coming Soon</span>
          </div>
          <div className="games-grid">
            {comingSoonGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-title">
          <span>Game Categories</span>
        </div>
        <div className="categories-grid">
          {categories.map((category) => {
            const categoryGames = games.filter(game => game.category === category);
            return (
              <div key={category} className="category-card">
                <h3>{category}</h3>
                <p>{categoryGames.length} {categoryGames.length === 1 ? 'game' : 'games'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
