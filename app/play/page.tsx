'use client';

import { useState } from 'react';
import { Difficulty, Category, Scenario } from '@/types';
import { getRandomScenario } from '@/lib/scenarios';
import ScenarioCard from '@/components/ScenarioCard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PlayPage() {
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

  const categories: { value: Category; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'daily', label: 'Daily Life' },
    { value: 'travel', label: 'Travel' },
    { value: 'work', label: 'Work' },
    { value: 'romance', label: 'Romance' },
    { value: 'fun', label: 'Fun / Silly' },
    { value: 'deep', label: 'Deep Talk' },
  ];

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="page-header">
          <h1>Practice Mode</h1>
          <p>Choose your settings and start practicing</p>
        </div>

        <div className="section">
          <div className="section-title">Choose Difficulty</div>
          <div className="difficulty-selector">
            <button
              className={`difficulty-btn easy ${selectedDifficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('easy')}
            >
              Easy
            </button>
            <button
              className={`difficulty-btn medium ${selectedDifficulty === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('medium')}
            >
              Medium
            </button>
            <button
              className={`difficulty-btn hard ${selectedDifficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('hard')}
            >
              Hard
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
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <button className="spin-button" onClick={handleSpin}>
          Spin Scenario
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
              <div>Try another category or difficulty</div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
