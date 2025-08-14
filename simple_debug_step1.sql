-- Simple Debug Step 1 - Check Profiles Table
-- Run this ALONE in Supabase SQL Editor

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
