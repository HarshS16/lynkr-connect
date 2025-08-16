import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  useProfile,
  useWorkExperience,
  useEducation,
  useAchievements,
  useCertifications,
  useSkills
} from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkExperienceForm } from "@/components/profile/WorkExperienceForm";
import { EducationForm } from "@/components/profile/EducationForm";
import { SkillsForm } from "@/components/profile/SkillsForm";
import { AchievementForm } from "@/components/profile/AchievementForm";
import { CertificationForm } from "@/components/profile/CertificationForm";
import { cityOptions } from "@/data/cities";
import { cn } from "@/lib/utils";

import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  LogOut,
  User,
  Bell,
  Plus,
  MapPin,
  Calendar,
  Building,
  GraduationCap,
  Award,
  FileText,
  Briefcase,
  ExternalLink,
  Github,
  Linkedin,
  Globe,

  Users,
  Star,
  Trash2,
  Search,
  Check,
  ChevronsUpDown
} from "lucide-react";

interface Profile {
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
}

interface WorkExperience {
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
}

interface Education {
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
}

interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date_achieved?: string;
  organization?: string;
  url?: string;
  created_at: string;
}

interface Certification {
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
}

interface Skill {
  id: string;
  user_id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  created_at: string;
}

interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  requester: {
    full_name: string;
    avatar_url: string | null;
    user_id: string;
  };
  addressee: {
    full_name: string;
    avatar_url: string | null;
    user_id: string;
  };
}

