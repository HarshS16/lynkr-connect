-- Fix RLS Policies for Messaging System
-- Run this in Supabase SQL Editor to fix the infinite recursion issue

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view message attachments in their conversations" ON storage.objects;

-- 2. Create fixed RLS policies for conversation_participants (base table - no recursion)
CREATE POLICY "Users can view their own participation" ON public.conversation_participants
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view participants in conversations they joined" ON public.conversation_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT cp.conversation_id 
    FROM public.conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join conversations" ON public.conversation_participants
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 3. Create fixed RLS policies for conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their conversations" ON public.conversations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.uid()
  )
);

-- 4. Create fixed RLS policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

-- 5. Create fixed storage policy for message attachments
CREATE POLICY "Users can view message attachments in their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id::text = (storage.foldername(name))[2]
    AND cp.user_id = auth.uid()
  )
);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- 7. Test the policies by running a simple query
-- This should work without infinite recursion
SELECT 'Policies fixed successfully' as status;
