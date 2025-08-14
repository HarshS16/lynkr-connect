-- Check Comments Status After Fix
-- Run this in Supabase SQL Editor to see what was actually fixed

-- 1. Check if foreign keys now exist for comments
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

-- 2. Test if the relationship actually works now
SELECT 
    c.id,
    c.content,
    c.user_id,
    p.full_name as commenter_name
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.user_id
LIMIT 5;

-- 3. Check notifications table structure (for the other error)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' AND table_schema = 'public'
ORDER BY ordinal_position;
