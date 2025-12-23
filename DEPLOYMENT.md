# Deployment Guide

## Deploying to Vercel

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: Next.js migration"
```

2. Push to GitHub:
```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

That's it! Your app will be live in minutes.

### Step 3: Connect Supabase (After Setup)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Add environment variables in Vercel:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy your app

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Add your Supabase credentials to `.env.local`

4. Run development server:
```bash
npm run dev
```

## Next Steps

After deployment, you can:
- Set up Supabase authentication
- Create database tables
- Add user accounts and progress tracking
- Enable real-time features for couples
