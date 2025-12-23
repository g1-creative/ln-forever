'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { TargetIcon, BookIcon, ChartIcon, ClockIcon } from '@/components/Icons';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="landing-hero">
        <h1>Role-Play Roulette</h1>
        <p className="hero-subtitle">
          Practice English conversation with fun, interactive scenarios
        </p>
        <p className="hero-description">
          Perfect for couples learning English together. Choose scenarios, practice speaking, and track your progress.
        </p>

        {user ? (
          <div className="hero-actions">
            <Link href="/play" className="hero-btn primary">
              Start Practicing
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

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <TargetIcon />
          </div>
          <h3>Multiple Difficulties</h3>
          <p>Choose from Easy, Medium, or Hard scenarios based on your level</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <BookIcon />
          </div>
          <h3>Various Categories</h3>
          <p>Practice conversations for daily life, travel, work, romance, and more</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <ChartIcon />
          </div>
          <h3>Track Progress</h3>
          <p>Monitor your practice sessions, streaks, and achievements</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <ClockIcon />
          </div>
          <h3>Practice Timer</h3>
          <p>Use the built-in timer to structure your practice sessions</p>
        </div>
      </div>
    </div>
  );
}
