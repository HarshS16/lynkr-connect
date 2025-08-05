import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { sendConnectionRequest } from '@/integrations/supabase/connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, Edit2, Save, X, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
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
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [userId]);

  useEffect(() => {
    if (!userId && user) {
      navigate(`/profile/${user.id}`, { replace: true });
    }
  }, [userId, user, navigate]);

  useEffect(() => {
    if (userId) {
      getConnections(userId).then(({ data }) => setConnections(data || []));
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditForm({ full_name: data.full_name, bio: data.bio || '' });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
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
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Avatar updated!',
        description: 'Your profile picture has been updated.',
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
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Avatar removed!',
        description: 'Your profile picture has been removed.',
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
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio
        })
        .eq('user_id', userId);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: editForm.full_name,
        bio: editForm.bio
      });
      setEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out"
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-primary">Lynkr</h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-foreground hover:text-primary">
                  Home
                </Link>
                <Link to={`/profile/${user?.id}`} className="text-foreground hover:text-primary">
                  My Profile
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to={`/profile/${user?.id}`}>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
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
                          <p className="text-sm text-gray-500 mt-2">
                            Member since {format(new Date(profile.created_at), 'MMM yyyy')}
                          </p>
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
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
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

      <div>
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => setConnectionsOpen(true)}
        >
          {connections.length} Connections
        </span>
        {connectionsOpen && (
          <Dialog open={connectionsOpen} onOpenChange={setConnectionsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connections</DialogTitle>
              </DialogHeader>
              <ul>
                {connections.map(conn => (
                  <li key={conn.id}>
                    {/* Show the other user's name, not the current user */}
                    {conn.requester_id === userId ? conn.addressee_id : conn.requester_id}
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isOwnProfile && (
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
      )}
    </div>
  );
}

export async function sendConnectionRequest(requesterId: string, addresseeId: string) {
  return supabase.from('connections').insert({ requester_id: requesterId, addressee_id: addresseeId });
}
