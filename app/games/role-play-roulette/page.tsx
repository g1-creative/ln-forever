'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Difficulty, Category, Scenario } from '@/types';
import { getRandomScenario, getFilteredScenarios } from '@/lib/scenarios';
import ScenarioCard from '@/components/ScenarioCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function RolePlayRoulettePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedCategory, setSelectedCategory] = useState<Category>('daily');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [rolesSwapped, setRolesSwapped] = useState(false);
  const [showNoScenario, setShowNoScenario] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinProgress, setSpinProgress] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  // Update available count when filters change
  useEffect(() => {
    const filtered = getFilteredScenarios(selectedDifficulty, selectedCategory);
    setAvailableCount(filtered.length);
  }, [selectedDifficulty, selectedCategory]);

  const handleSpin = () => {
    setRolesSwapped(false);
    setShowNoScenario(false);
    setCurrentScenario(null);
    setIsSpinning(true);
    setSpinProgress(0);

    // Animate spin progress
    const spinDuration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      setSpinProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin complete, get scenario
        const scenario = getRandomScenario(selectedDifficulty, selectedCategory);
        
        if (!scenario) {
          setCurrentScenario(null);
          setShowNoScenario(true);
          setIsSpinning(false);
          return;
        }

        setCurrentScenario(scenario);
        setIsSpinning(false);
        setSpinProgress(0);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleSwapRoles = () => {
    setRolesSwapped(!rolesSwapped);
  };

  const handleNextScenario = () => {
    handleSpin();
  };

  const categories: { value: Category; label: string; icon?: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'daily', label: 'Daily Life' },
    { value: 'travel', label: 'Travel' },
    { value: 'work', label: 'Work' },
    { value: 'romance', label: 'Romance' },
    { value: 'fun', label: 'Fun / Silly' },
    { value: 'deep', label: 'Deep Talk' },
  ];

  const difficultyInfo = {
    easy: { time: '2-3 min', color: 'var(--accent)' },
    medium: { time: '3-5 min', color: 'var(--primary)' },
    hard: { time: '5-7 min', color: 'var(--secondary)' },
  };

  return (
    <ProtectedRoute>
      <div className="container">
        {!currentScenario && !showNoScenario && (
          <>
            <div className="page-header">
              <Link href="/games" className="back-link">
                ← Back to Games
              </Link>
              <Image 
                src="/images/ln_logo_favicon.png" 
                alt="LN Forever" 
                width={64} 
                height={64}
                className="page-header-logo"
                priority
              />
              <h1>Role-Play Roulette</h1>
              <p>Practice English conversation with fun, interactive scenarios</p>
            </div>

            <div className="game-stats-bar">
              <div className="stat-badge">
                <span className="stat-label">Available</span>
                <span className="stat-value">{availableCount}</span>
              </div>
              <div className="stat-badge">
                <span className="stat-label">Suggested Time</span>
                <span className="stat-value" style={{ color: difficultyInfo[selectedDifficulty].color }}>
                  {difficultyInfo[selectedDifficulty].time}
                </span>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Choose Difficulty</div>
              <div className="difficulty-selector">
                <button
                  className={`difficulty-btn easy ${selectedDifficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty('easy')}
                >
                  <span className="difficulty-label">Easy</span>
                  <span className="difficulty-time">{difficultyInfo.easy.time}</span>
                </button>
                <button
                  className={`difficulty-btn medium ${selectedDifficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty('medium')}
                >
                  <span className="difficulty-label">Medium</span>
                  <span className="difficulty-time">{difficultyInfo.medium.time}</span>
                </button>
                <button
                  className={`difficulty-btn hard ${selectedDifficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty('hard')}
                >
                  <span className="difficulty-label">Hard</span>
                  <span className="difficulty-time">{difficultyInfo.hard.time}</span>
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

            <div className="spin-container">
              {isSpinning && (
                <div className="roulette-wheel">
                  <div 
                    className="roulette-spinner"
                    style={{ 
                      transform: `rotate(${spinProgress * 360 * 3}deg)`,
                      transition: 'transform 0.1s linear'
                    }}
                  >
                    <div className="roulette-segment"></div>
                    <div className="roulette-segment"></div>
                    <div className="roulette-segment"></div>
                    <div className="roulette-segment"></div>
                    <div className="roulette-segment"></div>
                    <div className="roulette-segment"></div>
                  </div>
                  <div className="roulette-pointer"></div>
                </div>
              )}
              <button 
                className={`spin-button ${isSpinning ? 'spinning' : ''}`} 
                onClick={handleSpin}
                disabled={isSpinning || availableCount === 0}
              >
                {isSpinning ? (
                  <>
                    <span className="spin-text">Spinning...</span>
                    <div className="spin-loader"></div>
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    <span>Spin Scenario</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {currentScenario && (
          <div className="scenario-view-mode">
            <button 
              className="back-to-spin-btn"
              onClick={() => {
                setCurrentScenario(null);
                setRolesSwapped(false);
              }}
            >
              ← Back to Spin
            </button>
            <ScenarioCard
              scenario={currentScenario}
              onSwapRoles={handleSwapRoles}
              rolesSwapped={rolesSwapped}
              onNextScenario={handleNextScenario}
              difficulty={selectedDifficulty}
            />
          </div>
        )}

        {showNoScenario && !currentScenario && (
          <div className="scenario-card show no-scenario-card">
            <div className="no-scenario">
              <div className="no-scenario-icon">🎯</div>
              <h3>No scenarios available</h3>
              <p>Try selecting a different category or difficulty level</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
