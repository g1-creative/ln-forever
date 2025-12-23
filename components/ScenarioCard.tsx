'use client';

'use client';

import { useState, useEffect } from 'react';
import { Scenario } from '@/types';
import Timer from './Timer';
import { createSession } from '@/lib/db/sessions';
import { useAuth } from '@/contexts/AuthContext';

interface ScenarioCardProps {
  scenario: Scenario | null;
  onSwapRoles: () => void;
  rolesSwapped: boolean;
}

export default function ScenarioCard({
  scenario,
  onSwapRoles,
  rolesSwapped,
}: ScenarioCardProps) {
  const [showTimer, setShowTimer] = useState(false);
  const { user } = useAuth();

  // Reset timer when scenario changes
  useEffect(() => {
    setShowTimer(false);
  }, [scenario?.title]);

  const handleTimerComplete = async (durationSeconds: number) => {
    if (user && scenario?.id) {
      try {
        await createSession(scenario.id, null, durationSeconds);
        console.log('Session saved successfully!');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  const handleTimerStop = async (durationSeconds: number) => {
    if (user && scenario?.id && durationSeconds > 30) {
      // Only save if they practiced for at least 30 seconds
      try {
        await createSession(scenario.id, null, durationSeconds);
        console.log('Session saved successfully!');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  if (!scenario) return null;

  const roleA = rolesSwapped ? scenario.roleB : scenario.roleA;
  const roleB = rolesSwapped ? scenario.roleA : scenario.roleB;

  return (
    <div className="scenario-card show">
      <div className="scenario-header">
        <div className="scenario-title">{scenario.title}</div>
        <div className="scenario-actions">
          <button className="action-btn swap-btn" onClick={onSwapRoles}>
            🔄 Swap Roles
          </button>
        </div>
      </div>

      {showTimer && (
        <Timer 
          onComplete={handleTimerComplete}
          onStop={handleTimerStop}
        />
      )}

      <div className={`role-section ${rolesSwapped ? 'swapped' : ''}`} id="roleASection">
        <div className="role-label">👤 Role A</div>
        <div className="role-description">{roleA}</div>
      </div>
      <div className="role-section" id="roleBSection">
        <div className="role-label">👤 Role B</div>
        <div className="role-description">{roleB}</div>
      </div>
      <div className="hints-section">
        <div className="hints-title">💡 Helpful Words</div>
        <div className="hints-list">
          {scenario.hints.map((hint, index) => (
            <span key={index} className="hint-tag">
              {hint}
            </span>
          ))}
        </div>
      </div>
      {!showTimer && (
        <button
          className="action-btn"
          onClick={() => setShowTimer(true)}
          style={{ marginTop: '15px', width: '100%' }}
        >
          ⏱️ Show Timer
        </button>
      )}
    </div>
  );
}
