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
  getAllCategories,
  getCategoryById,
  getRandomItemFromCategory,
  TwentyQuestionsCategory,
} from '@/lib/twenty-questions-data';
import { getFriends } from '@/lib/db/friends';
import { CheckCircleIcon, XCircleIcon, PlayIcon } from '@/components/Icons';

type GamePhase = 'categorySelect' | 'itemSelect' | 'playing' | 'results';
type GameStatus = 'selecting' | 'asking' | 'guessed' | 'finished';

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

interface Question {
  question: string;
  answer: 'yes' | 'no' | 'maybe';
  question_number: number;
}

interface Guess {
  guess: string;
  is_correct: boolean;
  question_number: number;
}

export default function TwentyQuestionsPage() {
  const { user, profile } = useAuth();
  const [lobbyView, setLobbyView] = useState<'create' | 'lobby' | 'playing'>('create');
  const [currentLobby, setCurrentLobby] = useState<LobbyWithParticipants | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('categorySelect');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [secretItem, setSecretItem] = useState<string | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState<Question[]>([]);
  const [guessesMade, setGuessesMade] = useState<Guess[]>([]);
  const [questionsRemaining, setQuestionsRemaining] = useState(20);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('selecting');
  const [roundNumber, setRoundNumber] = useState(1);
  const [answererId, setAnswererId] = useState<string | null>(null);
  const [guesserId, setGuesserId] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

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

    if (currentLobby.status === 'playing' && lobbyView === 'lobby') {
      console.log('Lobby is already playing, transitioning to playing view...');
      setLobbyView('playing');
      loadGameState();
    } else if (currentLobby.status === 'playing' && lobbyView === 'playing') {
      loadGameState();
    }

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
          const updated = await getLobby(currentLobby.id);
          if (updated) {
            const previousStatus = previousStatusRef.current;
            previousStatusRef.current = updated.status;
            setCurrentLobby(updated);

            if (updated.status === 'playing' && previousStatus === 'waiting') {
              setLobbyView('playing');
              setTimeout(() => {
                loadGameState();
              }, 200);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    const pollInterval = setInterval(async () => {
      const updated = await getLobby(currentLobby.id);
      if (updated) {
        const previousStatus = previousStatusRef.current;
        if (updated.status !== previousStatus) {
          previousStatusRef.current = updated.status;
          setCurrentLobby(updated);
          
          if (updated.status === 'playing' && previousStatus === 'waiting') {
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
          table: 'twenty_questions_state',
          filter: `lobby_id=eq.${currentLobby.id}`,
        },
        async () => {
          await loadGameState();
        }
      )
      .subscribe();

    gameStateChannelRef.current = gameStateChannel;

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
        .from('twenty_questions_state') as any)
        .select('game_data, current_turn_user_id')
        .eq('lobby_id', currentLobby.id)
        .single();

      if (gameStateData?.game_data) {
        const gameData = gameStateData.game_data;
        
        if (gameData.selectedCategory) setSelectedCategory(gameData.selectedCategory);
        if (gameData.secretItem) setSecretItem(gameData.secretItem);
        if (gameData.questionsAsked) setQuestionsAsked(gameData.questionsAsked);
        if (gameData.guessesMade) setGuessesMade(gameData.guessesMade);
        if (gameData.questionsRemaining !== undefined) setQuestionsRemaining(gameData.questionsRemaining);
        if (gameData.gamePhase) setGamePhase(gameData.gamePhase);
        if (gameData.gameStatus) setGameStatus(gameData.gameStatus);
        if (gameData.roundNumber) setRoundNumber(gameData.roundNumber);
        if (gameData.answererId) setAnswererId(gameData.answererId);
        if (gameData.guesserId) setGuesserId(gameData.guesserId);
        if (gameData.winner) setWinner(gameData.winner);
        
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
      const lobby = await createLobby('twenty-questions', 2);
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
      resetGameState();
    } catch (err: any) {
      setError(err.message || 'Failed to leave lobby');
    } finally {
      setLoading(false);
    }
  };

  const resetGameState = () => {
    setGamePhase('categorySelect');
    setSelectedCategory(null);
    setSecretItem(null);
    setQuestionsAsked([]);
    setGuessesMade([]);
    setQuestionsRemaining(20);
    setCurrentQuestion('');
    setCurrentGuess('');
    setGameStatus('selecting');
    setRoundNumber(1);
    setAnswererId(null);
    setGuesserId(null);
    setWinner(null);
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
    if (currentLobby.host_id !== user.id) return;

    setLoading(true);
    try {
      setSelectedCategory(categoryId);
      setGamePhase('itemSelect');
      
      // Store game state
      await (supabase.from('twenty_questions_state') as any).upsert({
        lobby_id: currentLobby.id,
        current_turn_user_id: user.id,
        game_data: {
          selectedCategory: categoryId,
          gamePhase: 'itemSelect',
          gameStatus: 'selecting',
        },
      }, { onConflict: 'lobby_id' });

    } catch (err: any) {
      setError(err.message || 'Failed to select category');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = async (item: string) => {
    if (!currentLobby || !user || !supabase) return;
    if (currentLobby.host_id !== user.id) return;

    setLoading(true);
    try {
      const otherPlayer = currentLobby.participants.find(p => p.user_id !== user.id);
      if (!otherPlayer) throw new Error('Other player not found');

      setSecretItem(item);
      setAnswererId(user.id);
      setGuesserId(otherPlayer.user_id);
      setGamePhase('playing');
      setGameStatus('asking');
      setQuestionsRemaining(20);

      // Store game state
      await (supabase.from('twenty_questions_state') as any).upsert({
        lobby_id: currentLobby.id,
        current_turn_user_id: otherPlayer.user_id,
        game_data: {
          selectedCategory: selectedCategory,
          secretItem: item,
          gamePhase: 'playing',
          gameStatus: 'asking',
          questionsAsked: [],
          guessesMade: [],
          questionsRemaining: 20,
          roundNumber: 1,
          answererId: user.id,
          guesserId: otherPlayer.user_id,
        },
      }, { onConflict: 'lobby_id' });

    } catch (err: any) {
      setError(err.message || 'Failed to select item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim() || !currentLobby || !user || !supabase) return;
    if (user.id !== guesserId) return;
    if (questionsRemaining <= 0) return;

    setLoading(true);
    try {
      // This will be answered by the answerer
      const newQuestion: Question = {
        question: currentQuestion.trim(),
        answer: 'maybe', // Will be set by answerer
        question_number: 21 - questionsRemaining,
      };

      const updatedQuestions = [...questionsAsked, newQuestion];
      setQuestionsAsked(updatedQuestions);
      setCurrentQuestion('');
      setQuestionsRemaining(questionsRemaining - 1);
      setGameStatus('asking');

      // Store game state
      await (supabase.from('twenty_questions_state') as any).update({
        current_turn_user_id: answererId,
        game_data: {
          selectedCategory,
          secretItem,
          gamePhase: 'playing',
          gameStatus: 'asking',
          questionsAsked: updatedQuestions,
          guessesMade,
          questionsRemaining: questionsRemaining - 1,
          roundNumber,
          answererId,
          guesserId,
        },
      }).eq('lobby_id', currentLobby.id);

    } catch (err: any) {
      setError(err.message || 'Failed to submit question');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = async (questionIndex: number, answer: 'yes' | 'no') => {
    if (!currentLobby || !user || !supabase) return;
    if (user.id !== answererId) return;

    setLoading(true);
    try {
      const updatedQuestions = [...questionsAsked];
      updatedQuestions[questionIndex].answer = answer;
      setQuestionsAsked(updatedQuestions);
      setGameStatus('asking');

      // Store game state
      await (supabase.from('twenty_questions_state') as any).update({
        current_turn_user_id: guesserId,
        game_data: {
          selectedCategory,
          secretItem,
          gamePhase: 'playing',
          gameStatus: 'asking',
          questionsAsked: updatedQuestions,
          guessesMade,
          questionsRemaining,
          roundNumber,
          answererId,
          guesserId,
        },
      }).eq('lobby_id', currentLobby.id);

    } catch (err: any) {
      setError(err.message || 'Failed to answer question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGuess = async () => {
    if (!currentGuess.trim() || !currentLobby || !user || !supabase) return;
    if (user.id !== guesserId) return;

    setLoading(true);
    try {
      const isCorrect = currentGuess.trim().toLowerCase() === secretItem?.toLowerCase();
      const newGuess: Guess = {
        guess: currentGuess.trim(),
        is_correct: isCorrect,
        question_number: 21 - questionsRemaining,
      };

      const updatedGuesses = [...guessesMade, newGuess];
      setGuessesMade(updatedGuesses);
      const guessValue = currentGuess.trim();
      setCurrentGuess('');

      if (isCorrect) {
        setWinner(guesserId);
        setGameStatus('finished');
        setGamePhase('results');
      } else {
        setGameStatus('asking');
      }

      // Store game state
      await (supabase.from('twenty_questions_state') as any).update({
        current_turn_user_id: isCorrect ? null : guesserId,
        game_data: {
          selectedCategory,
          secretItem,
          gamePhase: isCorrect ? 'results' : 'playing',
          gameStatus: isCorrect ? 'finished' : 'asking',
          questionsAsked,
          guessesMade: updatedGuesses,
          questionsRemaining,
          roundNumber,
          answererId,
          guesserId,
          winner: isCorrect ? guesserId : null,
        },
      }).eq('lobby_id', currentLobby.id);

    } catch (err: any) {
      setError(err.message || 'Failed to submit guess');
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = async () => {
    if (!currentLobby || !user || !supabase) return;
    if (questionsRemaining <= 0 && !winner) {
      // Answerer wins if no more questions
      setWinner(answererId);
      setGameStatus('finished');
      setGamePhase('results');

      await (supabase.from('twenty_questions_state') as any).update({
        game_data: {
          selectedCategory,
          secretItem,
          gamePhase: 'results',
          gameStatus: 'finished',
          questionsAsked,
          guessesMade,
          questionsRemaining: 0,
          roundNumber,
          answererId,
          guesserId,
          winner: answererId,
        },
      }).eq('lobby_id', currentLobby.id);
    }
  };

  // Auto-check game over when questions run out
  useEffect(() => {
    if (questionsRemaining <= 0 && gameStatus === 'asking' && !winner) {
      handleGameOver();
    }
  }, [questionsRemaining, gameStatus, winner]);

  const handlePlayAgain = async () => {
    if (!currentLobby || !user || !supabase) return;
    if (currentLobby.host_id !== user.id) return;

    setLoading(true);
    try {
      await (supabase.from('twenty_questions_state') as any).update({
        current_turn_user_id: null,
        game_data: null,
      }).eq('lobby_id', currentLobby.id);

      resetGameState();
    } catch (err: any) {
      setError(err.message || 'Failed to restart game');
    } finally {
      setLoading(false);
    }
  };

  const isHost = currentLobby && user && currentLobby.host_id === user.id;
  const isAnswerer = user && answererId === user.id;
  const isGuesser = user && guesserId === user.id;
  const categoryInfo = selectedCategory ? getCategoryById(selectedCategory) : null;

  const getParticipantProfile = (userId: string) => {
    return currentLobby?.participants.find(p => p.user_id === userId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-800 py-3 sm:py-6 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link href="/games" className="text-white hover:text-green-300 transition text-sm sm:text-base flex items-center gap-1">
              <span className="text-lg">←</span> <span className="hidden sm:inline">Back</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center flex-1">20 Questions</h1>
            <div className="w-12 sm:w-24"></div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Create Lobby View */}
          {lobbyView === 'create' && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 md:p-8 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Get Started</h2>
              
              {invitations.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Pending Invitations</h3>
                  <div className="space-y-2">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="bg-white/10 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">
                            {AVATAR_EMOJIS[invitation.inviter_profile?.avatar_emoji || invitation.inviter?.avatar_selection || 'avatar1']}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm sm:text-base truncate">{invitation.inviter_profile?.display_name || invitation.inviter?.name || 'Unknown'}</p>
                            <p className="text-xs sm:text-sm text-green-200">invited you to play</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleAcceptInvitation(invitation.id, invitation.lobby_id)}
                            disabled={loading}
                            className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg disabled:opacity-50 text-sm sm:text-base font-semibold min-h-[44px] sm:min-h-0"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineInvitation(invitation.id)}
                            disabled={loading}
                            className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg disabled:opacity-50 text-sm sm:text-base font-semibold min-h-[44px] sm:min-h-0"
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
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl transition disabled:opacity-50 text-base sm:text-lg min-h-[48px] sm:min-h-0"
              >
                {loading ? 'Creating...' : 'Create New Lobby'}
              </button>
            </div>
          )}

          {/* Lobby View */}
          {lobbyView === 'lobby' && currentLobby && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 md:p-8 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Lobby</h2>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Players ({currentLobby.participants.length}/{currentLobby.max_players})</h3>
                <div className="space-y-2">
                  {currentLobby.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="bg-white/10 p-3 sm:p-4 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">
                          {AVATAR_EMOJIS[participant.profile?.avatar_selection || 'avatar1']}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm sm:text-base truncate">
                            {participant.profile?.name || 'Unknown'}
                            {participant.user_id === currentLobby.host_id && <span className="text-green-300"> (Host)</span>}
                            {participant.user_id === user?.id && <span className="text-blue-300"> (You)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {participant.is_ready ? (
                          <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3">
                {isHost && currentLobby.participants.length < currentLobby.max_players && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  >
                    Invite Friend
                  </button>
                )}

                <button
                  onClick={handleToggleReady}
                  disabled={loading}
                  className={`font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 text-sm sm:text-base min-h-[44px] sm:min-h-0 ${
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
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px] sm:min-h-0"
                    >
                      <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      Start Game
                    </button>
                  )}

                <button
                  onClick={handleLeaveLobby}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 text-sm sm:text-base min-h-[44px] sm:min-h-0"
                >
                  Leave Lobby
                </button>
              </div>
            </div>
          )}

          {/* Playing View */}
          {lobbyView === 'playing' && currentLobby && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 md:p-8 text-white">
              {/* Category Selection */}
              {gamePhase === 'categorySelect' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Choose a Category</h2>
                  {isHost ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {getAllCategories().map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          disabled={loading}
                          className="bg-white/20 hover:bg-white/30 active:bg-white/40 p-4 sm:p-5 md:p-6 rounded-xl transition disabled:opacity-50 text-left min-h-[120px] sm:min-h-[140px]"
                        >
                          <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{category.emoji}</div>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{category.name}</h3>
                          <p className="text-xs sm:text-sm text-green-200">{category.description}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-base sm:text-lg md:text-xl py-8">
                      Waiting for host to select a category...
                    </div>
                  )}
                </div>
              )}

              {/* Item Selection */}
              {gamePhase === 'itemSelect' && categoryInfo && (
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">
                    Select an Item from {categoryInfo.emoji} {categoryInfo.name}
                  </h2>
                  {isHost ? (
                    <div>
                      <p className="text-center mb-3 sm:mb-4 text-green-200 text-sm sm:text-base px-2">
                        Think of an item from this category. You can select one randomly or choose your own.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 max-h-[50vh] sm:max-h-96 overflow-y-auto overscroll-contain">
                        {categoryInfo.items.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleItemSelect(item)}
                            disabled={loading}
                            className="bg-white/20 hover:bg-white/30 active:bg-white/40 p-2.5 sm:p-3 rounded-lg transition disabled:opacity-50 text-xs sm:text-sm font-medium min-h-[44px] sm:min-h-0"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const randomItem = getRandomItemFromCategory(selectedCategory!);
                          if (randomItem) handleItemSelect(randomItem);
                        }}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 text-sm sm:text-base min-h-[48px] sm:min-h-0"
                      >
                        🎲 Pick Random Item
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-base sm:text-lg md:text-xl py-8">
                      Waiting for host to select an item...
                    </div>
                  )}
                </div>
              )}

              {/* Playing Game */}
              {gamePhase === 'playing' && (
                <div>
                  <div className="mb-4 sm:mb-6 text-center">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 px-2">
                      <div className="text-sm sm:text-base md:text-lg">
                        {categoryInfo?.emoji} {categoryInfo?.name}
                      </div>
                      <div className="text-base sm:text-lg font-bold bg-white/20 px-2 sm:px-3 py-1 rounded-lg">
                        {questionsRemaining}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-green-200 mb-2 px-2">
                      {isAnswerer && `You are the Answerer. The secret item is: ${secretItem}`}
                      {isGuesser && 'You are the Guesser. Ask yes/no questions to find the item!'}
                    </div>
                  </div>

                  {/* Questions Asked */}
                  {questionsAsked.length > 0 && (
                    <div className="bg-white/20 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto overscroll-contain">
                      <h3 className="font-bold mb-2 text-sm sm:text-base">Questions Asked:</h3>
                      <div className="space-y-2">
                        {questionsAsked.map((q, index) => (
                          <div key={index} className="bg-white/10 p-2.5 sm:p-3 rounded-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm flex-1 break-words">Q{q.question_number}: {q.question}</span>
                              {isAnswerer && q.answer === 'maybe' ? (
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleAnswerQuestion(index, 'yes')}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-3 sm:px-3 py-2 sm:py-1 rounded text-xs sm:text-sm disabled:opacity-50 font-semibold min-h-[40px] sm:min-h-0"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => handleAnswerQuestion(index, 'no')}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-3 sm:px-3 py-2 sm:py-1 rounded text-xs sm:text-sm disabled:opacity-50 font-semibold min-h-[40px] sm:min-h-0"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-xs sm:text-sm font-bold flex-shrink-0 ${q.answer === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                                  {q.answer === 'yes' ? '✓ Yes' : '✗ No'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guesses Made */}
                  {guessesMade.length > 0 && (
                    <div className="bg-white/20 p-4 rounded-xl mb-4">
                      <h3 className="font-bold mb-2">Guesses Made:</h3>
                      <div className="space-y-2">
                        {guessesMade.map((g, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              g.is_correct ? 'bg-green-500/30' : 'bg-red-500/30'
                            }`}
                          >
                            <span className="text-sm">
                              Guess #{g.question_number}: {g.guess} - {g.is_correct ? '✓ Correct!' : '✗ Wrong'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guesser's Turn */}
                  {isGuesser && gameStatus === 'asking' && questionsRemaining > 0 && (
                    <div className="bg-white/20 p-4 sm:p-6 rounded-xl sticky bottom-0 sm:relative">
                      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Ask a Yes/No Question</h3>
                      <input
                        type="text"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                        placeholder="e.g., Is it an animal?"
                        className="w-full bg-white/20 border border-white/30 rounded-lg p-3 sm:p-3 text-white placeholder-white/50 mb-3 text-sm sm:text-base min-h-[44px]"
                      />
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={handleSubmitQuestion}
                          disabled={loading || !currentQuestion.trim() || questionsRemaining <= 0}
                          className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 text-sm sm:text-base min-h-[48px] sm:min-h-0"
                        >
                          Ask Question
                        </button>
                        <button
                          onClick={() => setShowGuessModal(true)}
                          disabled={loading || questionsRemaining <= 0}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 text-sm sm:text-base min-h-[48px] sm:min-h-0"
                        >
                          Make Guess
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Answerer's Turn */}
                  {isAnswerer && gameStatus === 'asking' && (
                    <div className="bg-white/20 p-4 sm:p-6 rounded-xl">
                      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Waiting for Guesser...</h3>
                      <p className="text-green-200 text-sm sm:text-base">
                        The guesser is asking questions. Answer them when they appear above.
                      </p>
                    </div>
                  )}

                  {/* Out of Questions */}
                  {questionsRemaining <= 0 && !winner && (
                    <div className="bg-yellow-500/20 border border-yellow-500 p-4 sm:p-6 rounded-xl text-center">
                      <p className="text-lg sm:text-xl font-bold mb-2">Out of Questions!</p>
                      <p className="text-green-200 text-sm sm:text-base mb-3 sm:mb-4">
                        {isAnswerer ? 'You win! The guesser couldn\'t guess your item.' : 'You ran out of questions. The answerer wins!'}
                      </p>
                      {isHost && (
                        <button
                          onClick={handleGameOver}
                          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2.5 sm:py-2 px-4 rounded-lg text-sm sm:text-base min-h-[44px] sm:min-h-0"
                        >
                          End Game
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Results */}
              {gamePhase === 'results' && (
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Game Over!</h2>

                  <div className="bg-white/20 p-4 sm:p-5 md:p-6 rounded-xl mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Results</h3>
                    
                    <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                      <p className="text-sm sm:text-base md:text-lg">Secret Item: <span className="font-bold">{secretItem}</span></p>
                      <p className="text-sm sm:text-base md:text-lg">Questions Asked: {questionsAsked.length}</p>
                      <p className="text-sm sm:text-base md:text-lg">Guesses Made: {guessesMade.length}</p>
                    </div>

                    {winner && (
                      <div className="bg-green-500/30 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">
                          {getParticipantProfile(winner)?.profile?.name || 'Player'} Wins! 🏆
                        </p>
                        {winner === guesserId && (
                          <p className="text-sm sm:text-base md:text-lg mt-2">They guessed correctly!</p>
                        )}
                        {winner === answererId && (
                          <p className="text-sm sm:text-base md:text-lg mt-2">The guesser ran out of questions!</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    {isHost && (
                      <button
                        onClick={handlePlayAgain}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl transition disabled:opacity-50 text-base sm:text-lg min-h-[48px] sm:min-h-0"
                      >
                        Play Again
                      </button>
                    )}

                    <button
                      onClick={handleLeaveLobby}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 text-sm sm:text-base min-h-[44px] sm:min-h-0"
                    >
                      Leave Game
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guess Modal */}
          {showGuessModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => {
              setShowGuessModal(false);
              setCurrentGuess('');
            }}>
              <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-4 sm:p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Make Your Guess</h3>
                <input
                  type="text"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentGuess.trim()) {
                      handleSubmitGuess();
                      setShowGuessModal(false);
                    }
                  }}
                  placeholder="What is your guess?"
                  className="w-full bg-white/20 border border-white/30 rounded-lg p-3 text-white placeholder-white/50 mb-3 sm:mb-4 text-sm sm:text-base min-h-[44px]"
                  autoFocus
                />
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      if (currentGuess.trim()) {
                        handleSubmitGuess();
                        setShowGuessModal(false);
                      }
                    }}
                    disabled={loading || !currentGuess.trim()}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition disabled:opacity-50 text-sm sm:text-base min-h-[48px] sm:min-h-0"
                  >
                    Submit Guess
                  </button>
                  <button
                    onClick={() => {
                      setShowGuessModal(false);
                      setCurrentGuess('');
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition text-sm sm:text-base min-h-[48px] sm:min-h-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invite Friend Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowInviteModal(false)}>
              <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Invite a Friend</h3>
                
                {friends.length === 0 ? (
                  <p className="text-white/70 text-center py-4 text-sm sm:text-base">
                    No friends available. Add some friends first!
                  </p>
                ) : (
                  <div className="space-y-2 mb-3 sm:mb-4 max-h-[50vh] overflow-y-auto">
                    {friends.map((friend) => (
                      <button
                        key={friend.friend_id}
                        onClick={() => handleInviteFriend(friend.friend_id)}
                        disabled={loading}
                        className="w-full bg-white/10 hover:bg-white/20 active:bg-white/30 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 transition disabled:opacity-50 text-white min-h-[56px] sm:min-h-0"
                      >
                        <span className="text-2xl sm:text-3xl flex-shrink-0">
                          {AVATAR_EMOJIS[friend.avatar_selection || 'avatar1']}
                        </span>
                        <span className="font-bold text-sm sm:text-base truncate flex-1 text-left">{friend.name || friend.username || 'Unknown'}</span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-3 sm:py-2 px-4 rounded-lg transition text-sm sm:text-base min-h-[44px] sm:min-h-0"
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

