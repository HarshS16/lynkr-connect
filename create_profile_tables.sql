-- Profile Enhancement Migration
-- Run this SQL in your Supabase SQL Editor to create the profile tables

-- 1. Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_position TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT;

-- 2. Create work_experience table
CREATE TABLE IF NOT EXISTS public.work_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  CONSTRAINT company_length CHECK (char_length(company) >= 1 AND char_length(company) <= 100),
  CONSTRAINT description_length CHECK (char_length(description) <= 1000)
);

-- 3. Create education table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  grade TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT institution_length CHECK (char_length(institution) >= 1 AND char_length(institution) <= 100),
  CONSTRAINT degree_length CHECK (char_length(degree) >= 1 AND char_length(degree) <= 100),
  CONSTRAINT description_length CHECK (char_length(description) <= 1000)
);

-- 4. Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_achieved DATE,
  organization TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT description_length CHECK (char_length(description) <= 1000)
);

-- 5. Create certifications table
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiration_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT organization_length CHECK (char_length(issuing_organization) >= 1 AND char_length(issuing_organization) <= 100),
  CONSTRAINT description_length CHECK (char_length(description) <= 1000)
);

-- 6. Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  CONSTRAINT unique_user_skill UNIQUE (user_id, name)
);

-- 7. Enable Row Level Security on all new tables
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for work_experience
CREATE POLICY "Users can view all work experience" ON public.work_experience FOR SELECT USING (true);
CREATE POLICY "Users can manage their own work experience" ON public.work_experience FOR ALL USING (auth.uid() = user_id);

-- 9. Create RLS Policies for education
CREATE POLICY "Users can view all education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Users can manage their own education" ON public.education FOR ALL USING (auth.uid() = user_id);

-- 10. Create RLS Policies for achievements
CREATE POLICY "Users can view all achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Users can manage their own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- 11. Create RLS Policies for certifications
CREATE POLICY "Users can view all certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Users can manage their own certifications" ON public.certifications FOR ALL USING (auth.uid() = user_id);

-- 12. Create RLS Policies for skills
CREATE POLICY "Users can view all skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their own skills" ON public.skills FOR ALL USING (auth.uid() = user_id);

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON public.work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON public.education(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);

-- 14. Create function for updating timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. Create triggers for automatic timestamp updates
CREATE TRIGGER update_work_experience_updated_at
  BEFORE UPDATE ON public.work_experience
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON public.education
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
