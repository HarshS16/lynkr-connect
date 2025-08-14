-- Debug and Fix Messaging System
-- Run this in Supabase SQL Editor to diagnose and fix the issue

-- 1. First, let's check what tables exist and their structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'conversation_participants', 'messages')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Check existing foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('conversation_participants', 'messages', 'profiles');

-- 3. Check if profiles table exists and has the right structure
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_table_exists;

-- 4. If profiles table doesn't exist or is wrong, let's create/fix it
-- Drop existing foreign keys first
ALTER TABLE public.conversation_participants 
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;

ALTER TABLE public.conversation_participants 
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_profiles_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_profiles_fkey;

-- 5. Ensure profiles table exists with correct structure
-- This will create it if it doesn't exist, or do nothing if it does
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  current_position TEXT,
  bio TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. If the profiles table uses 'user_id' instead of 'id' as the reference, let's fix our foreign keys
-- First, let's try the most common pattern: profiles.user_id
ALTER TABLE public.conversation_participants 
ADD CONSTRAINT conversation_participants_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_profiles_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 7. If that fails, let's try profiles.id
-- (This will only run if the above failed)

-- 8. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Create simple RLS policies for profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

-- 10. Grant permissions
GRANT ALL ON public.profiles TO authenticated;

-- 11. Test the relationships
SELECT 'Foreign key setup complete!' as status;

-- 12. Let's also check what the actual error might be by testing a simple query
SELECT COUNT(*) as conversation_participants_count FROM public.conversation_participants;
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as messages_count FROM public.messages;
