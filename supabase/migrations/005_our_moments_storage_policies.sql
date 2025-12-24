-- Standalone script to fix storage bucket RLS policies
-- Run this in Supabase SQL Editor if you're getting RLS errors on upload

-- Allow authenticated users to upload files to their own folder
-- Files are stored as: {user_id}/{timestamp}.{ext}
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'moments' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Allow authenticated users to read files from their own folder or partner's folder
DROP POLICY IF EXISTS "Users can read moments images" ON storage.objects;
CREATE POLICY "Users can read moments images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'moments' AND
  (
    (string_to_array(name, '/'))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM moments m
      WHERE m.image_url LIKE '%' || name || '%'
      AND (m.user_id = auth.uid() OR m.partner_id = auth.uid())
    )
  )
);

-- Allow authenticated users to delete files from their own folder
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'moments' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

