export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep' | 'all';

export interface Scenario {
  id?: string;
  title: string;
  category: Exclude<Category, 'all'>;
  difficulty: Difficulty;
  roleA: string;
  roleB: string;
  hints: string[];
}

export interface GameState {
  selectedDifficulty: Difficulty;
  selectedCategory: Category;
  currentScenario: Scenario | null;
  rolesSwapped: boolean;
}
