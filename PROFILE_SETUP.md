# Profile & Friends System Setup

## Overview
This update adds comprehensive profile personalization and a friends system to LN Forever, preparing the app for live social features.

## Features Added

### 1. Profile Personalization
- **Avatar Selection**: Choose from 12 emoji avatars
- **Username**: Unique username (minimum 3 characters)
- **Bio**: Personal bio up to 200 characters
- **Profile Page**: Accessible from navbar at `/profile`

### 2. Friends System
- **Friend Requests**: Send, accept, and reject friend requests
- **Friend Search**: Search users by username
- **Friends List**: View and manage your friends
- **Friend Management**: Remove friends

## Database Migration

### Step 1: Run the Migration
Execute the SQL migration in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/002_profile_enhancements.sql
```

This migration:
1. Adds `username`, `bio`, and `avatar_selection` columns to `profiles` table
2. Creates `friends` table for bidirectional friendships
3. Creates `friend_requests` table for managing friend requests
4. Sets up Row Level Security (RLS) policies
5. Creates indexes for performance
6. Adds trigger to auto-create friendships when requests are accepted

### Step 2: Verify Migration
After running the migration, verify the tables exist:
- `profiles` should have new columns: `username`, `bio`, `avatar_selection`
- `friends` table should exist
- `friend_requests` table should exist

## Usage

### Profile Settings
1. Navigate to **Profile** from the navbar
2. Select an avatar from the grid
3. Enter a unique username (optional but recommended)
4. Add a bio (optional)
5. Click **Save Changes**

### Adding Friends
1. Go to **Profile** → **Friends** tab
2. Search for users by username
3. Click **Add Friend** on search results
4. Wait for them to accept your request

### Managing Friend Requests
- **Received Requests**: Appear at the top of the Friends tab with a badge
- **Accept/Decline**: Click the appropriate button
- **Sent Requests**: Can be viewed (cancel functionality can be added)

### Viewing Friends
- All friends appear in the Friends list
- Shows avatar, username, name, and friendship date
- Remove friends with the **Remove** button

## Technical Details

### Avatar System
- Currently uses emoji avatars (12 options)
- Stored as `avatar_selection` in profiles table
- Can be easily extended to use image URLs or custom avatars

### Username System
- Unique constraint on username
- Minimum 3 characters
- Case-sensitive search
- Username is optional (users can use email if preferred)

### Friends System Architecture
- **Bidirectional Friendships**: Stored with `user1_id < user2_id` for consistency
- **Friend Requests**: Status-based (pending, accepted, rejected)
- **Auto-Friendship**: Trigger automatically creates friendship when request is accepted
- **RLS Policies**: Users can only see/manage their own friendships and requests

## Future Enhancements
- Real-time friend status
- Friend activity feed
- Friend suggestions
- Block users functionality
- Friend groups/categories
- Live game invitations

## Files Created/Modified

### New Files
- `supabase/migrations/002_profile_enhancements.sql` - Database migration
- `lib/db/friends.ts` - Friends system functions
- `app/profile/page.tsx` - Profile page component
- `PROFILE_SETUP.md` - This file

### Modified Files
- `types/database.types.ts` - Added friends and friend_requests types
- `components/Navbar.tsx` - Added Profile link
- `app/globals.css` - Added profile and friends styling

## Notes
- After running the migration, you may want to regenerate TypeScript types from Supabase
- The friends system is ready for live features - you can extend it with real-time subscriptions
- Avatar system can be upgraded to use image uploads or custom avatars later

