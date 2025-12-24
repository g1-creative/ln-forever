export interface WouldYouRatherQuestion {
  id: string;
  optionA: string;
  optionB: string;
  category: 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep' | 'food' | 'lifestyle';
  difficulty: 'easy' | 'medium' | 'hard';
  imageA?: string;
  imageB?: string;
  discussionPrompt?: string;
}

export interface QuestionStats {
  totalAnswered: number;
  categoryBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
}

export const wouldYouRatherQuestions: WouldYouRatherQuestion[] = [
  // Easy - Daily Life
  {
    id: 'wyr-1',
    optionA: 'Live in a big city',
    optionB: 'Live in a small town',
    category: 'daily',
    difficulty: 'easy',
    imageA: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    imageB: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
  },
  {
    id: 'wyr-2',
    optionA: 'Always be 10 minutes late',
    optionB: 'Always be 20 minutes early',
    category: 'daily',
    difficulty: 'easy',
  },
  {
    id: 'wyr-3',
    optionA: 'Have unlimited free Wi-Fi',
    optionB: 'Have unlimited free coffee',
    category: 'daily',
    difficulty: 'easy',
  },
  {
    id: 'wyr-4',
    optionA: 'Be able to fly',
    optionB: 'Be able to become invisible',
    category: 'fun',
    difficulty: 'easy',
  },
  {
    id: 'wyr-5',
    optionA: 'Have perfect memory',
    optionB: 'Be able to forget anything you want',
    category: 'deep',
    difficulty: 'easy',
  },
  // Easy - Romance
  {
    id: 'wyr-6',
    optionA: 'Receive a handwritten love letter',
    optionB: 'Receive a surprise date night',
    category: 'romance',
    difficulty: 'easy',
  },
  {
    id: 'wyr-7',
    optionA: 'Cuddle on the couch watching movies',
    optionB: 'Go on an adventure together',
    category: 'romance',
    difficulty: 'easy',
  },
  // Medium - Travel
  {
    id: 'wyr-8',
    optionA: 'Travel to the past',
    optionB: 'Travel to the future',
    category: 'travel',
    difficulty: 'medium',
    imageA: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    imageB: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
  },
  {
    id: 'wyr-9',
    optionA: 'Visit every country in the world',
    optionB: 'Live in one amazing place for your whole life',
    category: 'travel',
    difficulty: 'medium',
  },
  {
    id: 'wyr-10',
    optionA: 'Go on a beach vacation',
    optionB: 'Go on a mountain adventure',
    category: 'travel',
    difficulty: 'medium',
    imageA: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    imageB: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
  },
  // Medium - Work
  {
    id: 'wyr-11',
    optionA: 'Work from home forever',
    optionB: 'Work in an office with great colleagues',
    category: 'work',
    difficulty: 'medium',
  },
  {
    id: 'wyr-12',
    optionA: 'Have a job you love but low salary',
    optionB: 'Have a job you hate but high salary',
    category: 'work',
    difficulty: 'medium',
  },
  // Medium - Romance
  {
    id: 'wyr-13',
    optionA: 'Know everything your partner is thinking',
    optionB: 'Your partner knows everything you are thinking',
    category: 'romance',
    difficulty: 'medium',
  },
  {
    id: 'wyr-14',
    optionA: 'Have a surprise proposal',
    optionB: 'Plan the perfect proposal together',
    category: 'romance',
    difficulty: 'medium',
  },
  // Medium - Fun
  {
    id: 'wyr-15',
    optionA: 'Be able to speak all languages',
    optionB: 'Be able to play all musical instruments',
    category: 'fun',
    difficulty: 'medium',
  },
  {
    id: 'wyr-16',
    optionA: 'Have a superpower that helps others',
    optionB: 'Have a superpower that helps yourself',
    category: 'fun',
    difficulty: 'medium',
  },
  // Medium - Deep
  {
    id: 'wyr-17',
    optionA: 'Live forever but alone',
    optionB: 'Live a normal lifespan with loved ones',
    category: 'deep',
    difficulty: 'medium',
  },
  {
    id: 'wyr-18',
    optionA: 'Know how you will die',
    optionB: 'Never know when you will die',
    category: 'deep',
    difficulty: 'medium',
  },
  // Hard - Deep
  {
    id: 'wyr-19',
    optionA: 'Have everyone love you but hate yourself',
    optionB: 'Have everyone hate you but love yourself',
    category: 'deep',
    difficulty: 'hard',
  },
  {
    id: 'wyr-20',
    optionA: 'Relive your best day',
    optionB: 'Erase your worst day',
    category: 'deep',
    difficulty: 'hard',
  },
  // Hard - Romance
  {
    id: 'wyr-21',
    optionA: 'Love someone who doesn\'t love you back',
    optionB: 'Be loved by someone you don\'t love',
    category: 'romance',
    difficulty: 'hard',
  },
  {
    id: 'wyr-22',
    optionA: 'Have a perfect relationship but no passion',
    optionB: 'Have intense passion but constant arguments',
    category: 'romance',
    difficulty: 'hard',
  },
  // Hard - Work
  {
    id: 'wyr-23',
    optionA: 'Be famous but have no privacy',
    optionB: 'Be unknown but have complete privacy',
    category: 'work',
    difficulty: 'hard',
  },
  {
    id: 'wyr-24',
    optionA: 'Work with people you love but hate the work',
    optionB: 'Work alone but love the work',
    category: 'work',
    difficulty: 'hard',
  },
  // Food & Lifestyle
  {
    id: 'wyr-25',
    optionA: 'Eat your favorite food every day',
    optionB: 'Try a new food every day',
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'wyr-26',
    optionA: 'Have breakfast for dinner',
    optionB: 'Have dinner for breakfast',
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'wyr-27',
    optionA: 'Always be too hot',
    optionB: 'Always be too cold',
    category: 'lifestyle',
    difficulty: 'easy',
  },
  {
    id: 'wyr-28',
    optionA: 'Have no internet for a month',
    optionB: 'Have no phone for a month',
    category: 'lifestyle',
    difficulty: 'medium',
  },
  // More Easy Questions
  {
    id: 'wyr-29',
    optionA: 'Read a book',
    optionB: 'Watch a movie',
    category: 'daily',
    difficulty: 'easy',
  },
  {
    id: 'wyr-30',
    optionA: 'Have breakfast in bed',
    optionB: 'Have dinner at a fancy restaurant',
    category: 'romance',
    difficulty: 'easy',
  },
  {
    id: 'wyr-31',
    optionA: 'Speak 10 languages fluently',
    optionB: 'Be a master of 10 musical instruments',
    category: 'fun',
    difficulty: 'easy',
  },
  {
    id: 'wyr-32',
    optionA: 'Pizza for life',
    optionB: 'Ice cream for life',
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'wyr-33',
    optionA: 'Always have perfect weather',
    optionB: 'Always have perfect health',
    category: 'lifestyle',
    difficulty: 'easy',
  },
  {
    id: 'wyr-34',
    optionA: 'Have a pet dog',
    optionB: 'Have a pet cat',
    category: 'daily',
    difficulty: 'easy',
  },
  // More Medium Questions
  {
    id: 'wyr-35',
    optionA: 'Be able to read minds',
    optionB: 'Be able to see the future',
    category: 'deep',
    difficulty: 'medium',
  },
  {
    id: 'wyr-36',
    optionA: 'Have a romantic dinner at home',
    optionB: 'Have a romantic dinner at a restaurant',
    category: 'romance',
    difficulty: 'medium',
  },
  {
    id: 'wyr-37',
    optionA: 'Work 4 days a week',
    optionB: 'Work 5 days but shorter hours',
    category: 'work',
    difficulty: 'medium',
  },
  {
    id: 'wyr-38',
    optionA: 'Visit 10 countries for 1 week each',
    optionB: 'Visit 1 country for 10 weeks',
    category: 'travel',
    difficulty: 'medium',
  },
  {
    id: 'wyr-39',
    optionA: 'Have a surprise party thrown for you',
    optionB: 'Plan a surprise party for someone else',
    category: 'fun',
    difficulty: 'medium',
  },
  {
    id: 'wyr-40',
    optionA: 'Only eat sweet foods',
    optionB: 'Only eat savory foods',
    category: 'food',
    difficulty: 'medium',
  },
  // More Hard Questions
  {
    id: 'wyr-41',
    optionA: 'Know all the answers but never understand why',
    optionB: 'Understand everything but never know the answers',
    category: 'deep',
    difficulty: 'hard',
  },
  {
    id: 'wyr-42',
    optionA: 'Have a long-distance relationship that works',
    optionB: 'Have a close relationship with constant conflict',
    category: 'romance',
    difficulty: 'hard',
  },
  {
    id: 'wyr-43',
    optionA: 'Be the smartest person in the room',
    optionB: 'Be the kindest person in the room',
    category: 'deep',
    difficulty: 'hard',
  },
  {
    id: 'wyr-44',
    optionA: 'Have unlimited money but no time',
    optionB: 'Have unlimited time but no money',
    category: 'lifestyle',
    difficulty: 'hard',
  },
  {
    id: 'wyr-45',
    optionA: 'Be remembered for 100 years',
    optionB: 'Be forgotten but live happily',
    category: 'deep',
    difficulty: 'hard',
  },
];

