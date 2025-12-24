export interface WouldYouRatherQuestion {
  id: string;
  optionA: string;
  optionB: string;
  category: 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep' | 'food' | 'lifestyle';
  difficulty: 'easy' | 'medium' | 'hard';
  imageA?: string;
  imageB?: string;
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
];

export function getRandomQuestion(category?: string, difficulty?: string): WouldYouRatherQuestion | null {
  let filtered = wouldYouRatherQuestions;
  
  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }
  
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  if (filtered.length === 0) return null;
  
  return filtered[Math.floor(Math.random() * filtered.length)];
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
  
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  return filtered.length;
}

