-- Fix Comments Foreign Key Relationships
-- Run this in Supabase SQL Editor

-- 1. Check current comments table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'comments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing foreign key constraints for comments
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

-- 3. Check if comments table exists and has data
SELECT COUNT(*) as total_comments FROM public.comments;

-- 4. Drop existing foreign key constraints for comments (if any)
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_profiles_fkey;

ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

-- 5. Create the missing foreign key relationship between comments and profiles
-- Using the same pattern as messaging system (profiles.user_id)
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 6. Also ensure comments are linked to posts properly
ALTER TABLE public.comments 
ADD CONSTRAINT comments_post_id_posts_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- 7. Enable RLS on comments if not already enabled
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for comments
DROP POLICY IF EXISTS "comments_select_policy" ON public.comments;
CREATE POLICY "comments_select_policy" ON public.comments
FOR SELECT USING (true); -- Allow all users to view comments

DROP POLICY IF EXISTS "comments_insert_policy" ON public.comments;
CREATE POLICY "comments_insert_policy" ON public.comments
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_update_policy" ON public.comments;
CREATE POLICY "comments_update_policy" ON public.comments
FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_delete_policy" ON public.comments;
CREATE POLICY "comments_delete_policy" ON public.comments
FOR DELETE USING (user_id = auth.uid());

-- 9. Grant permissions
GRANT ALL ON public.comments TO authenticated;

-- 10. Test the foreign key relationships
SELECT 'Comments foreign keys created successfully!' as status;

-- 11. Verify the relationships work
SELECT 
    c.id,
    c.content,
    p.full_name as commenter_name
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.user_id
LIMIT 3;
