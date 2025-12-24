import { getSupabaseClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type FriendRequest = Database['public']['Tables']['friend_requests']['Row'];
type FriendRequestInsert = Database['public']['Tables']['friend_requests']['Insert'];
type FriendRequestUpdate = Database['public']['Tables']['friend_requests']['Update'];
type Friend = Database['public']['Tables']['friends']['Row'];

export interface FriendWithProfile {
  id: string;
  friend_id: string;
  username: string | null;
  name: string | null;
  avatar_selection: string | null;
  created_at: string;
}

export interface FriendRequestWithProfile {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender_profile?: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_selection: string | null;
  };
  receiver_profile?: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_selection: string | null;
  };
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(receiverId: string): Promise<FriendRequest> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if request already exists
  const { data: existing } = await (supabase
    .from('friend_requests') as any)
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .single();

  if (existing) {
    throw new Error('Friend request already exists');
  }

  // Check if already friends
  const { data: existingFriend } = await (supabase
    .from('friends') as any)
    .select('*')
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${user.id})`)
    .single();

  if (existingFriend) {
    throw new Error('Already friends');
  }

  const request: FriendRequestInsert = {
    sender_id: user.id,
    receiver_id: receiverId,
    status: 'pending',
  };

  const { data, error } = await (supabase
    .from('friend_requests') as any)
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const update: FriendRequestUpdate = {
    status: 'accepted',
  };

  const { error } = await (supabase
    .from('friend_requests') as any)
    .update(update)
    .eq('id', requestId)
    .eq('receiver_id', user.id);

  if (error) throw error;
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await (supabase
    .from('friend_requests') as any)
    .delete()
    .eq('id', requestId)
    .eq('receiver_id', user.id);

  if (error) throw error;
}

/**
 * Cancel a friend request (sender cancels)
 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await (supabase
    .from('friend_requests') as any)
    .delete()
    .eq('id', requestId)
    .eq('sender_id', user.id);

  if (error) throw error;
}

/**
 * Remove a friend
 */
export async function removeFriend(friendId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await (supabase
    .from('friends') as any)
    .delete()
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${user.id})`);

  if (error) throw error;
}

/**
 * Get all friends with profile information
 */
export async function getFriends(): Promise<FriendWithProfile[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get friendships where user is user1
  const { data: friends1, error: error1 } = await (supabase
    .from('friends') as any)
    .select(`
      id,
      user2_id,
      created_at,
      user2:profiles!friends_user2_id_fkey(username, name, avatar_selection)
    `)
    .eq('user1_id', user.id);

  // Get friendships where user is user2
  const { data: friends2, error: error2 } = await (supabase
    .from('friends') as any)
    .select(`
      id,
      user1_id,
      created_at,
      user1:profiles!friends_user1_id_fkey(username, name, avatar_selection)
    `)
    .eq('user2_id', user.id);

  if (error1 || error2) throw error1 || error2;

  const allFriends: FriendWithProfile[] = [];

  // Process friends1
  if (friends1) {
    friends1.forEach((f: any) => {
      allFriends.push({
        id: f.id,
        friend_id: f.user2_id,
        username: f.user2?.username || null,
        name: f.user2?.name || null,
        avatar_selection: f.user2?.avatar_selection || null,
        created_at: f.created_at,
      });
    });
  }

  // Process friends2
  if (friends2) {
    friends2.forEach((f: any) => {
      allFriends.push({
        id: f.id,
        friend_id: f.user1_id,
        username: f.user1?.username || null,
        name: f.user1?.name || null,
        avatar_selection: f.user1?.avatar_selection || null,
        created_at: f.created_at,
      });
    });
  }

  return allFriends.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Get pending friend requests (sent and received)
 */
export async function getFriendRequests(): Promise<{
  sent: FriendRequestWithProfile[];
  received: FriendRequestWithProfile[];
}> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get sent requests
  const { data: sent, error: sentError } = await (supabase
    .from('friend_requests') as any)
    .select(`
      *,
      receiver:profiles!friend_requests_receiver_id_fkey(id, username, name, avatar_selection)
    `)
    .eq('sender_id', user.id)
    .eq('status', 'pending');

  // Get received requests
  const { data: received, error: receivedError } = await (supabase
    .from('friend_requests') as any)
    .select(`
      *,
      sender:profiles!friend_requests_sender_id_fkey(id, username, name, avatar_selection)
    `)
    .eq('receiver_id', user.id)
    .eq('status', 'pending');

  if (sentError || receivedError) throw sentError || receivedError;

  return {
    sent: (sent || []).map((r: any) => ({
      ...r,
      receiver_profile: r.receiver ? {
        id: r.receiver_id,
        ...r.receiver,
      } : undefined,
    })),
    received: (received || []).map((r: any) => ({
      ...r,
      sender_profile: r.sender ? {
        id: r.sender_id,
        ...r.sender,
      } : undefined,
    })),
  };
}

/**
 * Search users by username
 */
export async function searchUsersByUsername(query: string, limit: number = 10): Promise<any[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await (supabase
    .from('profiles') as any)
    .select('id, username, name, avatar_selection')
    .ilike('username', `%${query}%`)
    .neq('id', user.id)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

