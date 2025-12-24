import { getSupabaseClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type Lobby = Database['public']['Tables']['lobbies']['Row'];
type LobbyInsert = Database['public']['Tables']['lobbies']['Insert'];
type LobbyUpdate = Database['public']['Tables']['lobbies']['Update'];
type LobbyParticipant = Database['public']['Tables']['lobby_participants']['Row'];
type LobbyParticipantInsert = Database['public']['Tables']['lobby_participants']['Insert'];

export interface LobbyWithParticipants extends Lobby {
  participants: (LobbyParticipant & {
    profile?: {
      id: string;
      username: string | null;
      name: string | null;
      avatar_selection: string | null;
    };
  })[];
}

/**
 * Create a new lobby
 */
export async function createLobby(gameType: string = 'guess_my_answer', maxPlayers: number = 2): Promise<Lobby> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: lobby, error } = await (supabase
    .from('lobbies') as any)
    .insert({
      host_id: user.id,
      game_type: gameType,
      max_players: maxPlayers,
      current_players: 1,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) throw error;

  // Add host as participant
  await (supabase
    .from('lobby_participants') as any)
    .insert({
      lobby_id: lobby.id,
      user_id: user.id,
      is_ready: false,
    });

  return lobby;
}

/**
 * Get lobby with participants
 */
export async function getLobby(lobbyId: string): Promise<LobbyWithParticipants | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get lobby
  const { data: lobby, error: lobbyError } = await (supabase
    .from('lobbies') as any)
    .select('*')
    .eq('id', lobbyId)
    .single();

  if (lobbyError || !lobby) return null;

  // Get participants
  const { data: participants, error: participantsError } = await (supabase
    .from('lobby_participants') as any)
    .select('*')
    .eq('lobby_id', lobbyId);

  if (participantsError) throw participantsError;

  // Get profiles for participants
  const userIds = (participants || []).map((p: any) => p.user_id);
  let profilesMap: Record<string, any> = {};
  
  if (userIds.length > 0) {
    const { data: profiles } = await (supabase
      .from('profiles') as any)
      .select('id, username, name, avatar_selection')
      .in('id', userIds);

    if (profiles) {
      profiles.forEach((p: any) => {
        profilesMap[p.id] = p;
      });
    }
  }

  return {
    ...lobby,
    participants: (participants || []).map((p: any) => ({
      ...p,
      profile: profilesMap[p.user_id],
    })),
  };
}

/**
 * Join a lobby
 */
export async function joinLobby(lobbyId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if lobby exists and has space
  const { data: lobby, error: lobbyError } = await (supabase
    .from('lobbies') as any)
    .select('*')
    .eq('id', lobbyId)
    .single();

  if (lobbyError || !lobby) throw new Error('Lobby not found');
  if (lobby.status !== 'waiting') throw new Error('Lobby is not accepting new players');
  if (lobby.current_players >= lobby.max_players) throw new Error('Lobby is full');

  // Add participant
  const { error: joinError } = await (supabase
    .from('lobby_participants') as any)
    .insert({
      lobby_id: lobbyId,
      user_id: user.id,
      is_ready: false,
    });

  if (joinError) throw joinError;

  // Update lobby player count
  await (supabase
    .from('lobbies') as any)
    .update({ current_players: lobby.current_players + 1 })
    .eq('id', lobbyId);
}

/**
 * Leave a lobby
 */
export async function leaveLobby(lobbyId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Remove participant
  const { error } = await (supabase
    .from('lobby_participants') as any)
    .delete()
    .eq('lobby_id', lobbyId)
    .eq('user_id', user.id);

  if (error) throw error;

  // Update lobby player count
  const { data: lobby } = await (supabase
    .from('lobbies') as any)
    .select('current_players')
    .eq('id', lobbyId)
    .single();

  if (lobby) {
    await (supabase
      .from('lobbies') as any)
      .update({ current_players: Math.max(0, lobby.current_players - 1) })
      .eq('id', lobbyId);
  }

  // If lobby is empty, delete it
  const { data: participants } = await (supabase
    .from('lobby_participants') as any)
    .select('id')
    .eq('lobby_id', lobbyId);

  if (!participants || participants.length === 0) {
    await (supabase
      .from('lobbies') as any)
      .delete()
      .eq('id', lobbyId);
  }
}

/**
 * Set ready status
 */
