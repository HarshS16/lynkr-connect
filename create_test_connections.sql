-- Create Test Connections
-- Run this in Supabase SQL Editor

-- First, let's create the connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "connections_select_policy" ON public.connections;
CREATE POLICY "connections_select_policy" ON public.connections
FOR SELECT USING (true);

DROP POLICY IF EXISTS "connections_insert_policy" ON public.connections;
CREATE POLICY "connections_insert_policy" ON public.connections
FOR INSERT WITH CHECK (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "connections_update_policy" ON public.connections;
CREATE POLICY "connections_update_policy" ON public.connections
FOR UPDATE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.connections TO authenticated;

-- Now let's create some test connections between the existing users
-- Using the user IDs from your profiles table

-- Connection 1: bb connects with Yashvardhan Singh (accepted)
INSERT INTO public.connections (requester_id, addressee_id, status)
VALUES (
    '304c1946-fd61-47aa-97e8-9bdfa4cbcc32', -- bb
    '8cc0be2b-1475-4fd6-bb39-2111ecb33841', -- Yashvardhan Singh
    'accepted'
) ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- Connection 2: bb connects with Shantanu (accepted)
INSERT INTO public.connections (requester_id, addressee_id, status)
VALUES (
    '304c1946-fd61-47aa-97e8-9bdfa4cbcc32', -- bb
    '738753a4-467d-46dd-9045-b5ac8c73d9a5', -- Shantanu
    'accepted'
) ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- Connection 3: Yashvardhan Singh connects with anand mehta (accepted)
INSERT INTO public.connections (requester_id, addressee_id, status)
VALUES (
    '8cc0be2b-1475-4fd6-bb39-2111ecb33841', -- Yashvardhan Singh
    '58d7b4f4-1790-4c4e-a1b6-8cafe985cfad', -- anand mehta
    'accepted'
) ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- Connection 4: Shantanu connects with Shantanutiwari (accepted)
INSERT INTO public.connections (requester_id, addressee_id, status)
VALUES (
    '738753a4-467d-46dd-9045-b5ac8c73d9a5', -- Shantanu
    '412dbab0-578f-41cd-b3fe-b24373235967', -- Shantanutiwari
    'accepted'
) ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- Connection 5: anand mehta connects with bb (pending - to test different statuses)
INSERT INTO public.connections (requester_id, addressee_id, status)
VALUES (
    '58d7b4f4-1790-4c4e-a1b6-8cafe985cfad', -- anand mehta
    '304c1946-fd61-47aa-97e8-9bdfa4cbcc32', -- bb
    'pending'
) ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- Verify the connections were created
SELECT 
    c.id,
    c.requester_id,
    c.addressee_id,
    c.status,
    r.full_name as requester_name,
    a.full_name as addressee_name
FROM public.connections c
LEFT JOIN public.profiles r ON c.requester_id = r.user_id
LEFT JOIN public.profiles a ON c.addressee_id = a.user_id
ORDER BY c.created_at;

-- Check connections count by status
SELECT status, COUNT(*) as count 
FROM public.connections 
GROUP BY status;

-- Test query for a specific user (bb's connections)
SELECT 
    c.id,
    c.requester_id,
    c.addressee_id,
    c.status,
    CASE 
        WHEN c.requester_id = '304c1946-fd61-47aa-97e8-9bdfa4cbcc32' THEN a.full_name
        ELSE r.full_name
    END as connection_name
FROM public.connections c
LEFT JOIN public.profiles r ON c.requester_id = r.user_id
LEFT JOIN public.profiles a ON c.addressee_id = a.user_id
WHERE (c.requester_id = '304c1946-fd61-47aa-97e8-9bdfa4cbcc32' OR c.addressee_id = '304c1946-fd61-47aa-97e8-9bdfa4cbcc32')
AND c.status = 'accepted';

SELECT 'Test connections created successfully!' as status;
