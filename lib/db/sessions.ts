import { getSupabaseClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type SessionInsert = Database['public']['Tables']['sessions']['Insert'];

export async function createSession(
  scenarioId: string,
  coupleId?: string | null,
  durationSeconds?: number,
  notes?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Must be logged in to create sessions');

  const session: SessionInsert = {
    user_id: user.id,
    scenario_id: scenarioId,
    couple_id: coupleId || null,
    completed_at: new Date().toISOString(),
    duration_seconds: durationSeconds || null,
    notes: notes || null,
  };

  const { error } = await supabase.from('sessions').insert(session);
  if (error) throw error;

  // Update progress
  await updateProgress(durationSeconds || 0);
}

async function updateProgress(durationSeconds: number): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // Get or create today's progress
  const { data: existing } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing) {
    // Update existing
    await supabase
      .from('progress')
      .update({
        scenarios_completed: existing.scenarios_completed + 1,
        time_practiced_seconds: existing.time_practiced_seconds + durationSeconds,
      })
      .eq('id', existing.id);
  } else {
    // Create new
    await supabase.from('progress').insert({
      user_id: user.id,
      date: today,
      scenarios_completed: 1,
      time_practiced_seconds: durationSeconds,
      difficulty_breakdown: {},
    });
  }
}

export async function getSessionHistory(limit = 10) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      scenarios (
        id,
        title,
        category,
        difficulty
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching session history:', error);
    return [];
  }

  return data;
}
