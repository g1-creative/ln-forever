export interface TwentyQuestionsCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  items: string[];
}

export const twentyQuestionsCategories: TwentyQuestionsCategory[] = [
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🐾',
    description: 'Think of any animal',
    items: [
      'Dog', 'Cat', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Giraffe',
      'Horse', 'Cow', 'Pig', 'Sheep', 'Goat', 'Chicken', 'Duck', 'Rabbit',
      'Mouse', 'Rat', 'Hamster', 'Bird', 'Eagle', 'Owl', 'Parrot', 'Penguin',
      'Dolphin', 'Whale', 'Shark', 'Fish', 'Octopus', 'Crab', 'Lobster',
      'Snake', 'Lizard', 'Turtle', 'Frog', 'Butterfly', 'Bee', 'Spider',
      'Zebra', 'Hippo', 'Rhino', 'Kangaroo', 'Panda', 'Koala', 'Fox', 'Wolf',
      'Deer', 'Moose', 'Squirrel', 'Raccoon', 'Skunk', 'Otter', 'Seal', 'Walrus'
    ]
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    emoji: '🍕',
    description: 'Think of any food or drink',
    items: [
      'Pizza', 'Burger', 'Pasta', 'Sushi', 'Taco', 'Burrito', 'Sandwich',
      'Salad', 'Soup', 'Steak', 'Chicken', 'Fish', 'Rice', 'Bread', 'Cake',
      'Cookie', 'Ice Cream', 'Chocolate', 'Apple', 'Banana', 'Orange', 'Strawberry',
      'Grapes', 'Watermelon', 'Pineapple', 'Mango', 'Coffee', 'Tea', 'Juice',
      'Soda', 'Water', 'Milk', 'Cheese', 'Egg', 'Butter', 'Yogurt', 'Cereal',
      'Pancake', 'Waffle', 'Donut', 'Muffin', 'Bagel', 'Croissant', 'Pretzel',
      'Popcorn', 'Chips', 'Candy', 'Gum', 'Honey', 'Jam', 'Peanut Butter'
    ]
  },
  {
    id: 'objects',
    name: 'Everyday Objects',
    emoji: '📱',
    description: 'Think of any common object',
    items: [
      'Phone', 'Computer', 'Tablet', 'TV', 'Remote', 'Headphones', 'Speaker',
      'Camera', 'Watch', 'Clock', 'Lamp', 'Chair', 'Table', 'Bed', 'Pillow',
      'Blanket', 'Towel', 'Toothbrush', 'Soap', 'Shampoo', 'Mirror', 'Comb',
      'Wallet', 'Keys', 'Bag', 'Backpack', 'Umbrella', 'Sunglasses', 'Hat',
      'Shoes', 'Socks', 'Shirt', 'Pants', 'Jacket', 'Gloves', 'Scarf',
      'Book', 'Pen', 'Pencil', 'Paper', 'Notebook', 'Eraser', 'Ruler',
      'Scissors', 'Tape', 'Glue', 'Stapler', 'Calculator', 'Battery', 'Flashlight'
    ]
  },
  {
    id: 'places',
    name: 'Places',
    emoji: '🌍',
    description: 'Think of any place or location',
    items: [
      'Beach', 'Mountain', 'Forest', 'Desert', 'Ocean', 'Lake', 'River',
      'Park', 'Garden', 'Zoo', 'Museum', 'Library', 'School', 'Hospital',
      'Restaurant', 'Cafe', 'Store', 'Mall', 'Cinema', 'Theater', 'Stadium',
      'Airport', 'Train Station', 'Bus Stop', 'Hotel', 'House', 'Apartment',
      'Office', 'Factory', 'Farm', 'Church', 'Temple', 'Mosque', 'Castle',
      'Bridge', 'Tower', 'Statue', 'Fountain', 'Playground', 'Gym', 'Pool',
      'Spa', 'Salon', 'Bank', 'Post Office', 'Gas Station', 'Parking Lot',
      'Highway', 'Street', 'Alley', 'Plaza', 'Square', 'Market', 'Bazaar'
    ]
  },
  {
    id: 'activities',
    name: 'Activities & Hobbies',
    emoji: '🎮',
    description: 'Think of any activity or hobby',
    items: [
      'Reading', 'Writing', 'Drawing', 'Painting', 'Singing', 'Dancing',
      'Playing Guitar', 'Playing Piano', 'Swimming', 'Running', 'Cycling',
      'Hiking', 'Camping', 'Fishing', 'Cooking', 'Baking', 'Gardening',
      'Photography', 'Video Games', 'Board Games', 'Chess', 'Poker',
      'Yoga', 'Meditation', 'Exercise', 'Weightlifting', 'Basketball',
      'Soccer', 'Tennis', 'Golf', 'Baseball', 'Volleyball', 'Badminton',
      'Skiing', 'Snowboarding', 'Surfing', 'Skating', 'Bowling', 'Darts',
      'Shopping', 'Traveling', 'Watching Movies', 'Listening to Music',
      'Collecting', 'Knitting', 'Sewing', 'Woodworking', 'Crafting'
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    emoji: '🌳',
    description: 'Think of something from nature',
    items: [
      'Tree', 'Flower', 'Rose', 'Sunflower', 'Tulip', 'Daisy', 'Leaf',
      'Grass', 'Moss', 'Fern', 'Bush', 'Branch', 'Root', 'Seed', 'Fruit',
      'Vegetable', 'Rock', 'Stone', 'Pebble', 'Sand', 'Dirt', 'Mud',
      'Cloud', 'Rain', 'Snow', 'Ice', 'Wind', 'Storm', 'Lightning',
      'Thunder', 'Rainbow', 'Sun', 'Moon', 'Star', 'Sky', 'Sunset',
      'Sunrise', 'Wave', 'Tide', 'Current', 'Breeze', 'Fog', 'Mist',
      'Dew', 'Frost', 'Hail', 'Sleet', 'Aurora', 'Meteor', 'Comet'
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    emoji: '🚗',
    description: 'Think of any vehicle or transportation',
    items: [
      'Car', 'Truck', 'Bus', 'Motorcycle', 'Bicycle', 'Scooter', 'Skateboard',
      'Train', 'Subway', 'Tram', 'Plane', 'Helicopter', 'Boat', 'Ship',
      'Yacht', 'Sailboat', 'Canoe', 'Kayak', 'Raft', 'Submarine', 'Rocket',
      'Hot Air Balloon', 'Zeppelin', 'Gondola', 'Cable Car', 'Elevator',
      'Escalator', 'Trolley', 'Taxi', 'Uber', 'Ambulance', 'Fire Truck',
      'Police Car', 'Ambulance', 'Garbage Truck', 'Tractor', 'Forklift',
      'Crane', 'Bulldozer', 'Excavator', 'Tank', 'Jeep', 'SUV', 'Van',
      'Convertible', 'Sports Car', 'Limousine', 'Horse', 'Camel', 'Elephant'
    ]
  },
  {
    id: 'body',
    name: 'Body Parts',
    emoji: '👤',
    description: 'Think of any body part',
    items: [
      'Head', 'Hair', 'Face', 'Eye', 'Ear', 'Nose', 'Mouth', 'Lip',
      'Tooth', 'Tongue', 'Chin', 'Cheek', 'Forehead', 'Eyebrow', 'Eyelash',
      'Neck', 'Shoulder', 'Arm', 'Elbow', 'Wrist', 'Hand', 'Finger',
      'Thumb', 'Nail', 'Chest', 'Back', 'Stomach', 'Waist', 'Hip',
      'Leg', 'Knee', 'Ankle', 'Foot', 'Toe', 'Heel', 'Muscle', 'Bone',
      'Skin', 'Heart', 'Lung', 'Brain', 'Stomach', 'Liver', 'Kidney'
    ]
  },
  {
    id: 'clothing',
    name: 'Clothing',
    emoji: '👕',
    description: 'Think of any piece of clothing',
    items: [
      'Shirt', 'T-Shirt', 'Blouse', 'Dress', 'Skirt', 'Pants', 'Jeans',
      'Shorts', 'Sweater', 'Jacket', 'Coat', 'Vest', 'Suit', 'Tie',
      'Bow Tie', 'Scarf', 'Gloves', 'Mittens', 'Hat', 'Cap', 'Beanie',
      'Helmet', 'Sunglasses', 'Glasses', 'Shoes', 'Sneakers', 'Boots',
      'Sandals', 'Flip Flops', 'Slippers', 'Socks', 'Stockings', 'Tights',
      'Underwear', 'Bra', 'Belt', 'Suspenders', 'Apron', 'Uniform',
      'Pajamas', 'Robe', 'Swimsuit', 'Bikini', 'Trunks', 'Wetsuit'
    ]
  },
  {
    id: 'colors',
    name: 'Colors',
    emoji: '🎨',
    description: 'Think of any color',
    items: [
      'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink',
      'Brown', 'Black', 'White', 'Gray', 'Grey', 'Silver', 'Gold',
      'Beige', 'Tan', 'Cream', 'Ivory', 'Maroon', 'Burgundy', 'Crimson',
      'Scarlet', 'Coral', 'Peach', 'Lime', 'Turquoise', 'Cyan', 'Navy',
      'Indigo', 'Violet', 'Lavender', 'Magenta', 'Fuchsia', 'Salmon',
      'Olive', 'Teal', 'Aqua', 'Mint', 'Emerald', 'Jade', 'Amber'
    ]
  }
];

export function getCategoryById(id: string): TwentyQuestionsCategory | undefined {
  return twentyQuestionsCategories.find(cat => cat.id === id);
}

export function getRandomItemFromCategory(categoryId: string): string | null {
  const category = getCategoryById(categoryId);
  if (!category || category.items.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * category.items.length);
  return category.items[randomIndex];
}

export function getAllCategories(): TwentyQuestionsCategory[] {
  return twentyQuestionsCategories;
}

