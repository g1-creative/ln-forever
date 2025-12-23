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
