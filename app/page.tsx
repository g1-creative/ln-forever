'use client';

import { useState } from 'react';
import { Difficulty, Category, Scenario } from '@/types';
import { getRandomScenario } from '@/lib/scenarios';
import ScenarioCard from '@/components/ScenarioCard';
import AuthButton from '@/components/AuthButton';
import Link from 'next/link';

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedCategory, setSelectedCategory] = useState<Category>('daily');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [rolesSwapped, setRolesSwapped] = useState(false);
  const [showNoScenario, setShowNoScenario] = useState(false);

  const handleSpin = () => {
    setRolesSwapped(false);
    setShowNoScenario(false);
    
    const scenario = getRandomScenario(selectedDifficulty, selectedCategory);
    
    if (!scenario) {
      setCurrentScenario(null);
      setShowNoScenario(true);
      return;
    }

    setCurrentScenario(scenario);
  };

  const handleSwapRoles = () => {
    setRolesSwapped(!rolesSwapped);
  };

  const categories: { value: Category; label: string; emoji: string }[] = [
    { value: 'all', label: 'All Categories', emoji: '' },
    { value: 'daily', label: 'Daily Life', emoji: '🏠' },
    { value: 'travel', label: 'Travel', emoji: '✈️' },
    { value: 'work', label: 'Work', emoji: '💼' },
    { value: 'romance', label: 'Romance', emoji: '💖' },
    { value: 'fun', label: 'Fun / Silly', emoji: '😂' },
    { value: 'deep', label: 'Deep Talk', emoji: '🧠' },
  ];

  return (
    <div className="container">
      <div className="header">
        <h1>🎭 Role-Play Roulette</h1>
        <p>Practice English conversation together ❤️</p>
      </div>

      <AuthButton />

      <Link href="/dashboard" className="nav-link">
        📊 View Progress →
      </Link>

      <div className="section">
        <div className="section-title">Choose Difficulty</div>
        <div className="difficulty-selector">
          <button
            className={`difficulty-btn easy ${selectedDifficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('easy')}
          >
            🟢 Easy
          </button>
          <button
            className={`difficulty-btn medium ${selectedDifficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('medium')}
          >
            🟡 Medium
          </button>
          <button
            className={`difficulty-btn hard ${selectedDifficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('hard')}
          >
            🔴 Hard
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Choose Category</div>
        <div className="category-selector">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <button className="spin-button" onClick={handleSpin}>
        🎰 Spin Scenario
      </button>

      {currentScenario && (
        <ScenarioCard
          scenario={currentScenario}
          onSwapRoles={handleSwapRoles}
          rolesSwapped={rolesSwapped}
        />
      )}

      {showNoScenario && (
        <div className="scenario-card show">
          <div className="no-scenario">
            <div className="no-scenario-emoji">😊</div>
            <div>Try another category or difficulty 😊</div>
          </div>
        </div>
      )}
    </div>
  );
}
