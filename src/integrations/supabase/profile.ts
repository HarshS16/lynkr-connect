import { supabase } from './client';

// Types for profile sections
export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  current_position?: string | null;
  company?: string | null;
  location?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date_achieved?: string;
  organization?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  created_at: string;
  updated_at: string;
}

// Profile API functions
export const profileAPI = {
  // Get profile by user ID
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { url: publicUrl, profile: data as Profile };
  },

  // Delete avatar
  async deleteAvatar(userId: string, avatarUrl: string) {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `avatars/${fileName}`;

    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (deleteError) throw deleteError;

    // Update profile to remove avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }
};

// Work Experience API functions
export const workExperienceAPI = {
  // Get all work experience for a user
  async getWorkExperience(userId: string) {
    const { data, error } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as WorkExperience[];
  },

  // Create new work experience
  async createWorkExperience(workExp: Omit<WorkExperience, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('work_experience')
      .insert(workExp)
      .select()
      .single();

    if (error) throw error;
    return data as WorkExperience;
  },

  // Update work experience
  async updateWorkExperience(id: string, updates: Partial<WorkExperience>) {
    const { data, error } = await supabase
      .from('work_experience')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkExperience;
  },

  // Delete work experience
  async deleteWorkExperience(id: string) {
    const { error } = await supabase
      .from('work_experience')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Education API functions
export const educationAPI = {
  // Get all education for a user
  async getEducation(userId: string) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as Education[];
  },

  // Create new education
  async createEducation(education: Omit<Education, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('education')
      .insert(education)
      .select()
      .single();

    if (error) throw error;
    return data as Education;
  },

  // Update education
  async updateEducation(id: string, updates: Partial<Education>) {
    const { data, error } = await supabase
      .from('education')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Education;
  },

  // Delete education
  async deleteEducation(id: string) {
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Achievements API functions
export const achievementsAPI = {
  // Get all achievements for a user
  async getAchievements(userId: string) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('date_achieved', { ascending: false });

    if (error) throw error;
    return data as Achievement[];
  },

  // Create new achievement
  async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single();

    if (error) throw error;
    return data as Achievement;
  },

  // Update achievement
  async updateAchievement(id: string, updates: Partial<Achievement>) {
    const { data, error } = await supabase
      .from('achievements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Achievement;
  },

  // Delete achievement
  async deleteAchievement(id: string) {
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Certifications API functions
export const certificationsAPI = {
  // Get all certifications for a user
  async getCertifications(userId: string) {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data as Certification[];
  },

  // Create new certification
  async createCertification(certification: Omit<Certification, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('certifications')
      .insert(certification)
      .select()
      .single();

    if (error) throw error;
    return data as Certification;
  },

  // Update certification
  async updateCertification(id: string, updates: Partial<Certification>) {
    const { data, error } = await supabase
      .from('certifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Certification;
  },

  // Delete certification
  async deleteCertification(id: string) {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Skills API functions
export const skillsAPI = {
  // Get all skills for a user
  async getSkills(userId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Skill[];
  },

  // Create new skill
  async createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('skills')
      .insert(skill)
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  },

  // Update skill
  async updateSkill(id: string, updates: Partial<Skill>) {
    const { data, error } = await supabase
      .from('skills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  },

  // Delete skill
  async deleteSkill(id: string) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Bulk create skills
  async createSkills(skills: Omit<Skill, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('skills')
      .insert(skills)
      .select();

    if (error) throw error;
    return data as Skill[];
  },

  // Search skills by name (for autocomplete)
  async searchSkills(query: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('skills')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data.map(skill => skill.name);
  }
};

// Combined API for getting all profile data
export const profileDataAPI = {
  // Get complete profile data
  async getCompleteProfile(userId: string) {
    try {
      const [
        profile,
        workExperience,
        education,
        achievements,
        certifications,
        skills
      ] = await Promise.all([
        profileAPI.getProfile(userId),
        workExperienceAPI.getWorkExperience(userId),
        educationAPI.getEducation(userId),
        achievementsAPI.getAchievements(userId),
        certificationsAPI.getCertifications(userId),
        skillsAPI.getSkills(userId)
      ]);

      return {
        profile,
        workExperience,
        education,
        achievements,
        certifications,
        skills
      };
    } catch (error) {
      console.error('Error fetching complete profile:', error);
      throw error;
    }
  },

  // Get profile statistics
  async getProfileStats(userId: string) {
    try {
      const [
        workExpCount,
        educationCount,
        achievementsCount,
        certificationsCount,
        skillsCount
      ] = await Promise.all([
        supabase.from('work_experience').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('education').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('achievements').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('certifications').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('skills').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      return {
        workExperience: workExpCount.count || 0,
        education: educationCount.count || 0,
        achievements: achievementsCount.count || 0,
        certifications: certificationsCount.count || 0,
        skills: skillsCount.count || 0,
        total: (workExpCount.count || 0) + (educationCount.count || 0) + (achievementsCount.count || 0) + (certificationsCount.count || 0) + (skillsCount.count || 0)
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      throw error;
    }
  },

  // Check profile completeness
  async getProfileCompleteness(userId: string) {
    try {
      const stats = await this.getProfileStats(userId);
      const profile = await profileAPI.getProfile(userId);

      let completeness = 0;
      const maxScore = 100;

      // Basic profile info (40 points)
      if (profile.full_name) completeness += 10;
      if (profile.bio) completeness += 10;
      if (profile.avatar_url) completeness += 10;
      if (profile.current_position) completeness += 5;
      if (profile.company) completeness += 5;

      // Profile sections (60 points)
      if (stats.workExperience > 0) completeness += 15;
      if (stats.education > 0) completeness += 15;
      if (stats.skills > 0) completeness += 15;
      if (stats.achievements > 0) completeness += 8;
      if (stats.certifications > 0) completeness += 7;

      return {
        percentage: Math.min(completeness, maxScore),
        missingFields: {
          basicInfo: !profile.full_name || !profile.bio || !profile.avatar_url,
          workExperience: stats.workExperience === 0,
          education: stats.education === 0,
          skills: stats.skills === 0,
          achievements: stats.achievements === 0,
          certifications: stats.certifications === 0
        },
        stats
      };
    } catch (error) {
      console.error('Error calculating profile completeness:', error);
      throw error;
    }
  }
};
