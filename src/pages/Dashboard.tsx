import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPendingRequests, respondToRequest } from '@/integrations/supabase/connections';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LikeButton } from '@/components/ui/LikeButton';

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    user_id: string;
  };
}

interface PendingRequest {
  id: string;
  requester_id: string;
  created_at?: string;
  profiles?: {
    full_name: string;
  };
}

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    created_at: string;
    read: boolean;
  }>[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (user?.id) {
      getPendingRequests(user.id).then(({ data }) => setPendingRequests(data || []));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('notifications')
        .select('id, message, created_at, read')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setNotifications(data || []));
    }
  }, [user?.id]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          profiles:profiles!posts_author_id_fkey (
            full_name,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) {
        throw new Error("User session not found. Please sign in again.");
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPost.trim(),
          author_id: sessionUser.id,
        });

      if (error) throw error;

      setNewPost('');
      toast({
        title: "Success",
        description: "Your post has been shared!"
      });

      fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out"
    });
  };

  const handleAccept = async (connectionId: string) => {
    await respondToRequest(connectionId, 'accepted');
    setPendingRequests((prev) => prev.filter((req) => req.id !== connectionId));
    toast({ title: "Connection accepted!" });
  };

  const handleDecline = async (connectionId: string) => {
    await respondToRequest(connectionId, 'rejected');
    setPendingRequests((prev) => prev.filter((req) => req.id !== connectionId));
    toast({ title: "Connection declined." });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-primary">Lynkr</h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-foreground hover:text-primary">
                  Home
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle button */}
              <ThemeToggle />

              {/* Notification bell */}
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setNotifOpen((o) => !o)}>
                  <Bell className="h-4 w-4" />
                  {(pendingRequests.length > 0 || notifications.length > 0) && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {pendingRequests.length + notifications.length}
                    </span>
                  )}
                </Button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                    <div className="p-4 font-semibold border-b">Notifications</div>
                    {/* Connection Requests */}
                    {pendingRequests.length > 0 && (
                      <ul>
                        {pendingRequests.map((req) => (
                          <li key={req.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                            <span>Connection request from {req.profiles?.full_name || 'a user'}</span>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAccept(req.id)} className="ml-2">Accept</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDecline(req.id)}>Decline</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* Like and other notifications */}
                    {notifications.length > 0 ? (
                      <ul>
                        {notifications.map((notif) => (
                          <li key={notif.id} className="p-4 border-b last:border-b-0 text-sm">
                            {notif.message}
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : pendingRequests.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No new notifications</div>
                    ) : null}
                  </div>
                )}
              </div>

              {user && (
                <Link to={`/profile/${user.id}`}>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create Post */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold">Share something with your network</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                maxLength={1000}
                rows={4}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {newPost.length}/1000 characters
                </span>
                <Button type="submit" disabled={!newPost.trim() || loading}>
                  {loading ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Posts</h2>

          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to share something!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/profile/${post.profiles.user_id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {post.profiles.full_name}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="mt-4">
                      <LikeButton 
                        postId={post.id} 
                        userId={user?.id || ''} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}