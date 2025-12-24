import { Scenario } from '@/types';

export const scenarios: Scenario[] = [
  // Easy scenarios
  {
    title: "Ordering Coffee",
    category: "daily",
    difficulty: "easy",
    roleA: "You are a customer at a coffee shop. Order your favorite drink and ask about the price.",
    roleB: "You are a friendly barista. Greet the customer, take their order, and tell them the price.",
    hints: ["coffee", "please", "thank you", "how much", "latte", "cappuccino"]
  },
  {
    title: "Asking for Directions",
    category: "daily",
    difficulty: "easy",
    roleA: "You are lost in a new city. Ask someone how to get to the nearest subway station.",
    roleB: "You are a helpful local person. Give clear directions to the subway station.",
    hints: ["excuse me", "where is", "turn left", "turn right", "straight ahead", "thank you"]
  },
  {
    title: "Talking About Hobbies",
    category: "daily",
    difficulty: "easy",
    roleA: "Ask your friend about their hobbies and what they like to do in their free time.",
    roleB: "Tell your friend about your hobbies. Ask them about their hobbies too.",
    hints: ["hobby", "like", "enjoy", "free time", "interesting", "fun"]
  },
  {
    title: "At the Airport",
    category: "travel",
    difficulty: "easy",
    roleA: "You are checking in for your flight. Show your passport and ask about your gate number.",
    roleB: "You are an airport staff member. Check the passenger's ticket and tell them their gate number.",
    hints: ["passport", "ticket", "gate", "flight", "boarding", "luggage"]
  },
  {
    title: "First Day at Work",
    category: "work",
    difficulty: "easy",
    roleA: "You are a new employee. Introduce yourself and ask about your responsibilities.",
    roleB: "You are a colleague helping the new employee. Welcome them and explain their first tasks.",
    hints: ["introduce", "welcome", "responsibility", "task", "colleague", "help"]
  },
  {
    title: "Complimenting Your Partner",
    category: "romance",
    difficulty: "easy",
    roleA: "Give your partner a genuine compliment about something you love about them.",
    roleB: "Receive the compliment graciously and share how it makes you feel.",
    hints: ["compliment", "beautiful", "appreciate", "thank you", "feel", "love"]
  },
  {
    title: "Planning a Silly Day",
    category: "fun",
    difficulty: "easy",
    roleA: "Suggest doing something silly and fun together, like wearing matching outfits or having a dance party.",
    roleB: "React to the silly idea and add your own fun suggestions.",
    hints: ["silly", "fun", "suggest", "idea", "together", "laugh", "enjoy"]
  },
  {
    title: "Sharing a Happy Memory",
    category: "deep",
    difficulty: "easy",
    roleA: "Share a happy memory from your childhood. Describe what happened and why it was special.",
    roleB: "Listen and ask questions about the memory. Share a similar memory if you have one.",
    hints: ["memory", "remember", "childhood", "happy", "special", "share", "story"]
  },
  // Medium scenarios
  {
    title: "Planning a Weekend Trip",
    category: "travel",
    difficulty: "medium",
    roleA: "You want to plan a weekend trip. Suggest a destination and explain why you want to go there.",
    roleB: "You have different ideas about where to go. Discuss your preferences and find a compromise.",
    hints: ["suggest", "prefer", "because", "maybe", "what about", "compromise", "agree"]
  },
  {
    title: "Discussing Movie Preferences",
    category: "daily",
    difficulty: "medium",
    roleA: "You love action movies. Explain why you prefer them and try to convince your partner to watch one.",
    roleB: "You prefer romantic comedies. Share your opinion and discuss which movie to watch together.",
    hints: ["prefer", "because", "opinion", "think", "suggest", "maybe", "compromise"]
  },
  {
    title: "Work Project Discussion",
    category: "work",
    difficulty: "medium",
    roleA: "You have a new project idea. Present it to your colleague and ask for their opinion.",
    roleB: "You have concerns about the project. Ask questions and suggest improvements.",
    hints: ["idea", "project", "opinion", "concern", "suggest", "improve", "discuss"]
  },
  {
    title: "Choosing a Restaurant",
    category: "romance",
    difficulty: "medium",
    roleA: "You want to try a new Italian restaurant. Explain why it sounds good and try to convince your partner.",
    roleB: "You prefer the usual place. Share your reasons and discuss both options together.",
    hints: ["suggest", "prefer", "because", "maybe", "try", "discuss", "decide"]
  },
  {
    title: "Booking a Hotel",
    category: "travel",
    difficulty: "medium",
    roleA: "You want to book a hotel for your trip. Call and ask about prices, amenities, and availability.",
    roleB: "You are a hotel receptionist. Answer questions about the hotel and help with the booking.",
    hints: ["book", "hotel", "price", "amenity", "available", "room", "reservation"]
  },
  {
    title: "Grocery Shopping Together",
    category: "daily",
    difficulty: "medium",
    roleA: "You have a shopping list. Ask your partner to help you find items and discuss what to buy.",
    roleB: "Help your partner shop. Suggest items and discuss meal plans together.",
    hints: ["shopping", "list", "find", "suggest", "buy", "meal", "plan"]
  },
  {
    title: "Team Meeting Discussion",
    category: "work",
    difficulty: "medium",
    roleA: "You have an idea for improving team communication. Present it in a meeting and ask for feedback.",
    roleB: "You are a team member. Listen to the idea, ask questions, and share your thoughts.",
    hints: ["idea", "team", "communication", "meeting", "suggest", "feedback", "discuss"]
  },
  {
    title: "Expressing Feelings",
    category: "romance",
    difficulty: "medium",
    roleA: "Tell your partner how much they mean to you and why you're grateful to have them in your life.",
    roleB: "Listen and respond with your own feelings. Share what you appreciate about your partner.",
    hints: ["feel", "appreciate", "grateful", "mean", "love", "special", "together"]
  },
  {
    title: "Imagining a Crazy Adventure",
    category: "fun",
    difficulty: "medium",
    roleA: "Imagine you both won a trip to anywhere in the world. Describe your dream destination and convince your partner.",
    roleB: "You have a different dream destination. Discuss both options and plan your imaginary adventure.",
    hints: ["imagine", "dream", "destination", "trip", "adventure", "plan", "discuss"]
  },
  {
    title: "Discussing Life Goals",
    category: "deep",
    difficulty: "medium",
    roleA: "Share your life goals and dreams. Explain what you want to achieve in the next 5 years.",
    roleB: "Listen and share your own goals. Discuss how you can support each other's dreams.",
    hints: ["goal", "dream", "achieve", "future", "plan", "support", "together"]
  },
  // Hard scenarios
  {
    title: "Convincing About a Big Change",
    category: "deep",
    difficulty: "hard",
    roleA: "You want to make a big life change (like moving cities or changing careers). Explain your reasons and try to convince your partner.",
    roleB: "You have concerns about this change. Ask questions, share your feelings, and discuss the future together.",
    hints: ["convince", "reason", "concern", "future", "feel", "discuss", "decision", "important"]
  },
  {
    title: "Giving Relationship Advice",
    category: "deep",
    difficulty: "hard",
    roleA: "Your friend is having relationship problems. Listen and give thoughtful advice about communication.",
    roleB: "You are having relationship problems. Share your feelings and ask for advice.",
    hints: ["advice", "problem", "feel", "suggest", "communication", "understand", "help", "support"]
  },
  {
    title: "Telling a Personal Story",
    category: "deep",
    difficulty: "hard",
    roleA: "Share a meaningful story from your past. Include details about what happened and how it affected you.",
    roleB: "Listen to the story. Ask questions to understand better and share your thoughts.",
    hints: ["story", "remember", "happen", "feel", "important", "understand", "share", "experience"]
  },
  {
    title: "Romantic Future Planning",
    category: "romance",
    difficulty: "hard",
    roleA: "You want to talk about your future together. Share your dreams and hopes for the relationship.",
    roleB: "Listen and share your own dreams. Discuss how you can build this future together.",
    hints: ["future", "dream", "hope", "together", "plan", "imagine", "believe", "commitment"]
  },
  {
    title: "Silly Superhero Team",
    category: "fun",
    difficulty: "hard",
    roleA: "You are a superhero with a funny power (like turning things into cheese). Convince others to join your team.",
    roleB: "You are another superhero with a silly power. Discuss your powers and plan a funny mission together.",
    hints: ["superhero", "power", "funny", "team", "mission", "convince", "imagine", "creative"]
  },
  {
    title: "Time Travel Adventure",
    category: "fun",
    difficulty: "hard",
    roleA: "You just discovered a time machine. Tell your friend about it and convince them to travel with you.",
    roleB: "You are skeptical but curious. Ask questions about time travel and discuss where you would go.",
    hints: ["time travel", "discover", "convince", "skeptical", "curious", "where", "when", "adventure"]
  },
  {
    title: "Dealing with a Difficult Customer",
    category: "work",
    difficulty: "hard",
    roleA: "You are a customer service representative. A customer is upset about a delayed order. Calm them down and find a solution.",
    roleB: "You are an upset customer. Your order is late. Express your frustration but be willing to listen to solutions.",
    hints: ["customer", "upset", "calm", "solution", "apologize", "understand", "resolve"]
  },
  {
    title: "Negotiating a Business Deal",
    category: "work",
    difficulty: "hard",
    roleA: "You want to negotiate better terms for a contract. Present your case professionally and find a compromise.",
    roleB: "You have budget constraints. Listen to the proposal, ask questions, and negotiate terms that work for both sides.",
    hints: ["negotiate", "contract", "terms", "proposal", "compromise", "budget", "professional"]
  },
  {
    title: "Planning a Surprise Date",
    category: "romance",
    difficulty: "hard",
    roleA: "You want to plan a surprise romantic date. Ask your partner about their preferences without revealing the surprise.",
    roleB: "Your partner is asking unusual questions. Answer naturally without suspecting anything.",
    hints: ["surprise", "date", "romantic", "plan", "preference", "secret", "special"]
  },
  {
    title: "Discussing Future Together",
    category: "romance",
    difficulty: "hard",
    roleA: "You want to discuss moving in together or taking the next step in your relationship. Share your thoughts and feelings.",
    roleB: "Listen carefully to your partner's thoughts. Share your own feelings and concerns about the future.",
    hints: ["future", "relationship", "step", "feel", "concern", "discuss", "commitment", "together"]
  },
  {
    title: "Creating a Fantasy World",
    category: "fun",
    difficulty: "hard",
    roleA: "You both discover you can create a fantasy world together. Describe your vision and convince your partner to join you.",
    roleB: "You have different ideas for the fantasy world. Discuss both visions and create something unique together.",
    hints: ["fantasy", "world", "create", "vision", "imagine", "unique", "together", "creative"]
  },
  {
    title: "Talking About Fears",
    category: "deep",
    difficulty: "hard",
    roleA: "Share a fear or insecurity you have. Explain where it comes from and how it affects you.",
    roleB: "Listen with empathy. Share your own fears and discuss how you can support each other.",
    hints: ["fear", "insecurity", "share", "feel", "support", "understand", "vulnerable", "trust"]
  },
  {
    title: "Discussing Past Mistakes",
    category: "deep",
    difficulty: "hard",
    roleA: "Share a mistake you made in the past and what you learned from it. Be open and honest.",
    roleB: "Listen without judgment. Share your own experience with mistakes and discuss growth.",
    hints: ["mistake", "past", "learn", "grow", "honest", "judgment", "experience", "forgive"]
  },
  {
    title: "Lost in a Foreign City",
    category: "travel",
    difficulty: "hard",
    roleA: "You are lost in a foreign city and don't speak the language well. Ask a local for help finding your hotel.",
    roleB: "You are a helpful local. The tourist doesn't speak your language well. Use gestures and simple words to help.",
    hints: ["lost", "foreign", "language", "help", "hotel", "direction", "gesture", "communicate"]
  },
  {
    title: "Planning a Long Trip",
    category: "travel",
    difficulty: "hard",
    roleA: "You want to plan a 3-month backpacking trip. Discuss destinations, budget, and what you want to experience.",
    roleB: "You have concerns about safety and budget. Share your worries and help plan a realistic trip.",
    hints: ["trip", "plan", "destination", "budget", "safety", "experience", "concern", "realistic"]
  },
  {
    title: "Resolving a Daily Conflict",
    category: "daily",
    difficulty: "hard",
    roleA: "You and your partner disagree about household chores. Express your feelings and find a fair solution.",
    roleB: "You have a different perspective. Listen to your partner's concerns and work together to compromise.",
    hints: ["disagree", "chore", "household", "feel", "solution", "compromise", "fair", "discuss"]
  },
  {
    title: "Supporting Each Other's Dreams",
    category: "deep",
    difficulty: "hard",
    roleA: "You have a big dream that requires sacrifice. Share it with your partner and discuss how to make it work.",
    roleB: "Your partner's dream affects you too. Share your concerns but also show support and find ways to help.",
    hints: ["dream", "sacrifice", "support", "concern", "help", "together", "future", "commitment"]
  }
];

export function getFilteredScenarios(
  difficulty: string,
  category: string
): Scenario[] {
  return scenarios.filter(scenario => {
    const difficultyMatch = scenario.difficulty === difficulty;
    const categoryMatch = category === "all" || scenario.category === category;
    return difficultyMatch && categoryMatch;
  });
}

export function getRandomScenario(
  difficulty: string,
  category: string
): Scenario | null {
  const filtered = getFilteredScenarios(difficulty, category);
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
