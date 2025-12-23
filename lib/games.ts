import { Game } from '@/types';

export const games: Game[] = [
  {
    id: 'role-play-roulette',
    name: 'Role-Play Roulette',
    description: 'Practice English conversation with fun, interactive scenarios. Perfect for couples learning English together.',
    category: 'Language Learning',
    icon: 'conversation',
    color: 'purple',
    difficulty: 'Beginner to Advanced',
    players: '2',
    duration: '2-5 minutes',
    featured: true,
    available: true,
  },
  {
    id: 'would-you-rather',
    name: 'Would You Rather',
    description: 'Make tough choices together and spark interesting conversations. Great for getting to know each other better.',
    category: 'Conversation',
    icon: 'choices',
    color: 'blue',
    difficulty: 'Easy',
    players: '2',
    duration: '5-10 minutes',
    featured: true,
    available: false,
  },
  {
    id: 'story-builder',
    name: 'Story Builder',
    description: 'Take turns building a story together. One sentence at a time, create amazing adventures.',
    category: 'Creative',
    icon: 'story',
    color: 'green',
    difficulty: 'Easy',
    players: '2',
    duration: '10-15 minutes',
    featured: false,
    available: false,
  },
  {
    id: 'truth-or-dare',
    name: 'Truth or Dare',
    description: 'Classic game with romantic and fun challenges designed for couples.',
    category: 'Fun',
    icon: 'dare',
    color: 'pink',
    difficulty: 'Easy',
    players: '2',
    duration: '15-30 minutes',
    featured: false,
    available: false,
  },
  {
    id: 'word-association',
    name: 'Word Association',
    description: 'Quick-fire word games to improve vocabulary and have fun together.',
    category: 'Language Learning',
    icon: 'words',
    color: 'orange',
    difficulty: 'Easy',
    players: '2',
    duration: '5 minutes',
    featured: false,
    available: false,
  },
  {
    id: 'debate-club',
    name: 'Debate Club',
    description: 'Friendly debates on interesting topics. Practice expressing opinions and listening skills.',
    category: 'Language Learning',
    icon: 'debate',
    color: 'red',
    difficulty: 'Advanced',
    players: '2',
    duration: '10-20 minutes',
    featured: false,
    available: false,
  },
];

export function getGameById(id: string): Game | undefined {
  return games.find(game => game.id === id);
}

export function getFeaturedGames(): Game[] {
  return games.filter(game => game.featured);
}

export function getAvailableGames(): Game[] {
  return games.filter(game => game.available);
}

export function getGamesByCategory(category: string): Game[] {
  return games.filter(game => game.category === category);
}
