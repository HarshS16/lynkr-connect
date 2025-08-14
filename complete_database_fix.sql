-- Complete Database Fix - Comments and Notifications
-- Run this in Supabase SQL Editor

-- 1. First, let's see what we're working with
SELECT 'PROFILES TABLE PRIMARY KEY:' as info;
SELECT 
    kcu.column_name as primary_key_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public';

-- 2. Check profiles table structure
SELECT 'PROFILES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check comments table structure
SELECT 'COMMENTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Fix notifications table - add missing columns
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS message TEXT;

-- 5. Now fix the comments foreign key
-- Drop any existing broken constraints
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_profiles_fkey;

-- Create the foreign key constraint
-- First try with profiles.user_id (most common)
DO $$
BEGIN
    -- Check if profiles has user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        -- Try to create foreign key with profiles.user_id
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_user_id_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key created with profiles.user_id';
    ELSE
        -- Try with profiles.id instead
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_user_id_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key created with profiles.id';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Foreign key creation failed: %', SQLERRM;
END $$;

-- 6. Grant permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 7. Test the comments relationship
SELECT 'TESTING COMMENTS RELATIONSHIP:' as info;
SELECT 
    c.id,
    c.content,
    c.user_id,
    p.full_name as commenter_name
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.user_id
LIMIT 3;

-- 8. If the above fails, try with profiles.id
SELECT 'TESTING WITH PROFILES.ID:' as info;
SELECT 
    c.id,
    c.content,
    c.user_id,
    p.full_name as commenter_name
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.id
LIMIT 3;

-- 9. Show final foreign keys
SELECT 'FINAL FOREIGN KEYS FOR COMMENTS:' as info;
SELECT 
    tc.constraint_name,
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'comments';

SELECT 'Database fix completed!' as status;
