-- Simple Messaging Fix - Step by Step
-- Run each section separately in Supabase SQL Editor

-- STEP 1: Check your current profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 2: Check conversation_participants structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 3: Check messages structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' AND table_schema = 'public'
ORDER BY ordinal_position;
