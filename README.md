# 🎭 Role-Play Roulette

A mobile-first web game for couples to practice spoken English conversation. Built with Next.js 14, TypeScript, and Supabase.

## Features

- 🎯 **Difficulty Levels**: Easy, Medium, Hard
- 🗂️ **Categories**: Daily Life, Travel, Work, Romance, Fun/Silly, Deep Talk
- ⏱️ **Timer**: Visual countdown timer for practice sessions
- 🔄 **Swap Roles**: Easily swap between Role A and Role B
- 👤 **User Accounts**: Sign up, sign in, and track your progress
- 💾 **Database**: Store scenarios, sessions, and progress in Supabase
- 📱 **Mobile-First**: Designed for phones, responsive on desktop
- 🎨 **Beautiful UI**: Friendly, playful, romantic design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)):
   - Create a Supabase project
   - Run the database migration
   - Add environment variables to `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout with AuthProvider
│   ├── page.tsx         # Main game page
│   └── globals.css      # Global styles
├── components/
│   ├── ScenarioCard.tsx # Scenario display component
│   ├── Timer.tsx        # Timer component
│   └── AuthButton.tsx   # Authentication UI
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   ├── scenarios.ts   # Scenario data and utilities
│   ├── supabase/        # Supabase client setup
│   └── db/              # Database operations
├── types/
│   ├── index.ts         # TypeScript type definitions
│   └── database.types.ts # Supabase database types
├── supabase/
│   └── migrations/      # Database migration files
└── public/              # Static assets
```

## Supabase Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on:
- Creating a Supabase project
- Running database migrations
- Setting up environment variables
- Seeding initial data

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vercel will automatically detect Next.js and deploy

## Database Features

- ✅ User authentication and profiles
- ✅ Scenario storage (community + custom)
- ✅ Session tracking
- ✅ Progress analytics
- ✅ Favorites system
- ✅ Couple accounts (ready for implementation)

## License

MIT
