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
import { getRandomScenario, Scenario } from '@/lib/scenarios';
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
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
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
          setTimeout(async () => {
            const updated = await getLobby(currentLobby.id);
            if (updated) {
              const previousStatus = currentLobby.status;
              setCurrentLobby(updated);
              // If lobby status changed to playing, start the game
              if (updated.status === 'playing' && previousStatus === 'waiting') {
                console.log('Game started! Starting game for all players...');
                await startGame(updated);
              }
            }
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
    } catch (error: any) {
      alert(error.message || 'Error updating ready status');
    }
  };

  const generateAnswerOptions = (scenario: Scenario, answererRole: 'roleA' | 'roleB'): string[] => {
    // Generate 4 multiple choice options based on the scenario
    const role = answererRole === 'roleA' ? scenario.roleA : scenario.roleB;
    const hints = scenario.hints || [];
    
    // Create options based on scenario context
    const options = [
      `Follow the scenario exactly as described`,
      `Add a creative twist to the scenario`,
      `Focus on being helpful and supportive`,
      `Make it fun and lighthearted`,
    ];
    
    return options;
  };

  const startGame = async (lobby: LobbyWithParticipants) => {
    if (lobby.participants.length < 2) return;

    // Determine who answers first (alternate each round)
    const answererIndex = (round - 1) % lobby.participants.length;
    const answerer = lobby.participants[answererIndex];
    const guesser = lobby.participants[1 - answererIndex];

    setAnswererId(answerer.user_id);
    setIsAnswerer(answerer.user_id === user?.id);

    // Get a random scenario
    const scenario = getRandomScenario('medium', 'all');
    if (scenario) {
      setCurrentScenario(scenario);
      const answererRole = answererIndex === 0 ? 'roleA' : 'roleB';
      const options = generateAnswerOptions(scenario, answererRole);
      setAnswerOptions(options);
      setSelectedAnswer(null);
      setSelectedGuess(null);
      setGameState('answering');
      setLobbyView('playing');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentLobby || !currentScenario) return;

    // Store answer (in a real implementation, this would go to the database)
    setGameState('guessing');
  };

  const handleSubmitGuess = async () => {
    if (!selectedGuess || !currentLobby) return;

    // Store guess and reveal answer
    setGameState('revealed');
  };

  const handleNextRound = () => {
    setRound(prev => prev + 1);
    setSelectedAnswer(null);
    setSelectedGuess(null);
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
            <div className="lobby-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 className="section-title">Lobby</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {currentLobby.host_id === user?.id && (
                  <button
                    className="action-btn secondary"
                    onClick={async () => {
                      const updated = await getLobby(currentLobby.id);
                      if (updated) setCurrentLobby(updated);
                    }}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    🔄 Refresh
                  </button>
                )}
                {currentLobby.host_id === user?.id && currentLobby.participants.length < currentLobby.max_players && (
                  <button
                    className="action-btn primary-action"
                    onClick={() => setShowInviteModal(true)}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Invite Friend
                  </button>
                )}
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
              {currentLobby.participants.length >= currentLobby.max_players && 
               currentLobby.participants.every(p => p.is_ready) &&
               currentLobby.host_id === user?.id && (
                <button
                  className="action-btn primary-action"
                  onClick={async () => {
                    try {
                      await updateLobbyStatus(currentLobby.id, 'playing');
                      const updated = await getLobby(currentLobby.id);
                      if (updated) {
                        setCurrentLobby(updated);
                        await startGame(updated);
                      }
                    } catch (error: any) {
                      alert(error.message || 'Error starting game');
                    }
                  }}
                  style={{ marginBottom: '0.5rem', width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                >
                  🎮 Start Game
                </button>
              )}
              {currentLobby.participants.length >= currentLobby.max_players && 
               currentLobby.participants.every(p => p.is_ready) &&
               currentLobby.host_id !== user?.id && (
                <div style={{ marginBottom: '0.5rem', padding: '0.75rem', backgroundColor: '#e7f3ff', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#0066cc' }}>
                    Waiting for host to start the game...
                  </p>
                </div>
              )}
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
            {gameState === 'answering' && isAnswerer && currentScenario && (
              <div className="game-phase">
                <h2 className="section-title">Round {round}</h2>
                <div className="question-card">
                  <h3>{currentScenario.title}</h3>
                  <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your Role:</p>
                    <p>{currentScenario.roleA}</p>
                  </div>
                  <p className="question-instruction" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                    What would you do in this scenario?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {answerOptions.map((option, index) => (
                      <button
                        key={index}
                        className={`action-btn ${selectedAnswer === option ? 'primary-action' : 'secondary'}`}
                        onClick={() => setSelectedAnswer(option)}
                        style={{
                          textAlign: 'left',
                          padding: '1rem',
                          border: selectedAnswer === option ? '2px solid #0066cc' : '1px solid #ddd',
                        }}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))}
                  </div>
                  <button
                    className="action-btn primary-action"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    style={{ marginTop: '1rem', width: '100%' }}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}

            {gameState === 'answering' && !isAnswerer && currentScenario && (
              <div className="game-phase">
                <h2 className="section-title">Round {round}</h2>
                <div className="waiting-card">
                  <p>Waiting for your partner to answer...</p>
                  <div className="question-preview" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                    <h3>{currentScenario.title}</h3>
                    <p style={{ marginTop: '0.5rem' }}>{currentScenario.roleB}</p>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'guessing' && !isAnswerer && currentScenario && (
              <div className="game-phase">
                <h2 className="section-title">Round {round}</h2>
                <div className="question-card">
                  <h3>{currentScenario.title}</h3>
                  <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your Partner's Role:</p>
                    <p>{currentScenario.roleA}</p>
                  </div>
                  <p className="question-instruction" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                    Guess what your partner chose:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {answerOptions.map((option, index) => (
                      <button
                        key={index}
                        className={`action-btn ${selectedGuess === option ? 'primary-action' : 'secondary'}`}
                        onClick={() => setSelectedGuess(option)}
                        style={{
                          textAlign: 'left',
                          padding: '1rem',
                          border: selectedGuess === option ? '2px solid #0066cc' : '1px solid #ddd',
                        }}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))}
                  </div>
                  <button
                    className="action-btn primary-action"
                    onClick={handleSubmitGuess}
                    disabled={!selectedGuess}
                    style={{ marginTop: '1rem', width: '100%' }}
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
                    <p className="reveal-text">{selectedAnswer}</p>
                  </div>
                  <div className="reveal-section">
                    <h4>Their Guess:</h4>
                    <p className="reveal-text">{selectedGuess}</p>
                  </div>
                  <div className="reveal-section" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: selectedAnswer === selectedGuess ? '#d4edda' : '#f8d7da', borderRadius: '6px' }}>
                    <h4 style={{ margin: 0 }}>
                      {selectedAnswer === selectedGuess ? '✅ Correct!' : '❌ Not quite!'}
                    </h4>
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

