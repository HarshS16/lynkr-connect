-- Test Connections Functionality
-- Run this in Supabase SQL Editor

-- 1. Check if connections table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'connections' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current connections data
SELECT COUNT(*) as total_connections FROM public.connections;

-- 3. Check connections with status
SELECT status, COUNT(*) as count 
FROM public.connections 
GROUP BY status;

-- 4. Check foreign key relationships for connections
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
AND tc.table_name = 'connections';

-- 5. Check if we have any users in profiles table
SELECT user_id, full_name FROM public.profiles LIMIT 5;

-- 6. Test query that the Profile page is using
-- Replace 'YOUR_USER_ID' with an actual user ID from profiles table
-- SELECT 
--   id,
--   requester_id,
--   addressee_id,
--   status,
--   created_at
-- FROM public.connections
-- WHERE (requester_id = 'YOUR_USER_ID' OR addressee_id = 'YOUR_USER_ID')
-- AND status = 'accepted';
