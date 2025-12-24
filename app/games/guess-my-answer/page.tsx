'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  createLobby,
  getLobby,
  joinLobby,
  leaveLobby,
  setReadyStatus,
  updateLobbyStatus,
  LobbyWithParticipants,
} from '@/lib/db/lobbies';
import {
  getRandomQuestion,
  getQuestionCount,
  GuessMyAnswerQuestion,
} from '@/lib/guess-my-answer-questions';
import { getFriends } from '@/lib/db/friends';
import { CheckCircleIcon, XCircleIcon, PlayIcon } from '@/components/Icons';

type GameState = 'lobby' | 'answering' | 'guessing' | 'revealed' | 'finished';
type LobbyView = 'create' | 'join' | 'lobby' | 'playing';

const AVATAR_EMOJIS: Record<string, string> = {
  avatar1: '👤',
  avatar2: '😊',
  avatar3: '😎',
  avatar4: '🤩',
  avatar5: '😍',
  avatar6: '🥰',
  avatar7: '😇',
  avatar8: '🤗',
  avatar9: '😋',
  avatar10: '🤓',
  avatar11: '🧐',
  avatar12: '😌',
};

export default function GuessMyAnswerPage() {
  const { user, profile } = useAuth();
  const [lobbyView, setLobbyView] = useState<LobbyView>('create');
  const [currentLobby, setCurrentLobby] = useState<LobbyWithParticipants | null>(null);
  const [lobbyCode, setLobbyCode] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [currentQuestion, setCurrentQuestion] = useState<GuessMyAnswerQuestion | null>(null);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [guess, setGuess] = useState('');
  const [answererId, setAnswererId] = useState<string | null>(null);
  const [isAnswerer, setIsAnswerer] = useState(false);
  const [round, setRound] = useState(1);
  const supabase = getSupabaseClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  useEffect(() => {
    if (currentLobby) {
      setupRealtimeSubscription();
      return () => {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
        }
      };
    }
  }, [currentLobby?.id]);

  const loadFriends = async () => {
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!supabase || !currentLobby) return;

    // Subscribe to lobby changes
    channelRef.current = supabase
      .channel(`lobby:${currentLobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants',
          filter: `lobby_id=eq.${currentLobby.id}`,
        },
        async () => {
          // Refresh lobby data
          const updated = await getLobby(currentLobby.id);
          if (updated) setCurrentLobby(updated);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${currentLobby.id}`,
        },
        async () => {
          const updated = await getLobby(currentLobby.id);
          if (updated) setCurrentLobby(updated);
        }
      )
      .subscribe();
  };

  const handleCreateLobby = async () => {
    try {
      const lobby = await createLobby('guess_my_answer', 2);
      const fullLobby = await getLobby(lobby.id);
      if (fullLobby) {
        setCurrentLobby(fullLobby);
        setLobbyView('lobby');
        setLobbyCode(lobby.id);
      }
    } catch (error: any) {
      alert(error.message || 'Error creating lobby');
    }
  };

  const handleJoinLobby = async () => {
    if (!lobbyCode.trim()) {
      alert('Please enter a lobby code');
      return;
    }

    try {
      await joinLobby(lobbyCode);
      const lobby = await getLobby(lobbyCode);
      if (lobby) {
        setCurrentLobby(lobby);
        setLobbyView('lobby');
      } else {
        alert('Lobby not found');
      }
    } catch (error: any) {
      alert(error.message || 'Error joining lobby');
    }
  };

  const handleLeaveLobby = async () => {
    if (!currentLobby) return;

    try {
      await leaveLobby(currentLobby.id);
      setCurrentLobby(null);
      setLobbyView('create');
      setLobbyCode('');
      setGameState('lobby');
    } catch (error: any) {
      alert(error.message || 'Error leaving lobby');
    }
  };

  const handleToggleReady = async () => {
    if (!currentLobby) return;

    const participant = currentLobby.participants.find(p => p.user_id === user?.id);
    const newReadyStatus = !participant?.is_ready;

    try {
      await setReadyStatus(currentLobby.id, newReadyStatus);
      const updated = await getLobby(currentLobby.id);
      if (updated) setCurrentLobby(updated);

      // Check if all players are ready
      if (updated && updated.participants.length === updated.max_players) {
        const allReady = updated.participants.every(p => p.is_ready);
        if (allReady && updated.status === 'waiting') {
          await updateLobbyStatus(updated.id, 'playing');
          startGame(updated);
        }
      }
    } catch (error: any) {
      alert(error.message || 'Error updating ready status');
    }
  };

  const startGame = async (lobby: LobbyWithParticipants) => {
    if (lobby.participants.length < 2) return;

    // Determine who answers first (alternate each round)
    const answererIndex = (round - 1) % lobby.participants.length;
    const answerer = lobby.participants[answererIndex];
    const guesser = lobby.participants[1 - answererIndex];

    setAnswererId(answerer.user_id);
    setIsAnswerer(answerer.user_id === user?.id);

    // Get a random question
    const question = getRandomQuestion();
    if (question) {
      setCurrentQuestion(question);
      setGameState('answering');
      setLobbyView('playing');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!secretAnswer.trim() || !currentLobby || !currentQuestion) return;

    // Store answer (in a real implementation, this would go to the database)
    setGameState('guessing');
  };

  const handleSubmitGuess = async () => {
    if (!guess.trim() || !currentLobby) return;

    // Store guess and reveal answer
    setGameState('revealed');
  };

  const handleNextRound = () => {
    setRound(prev => prev + 1);
    setSecretAnswer('');
    setGuess('');
    setGameState('answering');
    
    if (currentLobby) {
      startGame(currentLobby);
    }
  };

  const getAvatarEmoji = (avatarId: string | null) => {
    return AVATAR_EMOJIS[avatarId || 'avatar1'] || '👤';
  };

  if (!user) {
    return <ProtectedRoute><div>Loading...</div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <div className="container">
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
          />
          <h1>Guess My Answer</h1>
          <p>One answers secretly, the other guesses!</p>
        </div>

        {lobbyView === 'create' && (
          <div className="section">
            <h2 className="section-title">Create or Join a Game</h2>
            <div className="lobby-actions">
              <button className="spin-button" onClick={handleCreateLobby}>
                <PlayIcon />
                <span>Create Lobby</span>
              </button>
              <div className="lobby-divider">OR</div>
              <div className="join-lobby">
                <input
                  type="text"
                  className="profile-input"
                  placeholder="Enter lobby code"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                />
                <button className="action-btn primary-action" onClick={handleJoinLobby}>
                  Join Lobby
                </button>
              </div>
            </div>
          </div>
        )}

        {lobbyView === 'lobby' && currentLobby && (
          <div className="section">
            <div className="lobby-header">
              <h2 className="section-title">Lobby</h2>
              <div className="lobby-code">
                <span>Code: </span>
                <strong>{currentLobby.id.slice(0, 8).toUpperCase()}</strong>
              </div>
            </div>

            <div className="lobby-participants">
              <h3 className="section-subtitle">Players ({currentLobby.participants.length}/{currentLobby.max_players})</h3>
              <div className="participants-list">
                {currentLobby.participants.map((participant) => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">
                      {getAvatarEmoji(participant.profile?.avatar_selection || null)}
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">
                        {participant.profile?.username || participant.profile?.name || 'Player'}
                        {participant.user_id === currentLobby.host_id && (
                          <span className="host-badge">Host</span>
                        )}
                      </div>
                      <div className="participant-status">
                        {participant.is_ready ? (
                          <span className="ready-status ready">
                            <CheckCircleIcon /> Ready
                          </span>
                        ) : (
                          <span className="ready-status not-ready">
                            <XCircleIcon /> Not Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lobby-actions-bar">
              <button
                className="action-btn primary-action"
                onClick={handleToggleReady}
                disabled={currentLobby.participants.length < currentLobby.max_players}
              >
                {currentLobby.participants.find(p => p.user_id === user?.id)?.is_ready
                  ? 'Not Ready'
                  : 'Ready'}
              </button>
              <button className="action-btn secondary" onClick={handleLeaveLobby}>
                Leave Lobby
              </button>
            </div>

            {currentLobby.participants.length < currentLobby.max_players && (
              <div className="lobby-waiting">
                <p>Waiting for another player to join...</p>
                <p className="lobby-code-share">Share this code: <strong>{currentLobby.id.slice(0, 8).toUpperCase()}</strong></p>
              </div>
            )}
          </div>
        )}

        {lobbyView === 'playing' && (
          <div className="section">
            {gameState === 'answering' && isAnswerer && (
              <div className="game-phase">
                <h2 className="section-title">Round {round}</h2>
                <div className="question-card">
                  <h3>{currentQuestion?.question}</h3>
                  <p className="question-instruction">Enter your secret answer:</p>
                  <textarea
                    className="profile-textarea"
                    placeholder="Type your answer here..."
                    value={secretAnswer}
                    onChange={(e) => setSecretAnswer(e.target.value)}
                    rows={4}
                  />
                  <button
                    className="action-btn primary-action"
                    onClick={handleSubmitAnswer}
                    disabled={!secretAnswer.trim()}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}

            {gameState === 'answering' && !isAnswerer && (
              <div className="game-phase">
                <h2 className="section-title">Round {round}</h2>
                <div className="waiting-card">
                  <p>Waiting for your partner to answer the question...</p>
                  <div className="question-preview">
                    <h3>{currentQuestion?.question}</h3>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'guessing' && !isAnswerer && (
              <div className="game-phase">
                <h2 className="section-title">Round {round}</h2>
                <div className="question-card">
                  <h3>{currentQuestion?.question}</h3>
                  <p className="question-instruction">What do you think they answered?</p>
                  <textarea
                    className="profile-textarea"
                    placeholder="Type your guess here..."
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    rows={4}
                  />
                  <button
                    className="action-btn primary-action"
                    onClick={handleSubmitGuess}
                    disabled={!guess.trim()}
                  >
                    Submit Guess
                  </button>
                </div>
              </div>
            )}

            {gameState === 'guessing' && isAnswerer && (
              <div className="game-phase">
                <h2 className="section-title">Round {round}</h2>
                <div className="waiting-card">
                  <p>Waiting for your partner to make their guess...</p>
                </div>
              </div>
            )}

            {gameState === 'revealed' && (
              <div className="game-phase">
                <h2 className="section-title">Round {round} - Results</h2>
                <div className="reveal-card">
                  <div className="reveal-section">
                    <h4>Your Answer:</h4>
                    <p className="reveal-text">{secretAnswer}</p>
                  </div>
                  <div className="reveal-section">
                    <h4>Their Guess:</h4>
                    <p className="reveal-text">{guess}</p>
                  </div>
                  <div className="reveal-actions">
                    <button className="action-btn primary-action" onClick={handleNextRound}>
                      Next Round
                    </button>
                    <button className="action-btn secondary" onClick={handleLeaveLobby}>
                      End Game
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

