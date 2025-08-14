-- Final Comments Fix - Comprehensive Solution
-- Run this in Supabase SQL Editor

-- 1. First, let's see what foreign keys currently exist for comments
SELECT 
    tc.table_name, 
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

-- 2. Check the actual structure of comments and profiles tables
SELECT 'COMMENTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'PROFILES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Drop ALL existing foreign key constraints for comments
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_profiles_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_post_id_posts_fkey;

-- 4. Check what column the profiles table actually uses as primary key
SELECT 
    kcu.column_name as primary_key_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public';

-- 5. Create the foreign key using the correct reference
-- Try with profiles.user_id first (most common)
DO $$
BEGIN
    -- Try to create foreign key with profiles.user_id
    BEGIN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_user_id_profiles_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key created with profiles.user_id';
    EXCEPTION WHEN OTHERS THEN
        -- If that fails, try with profiles.id
        BEGIN
            ALTER TABLE public.comments 
            ADD CONSTRAINT comments_user_id_profiles_fkey 
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            
            RAISE NOTICE 'Foreign key created with profiles.id';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create foreign key with either profiles.user_id or profiles.id';
        END;
    END;
END $$;

-- 6. Create foreign key for posts
ALTER TABLE public.comments 
ADD CONSTRAINT comments_post_id_posts_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- 7. Verify the foreign keys were created
SELECT 'FINAL FOREIGN KEYS:' as info;
SELECT 
    tc.table_name, 
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

-- 8. Test the relationship with a simple query
SELECT 'TESTING RELATIONSHIP:' as info;
SELECT 
    c.id,
    c.content,
    c.user_id,
    p.full_name
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.user_id
LIMIT 3;

-- 9. If the above fails, try with profiles.id
SELECT 'TESTING WITH PROFILES.ID:' as info;
SELECT 
    c.id,
    c.content,
    c.user_id,
    p.full_name
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.id
LIMIT 3;

SELECT 'Comments foreign key fix completed!' as status;
