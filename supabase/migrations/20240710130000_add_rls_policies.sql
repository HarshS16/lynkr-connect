-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id); 