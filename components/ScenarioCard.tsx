'use client';

import { useState, useEffect } from 'react';
import { Scenario, Difficulty } from '@/types';
import Timer from './Timer';
import { createSession } from '@/lib/db/sessions';
import { useAuth } from '@/contexts/AuthContext';
import { SwapIcon, UserIcon, LightbulbIcon, StarIcon, RefreshIcon } from '@/components/Icons';

interface ScenarioCardProps {
  scenario: Scenario | null;
  onSwapRoles: () => void;
  rolesSwapped: boolean;
  onNextScenario?: () => void;
  difficulty?: Difficulty;
}

export default function ScenarioCard({
  scenario,
  onSwapRoles,
  rolesSwapped,
  onNextScenario,
  difficulty = 'easy',
}: ScenarioCardProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();

  // Reset timer when scenario changes
  useEffect(() => {
    setShowTimer(false);
    setIsCompleted(false);
  }, [scenario?.title]);

  const handleTimerComplete = async (durationSeconds: number) => {
    if (user && scenario?.id) {
      try {
        await createSession(scenario.id, null, durationSeconds);
        setIsCompleted(true);
        // Vibrate on completion
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 200]);
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    } else {
      setIsCompleted(true);
    }
  };

  const handleTimerStop = async (durationSeconds: number) => {
    if (user && scenario?.id && durationSeconds > 30) {
      try {
        await createSession(scenario.id, null, durationSeconds);
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  if (!scenario) return null;

  const roleA = rolesSwapped ? scenario.roleB : scenario.roleA;
  const roleB = rolesSwapped ? scenario.roleA : scenario.roleB;

  const difficultyTimeMap = {
    easy: 120,
    medium: 180,
    hard: 300,
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      daily: 'var(--accent)',
      travel: 'var(--primary)',
      work: 'var(--secondary)',
      romance: 'var(--primary)',
      fun: 'var(--accent)',
      deep: 'var(--secondary)',
    };
    return colors[category] || 'var(--primary)';
  };

  const getConversationStarters = (category: string) => {
    const starters: Record<string, string[]> = {
      daily: ["Start with a greeting", "Ask open-ended questions", "Share your thoughts naturally"],
      travel: ["Begin with excitement", "Describe what you see", "Ask about experiences"],
      work: ["Be professional but friendly", "Ask for opinions", "Suggest ideas"],
      romance: ["Be warm and genuine", "Share feelings openly", "Listen actively"],
      fun: ["Be creative and playful", "Don't be afraid to be silly", "Have fun with it!"],
      deep: ["Take your time", "Be thoughtful", "Share from the heart"],
    };
    return starters[category] || starters.daily;
  };

  return (
    <div className="scenario-card show">
      {isCompleted && (
        <div className="completion-celebration">
          <div className="celebration-content">
            <div className="celebration-icon">✨</div>
            <h3>Great job!</h3>
            <p>You completed this scenario</p>
          </div>
        </div>
      )}

      <div className="scenario-header">
        <div className="scenario-meta">
          <span 
            className="scenario-category-badge"
            style={{ backgroundColor: getCategoryColor(scenario.category) }}
          >
            {scenario.category.charAt(0).toUpperCase() + scenario.category.slice(1)}
          </span>
          <span className={`scenario-difficulty-badge difficulty-${scenario.difficulty}`}>
            {scenario.difficulty}
          </span>
        </div>
        <div className="scenario-title">{scenario.title}</div>
        <div className="scenario-objective">
          <strong>Goal:</strong> Practice natural English conversation in this scenario
        </div>
      </div>

      {showTimer && (
        <Timer 
          totalTime={difficultyTimeMap[difficulty]}
          onComplete={handleTimerComplete}
          onStop={handleTimerStop}
        />
      )}

      <div className="conversation-starters">
        <div className="starters-title">
          <LightbulbIcon />
          <span>Conversation Tips</span>
        </div>
        <ul className="starters-list">
          {getConversationStarters(scenario.category).map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="roles-container">
        <div className={`role-section ${rolesSwapped ? 'swapped' : ''}`} id="roleASection">
          <div className="role-header">
            <div className="role-label">
              <UserIcon />
              <span>Role A</span>
            </div>
            <div className="role-number">1</div>
          </div>
          <div className="role-description">{roleA}</div>
        </div>
        
        <div className="role-divider">
          <div className="divider-line"></div>
          <span className="divider-text">vs</span>
          <div className="divider-line"></div>
        </div>

        <div className={`role-section ${!rolesSwapped ? 'swapped' : ''}`} id="roleBSection">
          <div className="role-header">
            <div className="role-label">
              <UserIcon />
              <span>Role B</span>
            </div>
            <div className="role-number">2</div>
          </div>
          <div className="role-description">{roleB}</div>
        </div>
      </div>

      <div className="hints-section">
        <div className="hints-title">
          <LightbulbIcon />
          <span>Helpful Vocabulary</span>
        </div>
        <div className="hints-list">
          {scenario.hints.map((hint, index) => (
            <span key={index} className="hint-tag">
              {hint}
            </span>
          ))}
        </div>
      </div>

      <div className="scenario-actions-bar">
        {!showTimer && (
          <button
            className="action-btn primary-action"
            onClick={() => setShowTimer(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Start Timer</span>
          </button>
        )}
        <button className="action-btn" onClick={onSwapRoles}>
          <SwapIcon />
          <span>Swap Roles</span>
        </button>
        {onNextScenario && (
          <button className="action-btn" onClick={onNextScenario}>
            <RefreshIcon />
            <span>Next Scenario</span>
          </button>
        )}
      </div>
    </div>
  );
}
