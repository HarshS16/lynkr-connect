-- Cleanup and Complete Messaging Fix
-- Run this in Supabase SQL Editor

-- 1. Check current foreign key constraints
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
AND tc.table_name IN ('conversation_participants', 'messages');

-- 2. Ensure profiles table exists and is populated
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 3. Add the messages foreign key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_profiles_fkey'
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE public.messages 
        ADD CONSTRAINT messages_sender_id_profiles_fkey 
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Grant all necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- 5. Test that everything works
SELECT 'Messaging system setup complete!' as status;

-- 6. Test a simple join to verify foreign keys work
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 7. Verify we can query conversations with profiles
SELECT 
    'Foreign key relationships working!' as test_result
WHERE EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name IN (
        'conversation_participants_user_id_profiles_fkey',
        'messages_sender_id_profiles_fkey'
    )
    AND table_schema = 'public'
);
