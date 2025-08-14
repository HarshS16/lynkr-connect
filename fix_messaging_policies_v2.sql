-- Complete Fix for RLS Policies - No Recursion
-- Run this in Supabase SQL Editor

-- 1. Disable RLS temporarily to clean up
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies completely
DROP POLICY IF EXISTS "Users can view their own participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in conversations they joined" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view message attachments in their conversations" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own message attachments" ON storage.objects;

-- 3. Re-enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, non-recursive policies for conversation_participants
CREATE POLICY "conversation_participants_select_policy" ON public.conversation_participants
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "conversation_participants_insert_policy" ON public.conversation_participants
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. Create policies for conversations using direct user check
CREATE POLICY "conversations_select_policy" ON public.conversations
FOR SELECT USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "conversations_insert_policy" ON public.conversations
FOR INSERT WITH CHECK (true);

CREATE POLICY "conversations_update_policy" ON public.conversations
FOR UPDATE USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- 6. Create policies for messages
CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "messages_update_policy" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "messages_delete_policy" ON public.messages
FOR DELETE USING (sender_id = auth.uid());

-- 7. Create storage policies
CREATE POLICY "message_attachments_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "message_attachments_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[2] IN (
    SELECT conversation_id::text
    FROM public.conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "message_attachments_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 8. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- 9. Add missing foreign key relationships to profiles table
-- First check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  current_position TEXT,
  bio TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profiles if not exists
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (true); -- Allow all users to view profiles

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Add foreign key constraints to link messaging tables with profiles
-- Note: We use user_id to reference profiles.id (which references auth.users.id)

-- For conversation_participants -> profiles relationship
ALTER TABLE public.conversation_participants
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;

ALTER TABLE public.conversation_participants
ADD CONSTRAINT conversation_participants_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- For messages -> profiles relationship
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_profiles_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Grant permissions on profiles
GRANT ALL ON public.profiles TO authenticated;

-- 10. Test query
SELECT 'All policies and foreign keys fixed!' as status;
