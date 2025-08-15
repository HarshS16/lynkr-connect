import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { sendConnectionRequest, getConnections } from "@/integrations/supabase/connections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ThreeBackground } from "@/components/ThreeBackground";
import { LikeButton } from "@/components/ui/LikeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Certificate,
  Briefcase,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Users,
  Star,
  Trash2,
  Search
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

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user, signOut, updateAvatar, deleteAvatar } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    created_at: string;
    read: boolean;
  }>>([]);
  const abortControllers = useRef<AbortController[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
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
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeSection, setActiveSection] = useState('about');

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setNotificationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, message, created_at, read')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? {...n, read: true} : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    // Cleanup any pending requests if component unmounts
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current = [];
    };
  }, []);

  useEffect(() => {
    if (userId) {
      // Cancel any pending requests
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current = [];

      const controllers = Array.from({ length: 8 }, () => new AbortController());
      abortControllers.current.push(...controllers);

      fetchProfile({ signal: controllers[0].signal });
      fetchUserPosts({ signal: controllers[1].signal });
      fetchConnections({ signal: controllers[2].signal });
      fetchWorkExperience({ signal: controllers[3].signal });
      fetchEducation({ signal: controllers[4].signal });
      fetchAchievements({ signal: controllers[5].signal });
      fetchCertifications({ signal: controllers[6].signal });
      fetchSkills({ signal: controllers[7].signal });
    }
  }, [userId, user?.id]);

  useEffect(() => {
    if (!userId && user) {
      navigate(`/profile/${user.id}`, { replace: true });
    }
  }, [userId, user, navigate]);

  const fetchConnections = async (options?: { signal?: AbortSignal }) => {
    const { data, error } = await supabase
      .from("connections")
      .select(`
        id,
        requester_id,
        addressee_id,
        status,
        created_at,
        requester:profiles!requester_id(full_name, avatar_url, user_id, current_position, company),
        addressee:profiles!addressee_id(full_name, avatar_url, user_id, current_position, company)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted')
      .abortSignal(options?.signal);

    if (error) {
      console.error("Error fetching connections:", error);
    } else {
      setConnections(data || []);
    }
  };

  const fetchProfile = async (options: { signal?: AbortSignal } = {}) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(options.signal)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditForm({
        full_name: data.full_name,
        bio: data.bio || "",
        current_position: data.current_position || "",
        company: data.company || "",
        location: data.location || "",
        website: data.website || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (options: { signal?: AbortSignal } = {}) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", userId)
        .abortSignal(options.signal)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchWorkExperience = async (options: { signal?: AbortSignal } = {}) => {
    try {
      const { data, error } = await supabase
        .from("work_experience")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(options.signal)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setWorkExperience(data || []);
    } catch (error) {
      console.error("Error fetching work experience:", error);
    }
  };

  const fetchEducation = async (options: { signal?: AbortSignal } = {}) => {
    try {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(options.signal)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (error) {
      console.error("Error fetching education:", error);
    }
  };

  const fetchAchievements = async (options: { signal?: AbortSignal } = {}) => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(options.signal)
        .order("date_achieved", { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const fetchCertifications = async (options: { signal?: AbortSignal } = {}) => {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(options.signal)
        .order("issue_date", { ascending: false });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error) {
      console.error("Error fetching certifications:", error);
    }
  };

  const fetchSkills = async (options: { signal?: AbortSignal } = {}) => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(options.signal)
        .order("name", { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    const { error, url } = await updateAvatar(avatarFile);
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated.",
      });
      setAvatarDialogOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      fetchProfile(); // Refresh profile data
    }
    setAvatarLoading(false);
  };

  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    const { error } = await deleteAvatar();
    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Avatar removed!",
        description: "Your profile picture has been removed.",
      });
      fetchProfile(); // Refresh profile data
    }
    setAvatarLoading(false);
  };

  const removeAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSaveProfile = async () => {
    if (!profile || !isOwnProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
        })
        .eq("user_id", userId);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: editForm.full_name,
        bio: editForm.bio,
      });
      setEditing(false);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Post deleted" });
    }
  };

  const acceptedConnections = connections.filter((c) => c.status === "accepted");
  
  // Check if a connection request is pending or accepted
  const hasConnection = connections.some(
    (conn) =>
      (conn.requester_id === user?.id && conn.addressee_id === userId) ||
      (conn.requester_id === userId && conn.addressee_id === user?.id)
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-primary">Lynkr</h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="hover:text-primary">
                  Home
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle button */}
              <ThemeToggle />
              {/* Notification bell and dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNotifOpen((o) => {
                      if (!o) fetchNotifications();
                      return !o;
                    });
                  }}
                >
                  <Bell className="h-4 w-4" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                    <div className="p-4 font-semibold border-b">Notifications</div>
                    {notificationsLoading ? (
                      <div className="p-4 text-sm text-gray-500">Loading...</div>
                    ) : notifications.length > 0 ? (
                      <ul>
                        {notifications.map((notif) => (
                          <li
                            key={notif.id}
                            className={`p-4 border-b last:border-b-0 text-sm cursor-pointer ${notif.read ? "text-gray-500" : "font-semibold"}`}
                            onClick={() => markNotificationAsRead(notif.id)}
                          >
                            {notif.message}
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-sm text-gray-500">No new notifications</div>
                    )}
                  </div>
                )}
              </div>
              {user && (
                <Link to={`/profile/${user.id}`}>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          {loading ? (
            <div className="text-center py-8">Loading profile...</div>
          ) : profile ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Profile</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(!editing)}
                        >
                          {editing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-2xl">
                            {profile.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                            onClick={() => setAvatarDialogOpen(true)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {editing ? (
                        <div className="w-full space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                              id="edit-name"
                              value={editForm.full_name}
                              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-bio">Bio</Label>
                            <Textarea
                              id="edit-bio"
                              value={editForm.bio}
                              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <h2 className="text-xl font-semibold">{profile.full_name}</h2>
                          {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
                          {/* Connections count and dialog trigger */}
                          <div className="mt-2">
                            <span
                              className="cursor-pointer text-blue-600 hover:underline font-medium"
                              onClick={() => setConnectionsOpen(true)}
                            >
                              {acceptedConnections.length} Connections
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Member since {format(new Date(profile.created_at), 'MMM yyyy')}
                          </p>
                          {/* Connection Request Button */}
                          {!isOwnProfile && !hasConnection && (
                            <div className="mt-4">
                              <Button
                                onClick={async () => {
                                  if (!user?.id || !userId) return;
                                  const { error } = await sendConnectionRequest(user.id, userId);
                                  if (error) {
                                    toast({ title: "Already sent!", description: error.message, variant: "destructive" });
                                  } else {
                                    toast({ title: "Request sent!" });
                                  }
                                }}
                              >
                                Connect
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Posts */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {posts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No posts yet.</p>
                        {isOwnProfile && (
                          <Link to="/dashboard">
                            <Button className="mt-4">Create your first post</Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      posts.map((post) => (
                        <Card key={post.id} className="hover:shadow-md transition-shadow mb-4">
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-primary">
                                  {profile.full_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap">
                                {post.content}
                              </p>
                              <div className="mt-4">
                                <LikeButton
                                  postId={post.id}
                                  userId={user?.id || ''}
                                />
                              </div>
                              {/* Delete button for own posts */}
                              {isOwnProfile && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
              <p className="text-muted-foreground mb-4">
                This user profile doesn't exist or has been removed.
              </p>
              <Link to="/dashboard">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Avatar Edit Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture or remove the current one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {profile?.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB. JPG, PNG, GIF accepted.
                </p>
              </div>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeAvatarPreview}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {avatarFile && (
                <Button onClick={handleUpdateAvatar} disabled={avatarLoading} className="flex-1">
                  {avatarLoading ? 'Updating...' : 'Update Avatar'}
                </Button>
              )}
              {profile?.avatar_url && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteAvatar}
                  disabled={avatarLoading}
                  className="flex-1"
                >
                  {avatarLoading ? 'Removing...' : 'Remove Avatar'}
                </Button>
              )}
              <Button variant="outline" onClick={() => setAvatarDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Connections Dialog */}
      <Dialog open={connectionsOpen} onOpenChange={setConnectionsOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold text-lg">Connections</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {acceptedConnections.length > 0 ? (
              <div className="space-y-2">
                {acceptedConnections.map((conn) => {
                  const otherUser = conn.requester_id === userId ? conn.addressee : conn.requester;
                  return (
                    <motion.div
                      key={conn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-700/30"
                      onClick={() => {
                        navigate(`/profile/${otherUser?.user_id}`);
                        setConnectionsOpen(false);
                      }}
                    >
                      <Avatar className="h-10 w-10 border-2 border-gray-600/50">
                        <AvatarImage src={otherUser?.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white font-medium">
                          {otherUser?.full_name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-white hover:text-blue-400 transition-colors">
                          {otherUser?.full_name || "Unknown User"}
                        </h4>
                        {otherUser?.current_position && (
                          <p className="text-sm text-gray-400">
                            {otherUser.current_position}
                            {otherUser?.company && ` at ${otherUser.company}`}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No connections found.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}