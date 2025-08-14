-- Final Messaging Fix - Skip Data Insertion
-- Run this in Supabase SQL Editor

-- 1. Check your current profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing data in profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 3. Skip data insertion since profiles already exist
-- Just fix the foreign key relationships

-- 4. Drop existing foreign keys
ALTER TABLE public.conversation_participants 
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_profiles_fkey;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_profiles_fkey;

-- 5. Create foreign keys using profiles.user_id (since that's what exists)
ALTER TABLE public.conversation_participants 
ADD CONSTRAINT conversation_participants_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_profiles_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 6. Grant all necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- 7. Test the setup
SELECT 'Foreign keys created successfully - messaging should work now!' as status;

-- 8. Verify foreign key relationships exist
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
AND tc.table_name IN ('conversation_participants', 'messages')
AND tc.constraint_name LIKE '%profiles%';