interface Post {
  id: string;
  content: string;
  created_at: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ProfileNew() {
  const { userId } = useParams<{ userId: string }>();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use custom hooks for profile data
  const { profile, loading: profileLoading, updateProfile, uploadAvatar, deleteAvatar, isOwnProfile } = useProfile(userId);

  // Use hooks with fallback for new tables that might not exist yet
  const { workExperience = [], loading: workLoading, refetch: refetchWorkExperience } = useWorkExperience(userId);
  const { education = [], loading: eduLoading, refetch: refetchEducation } = useEducation(userId);
  const { achievements = [], loading: achieveLoading, refetch: refetchAchievements } = useAchievements(userId);
  const { certifications = [], loading: certLoading, refetch: refetchCertifications } = useCertifications(userId);
  const { skills = [], loading: skillsLoading, refetch: refetchSkills } = useSkills(userId);

  // Connections state
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [showConnectionsDialog, setShowConnectionsDialog] = useState(false);

  // Fetch connections
  const fetchConnections = async () => {
    if (!userId) return;

    try {
      setConnectionsLoading(true);

      // Get basic connections data
      const { data: connectionsData, error: connectionsError } = await supabase
        .from("connections")
        .select("id, requester_id, addressee_id, status, created_at")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (connectionsError) {
        console.error("Error fetching connections:", connectionsError);
        setConnections([]);
        return;
      }

      if (!connectionsData || connectionsData.length === 0) {
        setConnections([]);
        return;
      }

      // Fetch profile data for each connection
      const connectionsWithProfiles = await Promise.all(
        connectionsData.map(async (conn) => {
          const otherUserId = conn.requester_id === userId ? conn.addressee_id : conn.requester_id;

          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('user_id, full_name, avatar_url')
              .eq('user_id', otherUserId)
              .single();

            return {
              ...conn,
              otherUser: profileData || {
                user_id: otherUserId,
                full_name: 'Unknown User',
                avatar_url: null
              }
            };
          } catch (error) {
            return {
              ...conn,
              otherUser: {
                user_id: otherUserId,
                full_name: 'Unknown User',
                avatar_url: null
              }
            };
          }
        })
      );

      setConnections(connectionsWithProfiles);
    } catch (error) {
      console.error("Error in fetchConnections:", error);
      setConnections([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  // UI state
  const [editing, setEditing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeSection, setActiveSection] = useState('about');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [isOtherLocation, setIsOtherLocation] = useState(false);

  // Form states
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [editingWorkExp, setEditingWorkExp] = useState<WorkExperience | undefined>();
  const [editingEducation, setEditingEducation] = useState<Education | undefined>();
  const [editingAchievement, setEditingAchievement] = useState<Achievement | undefined>();
  const [editingCertification, setEditingCertification] = useState<Certification | undefined>();

  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    current_position: "",
    company: "",
    location: "",
    website: "",
    linkedin_url: "",
    github_url: ""
  });

  const loading = profileLoading;

  // Redirect to own profile if no userId provided
  useEffect(() => {
    if (!userId && user) {
      navigate(`/profile/${user.id}`, { replace: true });
    }
  }, [userId, user, navigate]);

  // Fetch connections when userId changes
  useEffect(() => {
    if (userId) {
      fetchConnections();
    }
  }, [userId]);

  // Update edit form when profile changes
  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name,
        bio: profile.bio || "",
        current_position: profile.current_position || "",
        company: profile.company || "",
        location: profile.location || "",
        website: profile.website || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || ""
      });
    }
  }, [profile]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!locationSearch) {
      // Show popular cities first, then others
      const popularCities = cityOptions.filter(city =>
        city.includes('Mumbai') || city.includes('Delhi') || city.includes('Bengaluru') ||
        city.includes('Chennai') || city.includes('Kolkata') || city.includes('Hyderabad') ||
        city.includes('Pune') || city.includes('Ahmedabad') || city.includes('Jaipur') ||
        city.includes('Surat') || city.includes('Lucknow') || city.includes('Kanpur')
      );
      const otherCities = cityOptions.filter(city =>
        !popularCities.includes(city)
      ).slice(0, 50); // Show first 50 of others
      return [...popularCities, ...otherCities];
    }

    // When searching, show all matching results
    return cityOptions.filter(city =>
      city.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [locationSearch]);

  // Check if current location is in the list or is custom
  useMemo(() => {
    if (editForm.location && !cityOptions.includes(editForm.location)) {
      setIsOtherLocation(true);
    }
  }, [editForm.location]);

  // Handler functions
  const handleEditWorkExperience = (workExp: WorkExperience) => {
    setEditingWorkExp(workExp);
    setShowWorkForm(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEditingEducation(edu);
    setShowEducationForm(true);
  };

  const handleCloseWorkForm = () => {
    setShowWorkForm(false);
    setEditingWorkExp(undefined);
  };

  const handleCloseEducationForm = () => {
    setShowEducationForm(false);
    setEditingEducation(undefined);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowAchievementForm(true);
  };

  const handleCloseAchievementForm = () => {
    setShowAchievementForm(false);
    setEditingAchievement(undefined);
  };

  const handleEditCertification = (certification: Certification) => {
    setEditingCertification(certification);
    setShowCertificationForm(true);
  };

  const handleCloseCertificationForm = () => {
    setShowCertificationForm(false);
    setEditingCertification(undefined);
  };

  // Handler functions
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      toast({
        title: "Signed out successfully",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !isOwnProfile) return;

    setSaving(true);
    try {
      await updateProfile(editForm);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isOwnProfile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      await uploadAvatar(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Add scroll wheel support for location dropdown
  useEffect(() => {
    const handleWheelEvent = (e: WheelEvent) => {
      const target = e.target as HTMLElement;

      // Check if we're inside a location dropdown scroll container
      const scrollContainer = target.closest('.location-dropdown-scroll-container');

      if (scrollContainer) {
        e.preventDefault();
        e.stopPropagation();

        // Apply smooth scrolling
        const scrollAmount = e.deltaY * 0.8;
        scrollContainer.scrollTop += scrollAmount;
      }
    };

    // Add event listener to document to catch all wheel events
    document.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  const getSkillLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-gray-500/90';
      case 'intermediate': return 'bg-blue-500/90';
      case 'advanced': return 'bg-green-500/90';
      case 'expert': return 'bg-purple-500/90';
      default: return 'bg-gray-500/90';
    }
  };

  const getSkillLevelLabel = (level?: string) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      case 'expert': return 'Expert';
      default: return 'Not specified';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        <ThreeBackground />
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-blue-100/30 -z-5"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-blue-900 mt-4 text-center">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Background Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-blue-100/30 -z-5"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg z-20 sticky top-0"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Back Button */}
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 text-blue-900 hover:bg-white/30 rounded-lg transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
              </Link>

              <motion.h1
                whileHover={{ scale: 1.05 }}
                className="text-3xl font-bold text-blue-900 tracking-tight drop-shadow-sm cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                Lynkr
              </motion.h1>

              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-80 border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-blue-900 hover:bg-white/30"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </motion.div>

              {/* Theme Toggle */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-md">
                  <ThemeToggle />
                </div>
              </motion.div>

              {/* Profile Link */}
              {user && (
                <Link to={`/profile/${user.id}`}>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-blue-900 hover:bg-white/30"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </motion.div>
                </Link>
              )}

              {/* Sign Out */}
              {isOwnProfile && (
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-blue-900 hover:bg-white/30"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!loading && profile ? (
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Avatar and Basic Info */}
                    <div className="flex flex-col items-center md:items-start">
                      <Avatar className="h-32 w-32 border-4 border-white/30 shadow-lg mb-4">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-600/90 text-white text-4xl font-bold">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {isOwnProfile && (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            disabled={uploadingPhoto}
                            className="border-white/30 bg-white/20 backdrop-blur-sm text-blue-900 hover:bg-white/30"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            {uploadingPhoto ? 'Uploading...' : 'Edit Photo'}
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Profile Information */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-blue-900 mb-2">
                            {profile.full_name}
                          </h1>
                          {profile.current_position && (
                            <p className="text-xl text-blue-700 font-medium mb-1">
                              {profile.current_position}
                              {profile.company && ` at ${profile.company}`}
                            </p>
                          )}
                          {profile.location && (
                            <p className="text-blue-700/70 flex items-center gap-1 mb-3">
                              <MapPin className="h-4 w-4" />
                              {profile.location}
                            </p>
                          )}
                        </div>

                        {isOwnProfile && (
                          <Button
                            onClick={() => setEditing(!editing)}
                            variant="outline"
                            size="sm"
                            className="border-white/30 bg-white/20 backdrop-blur-sm text-blue-900 hover:bg-white/30"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>

                      {profile.bio && (
                        <p className="text-blue-700/80 mb-4 leading-relaxed">
                          {profile.bio}
                        </p>
                      )}

                      {/* Portfolio/Website Link - Subtle */}
                      {profile.website && (
                        <div className="mb-3">
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                            {profile.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      {/* Social Links */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {profile.website && (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-sm hover:bg-blue-200/50 transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-sm hover:bg-blue-200/50 transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                        {profile.github_url && (
                          <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-sm hover:bg-blue-200/50 transition-colors"
                          >
                            <Github className="h-4 w-4" />
                            GitHub
                          </a>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-sm text-blue-700/70">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConnectionsDialog(true)}
                          className="flex items-center gap-1 text-blue-700/70 hover:text-blue-600 hover:bg-blue-50 p-0 h-auto font-normal"
                        >
                          <Users className="h-4 w-4" />
                          {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
                        </Button>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'about', label: 'About', icon: User },
                    { id: 'experience', label: 'Experience', icon: Briefcase },
                    { id: 'education', label: 'Education', icon: GraduationCap },
                    { id: 'achievements', label: 'Achievements', icon: Award },
                    { id: 'certifications', label: 'Certifications', icon: FileText },
                    { id: 'skills', label: 'Skills', icon: Star }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                          activeSection === tab.id
                            ? 'bg-blue-600/90 text-white shadow-lg'
                            : 'text-blue-900/70 hover:text-blue-900 hover:bg-white/20'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
              {activeSection === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        About
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editing ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="full_name" className="text-blue-900">Full Name</Label>
                            <Input
                              id="full_name"
                              value={editForm.full_name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bio" className="text-blue-900">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editForm.bio}
                              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="current_position" className="text-blue-900">Current Position</Label>
                            <Input
                              id="current_position"
                              value={editForm.current_position}
                              onChange={(e) => setEditForm(prev => ({ ...prev, current_position: e.target.value }))}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                            />
                          </div>
                          <div>
                            <Label htmlFor="company" className="text-blue-900">Company</Label>
                            <Input
                              id="company"
                              value={editForm.company}
                              onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                            />
                          </div>
                          <div>
                            <Label htmlFor="location" className="text-blue-900">Location</Label>
                            {!isOtherLocation ? (
                              <div className="space-y-2">
                                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={locationOpen}
                                      className="w-full justify-between border-white/30 bg-white/30 backdrop-blur-sm text-blue-900 hover:bg-white/40"
                                    >
                                      {editForm.location || "Select location..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput
                                        placeholder="Search cities..."
                                        value={locationSearch}
                                        onValueChange={setLocationSearch}
                                      />
                                      <CommandEmpty>No city found.</CommandEmpty>
                                      <CommandGroup className="max-h-64 overflow-auto location-dropdown-scroll-container">
                                        {filteredCities.map((city) => (
                                          <CommandItem
                                            key={city}
                                            value={city}
                                            onSelect={(currentValue) => {
                                              setEditForm(prev => ({ ...prev, location: currentValue }));
                                              setLocationOpen(false);
                                              setLocationSearch('');
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                editForm.location === city ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {city}
                                          </CommandItem>
                                        ))}
                                        <CommandItem
                                          value="other"
                                          onSelect={() => {
                                            setIsOtherLocation(true);
                                            setEditForm(prev => ({ ...prev, location: '' }));
                                            setLocationOpen(false);
                                            setLocationSearch('');
                                          }}
                                          className="border-t border-gray-200 font-medium text-blue-600"
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Other (Enter custom location)
                                        </CommandItem>
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsOtherLocation(true)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  Can't find your city? Enter manually
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Input
                                  id="location"
                                  value={editForm.location}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                  placeholder="Enter city name"
                                  className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setIsOtherLocation(false);
                                    setEditForm(prev => ({ ...prev, location: '' }));
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  Choose from list instead
                                </Button>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="website" className="text-blue-900">
                              Website/Portfolio URL
                              <span className="text-blue-600 text-sm font-normal ml-2">(Showcase your work)</span>
                            </Label>
                            <Input
                              id="website"
                              type="url"
                              value={editForm.website}
                              onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://yourportfolio.com"
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkedin_url" className="text-blue-900">LinkedIn URL</Label>
                            <Input
                              id="linkedin_url"
                              value={editForm.linkedin_url}
                              onChange={(e) => setEditForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                            />
                          </div>
                          <div>
                            <Label htmlFor="github_url" className="text-blue-900">GitHub URL</Label>
                            <Input
                              id="github_url"
                              value={editForm.github_url}
                              onChange={(e) => setEditForm(prev => ({ ...prev, github_url: e.target.value }))}
                              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveProfile}
                              disabled={saving}
                              className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              onClick={() => setEditing(false)}
                              variant="outline"
                              className="border-white/30 bg-white/20 backdrop-blur-sm text-blue-900 hover:bg-white/30"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Bio</h3>
                            <p className="text-blue-700/80">
                              {profile.bio || 'No bio available'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Contact Information</h3>
                            <div className="space-y-2">
                              {profile.current_position && (
                                <p className="text-blue-700/80 flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" />
                                  {profile.current_position}
                                  {profile.company && ` at ${profile.company}`}
                                </p>
                              )}
                              {profile.location && (
                                <p className="text-blue-700/80 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {profile.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'experience' && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Work Experience
                        </CardTitle>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            onClick={() => setShowWorkForm(true)}
                            className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Experience
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {workExperience.length > 0 ? (
                        <div className="space-y-6">
                          {workExperience.map((exp) => (
                            <motion.div
                              key={exp.id}
                              whileHover={{ x: 5 }}
                              className="border-l-2 border-blue-300/50 pl-6 relative"
                            >
                              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-blue-900 text-lg">{exp.title}</h3>
                                  <p className="text-blue-700 font-medium flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    {exp.company}
                                    {exp.location && ` • ${exp.location}`}
                                  </p>
                                  <p className="text-blue-700/70 text-sm flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(exp.start_date), 'MMM yyyy')} -
                                    {exp.is_current ? ' Present' : (exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : ' Present')}
                                  </p>
                                  {exp.description && (
                                    <p className="text-blue-700/80 mt-3 leading-relaxed">
                                      {exp.description}
                                    </p>
                                  )}
                                </div>
                                {isOwnProfile && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditWorkExperience(exp)}
                                      className="text-blue-600 hover:bg-blue-50/50"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:bg-red-50/50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="h-12 w-12 text-blue-600/50 mx-auto mb-4" />
                          <p className="text-blue-700/70">No work experience added yet</p>
                          {isOwnProfile && (
                            <Button
                              onClick={() => setShowWorkForm(true)}
                              className="mt-4 bg-blue-600/90 hover:bg-blue-700/90 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Experience
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'education' && (
                <motion.div
                  key="education"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          Education
                        </CardTitle>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            onClick={() => setShowEducationForm(true)}
                            className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {education.length > 0 ? (
                        <div className="space-y-6">
                          {education.map((edu) => (
                            <motion.div
                              key={edu.id}
                              whileHover={{ x: 5 }}
                              className="border-l-2 border-green-300/50 pl-6 relative"
                            >
                              <div className="absolute -left-2 top-0 w-4 h-4 bg-green-600 rounded-full border-2 border-white"></div>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-blue-900 text-lg">{edu.degree}</h3>
                                  {edu.field_of_study && (
                                    <p className="text-blue-700 font-medium">{edu.field_of_study}</p>
                                  )}
                                  <p className="text-blue-700 font-medium flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    {edu.institution}
                                  </p>
                                  <p className="text-blue-700/70 text-sm flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(edu.start_date), 'MMM yyyy')} -
                                    {edu.is_current ? ' Present' : (edu.end_date ? format(new Date(edu.end_date), 'MMM yyyy') : ' Present')}
                                  </p>
                                  {edu.grade && (
                                    <p className="text-blue-700/80 mt-2">
                                      <span className="font-medium">Grade:</span> {edu.grade}
                                    </p>
                                  )}
                                  {edu.description && (
                                    <p className="text-blue-700/80 mt-3 leading-relaxed">
                                      {edu.description}
                                    </p>
                                  )}
                                </div>
                                {isOwnProfile && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditEducation(edu)}
                                      className="text-blue-600 hover:bg-blue-50/50"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:bg-red-50/50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <GraduationCap className="h-12 w-12 text-blue-600/50 mx-auto mb-4" />
                          <p className="text-blue-700/70">No education added yet</p>
                          {isOwnProfile && (
                            <Button
                              onClick={() => setShowEducationForm(true)}
                              className="mt-4 bg-blue-600/90 hover:bg-blue-700/90 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your Education
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Achievements
                        </CardTitle>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            onClick={() => setShowAchievementForm(true)}
                            className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Achievement
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {achievements.map((achievement) => (
                            <motion.div
                              key={achievement.id}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-blue-900">{achievement.title}</h3>
                                {isOwnProfile && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditAchievement(achievement)}
                                      className="text-blue-600 hover:bg-blue-50/50 h-6 w-6 p-0"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:bg-red-50/50 h-6 w-6 p-0"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              {achievement.organization && (
                                <p className="text-blue-700 text-sm font-medium mb-1">
                                  {achievement.organization}
                                </p>
                              )}
                              {achievement.date_achieved && (
                                <p className="text-blue-700/70 text-sm mb-2">
                                  {format(new Date(achievement.date_achieved), 'MMM yyyy')}
                                </p>
                              )}
                              {achievement.description && (
                                <p className="text-blue-700/80 text-sm">
                                  {achievement.description}
                                </p>
                              )}
                              {achievement.url && (
                                <a
                                  href={achievement.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline"
                                >
                                  View Certificate
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Award className="h-12 w-12 text-blue-600/50 mx-auto mb-4" />
                          <p className="text-blue-700/70">No achievements added yet</p>
                          {isOwnProfile && (
                            <Button
                              onClick={() => setShowAchievementForm(true)}
                              className="mt-4 bg-blue-600/90 hover:bg-blue-700/90 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Achievement
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'certifications' && (
                <motion.div
                  key="certifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Certifications
                        </CardTitle>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            onClick={() => setShowCertificationForm(true)}
                            className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {certifications.length > 0 ? (
                        <div className="space-y-4">
                          {certifications.map((cert) => (
                            <motion.div
                              key={cert.id}
                              whileHover={{ x: 5 }}
                              className="p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-blue-900">{cert.name}</h3>
                                  <p className="text-blue-700 font-medium">{cert.issuing_organization}</p>
                                  <p className="text-blue-700/70 text-sm">
                                    Issued {format(new Date(cert.issue_date), 'MMM yyyy')}
                                    {cert.expiration_date && (
                                      <span> • Expires {format(new Date(cert.expiration_date), 'MMM yyyy')}</span>
                                    )}
                                  </p>
                                  {cert.credential_id && (
                                    <p className="text-blue-700/70 text-sm mt-1">
                                      Credential ID: {cert.credential_id}
                                    </p>
                                  )}
                                  {cert.description && (
                                    <p className="text-blue-700/80 text-sm mt-2">
                                      {cert.description}
                                    </p>
                                  )}
                                  {cert.credential_url && (
                                    <a
                                      href={cert.credential_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline"
                                    >
                                      View Credential
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                                {isOwnProfile && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditCertification(cert)}
                                      className="text-blue-600 hover:bg-blue-50/50"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:bg-red-50/50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-blue-600/50 mx-auto mb-4" />
                          <p className="text-blue-700/70">No certifications added yet</p>
                          {isOwnProfile && (
                            <Button
                              onClick={() => setShowCertificationForm(true)}
                              className="mt-4 bg-blue-600/90 hover:bg-blue-700/90 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Certification
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Skills
                        </CardTitle>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            onClick={() => setShowSkillsForm(true)}
                            className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Skill
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {skills.map((skill) => (
                            <motion.div
                              key={skill.id}
                              whileHover={{ scale: 1.05 }}
                              className="group relative"
                            >
                              <div className={`px-4 py-2 rounded-full text-white text-sm font-medium ${getSkillLevelColor(skill.level)} flex items-center gap-2`}>
                                <span>{skill.name}</span>
                                {skill.level && (
                                  <span className="text-xs opacity-80">
                                    {getSkillLevelLabel(skill.level)}
                                  </span>
                                )}
                                {skill.years_of_experience && (
                                  <span className="text-xs opacity-80">
                                    ({skill.years_of_experience}y)
                                  </span>
                                )}
                                {isOwnProfile && (
                                  <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 text-blue-600/50 mx-auto mb-4" />
                          <p className="text-blue-700/70">No skills added yet</p>
                          {isOwnProfile && (
                            <Button
                              onClick={() => setShowSkillsForm(true)}
                              className="mt-4 bg-blue-600/90 hover:bg-blue-700/90 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your Skills
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
              <User className="h-16 w-16 text-blue-600/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Profile Not Found</h3>
              <p className="text-blue-700/70">
                The profile you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/dashboard">
                <Button className="mt-4 bg-blue-600/90 hover:bg-blue-700/90 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Form Dialogs */}
      {userId && (
        <>
          <WorkExperienceForm
            isOpen={showWorkForm}
            onClose={handleCloseWorkForm}
            workExperience={editingWorkExp}
            userId={userId}
            onSuccess={refetchWorkExperience}
          />
          <EducationForm
            isOpen={showEducationForm}
            onClose={handleCloseEducationForm}
            education={editingEducation}
            userId={userId}
            onSuccess={refetchEducation}
          />
          <SkillsForm
            isOpen={showSkillsForm}
            onClose={() => setShowSkillsForm(false)}
            userId={userId}
            onSuccess={refetchSkills}
          />
          <AchievementForm
            isOpen={showAchievementForm}
            onClose={handleCloseAchievementForm}
            achievement={editingAchievement}
            userId={userId}
            onSuccess={refetchAchievements}
          />
          <CertificationForm
            isOpen={showCertificationForm}
            onClose={handleCloseCertificationForm}
            certification={editingCertification}
            userId={userId}
            onSuccess={refetchCertifications}
          />
        </>
      )}

      {/* Connections Dialog */}
      <Dialog open={showConnectionsDialog} onOpenChange={setShowConnectionsDialog}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold text-lg">Connections</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {connectionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-blue-400">Loading connections...</div>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No connections found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {connections.map((conn) => (
                  <motion.div
                    key={conn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-700/30"
                    onClick={() => {
                      navigate(`/profile/${conn.otherUser?.user_id}`);
                      setShowConnectionsDialog(false);
                    }}
                  >
                    <Avatar className="h-10 w-10 border-2 border-gray-600/50">
                      <AvatarImage src={conn.otherUser?.avatar_url || undefined} />
                      <AvatarFallback className="bg-blue-600 text-white font-medium">
                        {conn.otherUser?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-white hover:text-blue-400 transition-colors">
                        {conn.otherUser?.full_name || "Unknown User"}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
