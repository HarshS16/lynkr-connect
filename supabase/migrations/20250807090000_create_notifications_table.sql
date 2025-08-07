-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  from_user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  post_id UUID REFERENCES posts,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow select own notifications" 
ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Allow insert notifications" 
ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update read status" 
ON notifications FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (true);