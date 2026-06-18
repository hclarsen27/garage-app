-- Run these in Supabase SQL Editor to fix the quotes table schema
-- This fixes the "invalid input syntax for type uuid" error on the quote page

-- Step 1: Drop foreign key constraints that reference users
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_user_id_fkey;
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_project_id_fkey;

-- Step 2: Change user_id to TEXT (Firebase UIDs are strings, not UUIDs)
ALTER TABLE quotes ALTER COLUMN user_id TYPE text;

-- Step 3: Disable RLS (same approach as projects/appointments tables)
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-add project_id foreign key pointing to projects table (optional, skip if errors)
-- ALTER TABLE quotes ADD CONSTRAINT quotes_project_id_fkey
--   FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'quotes';
