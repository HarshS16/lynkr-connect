-- Test Comments Relationship
-- Run this to verify comments can fetch user information

SELECT 
    c.id,
    c.content,
    c.user_id,
    p.full_name as commenter_name,
    c.created_at
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.user_id
ORDER BY c.created_at DESC
LIMIT 5;
