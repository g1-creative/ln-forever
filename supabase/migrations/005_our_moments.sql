-- Our Moments Timeline Feature
-- 
-- NOTE: After running this migration, you need to create a Supabase Storage bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named "moments"
-- 3. Set it to Public (or configure RLS policies for authenticated users)
-- 4. The bucket will store uploaded moment images

-- Moments table
CREATE TABLE IF NOT EXISTS moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  moment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  partner_comment TEXT,
  partner_comment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id != partner_id)
);

-- Indexes for moments
CREATE INDEX IF NOT EXISTS idx_moments_user_id ON moments(user_id);
CREATE INDEX IF NOT EXISTS idx_moments_partner_id ON moments(partner_id);
CREATE INDEX IF NOT EXISTS idx_moments_moment_date ON moments(moment_date DESC);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_moments_updated_at ON moments;
CREATE TRIGGER update_moments_updated_at BEFORE UPDATE ON moments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view moments where they are either the creator or partner
DROP POLICY IF EXISTS "Users can view moments with their partner" ON moments;
CREATE POLICY "Users can view moments with their partner"
  ON moments FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Users can create moments with their partner
DROP POLICY IF EXISTS "Users can create moments with their partner" ON moments;
CREATE POLICY "Users can create moments with their partner"
  ON moments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM friends f
      WHERE (f.user1_id = auth.uid() AND f.user2_id = partner_id)
         OR (f.user1_id = partner_id AND f.user2_id = auth.uid())
    )
  );

-- Users can update their own moments (caption, image) or add partner comment
DROP POLICY IF EXISTS "Users can update moments" ON moments;
CREATE POLICY "Users can update moments"
  ON moments FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (auth.uid() = partner_id AND partner_comment IS NULL) -- Partner can only comment once
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (auth.uid() = partner_id AND partner_comment IS NOT NULL)
  );

-- Users can delete their own moments
DROP POLICY IF EXISTS "Users can delete their own moments" ON moments;
CREATE POLICY "Users can delete their own moments"
  ON moments FOR DELETE
  USING (auth.uid() = user_id);

