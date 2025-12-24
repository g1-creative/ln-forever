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
    .select('id, user2_id, created_at')
    .eq('user1_id', user.id);

  // Get friendships where user is user2
  const { data: friends2, error: error2 } = await (supabase
    .from('friends') as any)
    .select('id, user1_id, created_at')
    .eq('user2_id', user.id);

  if (error1 || error2) throw error1 || error2;

  // Collect all friend user IDs
  const friendIds = new Set<string>();
  (friends1 || []).forEach((f: any) => friendIds.add(f.user2_id));
  (friends2 || []).forEach((f: any) => friendIds.add(f.user1_id));

  // Fetch profiles for all friends
  let profilesMap: Record<string, any> = {};
  if (friendIds.size > 0) {
    const { data: profiles, error: profilesError } = await (supabase
      .from('profiles') as any)
      .select('id, username, name, avatar_selection')
      .in('id', Array.from(friendIds));

    if (profilesError) {
      console.error('Error fetching friend profiles:', profilesError);
    } else if (profiles) {
      profiles.forEach((p: any) => {
        profilesMap[p.id] = p;
      });
    }
  }

  const allFriends: FriendWithProfile[] = [];

  // Process friends1
  if (friends1) {
    friends1.forEach((f: any) => {
      const profile = profilesMap[f.user2_id];
      allFriends.push({
        id: f.id,
        friend_id: f.user2_id,
        username: profile?.username || null,
        name: profile?.name || null,
        avatar_selection: profile?.avatar_selection || null,
        created_at: f.created_at,
      });
    });
  }

  // Process friends2
  if (friends2) {
    friends2.forEach((f: any) => {
      const profile = profilesMap[f.user1_id];
      allFriends.push({
        id: f.id,
        friend_id: f.user1_id,
        username: profile?.username || null,
        name: profile?.name || null,
        avatar_selection: profile?.avatar_selection || null,
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
    .select('*')
    .eq('sender_id', user.id)
    .eq('status', 'pending');

  // Get received requests
  const { data: received, error: receivedError } = await (supabase
    .from('friend_requests') as any)
    .select('*')
    .eq('receiver_id', user.id)
    .eq('status', 'pending');

  if (sentError || receivedError) throw sentError || receivedError;

  // Get all unique user IDs that we need profile data for
  const userIds = new Set<string>();
  (sent || []).forEach((r: any) => userIds.add(r.receiver_id));
  (received || []).forEach((r: any) => userIds.add(r.sender_id));

  // Fetch profiles for all users
  let profilesMap: Record<string, any> = {};
  if (userIds.size > 0) {
    const { data: profiles, error: profilesError } = await (supabase
      .from('profiles') as any)
      .select('id, username, name, avatar_selection')
      .in('id', Array.from(userIds));

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else if (profiles) {
      profiles.forEach((p: any) => {
        profilesMap[p.id] = p;
      });
    }
  }

  return {
    sent: (sent || []).map((r: any) => ({
      ...r,
      receiver_profile: profilesMap[r.receiver_id] ? {
        id: r.receiver_id,
        ...profilesMap[r.receiver_id],
      } : undefined,
    })),
    received: (received || []).map((r: any) => ({
      ...r,
      sender_profile: profilesMap[r.sender_id] ? {
        id: r.sender_id,
        ...profilesMap[r.sender_id],
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

