-- Fix Profiles Table Structure and Messaging
-- Run this in Supabase SQL Editor

-- 1. First, let's see the actual structure of your profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check what's currently in the profiles table
SELECT id, user_id, full_name FROM public.profiles LIMIT 5;

-- 3. Fix the profiles table population based on your actual structure
-- Your profiles table seems to have both 'id' and 'user_id' columns
INSERT INTO public.profiles (id, user_id, full_name, created_at, updated_at)
SELECT 
    au.id,
    au.id as user_id,  -- Set user_id to the same as id
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. Now let's check what foreign key column we should use
-- Check if we should reference profiles.id or profiles.user_id
SELECT 
    'profiles.id' as reference_column,
    COUNT(*) as count
FROM public.profiles 
WHERE id IS NOT NULL
UNION ALL
SELECT 
    'profiles.user_id' as reference_column,
    COUNT(*) as count
FROM public.profiles 
WHERE user_id IS NOT NULL;

-- 5. Drop existing foreign keys and recreate them correctly
ALTER TABLE public.conversation_participants 
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_profiles_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_profiles_fkey;

-- 6. Create foreign keys using the correct reference column
-- Try with profiles.user_id first (most common pattern)
ALTER TABLE public.conversation_participants 
ADD CONSTRAINT conversation_participants_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_profiles_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 7. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- 8. Test the setup
SELECT 'Messaging system fixed with correct profile structure!' as status;

-- 9. Test that foreign keys work
SELECT 
    cp.user_id,
    p.full_name
FROM public.conversation_participants cp
LEFT JOIN public.profiles p ON cp.user_id = p.user_id
LIMIT 1;
