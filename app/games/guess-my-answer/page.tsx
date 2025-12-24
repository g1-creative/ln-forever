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
  getRandomQuestions, 
  categories, 
  GuessMyAnswerQuestion 
} from '@/lib/guess-my-answer-questions-new';
import { getFriends } from '@/lib/db/friends';
import { CheckCircleIcon, XCircleIcon, PlayIcon } from '@/components/Icons';

type GamePhase = 'categorySelect' | 'round1' | 'round2' | 'results';
type QuestionState = 'answering' | 'guessing' | 'revealed';
type LobbyView = 'create' | 'lobby' | 'playing';

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

interface GameScore {
  round1Answerer: string;
  round1Guesser: string;
  round1Score: number;
  round2Answerer: string;
  round2Guesser: string;
  round2Score: number;
}

export default function GuessMyAnswerPage() {
  const { user, profile } = useAuth();
  const [lobbyView, setLobbyView] = useState<LobbyView>('create');
  const [currentLobby, setCurrentLobby] = useState<LobbyWithParticipants | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('categorySelect');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GuessMyAnswerQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionState, setQuestionState] = useState<QuestionState>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [scores, setScores] = useState<GameScore>({
    round1Answerer: '',
    round1Guesser: '',
    round1Score: 0,
    round2Answerer: '',
    round2Guesser: '',
    round2Score: 0,
  });
  const [currentRoundScore, setCurrentRoundScore] = useState(0);

  const supabase = getSupabaseClient();
  const channelRef = useRef<any>(null);
  const gameStateChannelRef = useRef<any>(null);
  const previousStatusRef = useRef(currentLobby?.status || 'waiting');

  // Load friends
  const loadFriends = useCallback(async () => {
    if (!user) return;
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  }, [user]);

  // Load invitations
  const loadInvitations = useCallback(async () => {
    if (!user) return;
    try {
      const invitationsList = await getLobbyInvitations();
      setInvitations(invitationsList);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    }
  }, [user]);

  // Load friends and invitations on mount
  useEffect(() => {
    loadFriends();
    loadInvitations();
  }, [loadFriends, loadInvitations]);

  // Real-time subscription for invitations
  useEffect(() => {
    if (!supabase || !user) return;

    const invitationsChannel = supabase
      .channel(`invitations-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_invitations',
          filter: `invitee_id=eq.${user.id}`,
        },
        () => {
          loadInvitations();
        }
      )
      .subscribe();

    return () => {
      invitationsChannel.unsubscribe();
    };
  }, [supabase, user, loadInvitations]);

  // Lobby subscription
  useEffect(() => {
    if (!supabase || !currentLobby) return;

    previousStatusRef.current = currentLobby.status;

    // If lobby is already playing, transition to playing view and load game state
    if (currentLobby.status === 'playing' && lobbyView === 'lobby') {
      console.log('Lobby is already playing, transitioning to playing view...');
      setLobbyView('playing');
      loadGameState();
    } else if (currentLobby.status === 'playing' && lobbyView === 'playing') {
      // Already in playing view, just load the state
      loadGameState();
    }

    // Clean up existing subscription
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`lobby-${currentLobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants',
          filter: `lobby_id=eq.${currentLobby.id}`,
        },
        () => {
          console.log('Lobby participants changed, refreshing...');
          refreshLobby();
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
          const updated = await getLobby(currentLobby.id);
          if (updated) {
            const previousStatus = previousStatusRef.current;
            previousStatusRef.current = updated.status;
            setCurrentLobby(updated);

            // If lobby status changed to playing, transition to playing view
            if (updated.status === 'playing' && previousStatus === 'waiting') {
              console.log('Game started! Transitioning to playing view...');
              setLobbyView('playing');
              // Give a moment for the view to update, then load game state
              setTimeout(() => {
                loadGameState();
              }, 200);
            }
          }
        }
      )
      .subscribe((status: string) => {
        console.log('Lobby channel subscription status:', status);
      });

    channelRef.current = channel;

    // Add polling fallback for lobby status changes
    const pollInterval = setInterval(async () => {
      const updated = await getLobby(currentLobby.id);
      if (updated) {
        const previousStatus = previousStatusRef.current;
        if (updated.status !== previousStatus) {
          console.log(`Lobby status changed (polling): ${previousStatus} -> ${updated.status}`);
          previousStatusRef.current = updated.status;
          setCurrentLobby(updated);
          
          if (updated.status === 'playing' && previousStatus === 'waiting') {
            console.log('Game started (detected by polling)! Transitioning to playing view...');
            setLobbyView('playing');
            setTimeout(() => {
              loadGameState();
            }, 200);
          }
        }
      }
    }, 2000);

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      clearInterval(pollInterval);
    };
  }, [currentLobby, supabase]);

  // Game state subscription
  useEffect(() => {
    if (!supabase || !currentLobby || currentLobby.status !== 'playing') return;

    if (gameStateChannelRef.current) {
      gameStateChannelRef.current.unsubscribe();
    }

    const gameStateChannel = supabase
      .channel(`game-state-${currentLobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guess_my_answer_state',
          filter: `lobby_id=eq.${currentLobby.id}`,
        },
        async () => {
          console.log('Game state changed, reloading...');
          await loadGameState();
        }
      )
      .subscribe();

    gameStateChannelRef.current = gameStateChannel;

    // Polling fallback
    const pollInterval = setInterval(() => {
      loadGameState();
    }, 1000);

    return () => {
      gameStateChannel.unsubscribe();
      gameStateChannelRef.current = null;
      clearInterval(pollInterval);
    };
  }, [currentLobby, supabase]);

  const loadGameState = async () => {
    if (!currentLobby || !user || !supabase) return;

    try {
      const { data: gameStateData } = await (supabase
        .from('guess_my_answer_state') as any)
        .select('game_data, current_turn_user_id')
        .eq('lobby_id', currentLobby.id)
        .single();

      if (gameStateData?.game_data) {
        const gameData = gameStateData.game_data;
        
        if (gameData.selectedCategory) setSelectedCategory(gameData.selectedCategory);
        if (gameData.questions) setQuestions(gameData.questions);
        if (gameData.gamePhase) setGamePhase(gameData.gamePhase);
        if (gameData.currentQuestionIndex !== undefined) setCurrentQuestionIndex(gameData.currentQuestionIndex);
        if (gameData.questionState) setQuestionState(gameData.questionState);
        if (gameData.selectedAnswer) setSelectedAnswer(gameData.selectedAnswer);
        if (gameData.currentRoundScore !== undefined) setCurrentRoundScore(gameData.currentRoundScore);
        if (gameData.scores) setScores(gameData.scores);
        
        // If we're in playing view but haven't transitioned yet, do it now
        if (lobbyView !== 'playing') {
          setLobbyView('playing');
        }
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  };

  const refreshLobby = async () => {
    if (!currentLobby) return;
    try {
      const updated = await getLobby(currentLobby.id);
      if (updated) {
        setCurrentLobby(updated);
      }
    } catch (err) {
      console.error('Failed to refresh lobby:', err);
    }
  };

  const handleCreateLobby = async () => {
    setLoading(true);
    setError(null);
    try {
      const lobby = await createLobby('guess-my-answer', 2);
      // Fetch the full lobby with participants
      const fullLobby = await getLobby(lobby.id);
      if (fullLobby) {
        setCurrentLobby(fullLobby);
        setLobbyView('lobby');
      } else {
        throw new Error('Failed to load lobby details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (!currentLobby) return;
    setLoading(true);
    try {
      await leaveLobby(currentLobby.id);
      setCurrentLobby(null);
      setLobbyView('create');
      setGamePhase('categorySelect');
      setSelectedCategory(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setQuestionState('answering');
      setSelectedAnswer(null);
      setSelectedGuess(null);
      setCurrentRoundScore(0);
    } catch (err: any) {
      setError(err.message || 'Failed to leave lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!currentLobby || !user) return;
    const currentParticipant = currentLobby.participants.find(p => p.user_id === user.id);
    if (!currentParticipant) return;

    setLoading(true);
    try {
      await setReadyStatus(currentLobby.id, !currentParticipant.is_ready);
      await refreshLobby();
    } catch (err: any) {
      setError(err.message || 'Failed to update ready status');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriend = async (friendId: string) => {
    if (!currentLobby) return;
    setLoading(true);
    setError(null);
    try {
      await inviteFriendToLobby(currentLobby.id, friendId);
      setShowInviteModal(false);
      await refreshLobby();
    } catch (err: any) {
      setError(err.message || 'Failed to invite friend');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string, lobbyId: string) => {
    setLoading(true);
    setError(null);
    try {
      await acceptLobbyInvitation(invitationId);
      await loadInvitations();
      const lobby = await getLobby(lobbyId);
      if (lobby) {
        setCurrentLobby(lobby);
        setLobbyView('lobby');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    setLoading(true);
    try {
      await declineLobbyInvitation(invitationId);
      await loadInvitations();
    } catch (err: any) {
      setError(err.message || 'Failed to decline invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!currentLobby || !user) return;
    if (currentLobby.host_id !== user.id) return;
    if (currentLobby.participants.length !== 2) return;
    if (!currentLobby.participants.every(p => p.is_ready)) return;

    setLoading(true);
    try {
      await updateLobbyStatus(currentLobby.id, 'playing');
      const updated = await getLobby(currentLobby.id);
      if (updated) {
        setCurrentLobby(updated);
        setLobbyView('playing');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!currentLobby || !user || !supabase) return;
    // Only host can select category
    if (currentLobby.host_id !== user.id) return;

    setLoading(true);
    try {
      const selectedQuestions = getRandomQuestions(categoryId, 10);
      setSelectedCategory(categoryId);
      setQuestions(selectedQuestions);
      
      // Determine who goes first (host is answerer in round 1)
      const round1Answerer = user.id;
      const round1Guesser = currentLobby.participants.find(p => p.user_id !== user.id)?.user_id || '';

      setGamePhase('round1');
      setCurrentQuestionIndex(0);
      setQuestionState('answering');
      setScores({
        round1Answerer: round1Answerer,
        round1Guesser: round1Guesser,
        round1Score: 0,
        round2Answerer: round1Guesser,
        round2Guesser: round1Answerer,
        round2Score: 0,
      });

      // Store game state in DB
      await (supabase.from('guess_my_answer_state') as any).upsert({
        lobby_id: currentLobby.id,
        current_turn_user_id: round1Answerer,
        game_data: {
          selectedCategory: categoryId,
          questions: selectedQuestions,
          gamePhase: 'round1',
          currentQuestionIndex: 0,
          questionState: 'answering',
          selectedAnswer: null,
          currentRoundScore: 0,
          scores: {
            round1Answerer: round1Answerer,
            round1Guesser: round1Guesser,
            round1Score: 0,
            round2Answerer: round1Guesser,
            round2Guesser: round1Answerer,
            round2Score: 0,
          },
        },
      }, { onConflict: 'lobby_id' });

    } catch (err: any) {
      setError(err.message || 'Failed to select category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentLobby || !user || !supabase) return;

    setLoading(true);
    try {
      const currentAnswerer = gamePhase === 'round1' ? scores.round1Answerer : scores.round2Answerer;
      const currentGuesser = gamePhase === 'round1' ? scores.round1Guesser : scores.round2Guesser;

      await (supabase.from('guess_my_answer_state') as any).update({
        current_turn_user_id: currentGuesser,
        game_data: {
          selectedCategory,
          questions,
          gamePhase,
          currentQuestionIndex,
          questionState: 'guessing',
          selectedAnswer: selectedAnswer,
          currentRoundScore,
          scores,
        },
      }).eq('lobby_id', currentLobby.id);

      setQuestionState('guessing');
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGuess = async () => {
    if (!selectedGuess || !currentLobby || !user || !supabase) return;

    setLoading(true);
    try {
      const isCorrect = selectedGuess === selectedAnswer;
      const newScore = isCorrect ? currentRoundScore + 1 : currentRoundScore;

      await (supabase.from('guess_my_answer_state') as any).update({
        current_turn_user_id: null,
        game_data: {
          selectedCategory,
          questions,
          gamePhase,
          currentQuestionIndex,
          questionState: 'revealed',
          selectedAnswer,
          selectedGuess,
          currentRoundScore: newScore,
          scores,
        },
      }).eq('lobby_id', currentLobby.id);

      setCurrentRoundScore(newScore);
      setQuestionState('revealed');
    } catch (err: any) {
      setError(err.message || 'Failed to submit guess');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentLobby || !user || !supabase) return;

    setLoading(true);
    try {
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex >= questions.length) {
        // Round finished
        if (gamePhase === 'round1') {
          // Update round 1 score and move to round 2
          const updatedScores = { ...scores, round1Score: currentRoundScore };
          
          await (supabase.from('guess_my_answer_state') as any).update({
            current_turn_user_id: scores.round2Answerer,
            game_data: {
              selectedCategory,
              questions,
              gamePhase: 'round2',
              currentQuestionIndex: 0,
              questionState: 'answering',
              selectedAnswer: null,
              selectedGuess: null,
              currentRoundScore: 0,
              scores: updatedScores,
            },
          }).eq('lobby_id', currentLobby.id);

          setScores(updatedScores);
          setGamePhase('round2');
          setCurrentQuestionIndex(0);
          setCurrentRoundScore(0);
        } else {
          // Round 2 finished, show results
          const updatedScores = { ...scores, round2Score: currentRoundScore };
          
          await (supabase.from('guess_my_answer_state') as any).update({
            current_turn_user_id: null,
            game_data: {
              selectedCategory,
              questions,
              gamePhase: 'results',
              currentQuestionIndex: 0,
              questionState: 'answering',
              selectedAnswer: null,
              selectedGuess: null,
              currentRoundScore: 0,
              scores: updatedScores,
            },
          }).eq('lobby_id', currentLobby.id);

          setScores(updatedScores);
          setGamePhase('results');
        }
      } else {
        // Next question
        const currentAnswerer = gamePhase === 'round1' ? scores.round1Answerer : scores.round2Answerer;
        
        await (supabase.from('guess_my_answer_state') as any).update({
          current_turn_user_id: currentAnswerer,
          game_data: {
            selectedCategory,
            questions,
            gamePhase,
            currentQuestionIndex: nextIndex,
            questionState: 'answering',
            selectedAnswer: null,
            selectedGuess: null,
            currentRoundScore,
            scores,
          },
        }).eq('lobby_id', currentLobby.id);

        setCurrentQuestionIndex(nextIndex);
      }

      setQuestionState('answering');
      setSelectedAnswer(null);
      setSelectedGuess(null);
    } catch (err: any) {
      setError(err.message || 'Failed to proceed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = async () => {
    if (!currentLobby || !user || !supabase) return;
    if (currentLobby.host_id !== user.id) return;

    setLoading(true);
    try {
      // Reset game state
      await (supabase.from('guess_my_answer_state') as any).update({
        current_turn_user_id: null,
        game_data: null,
      }).eq('lobby_id', currentLobby.id);

      // Reset local state
      setGamePhase('categorySelect');
      setSelectedCategory(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setQuestionState('answering');
      setSelectedAnswer(null);
      setSelectedGuess(null);
      setCurrentRoundScore(0);
      setScores({
        round1Answerer: '',
        round1Guesser: '',
        round1Score: 0,
        round2Answerer: '',
        round2Guesser: '',
        round2Score: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to restart game');
    } finally {
      setLoading(false);
    }
  };

  const isHost = currentLobby && user && currentLobby.host_id === user.id;
  const currentAnswerer = gamePhase === 'round1' ? scores.round1Answerer : scores.round2Answerer;
  const currentGuesser = gamePhase === 'round1' ? scores.round1Guesser : scores.round2Guesser;
  const isMyTurnToAnswer = user && currentAnswerer === user.id;
  const isMyTurnToGuess = user && currentGuesser === user.id;

  const currentQuestion = questions[currentQuestionIndex];
  const categoryInfo = categories.find(c => c.id === selectedCategory);

  // Calculate winner
  const getWinner = () => {
    if (scores.round1Score > scores.round2Score) {
      return scores.round1Guesser;
    } else if (scores.round2Score > scores.round1Score) {
      return scores.round2Guesser;
    }
    return 'tie';
  };

  const getParticipantProfile = (userId: string) => {
    return currentLobby?.participants.find(p => p.user_id === userId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/games" className="text-white hover:text-pink-300 transition">
              ← Back to Games
            </Link>
            <h1 className="text-4xl font-bold text-white">Guess My Answer</h1>
            <div className="w-24"></div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Create Lobby View */}
          {lobbyView === 'create' && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 text-center">Get Started</h2>
              
              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Pending Invitations</h3>
                  <div className="space-y-2">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="bg-white/10 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {AVATAR_EMOJIS[invitation.inviter_profile?.avatar_emoji || 'avatar1']}
                          </span>
                          <div>
                            <p className="font-bold">{invitation.inviter_profile?.display_name}</p>
                            <p className="text-sm text-pink-200">invited you to play</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptInvitation(invitation.id, invitation.lobby_id)}
                            disabled={loading}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineInvitation(invitation.id)}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateLobby}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create New Lobby'}
              </button>
            </div>
          )}

          {/* Lobby View */}
          {lobbyView === 'lobby' && currentLobby && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 text-center">Lobby</h2>

              {/* Participants */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Players ({currentLobby.participants.length}/{currentLobby.max_players})</h3>
                <div className="space-y-2">
                  {currentLobby.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="bg-white/10 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {AVATAR_EMOJIS[participant.profile?.avatar_selection || 'avatar1']}
                        </span>
                        <div>
                          <p className="font-bold">
                            {participant.profile?.name}
                            {participant.user_id === currentLobby.host_id && ' (Host)'}
                            {participant.user_id === user?.id && ' (You)'}
                          </p>
                        </div>
                      </div>
                      <div>
                        {participant.is_ready ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-400" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {isHost && currentLobby.participants.length < currentLobby.max_players && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition"
                  >
                    Invite Friend
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={refreshLobby}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
                  >
                    Refresh
                  </button>
                )}

                <button
                  onClick={handleToggleReady}
                  disabled={loading}
                  className={`font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 ${
                    currentLobby.participants.find(p => p.user_id === user?.id)?.is_ready
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {currentLobby.participants.find(p => p.user_id === user?.id)?.is_ready
                    ? 'Not Ready'
                    : 'Ready'}
                </button>

                {isHost &&
                  currentLobby.participants.length === 2 &&
                  currentLobby.participants.every(p => p.is_ready) && (
                    <button
                      onClick={handleStartGame}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Start Game
                    </button>
                  )}

                {!isHost &&
                  currentLobby.participants.length === 2 &&
                  currentLobby.participants.every(p => p.is_ready) && (
                    <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-lg text-center">
                      Waiting for host to start the game...
                    </div>
                  )}

                <button
                  onClick={handleLeaveLobby}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                >
                  Leave Lobby
                </button>
              </div>
            </div>
          )}

          {/* Playing View */}
          {lobbyView === 'playing' && currentLobby && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white">
              {/* Category Selection */}
              {gamePhase === 'categorySelect' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-center">Choose a Category</h2>
                  {isHost ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          disabled={loading}
                          className="bg-white/20 hover:bg-white/30 p-6 rounded-xl transition disabled:opacity-50 text-left"
                        >
                          <div className="text-5xl mb-3">{category.emoji}</div>
                          <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                          <p className="text-pink-200">{category.description}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-xl">
                      Waiting for host to select a category...
                    </div>
                  )}
                </div>
              )}

              {/* Playing Round */}
              {(gamePhase === 'round1' || gamePhase === 'round2') && currentQuestion && (
                <div>
                  {/* Header */}
                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg">
                        {categoryInfo?.emoji} {categoryInfo?.name}
                      </div>
                      <div className="text-lg font-bold">
                        {gamePhase === 'round1' ? 'Round 1' : 'Round 2'}
                      </div>
                      <div className="text-lg">
                        Question {currentQuestionIndex + 1}/10
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      Score: {currentRoundScore}/10
                    </div>
                  </div>

                  {/* Question */}
                  <div className="bg-white/20 p-6 rounded-xl mb-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">{currentQuestion.question}</h3>

                    {/* Answering Phase */}
                    {questionState === 'answering' && (
                      <div>
                        {isMyTurnToAnswer ? (
                          <div>
                            <p className="text-center mb-4 text-pink-200">Select your answer:</p>
                            <div className="grid grid-cols-1 gap-3">
                              {currentQuestion.options.map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedAnswer(option)}
                                  className={`p-4 rounded-lg text-left transition ${
                                    selectedAnswer === option
                                      ? 'bg-pink-500 text-white'
                                      : 'bg-white/10 hover:bg-white/20'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                            {selectedAnswer && (
                              <button
                                onClick={handleSubmitAnswer}
                                disabled={loading}
                                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                              >
                                Submit Answer
                              </button>
                            )}
                          </div>
                        ) : (
                        <div className="text-center text-xl">
                          Waiting for {getParticipantProfile(currentAnswerer)?.profile?.name} to answer...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Guessing Phase */}
                    {questionState === 'guessing' && (
                      <div>
                        {isMyTurnToGuess ? (
                          <div>
                            <p className="text-center mb-4 text-pink-200">Guess their answer:</p>
                            <div className="grid grid-cols-1 gap-3">
                              {currentQuestion.options.map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedGuess(option)}
                                  className={`p-4 rounded-lg text-left transition ${
                                    selectedGuess === option
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-white/10 hover:bg-white/20'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                            {selectedGuess && (
                              <button
                                onClick={handleSubmitGuess}
                                disabled={loading}
                                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                              >
                                Submit Guess
                              </button>
                            )}
                          </div>
                        ) : (
                        <div className="text-center text-xl">
                          Waiting for {getParticipantProfile(currentGuesser)?.profile?.name} to guess...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Revealed Phase */}
                    {questionState === 'revealed' && (
                      <div>
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          {currentQuestion.options.map((option, index) => {
                            const isCorrectAnswer = option === selectedAnswer;
                            const wasGuessed = option === selectedGuess;
                            const isCorrectGuess = selectedAnswer === selectedGuess && isCorrectAnswer;

                            return (
                              <div
                                key={index}
                                className={`p-4 rounded-lg ${
                                  isCorrectAnswer && isCorrectGuess
                                    ? 'bg-green-500 text-white'
                                    : isCorrectAnswer
                                    ? 'bg-blue-500 text-white'
                                    : wasGuessed
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/10'
                                }`}
                              >
                                {option}
                                {isCorrectAnswer && ' ✓ (Correct Answer)'}
                                {wasGuessed && !isCorrectGuess && ' ✗ (Your Guess)'}
                              </div>
                            );
                          })}
                        </div>

                        <div className="text-center mb-4">
                          {selectedAnswer === selectedGuess ? (
                            <p className="text-2xl font-bold text-green-400">Correct! 🎉</p>
                          ) : (
                            <p className="text-2xl font-bold text-red-400">Incorrect 😞</p>
                          )}
                        </div>

                        {isHost && (
                          <button
                            onClick={handleNextQuestion}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                          >
                            {currentQuestionIndex + 1 >= questions.length
                              ? gamePhase === 'round1'
                                ? 'Start Round 2'
                                : 'See Results'
                              : 'Next Question'}
                          </button>
                        )}

                        {!isHost && (
                          <div className="text-center text-pink-200">
                            Waiting for host to continue...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Results */}
              {gamePhase === 'results' && (
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-8">Game Over!</h2>

                  <div className="bg-white/20 p-6 rounded-xl mb-6">
                    <h3 className="text-2xl font-bold mb-4">Final Scores</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-3xl mb-2">
                          {AVATAR_EMOJIS[getParticipantProfile(scores.round1Guesser)?.profile?.avatar_selection || 'avatar1']}
                        </div>
                        <p className="font-bold">
                          {getParticipantProfile(scores.round1Guesser)?.profile?.name}
                        </p>
                        <p className="text-3xl font-bold text-green-400">
                          {scores.round1Score}/10
                        </p>
                      </div>

                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-3xl mb-2">
                          {AVATAR_EMOJIS[getParticipantProfile(scores.round2Guesser)?.profile?.avatar_selection || 'avatar1']}
                        </div>
                        <p className="font-bold">
                          {getParticipantProfile(scores.round2Guesser)?.profile?.name}
                        </p>
                        <p className="text-3xl font-bold text-green-400">
                          {scores.round2Score}/10
                        </p>
                      </div>
                    </div>

                    {getWinner() === 'tie' ? (
                      <p className="text-3xl font-bold text-yellow-400">It's a Tie! 🤝</p>
                    ) : (
                      <p className="text-3xl font-bold text-green-400">
                        {getParticipantProfile(getWinner())?.profile?.name} Wins! 🏆
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {isHost && (
                      <button
                        onClick={handlePlayAgain}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50"
                      >
                        Play Again (Choose New Category)
                      </button>
                    )}

                    <button
                      onClick={handleLeaveLobby}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
                    >
                      Leave Game
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invite Friend Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Invite a Friend</h3>
                
                {friends.length === 0 ? (
                  <p className="text-white/70 text-center py-4">
                    No friends available. Add some friends first!
                  </p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {friends.map((friend) => (
                      <button
                        key={friend.friend_id}
                        onClick={() => handleInviteFriend(friend.friend_id)}
                        disabled={loading}
                        className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-lg flex items-center gap-3 transition disabled:opacity-50 text-white"
                      >
                        <span className="text-3xl">
                          {AVATAR_EMOJIS[friend.avatar_selection || 'avatar1']}
                        </span>
                        <span className="font-bold">{friend.name || friend.username || 'Unknown'}</span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
