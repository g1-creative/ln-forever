'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { TrophyIcon } from '@/components/Icons';

interface Stats {
  totalSessions: number;
  totalTimeMinutes: number;
  currentStreak: number;
  scenariosByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentSessions: any[];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      loadStats();
    } else if (!loading) {
      setLoadingStats(false);
    }
  }, [user, loading]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client not available');
        setLoadingStats(false);
        return;
      }
      
      // Get all sessions
      const { data: sessions, error: sessionsError } = await (supabase
        .from('sessions') as any)
        .select('*, scenarios(title, difficulty, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get progress data
      const { data: progressData, error: progressError } = await (supabase
        .from('progress') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (progressError) throw progressError;

      // Calculate stats
      const totalSessions = sessions?.length || 0;
      const totalTimeSeconds = sessions?.reduce((sum: number, s: any) => 
        sum + (s.duration_seconds || 0), 0) || 0;
      const totalTimeMinutes = Math.floor(totalTimeSeconds / 60);

      // Calculate streak
      let currentStreak = 0;
      if (progressData && progressData.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < progressData.length; i++) {
          const progressDate = new Date(progressData[i].date);
          progressDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((today.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === i) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Count by difficulty
      const scenariosByDifficulty = {
        easy: sessions?.filter((s: any) => s.scenarios?.difficulty === 'easy').length || 0,
        medium: sessions?.filter((s: any) => s.scenarios?.difficulty === 'medium').length || 0,
        hard: sessions?.filter((s: any) => s.scenarios?.difficulty === 'hard').length || 0,
      };

      setStats({
        totalSessions,
        totalTimeMinutes,
        currentStreak,
        scenariosByDifficulty,
        recentSessions: sessions?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <ProtectedRoute>
        <div className="container">
          <div className="page-header">
            <Image 
              src="/images/ln_logo_favicon.png" 
              alt="LN Forever" 
              width={64} 
              height={64}
              className="page-header-logo"
            />
            <h1>Your Progress</h1>
            <p>Loading your stats...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const achievements = [
    { id: 'first', name: 'First Steps', unlocked: stats && stats.totalSessions >= 1 },
    { id: 'dedicated', name: 'Dedicated', unlocked: stats && stats.currentStreak >= 3 },
    { id: 'expert', name: 'Expert', unlocked: stats && stats.totalSessions >= 10 },
    { id: 'master', name: 'Master', unlocked: stats && stats.totalSessions >= 25 },
    { id: 'hardcore', name: 'Hardcore', unlocked: stats && stats.scenariosByDifficulty.hard >= 5 },
  ];

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="page-header">
          <Image 
            src="/images/ln_logo_favicon.png" 
            alt="Couples Games Hub" 
            width={64} 
            height={64}
            className="page-header-logo"
          />
          <h1>Your Progress</h1>
          <p>Keep practicing! You&apos;re doing great</p>
        </div>

      {stats && (
        <>
          {/* Main Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalSessions}</div>
              <div className="stat-label">Scenarios Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalTimeMinutes}</div>
              <div className="stat-label">Minutes Practiced</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="section">
            <div className="section-title">Practice by Difficulty</div>
            <div className="difficulty-stats">
              <div className="difficulty-stat">
                <span className="difficulty-count">{stats.scenariosByDifficulty.easy}</span>
                <span className="difficulty-label">Easy</span>
              </div>
              <div className="difficulty-stat">
                <span className="difficulty-count">{stats.scenariosByDifficulty.medium}</span>
                <span className="difficulty-label">Medium</span>
              </div>
              <div className="difficulty-stat">
                <span className="difficulty-count">{stats.scenariosByDifficulty.hard}</span>
                <span className="difficulty-label">Hard</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="section">
            <div className="section-title">
              <TrophyIcon />
              <span>Achievements</span>
            </div>
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-name">{achievement.name}</div>
                  {achievement.unlocked && <div className="achievement-badge">✓</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          {stats.recentSessions.length > 0 && (
            <div className="section">
              <div className="section-title">Recent Practice</div>
              <div className="sessions-list">
                {stats.recentSessions.map((session: any) => (
                  <div key={session.id} className="session-item">
                    <div className="session-title">
                      {session.scenarios?.title || 'Unknown Scenario'}
                    </div>
                    <div className="session-meta">
                      <span className="session-difficulty">
                        {session.scenarios?.difficulty || 'N/A'}
                      </span>
                      {session.duration_seconds && (
                        <span className="session-duration">
                          {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                        </span>
                      )}
                      <span className="session-date">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.totalSessions === 0 && (
            <div className="section">
            <div className="no-data">
              <div className="no-data-text">
                <p>Start practicing to see your progress here!</p>
                <p>Complete your first scenario to unlock achievements.</p>
              </div>
                <Link href="/play" className="spin-button" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '20px' }}>
                  Start Practicing →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </ProtectedRoute>
  );
}
