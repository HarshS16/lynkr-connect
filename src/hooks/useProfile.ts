import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import {
  profileAPI,
  workExperienceAPI,
  educationAPI,
  achievementsAPI,
  certificationsAPI,
  skillsAPI,
  profileDataAPI,
  type Profile,
  type WorkExperience,
  type Education,
  type Achievement,
  type Certification,
  type Skill
} from '@/integrations/supabase/profile';

// Hook for managing profile data
export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const targetUserId = userId || user?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await profileAPI.getProfile(targetUserId);
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!targetUserId) return;

    try {
      const updatedProfile = await profileAPI.updateProfile(targetUserId, updates);
      setProfile(updatedProfile);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!targetUserId) return;

    try {
      const result = await profileAPI.uploadAvatar(targetUserId, file);
      setProfile(result.profile);
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.',
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteAvatar = async () => {
    if (!targetUserId || !profile?.avatar_url) return;

    try {
      const updatedProfile = await profileAPI.deleteAvatar(targetUserId, profile.avatar_url);
      setProfile(updatedProfile);
      toast({
        title: 'Avatar removed',
        description: 'Your profile picture has been removed.',
      });
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete avatar';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetUserId]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refetch: fetchProfile,
    isOwnProfile: user?.id === targetUserId
  };
};

// Hook for managing work experience
export const useWorkExperience = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const targetUserId = userId || user?.id;

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkExperience = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await workExperienceAPI.getWorkExperience(targetUserId);
      setWorkExperience(data);
    } catch (err: any) {
      // Handle case where table doesn't exist yet (404 error)
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        console.log('Work experience table not found, using empty array');
        setWorkExperience([]);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work experience';
        setError(errorMessage);
        console.error('Error fetching work experience:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createWorkExperience = async (workExp: Omit<WorkExperience, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newWorkExp = await workExperienceAPI.createWorkExperience(workExp);
      // Optimistically update the UI
      setWorkExperience(prev => [newWorkExp, ...prev]);
      toast({
        title: 'Work experience added',
        description: 'Your work experience has been added successfully.',
      });
      return newWorkExp;
    } catch (err: any) {
      // If table doesn't exist, show helpful message
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        toast({
          title: 'Database setup required',
          description: 'Please run the SQL migration to enable this feature.',
          variant: 'destructive',
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add work experience';
        toast({
          title: 'Add failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw err;
    }
  };

  const updateWorkExperience = async (id: string, updates: Partial<WorkExperience>) => {
    try {
      const updatedWorkExp = await workExperienceAPI.updateWorkExperience(id, updates);
      setWorkExperience(prev => prev.map(item => item.id === id ? updatedWorkExp : item));
      toast({
        title: 'Work experience updated',
        description: 'Your work experience has been updated successfully.',
      });
      return updatedWorkExp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update work experience';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteWorkExperience = async (id: string) => {
    try {
      await workExperienceAPI.deleteWorkExperience(id);
      setWorkExperience(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Work experience deleted',
        description: 'Your work experience has been deleted successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete work experience';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchWorkExperience();
  }, [targetUserId]);

  return {
    workExperience,
    loading,
    error,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    refetch: fetchWorkExperience,
    isOwnProfile: user?.id === targetUserId
  };
};

// Hook for managing education
export const useEducation = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const targetUserId = userId || user?.id;

  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEducation = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await educationAPI.getEducation(targetUserId);
      setEducation(data);
    } catch (err: any) {
      // Handle case where table doesn't exist yet (404 error)
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        console.log('Education table not found, using empty array');
        setEducation([]);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch education';
        setError(errorMessage);
        console.error('Error fetching education:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createEducation = async (edu: Omit<Education, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEducation = await educationAPI.createEducation(edu);
      // Optimistically update the UI
      setEducation(prev => [newEducation, ...prev]);
      toast({
        title: 'Education added',
        description: 'Your education has been added successfully.',
      });
      return newEducation;
    } catch (err: any) {
      // If table doesn't exist, show helpful message
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        toast({
          title: 'Database setup required',
          description: 'Please run the SQL migration to enable this feature.',
          variant: 'destructive',
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add education';
        toast({
          title: 'Add failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw err;
    }
  };

  const updateEducation = async (id: string, updates: Partial<Education>) => {
    try {
      const updatedEducation = await educationAPI.updateEducation(id, updates);
      setEducation(prev => prev.map(item => item.id === id ? updatedEducation : item));
      toast({
        title: 'Education updated',
        description: 'Your education has been updated successfully.',
      });
      return updatedEducation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update education';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteEducation = async (id: string) => {
    try {
      await educationAPI.deleteEducation(id);
      setEducation(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Education deleted',
        description: 'Your education has been deleted successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete education';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchEducation();
  }, [targetUserId]);

  return {
    education,
    loading,
    error,
    createEducation,
    updateEducation,
    deleteEducation,
    refetch: fetchEducation,
    isOwnProfile: user?.id === targetUserId
  };
};

// Hook for managing achievements
export const useAchievements = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const targetUserId = userId || user?.id;

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await achievementsAPI.getAchievements(targetUserId);
      setAchievements(data);
    } catch (err: any) {
      // Handle case where table doesn't exist yet (404 error)
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        console.log('Achievements table not found, using empty array');
        setAchievements([]);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch achievements';
        setError(errorMessage);
        console.error('Error fetching achievements:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createAchievement = async (achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newAchievement = await achievementsAPI.createAchievement(achievement);
      setAchievements(prev => [newAchievement, ...prev]);
      toast({
        title: 'Achievement added',
        description: 'Your achievement has been added successfully.',
      });
      return newAchievement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add achievement';
      toast({
        title: 'Add failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateAchievement = async (id: string, updates: Partial<Achievement>) => {
    try {
      const updatedAchievement = await achievementsAPI.updateAchievement(id, updates);
      setAchievements(prev => prev.map(item => item.id === id ? updatedAchievement : item));
      toast({
        title: 'Achievement updated',
        description: 'Your achievement has been updated successfully.',
      });
      return updatedAchievement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update achievement';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      await achievementsAPI.deleteAchievement(id);
      setAchievements(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Achievement deleted',
        description: 'Your achievement has been deleted successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete achievement';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [targetUserId]);

  return {
    achievements,
    loading,
    error,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    refetch: fetchAchievements,
    isOwnProfile: user?.id === targetUserId
  };
};

// Hook for managing certifications
export const useCertifications = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const targetUserId = userId || user?.id;

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertifications = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await certificationsAPI.getCertifications(targetUserId);
      setCertifications(data);
    } catch (err: any) {
      // Handle case where table doesn't exist yet (404 error)
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        console.log('Certifications table not found, using empty array');
        setCertifications([]);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch certifications';
        setError(errorMessage);
        console.error('Error fetching certifications:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createCertification = async (certification: Omit<Certification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCertification = await certificationsAPI.createCertification(certification);
      setCertifications(prev => [newCertification, ...prev]);
      toast({
        title: 'Certification added',
        description: 'Your certification has been added successfully.',
      });
      return newCertification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add certification';
      toast({
        title: 'Add failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateCertification = async (id: string, updates: Partial<Certification>) => {
    try {
      const updatedCertification = await certificationsAPI.updateCertification(id, updates);
      setCertifications(prev => prev.map(item => item.id === id ? updatedCertification : item));
      toast({
        title: 'Certification updated',
        description: 'Your certification has been updated successfully.',
      });
      return updatedCertification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update certification';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteCertification = async (id: string) => {
    try {
      await certificationsAPI.deleteCertification(id);
      setCertifications(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Certification deleted',
        description: 'Your certification has been deleted successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete certification';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [targetUserId]);

  return {
    certifications,
    loading,
    error,
    createCertification,
    updateCertification,
    deleteCertification,
    refetch: fetchCertifications,
    isOwnProfile: user?.id === targetUserId
  };
};

// Hook for managing skills
export const useSkills = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const targetUserId = userId || user?.id;

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await skillsAPI.getSkills(targetUserId);
      setSkills(data);
    } catch (err: any) {
      // Handle case where table doesn't exist yet (404 error)
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        console.log('Skills table not found, using empty array');
        setSkills([]);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch skills';
        setError(errorMessage);
        console.error('Error fetching skills:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createSkill = async (skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSkill = await skillsAPI.createSkill(skill);
      // Optimistically update the UI
      setSkills(prev => [...prev, newSkill].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Skill added',
        description: 'Your skill has been added successfully.',
      });
      return newSkill;
    } catch (err: any) {
      // If table doesn't exist, show helpful message
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        toast({
          title: 'Database setup required',
          description: 'Please run the SQL migration to enable this feature.',
          variant: 'destructive',
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add skill';
        toast({
          title: 'Add failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw err;
    }
  };

  const createSkills = async (skillsData: Omit<Skill, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const newSkills = await skillsAPI.createSkills(skillsData);
      // Optimistically update the UI
      setSkills(prev => [...prev, ...newSkills].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Skills added',
        description: `${newSkills.length} skills have been added successfully.`,
      });
      return newSkills;
    } catch (err: any) {
      // If table doesn't exist, show helpful message
      if (err?.code === 'PGRST116' || err?.message?.includes('404')) {
        toast({
          title: 'Database setup required',
          description: 'Please run the SQL migration to enable this feature.',
          variant: 'destructive',
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add skills';
        toast({
          title: 'Add failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw err;
    }
  };

  const updateSkill = async (id: string, updates: Partial<Skill>) => {
    try {
      const updatedSkill = await skillsAPI.updateSkill(id, updates);
      setSkills(prev => prev.map(item => item.id === id ? updatedSkill : item).sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Skill updated',
        description: 'Your skill has been updated successfully.',
      });
      return updatedSkill;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update skill';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      await skillsAPI.deleteSkill(id);
      setSkills(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Skill deleted',
        description: 'Your skill has been deleted successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete skill';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const searchSkills = async (query: string) => {
    try {
      return await skillsAPI.searchSkills(query);
    } catch (err) {
      console.error('Error searching skills:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [targetUserId]);

  return {
    skills,
    loading,
    error,
    createSkill,
    createSkills,
    updateSkill,
    deleteSkill,
    searchSkills,
    refetch: fetchSkills,
    isOwnProfile: user?.id === targetUserId
  };
};

// Hook for complete profile data
export const useCompleteProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompleteProfile = async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);

      const [completeData, statsData, completenessData] = await Promise.all([
        profileDataAPI.getCompleteProfile(targetUserId),
        profileDataAPI.getProfileStats(targetUserId),
        profileDataAPI.getProfileCompleteness(targetUserId)
      ]);

      setProfileData(completeData);
      setStats(statsData);
      setCompleteness(completenessData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile data';
      setError(errorMessage);
      console.error('Error fetching complete profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompleteProfile();
  }, [targetUserId]);

  return {
    profileData,
    stats,
    completeness,
    loading,
    error,
    refetch: fetchCompleteProfile,
    isOwnProfile: user?.id === targetUserId
  };
};
