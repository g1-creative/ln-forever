import { getSupabaseClient } from '@/lib/supabase/client';
import { Scenario } from '@/types';
import { Database } from '@/types/database.types';

type DbScenario = Database['public']['Tables']['scenarios']['Row'];
type DbScenarioInsert = Database['public']['Tables']['scenarios']['Insert'];

// Convert database scenario to app scenario
function dbToScenario(dbScenario: DbScenario): Scenario {
  return {
    id: dbScenario.id,
    title: dbScenario.title,
    category: dbScenario.category,
    difficulty: dbScenario.difficulty,
    roleA: dbScenario.role_a,
    roleB: dbScenario.role_b,
    hints: dbScenario.hints,
  };
}

// Convert app scenario to database insert
function scenarioToDb(scenario: Omit<Scenario, 'id'>): DbScenarioInsert {
  return {
    title: scenario.title,
    category: scenario.category,
    difficulty: scenario.difficulty,
    role_a: scenario.roleA,
    role_b: scenario.roleB,
    hints: scenario.hints,
  };
}

export async function getScenariosFromDb(
  difficulty?: string,
  category?: string
): Promise<Scenario[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase not available, returning empty array');
    return [];
  }
  
  // Type assertion needed due to Supabase type inference limitations during build
  let query = (supabase.from('scenarios') as any)
    .select('*')
    .eq('is_community', true);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }

  return (data || []).map(dbToScenario);
}

export async function getRandomScenarioFromDb(
  difficulty: string,
  category: string
): Promise<Scenario | null> {
  const scenarios = await getScenariosFromDb(difficulty, category);
  if (scenarios.length === 0) return null;
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

export async function createScenario(scenario: Omit<Scenario, 'id'>): Promise<Scenario> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Must be logged in to create scenarios');

  const dbScenario = scenarioToDb(scenario);
  dbScenario.created_by = user.id;
  dbScenario.is_community = false;

  // Type assertion needed due to Supabase type inference limitations during build
  const { data, error } = await (supabase
    .from('scenarios') as any)
    .insert(dbScenario)
    .select()
    .single();

  if (error) throw error;
  return dbToScenario(data);
}

export async function saveScenarioToFavorites(scenarioId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Must be logged in to save favorites');

  // Type assertion needed due to Supabase type inference limitations during build
  const { error } = await (supabase
    .from('user_scenarios') as any)
    .upsert({
      user_id: user.id,
      scenario_id: scenarioId,
      is_favorite: true,
    });

  if (error) throw error;
}
