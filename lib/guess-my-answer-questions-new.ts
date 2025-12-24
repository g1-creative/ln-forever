export interface GuessMyAnswerQuestion {
  id: string;
  question: string;
  options: string[];
  category: 'romance' | 'lifestyle' | 'preferences' | 'fun' | 'deep';
}

export const guessMyAnswerQuestions: GuessMyAnswerQuestion[] = [
  // Romance Category
  {
    id: 'r1',
    question: 'What would I pick for a date night?',
    options: [
      'Dinner at a restaurant',
      'Movie night at home',
      'Late-night drive',
      'Game night together'
    ],
    category: 'romance'
  },
  {
    id: 'r2',
    question: 'How do I prefer to show affection?',
    options: [
      'Physical touch and hugs',
      'Words of affirmation',
      'Quality time together',
      'Giving thoughtful gifts'
    ],
    category: 'romance'
  },
  {
    id: 'r3',
    question: 'What\'s my ideal way to celebrate our anniversary?',
    options: [
      'Fancy dinner and dancing',
      'Weekend getaway trip',
      'Quiet romantic evening at home',
      'Fun adventure or activity'
    ],
    category: 'romance'
  },
  {
    id: 'r4',
    question: 'What romantic gesture means the most to me?',
    options: [
      'Surprise dates or gifts',
      'Love notes or messages',
      'Acts of service',
      'Undivided attention'
    ],
    category: 'romance'
  },
  {
    id: 'r5',
    question: 'Where would I want to go for a romantic vacation?',
    options: [
      'Beach resort',
      'Mountain cabin',
      'European city',
      'Tropical island'
    ],
    category: 'romance'
  },
  {
    id: 'r6',
    question: 'What\'s my favorite way to spend a lazy Sunday with you?',
    options: [
      'Cuddling and watching shows',
      'Cooking a meal together',
      'Going for a walk or hike',
      'Staying in bed all day'
    ],
    category: 'romance'
  },
  {
    id: 'r7',
    question: 'What would I choose for a surprise date?',
    options: [
      'Concert or live show',
      'Picnic in the park',
      'Cooking class together',
      'Spa day for two'
    ],
    category: 'romance'
  },
  {
    id: 'r8',
    question: 'How do I feel about public displays of affection?',
    options: [
      'Love it, the more the better',
      'Comfortable with hand-holding and light kisses',
      'Prefer to keep it private',
      'Only on special occasions'
    ],
    category: 'romance'
  },
  {
    id: 'r9',
    question: 'What\'s my love language?',
    options: [
      'Physical touch',
      'Words of affirmation',
      'Quality time',
      'Acts of service'
    ],
    category: 'romance'
  },
  {
    id: 'r10',
    question: 'What kind of romantic movie would I choose?',
    options: [
      'Classic romance',
      'Rom-com',
      'Drama with romance',
      'Action with romance subplot'
    ],
    category: 'romance'
  },

  // Lifestyle Category
  {
    id: 'l1',
    question: 'What\'s my ideal morning routine?',
    options: [
      'Early rise and workout',
      'Slow morning with coffee',
      'Sleep in as long as possible',
      'Quick breakfast and go'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l2',
    question: 'How do I prefer to spend my free time?',
    options: [
      'Being active and outdoors',
      'Relaxing at home',
      'Socializing with friends',
      'Pursuing hobbies alone'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l3',
    question: 'What\'s my dream living situation?',
    options: [
      'City apartment',
      'Suburban house',
      'Rural countryside',
      'Beach or lakefront'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l4',
    question: 'What\'s my ideal weekend activity?',
    options: [
      'Exploring new places',
      'Binge-watching shows',
      'Working on projects',
      'Hanging out with friends'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l5',
    question: 'How do I handle stress?',
    options: [
      'Exercise or physical activity',
      'Talk it out with someone',
      'Need alone time to recharge',
      'Distract myself with entertainment'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l6',
    question: 'What\'s my approach to health and fitness?',
    options: [
      'Very dedicated and consistent',
      'Try to stay active when I can',
      'Not a priority for me',
      'Focused on mental health more'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l7',
    question: 'What\'s my sleep schedule like?',
    options: [
      'Early to bed, early to rise',
      'Night owl, late sleeper',
      'Whatever works that day',
      'Wish I could sleep more'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l8',
    question: 'How organized am I?',
    options: [
      'Everything has its place',
      'Organized chaos',
      'I try but struggle',
      'Clutter doesn\'t bother me'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l9',
    question: 'What\'s my relationship with technology?',
    options: [
      'Always connected and online',
      'Use it but can disconnect',
      'Prefer minimal screen time',
      'Only for necessities'
    ],
    category: 'lifestyle'
  },
  {
    id: 'l10',
    question: 'What\'s my ideal vacation style?',
    options: [
      'Relaxing and doing nothing',
      'Adventure and activities',
      'Cultural exploration',
      'Mix of everything'
    ],
    category: 'lifestyle'
  },

  // Preferences Category
  {
    id: 'p1',
    question: 'What\'s my favorite type of food?',
    options: [
      'Italian',
      'Mexican',
      'Asian',
      'American comfort food'
    ],
    category: 'preferences'
  },
  {
    id: 'p2',
    question: 'What\'s my go-to drink?',
    options: [
      'Coffee',
      'Tea',
      'Soda or juice',
      'Water'
    ],
    category: 'preferences'
  },
  {
    id: 'p3',
    question: 'What type of music do I listen to most?',
    options: [
      'Pop',
      'Rock or alternative',
      'Hip-hop or R&B',
      'Country or indie'
    ],
    category: 'preferences'
  },
  {
    id: 'p4',
    question: 'What\'s my favorite season?',
    options: [
      'Spring',
      'Summer',
      'Fall',
      'Winter'
    ],
    category: 'preferences'
  },
  {
    id: 'p5',
    question: 'What type of movies do I prefer?',
    options: [
      'Comedy',
      'Action or thriller',
      'Drama',
      'Sci-fi or fantasy'
    ],
    category: 'preferences'
  },
  {
    id: 'p6',
    question: 'What\'s my preferred way to travel?',
    options: [
      'Flying',
      'Road trip',
      'Train',
      'Don\'t like traveling'
    ],
    category: 'preferences'
  },
  {
    id: 'p7',
    question: 'What\'s my favorite color?',
    options: [
      'Blue',
      'Green',
      'Red or pink',
      'Black or neutral'
    ],
    category: 'preferences'
  },
  {
    id: 'p8',
    question: 'What\'s my ideal pet?',
    options: [
      'Dog',
      'Cat',
      'Something exotic',
      'No pets for me'
    ],
    category: 'preferences'
  },
  {
    id: 'p9',
    question: 'What\'s my preferred temperature?',
    options: [
      'Love the heat',
      'Prefer it warm',
      'Cool and comfortable',
      'Love the cold'
    ],
    category: 'preferences'
  },
  {
    id: 'p10',
    question: 'What\'s my reading preference?',
    options: [
      'Fiction novels',
      'Non-fiction or self-help',
      'Magazines or articles',
      'Don\'t read much'
    ],
    category: 'preferences'
  },

  // Fun Category
  {
    id: 'f1',
    question: 'What would I do if I won the lottery?',
    options: [
      'Travel the world',
      'Buy a dream house',
      'Invest and save it',
      'Help family and charity'
    ],
    category: 'fun'
  },
  {
    id: 'f2',
    question: 'What superpower would I choose?',
    options: [
      'Flying',
      'Invisibility',
      'Mind reading',
      'Time travel'
    ],
    category: 'fun'
  },
  {
    id: 'f3',
    question: 'What\'s my zombie apocalypse survival strategy?',
    options: [
      'Find a fortress and stock up',
      'Stay mobile and on the move',
      'Join a group for safety',
      'I\'d probably not survive'
    ],
    category: 'fun'
  },
  {
    id: 'f4',
    question: 'What would I do on a deserted island?',
    options: [
      'Build the best shelter',
      'Try to signal for rescue',
      'Explore and enjoy nature',
      'Panic first, plan later'
    ],
    category: 'fun'
  },
  {
    id: 'f5',
    question: 'What emoji describes me best?',
    options: [
      '😊 Happy',
      '😎 Cool',
      '🤓 Nerdy',
      '😴 Sleepy'
    ],
    category: 'fun'
  },
  {
    id: 'f6',
    question: 'What would I do if I could be invisible for a day?',
    options: [
      'Prank people',
      'Spy on someone',
      'Sneak into places',
      'Just observe and relax'
    ],
    category: 'fun'
  },
  {
    id: 'f7',
    question: 'What era would I time travel to?',
    options: [
      'Ancient civilizations',
      'Medieval times',
      'Roaring twenties',
      'The future'
    ],
    category: 'fun'
  },
  {
    id: 'f8',
    question: 'What fictional character am I most like?',
    options: [
      'The hero',
      'The funny sidekick',
      'The wise mentor',
      'The mysterious one'
    ],
    category: 'fun'
  },
  {
    id: 'f9',
    question: 'What\'s my karaoke song choice?',
    options: [
      'Classic rock anthem',
      'Pop hit everyone knows',
      'Emotional ballad',
      'I don\'t do karaoke'
    ],
    category: 'fun'
  },
  {
    id: 'f10',
    question: 'What would I do with a free day?',
    options: [
      'Adventure outside',
      'Pamper myself',
      'Catch up on sleep',
      'Binge my favorite shows'
    ],
    category: 'fun'
  },

  // Deep Category
  {
    id: 'd1',
    question: 'What matters most to me in life?',
    options: [
      'Relationships and love',
      'Career and success',
      'Personal growth',
      'Happiness and fun'
    ],
    category: 'deep'
  },
  {
    id: 'd2',
    question: 'How do I handle conflict?',
    options: [
      'Address it immediately',
      'Need time to cool down first',
      'Try to avoid it',
      'Depends on the situation'
    ],
    category: 'deep'
  },
  {
    id: 'd3',
    question: 'What\'s my biggest fear?',
    options: [
      'Losing loved ones',
      'Failure',
      'Being alone',
      'Not living up to potential'
    ],
    category: 'deep'
  },
  {
    id: 'd4',
    question: 'What do I value most in relationships?',
    options: [
      'Honesty and trust',
      'Communication',
      'Loyalty',
      'Fun and laughter'
    ],
    category: 'deep'
  },
  {
    id: 'd5',
    question: 'How would I describe my personality?',
    options: [
      'Outgoing and social',
      'Quiet and thoughtful',
      'Adventurous and spontaneous',
      'Balanced and adaptable'
    ],
    category: 'deep'
  },
  {
    id: 'd6',
    question: 'What motivates me most?',
    options: [
      'Making others happy',
      'Achieving goals',
      'Learning and growing',
      'Creating and expressing'
    ],
    category: 'deep'
  },
  {
    id: 'd7',
    question: 'How do I make important decisions?',
    options: [
      'Logic and analysis',
      'Trust my gut feeling',
      'Ask for advice',
      'Take my time thinking'
    ],
    category: 'deep'
  },
  {
    id: 'd8',
    question: 'What do I want people to remember about me?',
    options: [
      'Kindness and compassion',
      'Achievements and success',
      'Humor and fun personality',
      'Intelligence and wisdom'
    ],
    category: 'deep'
  },
  {
    id: 'd9',
    question: 'What\'s my approach to the future?',
    options: [
      'Plan everything carefully',
      'Go with the flow',
      'Dream big but stay flexible',
      'Live in the present'
    ],
    category: 'deep'
  },
  {
    id: 'd10',
    question: 'What would I change about myself?',
    options: [
      'Be more confident',
      'Be more patient',
      'Be more organized',
      'Nothing, I accept myself'
    ],
    category: 'deep'
  },
];

export const categories = [
  { id: 'romance', name: 'Romance', emoji: '💕', description: 'Questions about love and relationships' },
  { id: 'lifestyle', name: 'Lifestyle', emoji: '🏡', description: 'Daily habits and preferences' },
  { id: 'preferences', name: 'Preferences', emoji: '⭐', description: 'Favorites and choices' },
  { id: 'fun', name: 'Fun', emoji: '🎉', description: 'Silly and hypothetical questions' },
  { id: 'deep', name: 'Deep', emoji: '💭', description: 'Meaningful and personal questions' },
];

export function getQuestionsByCategory(category: string): GuessMyAnswerQuestion[] {
  return guessMyAnswerQuestions.filter(q => q.category === category);
}

export function getRandomQuestions(category: string, count: number = 10): GuessMyAnswerQuestion[] {
  const categoryQuestions = getQuestionsByCategory(category);
  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