export async function setReadyStatus(lobbyId: string, isReady: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await (supabase
    .from('lobby_participants') as any)
    .update({ is_ready: isReady })
    .eq('lobby_id', lobbyId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Update lobby status
 */
export async function updateLobbyStatus(lobbyId: string, status: 'waiting' | 'playing' | 'finished'): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if user is host
  const { data: lobby } = await (supabase
    .from('lobbies') as any)
    .select('host_id')
    .eq('id', lobbyId)
    .single();

  if (!lobby || lobby.host_id !== user.id) {
    throw new Error('Only the host can update lobby status');
  }

  const { error } = await (supabase
    .from('lobbies') as any)
    .update({ status })
    .eq('id', lobbyId);

  if (error) throw error;
}

/**
 * Invite a friend to a lobby
 */
export async function inviteFriendToLobby(lobbyId: string, friendId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if user is host
  const { data: lobby } = await (supabase
    .from('lobbies') as any)
    .select('host_id, status, current_players, max_players')
    .eq('id', lobbyId)
    .single();

  if (!lobby || lobby.host_id !== user.id) {
    throw new Error('Only the host can invite friends');
  }

  if (lobby.status !== 'waiting') {
    throw new Error('Can only invite to waiting lobbies');
  }

  if (lobby.current_players >= lobby.max_players) {
    throw new Error('Lobby is full');
  }

  // Check if already a participant
  const { data: existingParticipant } = await (supabase
    .from('lobby_participants') as any)
    .select('id')
    .eq('lobby_id', lobbyId)
    .eq('user_id', friendId)
    .single();

  if (existingParticipant) {
    throw new Error('Friend is already in the lobby');
  }

  // Check if already invited
  const { data: existingInvitation } = await (supabase
    .from('lobby_invitations') as any)
    .select('id')
    .eq('lobby_id', lobbyId)
    .eq('invitee_id', friendId)
    .eq('status', 'pending')
    .single();

  if (existingInvitation) {
    throw new Error('Friend already has a pending invitation');
  }

  // Create invitation
  const { error } = await (supabase
    .from('lobby_invitations') as any)
    .insert({
      lobby_id: lobbyId,
      inviter_id: user.id,
      invitee_id: friendId,
      status: 'pending',
    });

  if (error) throw error;
}

/**
 * Get pending lobby invitations for the current user
 */
export async function getLobbyInvitations(): Promise<any[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: invitations, error } = await (supabase
    .from('lobby_invitations') as any)
    .select('*, lobbies (*)')
    .eq('invitee_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get inviter profiles separately
  if (invitations && invitations.length > 0) {
    const inviterIds = [...new Set(invitations.map((inv: any) => inv.inviter_id))];
    const { data: profiles } = await (supabase
      .from('profiles') as any)
      .select('id, username, name, avatar_selection')
      .in('id', inviterIds);

    const profilesMap: Record<string, any> = {};
    if (profiles) {
      profiles.forEach((p: any) => {
        profilesMap[p.id] = p;
      });
    }

    return invitations.map((inv: any) => ({
      ...inv,
      inviter: profilesMap[inv.inviter_id],
    }));
  }

  return [];
}

/**
 * Accept a lobby invitation
 */
export async function acceptLobbyInvitation(invitationId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get invitation
  const { data: invitation, error: inviteError } = await (supabase
    .from('lobby_invitations') as any)
    .select('*, lobbies (*)')
    .eq('id', invitationId)
    .eq('invitee_id', user.id)
    .eq('status', 'pending')
    .single();

  if (inviteError || !invitation) {
    throw new Error('Invitation not found');
  }

  const lobby = invitation.lobbies;
  if (lobby.status !== 'waiting') {
    throw new Error('Lobby is no longer accepting players');
  }

  if (lobby.current_players >= lobby.max_players) {
    throw new Error('Lobby is full');
  }

  // Update invitation status
  const { error: updateError } = await (supabase
    .from('lobby_invitations') as any)
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  if (updateError) throw updateError;

  // Add as participant
  const { error: joinError } = await (supabase
    .from('lobby_participants') as any)
    .insert({
      lobby_id: lobby.id,
      user_id: user.id,
      is_ready: false,
    });

  if (joinError) throw joinError;

  // Update lobby player count
  await (supabase
    .from('lobbies') as any)
    .update({ current_players: lobby.current_players + 1 })
    .eq('id', lobby.id);
}

/**
 * Decline a lobby invitation
 */
export async function declineLobbyInvitation(invitationId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await (supabase
    .from('lobby_invitations') as any)
    .update({ status: 'declined' })
    .eq('id', invitationId)
    .eq('invitee_id', user.id)
    .eq('status', 'pending');

  if (error) throw error;
}

