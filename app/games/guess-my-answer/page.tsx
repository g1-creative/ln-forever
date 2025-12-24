'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  inviteFriendToLobby,
  getLobbyInvitations,
  acceptLobbyInvitation,
  declineLobbyInvitation,
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
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [currentQuestion, setCurrentQuestion] = useState<GuessMyAnswerQuestion | null>(null);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [guess, setGuess] = useState('');
  const [answererId, setAnswererId] = useState<string | null>(null);
  const [isAnswerer, setIsAnswerer] = useState(false);
  const [round, setRound] = useState(1);
  const supabase = getSupabaseClient();
  const channelRef = useRef<any>(null);
  const invitationChannelRef = useRef<any>(null);

  const loadInvitations = useCallback(async () => {
    try {
      const invs = await getLobbyInvitations();
      setInvitations(invs);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  }, []);

  // Load friends and invitations on mount
  useEffect(() => {
    if (user) {
      loadFriends();
      loadInvitations();
    }
  }, [user, loadFriends, loadInvitations]);

  // Set up real-time subscription for invitations
  useEffect(() => {
    if (!user || !supabase) return;

    // Clean up existing subscription
    if (invitationChannelRef.current) {
      invitationChannelRef.current.unsubscribe();
      invitationChannelRef.current = null;
    }

    // Subscribe to invitation changes
    invitationChannelRef.current = supabase
      .channel(`user_invitations_${user.id}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_invitations',
          filter: `invitee_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Invitation change detected:', payload);
          // Small delay to ensure database is updated
          setTimeout(() => {
            loadInvitations();
          }, 100);
        }
      )
      .subscribe((status: string) => {
        console.log('Invitation channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to invitations');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to invitations - using polling fallback');
        }
      });

    // Fallback polling every 5 seconds as backup
    const pollInterval = setInterval(() => {
      loadInvitations();
    }, 5000);

    return () => {
      if (invitationChannelRef.current) {
        invitationChannelRef.current.unsubscribe();
        invitationChannelRef.current = null;
      }
      clearInterval(pollInterval);
    };
  }, [user, supabase, loadInvitations]);


  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const inv = invitations.find(i => i.id === invitationId);
      if (!inv) {
        alert('Invitation not found');
        return;
      }

      await acceptLobbyInvitation(invitationId);
      
      // Reload invitations to remove the accepted one
      await loadInvitations();
      
      // Load the lobby and switch to lobby view
      const lobby = await getLobby(inv.lobby_id);
      if (lobby) {
        setCurrentLobby(lobby);
        setLobbyView('lobby');
      } else {
        alert('Could not load lobby after accepting invitation');
      }
    } catch (error: any) {
      alert(error.message || 'Error accepting invitation');
      // Reload invitations in case of error
      await loadInvitations();
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declineLobbyInvitation(invitationId);
      await loadInvitations();
    } catch (error: any) {
      alert(error.message || 'Error declining invitation');
    }
  };

  const handleInviteFriend = async (friendId: string) => {
    if (!currentLobby) return;
    try {
      await inviteFriendToLobby(currentLobby.id, friendId);
      alert('Invitation sent!');
      setShowInviteModal(false);
      // Refresh lobby to show updated state
      const updated = await getLobby(currentLobby.id);
      if (updated) {
        setCurrentLobby(updated);
      }
    } catch (error: any) {
      alert(error.message || 'Error inviting friend');
    }
  };

  // Set up real-time subscription for lobby changes
  useEffect(() => {
    if (!supabase || !currentLobby) return;

    // Clean up existing subscription
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const refreshLobby = async () => {
      const updated = await getLobby(currentLobby.id);
      if (updated) {
        setCurrentLobby(updated);
      }
    };

    // Subscribe to lobby participant changes
    channelRef.current = supabase
      .channel(`lobby:${currentLobby.id}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants',
          filter: `lobby_id=eq.${currentLobby.id}`,
        },
        async (payload: any) => {
          console.log('Participant change detected:', payload);
          // Small delay to ensure database is updated
          setTimeout(() => {
            refreshLobby();
          }, 100);
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
        async (payload: any) => {
          console.log('Lobby change detected:', payload);
          setTimeout(() => {
            refreshLobby();
          }, 100);
        }
      )
      .subscribe((status: string) => {
        console.log('Lobby channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to lobby changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to lobby changes');
        }
      });

    // Fallback polling every 2 seconds as backup
    const pollInterval = setInterval(() => {
      refreshLobby();
    }, 2000);

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      clearInterval(pollInterval);
    };
  }, [supabase, currentLobby?.id]);

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

        {/* Pending Invitations */}
        {invitations.length > 0 && lobbyView === 'create' && (
          <div className="section" style={{ marginBottom: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '1rem' }}>
            <h3 className="section-subtitle">Pending Invitations ({invitations.length})</h3>
            <div className="invitations-list">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="invitation-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: 'white', borderRadius: '6px' }}>
                  <div>
                    <strong>{invitation.inviter?.username || invitation.inviter?.name || 'Someone'}</strong> invited you to a game
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="action-btn primary-action"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Accept
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lobbyView === 'create' && (
          <div className="section">
            <h2 className="section-title">Create a Game</h2>
            <div className="lobby-actions">
              <button className="spin-button" onClick={handleCreateLobby}>
                <PlayIcon />
                <span>Create Lobby</span>
              </button>
            </div>
          </div>
        )}

        {lobbyView === 'lobby' && currentLobby && (
          <div className="section">
            <div className="lobby-header">
              <h2 className="section-title">Lobby</h2>
              {currentLobby.host_id === user?.id && currentLobby.participants.length < currentLobby.max_players && (
                <button
                  className="action-btn primary-action"
                  onClick={() => setShowInviteModal(true)}
                  style={{ marginLeft: 'auto' }}
                >
                  Invite Friend
                </button>
              )}
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
                {currentLobby.host_id === user?.id && (
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    Click "Invite Friend" to invite someone from your friends list
                  </p>
                )}
              </div>
            )}

            {/* Invite Friend Modal */}
            {showInviteModal && (
              <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Invite a Friend</h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {friends.length === 0 ? (
                      <p>No friends to invite. Add friends from your profile!</p>
                    ) : (
                      friends
                        .filter(friend => !currentLobby.participants.some(p => p.user_id === friend.friend_id))
                        .map((friend) => (
                          <div key={friend.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ fontSize: '2rem' }}>
                                {getAvatarEmoji(friend.avatar_selection || null)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 'bold' }}>{friend.username || friend.name || 'Friend'}</div>
                              </div>
                            </div>
                            <button
                              className="action-btn primary-action"
                              onClick={() => handleInviteFriend(friend.friend_id)}
                              style={{ padding: '0.5rem 1rem' }}
                            >
                              Invite
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                  <button
                    className="action-btn secondary"
                    onClick={() => setShowInviteModal(false)}
                    style={{ marginTop: '1rem', width: '100%' }}
                  >
                    Close
                  </button>
                </div>
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

