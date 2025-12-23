
 # Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: role-play-roulette (or your choice)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for project to initialize

## Step 2: Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

This creates:
- ✅ All database tables
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updating timestamps
- ✅ Function to auto-create profiles on signup

## Step 4: Seed Initial Scenarios (Optional)

To populate the database with the default scenarios:

1. Go to **SQL Editor** again
2. Create a new query
3. Run this to insert scenarios:

```sql
-- Insert default scenarios
INSERT INTO scenarios (title, category, difficulty, role_a, role_b, hints, is_community) VALUES
('Ordering Coffee', 'daily', 'easy', 'You are a customer at a coffee shop. Order your favorite drink and ask about the price.', 'You are a friendly barista. Greet the customer, take their order, and tell them the price.', ARRAY['coffee', 'please', 'thank you', 'how much', 'latte', 'cappuccino'], true),
('Asking for Directions', 'daily', 'easy', 'You are lost in a new city. Ask someone how to get to the nearest subway station.', 'You are a helpful local person. Give clear directions to the subway station.', ARRAY['excuse me', 'where is', 'turn left', 'turn right', 'straight ahead', 'thank you'], true),
('Talking About Hobbies', 'daily', 'easy', 'Ask your friend about their hobbies and what they like to do in their free time.', 'Tell your friend about your hobbies. Ask them about their hobbies too.', ARRAY['hobby', 'like', 'enjoy', 'free time', 'interesting', 'fun'], true),
('At the Airport', 'travel', 'easy', 'You are checking in for your flight. Show your passport and ask about your gate number.', 'You are an airport staff member. Check the passenger''s ticket and tell them their gate number.', ARRAY['passport', 'ticket', 'gate', 'flight', 'boarding', 'luggage'], true),
('Planning a Weekend Trip', 'travel', 'medium', 'You want to plan a weekend trip. Suggest a destination and explain why you want to go there.', 'You have different ideas about where to go. Discuss your preferences and find a compromise.', ARRAY['suggest', 'prefer', 'because', 'maybe', 'what about', 'compromise', 'agree'], true),
('Discussing Movie Preferences', 'daily', 'medium', 'You love action movies. Explain why you prefer them and try to convince your partner to watch one.', 'You prefer romantic comedies. Share your opinion and discuss which movie to watch together.', ARRAY['prefer', 'because', 'opinion', 'think', 'suggest', 'maybe', 'compromise'], true),
('Work Project Discussion', 'work', 'medium', 'You have a new project idea. Present it to your colleague and ask for their opinion.', 'You have concerns about the project. Ask questions and suggest improvements.', ARRAY['idea', 'project', 'opinion', 'concern', 'suggest', 'improve', 'discuss'], true),
('Choosing a Restaurant', 'romance', 'medium', 'You want to try a new Italian restaurant. Explain why it sounds good and try to convince your partner.', 'You prefer the usual place. Share your reasons and discuss both options together.', ARRAY['suggest', 'prefer', 'because', 'maybe', 'try', 'discuss', 'decide'], true),
('Convincing About a Big Change', 'deep', 'hard', 'You want to make a big life change (like moving cities or changing careers). Explain your reasons and try to convince your partner.', 'You have concerns about this change. Ask questions, share your feelings, and discuss the future together.', ARRAY['convince', 'reason', 'concern', 'future', 'feel', 'discuss', 'decision', 'important'], true),
('Giving Relationship Advice', 'deep', 'hard', 'Your friend is having relationship problems. Listen and give thoughtful advice about communication.', 'You are having relationship problems. Share your feelings and ask for advice.', ARRAY['advice', 'problem', 'feel', 'suggest', 'communication', 'understand', 'help', 'support'], true),
('Telling a Personal Story', 'deep', 'hard', 'Share a meaningful story from your past. Include details about what happened and how it affected you.', 'Listen to the story. Ask questions to understand better and share your thoughts.', ARRAY['story', 'remember', 'happen', 'feel', 'important', 'understand', 'share', 'experience'], true),
('Romantic Future Planning', 'romance', 'hard', 'You want to talk about your future together. Share your dreams and hopes for the relationship.', 'Listen and share your own dreams. Discuss how you can build this future together.', ARRAY['future', 'dream', 'hope', 'together', 'plan', 'imagine', 'believe', 'commitment'], true),
('Silly Superhero Team', 'fun', 'hard', 'You are a superhero with a funny power (like turning things into cheese). Convince others to join your team.', 'You are another superhero with a silly power. Discuss your powers and plan a funny mission together.', ARRAY['superhero', 'power', 'funny', 'team', 'mission', 'convince', 'imagine', 'creative'], true),
('Time Travel Adventure', 'fun', 'hard', 'You just discovered a time machine. Tell your friend about it and convince them to travel with you.', 'You are skeptical but curious. Ask questions about time travel and discuss where you would go.', ARRAY['time travel', 'discover', 'convince', 'skeptical', 'curious', 'where', 'when', 'adventure'], true);
```

## Step 5: Configure Environment Variables

### Local Development

1. Create `.env.local` file in the project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace with your actual values from Step 2

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Redeploy your app

## Step 6: Test Authentication

1. Run your app: `npm run dev`
2. Click "Sign In / Sign Up"
3. Create an account
4. Check Supabase dashboard → **Authentication** → **Users** to see your new user
5. Check **Table Editor** → **profiles** to see your auto-created profile

## Database Schema Overview

### Tables Created:

- **profiles** - User profiles (extends auth.users)
- **couples** - Links two users as a couple
- **scenarios** - All role-play scenarios
- **sessions** - Completed practice sessions
- **user_scenarios** - User favorites and custom scenarios
- **progress** - Daily/weekly progress tracking

### Security:

- Row Level Security (RLS) enabled on all tables
- Users can only see/modify their own data
- Community scenarios are publicly readable
- All policies are defined in the migration

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has the correct variable names
- Restart your dev server after adding env variables

### "Error fetching scenarios"
- Check that scenarios table exists
- Verify RLS policies are set up correctly
- Make sure scenarios have `is_community = true`

### "Profile not created on signup"
- Check that the trigger function exists
- Verify the trigger is active in Supabase dashboard

## Next Steps

After setup, you can:
- ✅ Test user authentication
- ✅ Create and save custom scenarios
- ✅ Track practice sessions
- ✅ View progress over time
- ✅ Link accounts as couples (coming soon)

## Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure migration ran successfully
