export interface GuessMyAnswerQuestion {
  id: string;
  question: string;
  category: 'daily' | 'romance' | 'fun' | 'deep' | 'food' | 'travel' | 'work' | 'lifestyle';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const guessMyAnswerQuestions: GuessMyAnswerQuestion[] = [
  // Daily Life
  {
    id: 'gma-daily-1',
    question: 'What would I choose on a free Saturday?',
    category: 'daily',
    difficulty: 'easy',
  },
  {
    id: 'gma-daily-2',
    question: 'What time do I usually wake up on weekends?',
    category: 'daily',
    difficulty: 'easy',
  },
  {
    id: 'gma-daily-3',
    question: 'What is my favorite way to relax after work?',
    category: 'daily',
    difficulty: 'easy',
  },
  {
    id: 'gma-daily-4',
    question: 'What would I order at a coffee shop?',
    category: 'daily',
    difficulty: 'easy',
  },
  {
    id: 'gma-daily-5',
    question: 'What is my morning routine?',
    category: 'daily',
    difficulty: 'medium',
  },
  {
    id: 'gma-daily-6',
    question: 'What would I do if I had an extra hour in my day?',
    category: 'daily',
    difficulty: 'medium',
  },
  
  // Romance
  {
    id: 'gma-romance-1',
    question: 'What is my ideal date night?',
    category: 'romance',
    difficulty: 'easy',
  },
  {
    id: 'gma-romance-2',
    question: 'What makes me feel most loved?',
    category: 'romance',
    difficulty: 'medium',
  },
  {
    id: 'gma-romance-3',
    question: 'What is my love language?',
    category: 'romance',
    difficulty: 'hard',
  },
  {
    id: 'gma-romance-4',
    question: 'What would be my perfect anniversary gift?',
    category: 'romance',
    difficulty: 'medium',
  },
  {
    id: 'gma-romance-5',
    question: 'What is my favorite way to show affection?',
    category: 'romance',
    difficulty: 'easy',
  },
  
  // Fun / Silly
  {
    id: 'gma-fun-1',
    question: 'What would I do if I won the lottery?',
    category: 'fun',
    difficulty: 'easy',
  },
  {
    id: 'gma-fun-2',
    question: 'What is my guilty pleasure?',
    category: 'fun',
    difficulty: 'medium',
  },
  {
    id: 'gma-fun-3',
    question: 'What would I name my pet if I could have any animal?',
    category: 'fun',
    difficulty: 'easy',
  },
  {
    id: 'gma-fun-4',
    question: 'What superpower would I choose?',
    category: 'fun',
    difficulty: 'easy',
  },
  {
    id: 'gma-fun-5',
    question: 'What is my weirdest habit?',
    category: 'fun',
    difficulty: 'medium',
  },
  
  // Deep Talk
  {
    id: 'gma-deep-1',
    question: 'What is my biggest fear?',
    category: 'deep',
    difficulty: 'hard',
  },
  {
    id: 'gma-deep-2',
    question: 'What is my life goal?',
    category: 'deep',
    difficulty: 'medium',
  },
  {
    id: 'gma-deep-3',
    question: 'What makes me feel most proud?',
    category: 'deep',
    difficulty: 'medium',
  },
  {
    id: 'gma-deep-4',
    question: 'What is my biggest dream?',
    category: 'deep',
    difficulty: 'hard',
  },
  
  // Food
  {
    id: 'gma-food-1',
    question: 'What is my favorite comfort food?',
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'gma-food-2',
    question: 'What would I order at a fancy restaurant?',
    category: 'food',
    difficulty: 'medium',
  },
  {
    id: 'gma-food-3',
    question: 'What is my favorite cuisine?',
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'gma-food-4',
    question: 'What food do I absolutely hate?',
    category: 'food',
    difficulty: 'easy',
  },
  
  // Travel
  {
    id: 'gma-travel-1',
    question: 'What is my dream vacation destination?',
    category: 'travel',
    difficulty: 'medium',
  },
  {
    id: 'gma-travel-2',
    question: 'How do I prefer to travel?',
    category: 'travel',
    difficulty: 'easy',
  },
  {
    id: 'gma-travel-3',
    question: 'What would I pack first for a trip?',
    category: 'travel',
    difficulty: 'easy',
  },
  
  // Work
  {
    id: 'gma-work-1',
    question: 'What is my ideal work environment?',
    category: 'work',
    difficulty: 'medium',
  },
  {
    id: 'gma-work-2',
    question: 'What would be my dream job?',
    category: 'work',
    difficulty: 'medium',
  },
  
  // Lifestyle
  {
    id: 'gma-lifestyle-1',
    question: 'What is my favorite season?',
    category: 'lifestyle',
    difficulty: 'easy',
  },
  {
    id: 'gma-lifestyle-2',
    question: 'What is my ideal weekend?',
    category: 'lifestyle',
    difficulty: 'easy',
  },
  {
    id: 'gma-lifestyle-3',
    question: 'What is my favorite way to spend a rainy day?',
    category: 'lifestyle',
    difficulty: 'easy',
  },
];

export function getRandomQuestion(
  category?: string,
  difficulty?: string,
  excludeIds: string[] = []
): GuessMyAnswerQuestion | null {
  let filtered = guessMyAnswerQuestions;

  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }

  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  const availableQuestions = filtered.filter(q => !excludeIds.includes(q.id));

  if (availableQuestions.length === 0) {
    return null;
  }

  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

export function getQuestionCount(category?: string, difficulty?: string): number {
  let filtered = guessMyAnswerQuestions;

  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }

  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  return filtered.length;
}

