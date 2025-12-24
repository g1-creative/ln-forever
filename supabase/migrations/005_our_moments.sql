-- Our Moments Timeline Feature
-- 
-- IMPORTANT: Before running this migration, create the storage bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: "moments"
-- 4. Public bucket: YES (for MVP - allows reading images)
-- 5. File size limit: 5MB (recommended)
-- 6. Allowed MIME types: image/* (optional)
-- 7. Click "Create bucket"
--
-- After creating the bucket, run this migration to set up storage policies.

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

-- Storage Bucket Policies for moments
-- These policies allow authenticated users to upload, read, and delete their own files
-- Note: If bucket is public, SELECT policy may not be needed, but INSERT/DELETE still require policies

-- Allow authenticated users to upload files to their own folder
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'moments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read files (if bucket is not public, uncomment this)
-- DROP POLICY IF EXISTS "Users can read moments images" ON storage.objects;
-- CREATE POLICY "Users can read moments images"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'moments' AND
--   (
--     (storage.foldername(name))[1] = auth.uid()::text OR
--     EXISTS (
--       SELECT 1 FROM moments m
--       WHERE m.image_url LIKE '%' || name || '%'
--       AND (m.user_id = auth.uid() OR m.partner_id = auth.uid())
--     )
--   )
-- );

-- Allow authenticated users to delete files from their own folder
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'moments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

