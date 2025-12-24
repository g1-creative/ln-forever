'use client';

import Link from 'next/link';
import { Game } from '@/types';

interface GameCardProps {
  game: Game;
}

const colorClasses: Record<string, string> = {
  purple: 'game-card-purple',
  blue: 'game-card-blue',
  green: 'game-card-green',
  pink: 'game-card-pink',
  orange: 'game-card-orange',
  red: 'game-card-red',
};

export default function GameCard({ game }: GameCardProps) {
  const colorClass = colorClasses[game.color] || 'game-card-purple';
  const isAvailable = game.available;

  return (
    <Link 
      href={isAvailable ? `/games/${game.id}` : '#'}
      className={`game-card ${colorClass} ${!isAvailable ? 'game-card-disabled' : ''}`}
    >
      <div className="game-card-header">
        <div className="game-card-icon">
          {game.icon === 'conversation' && <ConversationIcon />}
          {game.icon === 'choices' && <ChoicesIcon />}
          {game.icon === 'guess' && <GuessIcon />}
          {game.icon === 'story' && <StoryIcon />}
          {game.icon === 'dare' && <DareIcon />}
          {game.icon === 'words' && <WordsIcon />}
          {game.icon === 'debate' && <DebateIcon />}
        </div>
        {game.featured && (
          <span className="game-badge">Featured</span>
        )}
        {!isAvailable && (
          <span className="game-badge coming-soon">Coming Soon</span>
        )}
      </div>
      
      <div className="game-card-content">
        <h3 className="game-card-title">{game.name}</h3>
        <p className="game-card-description">{game.description}</p>
        
        <div className="game-card-meta">
          <div className="game-meta-item">
            <span className="game-meta-label">Category:</span>
            <span className="game-meta-value">{game.category}</span>
          </div>
          <div className="game-meta-item">
            <span className="game-meta-label">Players:</span>
            <span className="game-meta-value">{game.players}</span>
          </div>
          <div className="game-meta-item">
            <span className="game-meta-label">Duration:</span>
            <span className="game-meta-value">{game.duration}</span>
          </div>
        </div>
      </div>

      <div className="game-card-footer">
        {isAvailable ? (
          <span className="game-card-action">Play Now →</span>
        ) : (
          <span className="game-card-action disabled">Coming Soon</span>
        )}
      </div>
    </Link>
  );
}

function ConversationIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M13 8H7" />
      <path d="M17 12H7" />
    </svg>
  );
}

function ChoicesIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function GuessIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function StoryIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function DareIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function WordsIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h4" />
    </svg>
  );
}

function DebateIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h8" />
      <path d="M8 14h6" />
    </svg>
  );
}
