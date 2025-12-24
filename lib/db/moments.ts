import { getSupabaseClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type DbMoment = Database['public']['Tables']['moments']['Row'];
type DbMomentInsert = Database['public']['Tables']['moments']['Insert'];
type DbMomentUpdate = Database['public']['Tables']['moments']['Update'];

export interface MomentWithProfiles extends DbMoment {
  user_profile?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_selection: string | null;
  };
  partner_profile?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_selection: string | null;
  };
}

/**
 * Create a new moment
 */
export async function createMoment(
  partnerId: string,
  imageUrl: string,
  caption: string,
  momentDate?: string
): Promise<DbMoment> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Verify they are friends
  const { data: friendship } = await (supabase
    .from('friends') as any)
    .select('*')
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${user.id})`)
    .single();

  if (!friendship) {
    throw new Error('You must be friends to create moments together');
  }

  const moment: DbMomentInsert = {
    user_id: user.id,
    partner_id: partnerId,
    image_url: imageUrl,
    caption: caption,
    moment_date: momentDate || new Date().toISOString().split('T')[0],
  };

  const { data, error } = await (supabase
    .from('moments') as any)
    .insert(moment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all moments for the current user with their partner
 */
export async function getMoments(partnerId?: string): Promise<MomentWithProfiles[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = (supabase
    .from('moments') as any)
    .select('*')
    .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
    .order('moment_date', { ascending: false })
    .order('created_at', { ascending: false });

  // If partnerId is specified, filter to only moments with that partner
  if (partnerId) {
    query = query.or(`and(user_id.eq.${user.id},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${user.id})`);
  }

  const { data: moments, error } = await query;

  if (error) throw error;
  if (!moments || moments.length === 0) return [];

  // Get all unique user IDs
  const userIds = new Set<string>();
  moments.forEach((m: any) => {
    userIds.add(m.user_id);
    userIds.add(m.partner_id);
  });

  // Fetch profiles
  const { data: profiles } = await (supabase
    .from('profiles') as any)
    .select('id, name, username, avatar_selection')
    .in('id', Array.from(userIds));

  const profilesMap: Record<string, any> = {};
  if (profiles) {
    profiles.forEach((p: any) => {
      profilesMap[p.id] = p;
    });
  }

  // Combine moments with profiles
  return moments.map((m: any) => ({
    ...m,
    user_profile: profilesMap[m.user_id],
    partner_profile: profilesMap[m.partner_id],
  }));
}

/**
 * Add partner comment to a moment
 */
export async function addPartnerComment(momentId: string, comment: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Verify the moment exists and user is the partner
  const { data: moment } = await (supabase
    .from('moments') as any)
    .select('*')
    .eq('id', momentId)
    .single();

  if (!moment) throw new Error('Moment not found');
  if (moment.partner_id !== user.id) throw new Error('Only the partner can comment');
  if (moment.partner_comment) throw new Error('Comment already added');

  const update: DbMomentUpdate = {
    partner_comment: comment,
    partner_comment_at: new Date().toISOString(),
  };

  const { error } = await (supabase
    .from('moments') as any)
    .update(update)
    .eq('id', momentId);

  if (error) throw error;
}

/**
 * Update a moment (caption or image)
 */
export async function updateMoment(
  momentId: string,
  updates: { caption?: string; image_url?: string; moment_date?: string }
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Verify the moment exists and user is the creator
  const { data: moment } = await (supabase
    .from('moments') as any)
    .select('*')
    .eq('id', momentId)
    .single();

  if (!moment) throw new Error('Moment not found');
  if (moment.user_id !== user.id) throw new Error('Only the creator can update the moment');

  const { error } = await (supabase
    .from('moments') as any)
    .update(updates)
    .eq('id', momentId);

  if (error) throw error;
}

/**
 * Delete a moment
 */
export async function deleteMoment(momentId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Verify the moment exists and user is the creator
  const { data: moment } = await (supabase
    .from('moments') as any)
    .select('*')
    .eq('id', momentId)
    .single();

  if (!moment) throw new Error('Moment not found');
  if (moment.user_id !== user.id) throw new Error('Only the creator can delete the moment');

  const { error } = await (supabase
    .from('moments') as any)
    .delete()
    .eq('id', momentId);

  if (error) throw error;
}

/**
 * Upload image to Supabase storage
 */
export async function uploadMomentImage(file: File): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('moments')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('moments')
    .getPublicUrl(fileName);

  return publicUrl;
}