export function getRandomQuestion(
  category?: string, 
  difficulty?: string,
  excludeIds: string[] = []
): WouldYouRatherQuestion | null {
  let filtered = wouldYouRatherQuestions;
  
  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }
  
  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  // Exclude already shown questions
  if (excludeIds.length > 0) {
    filtered = filtered.filter(q => !excludeIds.includes(q.id));
  }
  
  if (filtered.length === 0) {
    // If all questions have been shown, reset and allow repeats
    filtered = wouldYouRatherQuestions;
    if (category && category !== 'all') {
      filtered = filtered.filter(q => q.category === category);
    }
    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }
  }
  
  if (filtered.length === 0) return null;
  
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getDiscussionPrompt(question: WouldYouRatherQuestion, selectedOption: 'A' | 'B'): string {
  if (question.discussionPrompt) {
    return question.discussionPrompt;
  }
  
  const prompts: Record<string, string[]> = {
    daily: [
      "What makes this choice better for your daily life?",
      "How would this affect your routine?",
      "What are the practical benefits of this choice?",
    ],
    travel: [
      "Where would you go first with this choice?",
      "What adventure would this lead to?",
      "How would this change your travel experiences?",
    ],
    work: [
      "How would this impact your career?",
      "What opportunities would this create?",
      "How would this affect your work-life balance?",
    ],
    romance: [
      "How would this strengthen your relationship?",
      "What romantic moments would this create?",
      "How would this make your partner feel?",
    ],
    fun: [
      "What fun memories would this create?",
      "How would you make the most of this?",
      "What hilarious situations would this lead to?",
    ],
    deep: [
      "What does this choice say about your values?",
      "How would this shape who you are?",
      "What deeper meaning does this have for you?",
    ],
    food: [
      "What meals would you create with this?",
      "How would this change your dining experiences?",
      "What flavors and memories would this bring?",
    ],
    lifestyle: [
      "How would this improve your quality of life?",
      "What habits would this help you build?",
      "How would this make your days better?",
    ],
  };
  
  const categoryPrompts = prompts[question.category] || prompts.daily;
  return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
}

export function getQuestionsByCategory(category: string): WouldYouRatherQuestion[] {
  if (category === 'all') return wouldYouRatherQuestions;
  return wouldYouRatherQuestions.filter(q => q.category === category);
}

export function getQuestionCount(category?: string, difficulty?: string): number {
  let filtered = wouldYouRatherQuestions;
  
  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }
  
  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  return filtered.length;
}

