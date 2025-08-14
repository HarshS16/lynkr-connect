import { supabase } from '@/integrations/supabase/client';

export async function runProfileMigration() {
  try {
    console.log('Running profile sections migration...');

    // Add new columns to profiles table
    const profileUpdates = `
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS current_position TEXT,
      ADD COLUMN IF NOT EXISTS company TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS website TEXT,
      ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
      ADD COLUMN IF NOT EXISTS github_url TEXT;
    `;

    // Create work_experience table
    const workExperienceTable = `
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
    `;

    // Create education table
    const educationTable = `
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
    `;

    // Create achievements table
    const achievementsTable = `
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
    `;

    // Create certifications table
    const certificationsTable = `
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
    `;

    // Create skills table
    const skillsTable = `
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
    `;

    // Execute the SQL commands
    const { error: profileError } = await supabase.rpc('exec_sql', { sql: profileUpdates });
    if (profileError) {
      console.error('Error updating profiles table:', profileError);
    } else {
      console.log('✓ Profiles table updated');
    }

    const { error: workError } = await supabase.rpc('exec_sql', { sql: workExperienceTable });
    if (workError) {
      console.error('Error creating work_experience table:', workError);
    } else {
      console.log('✓ Work experience table created');
    }

    const { error: eduError } = await supabase.rpc('exec_sql', { sql: educationTable });
    if (eduError) {
      console.error('Error creating education table:', eduError);
    } else {
      console.log('✓ Education table created');
    }

    const { error: achieveError } = await supabase.rpc('exec_sql', { sql: achievementsTable });
    if (achieveError) {
      console.error('Error creating achievements table:', achieveError);
    } else {
      console.log('✓ Achievements table created');
    }

    const { error: certError } = await supabase.rpc('exec_sql', { sql: certificationsTable });
    if (certError) {
      console.error('Error creating certifications table:', certError);
    } else {
      console.log('✓ Certifications table created');
    }

    const { error: skillsError } = await supabase.rpc('exec_sql', { sql: skillsTable });
    if (skillsError) {
      console.error('Error creating skills table:', skillsError);
    } else {
      console.log('✓ Skills table created');
    }

    console.log('Migration completed!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}
