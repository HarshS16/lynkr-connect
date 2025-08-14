-- Messaging System Database Setup for Lynkr
-- Run this in Supabase SQL Editor

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create conversation_participants table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(conversation_id, user_id)
);

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  image_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL
);

-- 4. Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Set up Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
FOR SELECT USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update conversations they participate in" ON public.conversations
FOR UPDATE USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- 7. Create RLS policies for conversation_participants
CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to conversations" ON public.conversation_participants
FOR INSERT WITH CHECK (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  ) OR user_id = auth.uid()
);

-- 8. Create RLS policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (sender_id = auth.uid());

-- 9. Create storage policies for message attachments
CREATE POLICY "Users can upload message attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view message attachments in their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[2] IN (
    SELECT conversation_id::text
    FROM public.conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own message attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- 11. Create triggers to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Create trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- 13. Create function to get or create conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing conversation between these two users
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  WHERE c.id IN (
    SELECT cp1.conversation_id
    FROM public.conversation_participants cp1
    WHERE cp1.user_id = user1_id
    INTERSECT
    SELECT cp2.conversation_id
    FROM public.conversation_participants cp2
    WHERE cp2.user_id = user2_id
  )
  AND (
    SELECT COUNT(*)
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = c.id
  ) = 2
  LIMIT 1;

  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations DEFAULT VALUES
    RETURNING id INTO conversation_id;
    
    -- Add both users as participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, user1_id), (conversation_id, user2_id);
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
