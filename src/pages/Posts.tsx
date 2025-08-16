import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { likePost, unlikePost, getLikesCount, hasLiked, getLikers } from '@/integrations/supabase/likes';
import { createComment, getComments } from '@/integrations/supabase/comments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Heart,
  MessageSquare,
  Share2,
  User,
  Bell,
  Search,
  LogOut
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: {
    full_name: string;
    user_id: string;
    avatar_url?: string;
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Posts() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [creating, setCreating] = useState(false);
  const [postLikes, setPostLikes] = useState<{[key: string]: {count: number, userLiked: boolean}}>({});
  const [postComments, setPostComments] = useState<{[key: string]: any[]}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [selectedPostLikers, setSelectedPostLikers] = useState<any[]>([]);
  const [likesDialogLoading, setLikesDialogLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          profiles:profiles!posts_author_id_fkey (
            full_name,
            user_id,
            avatar_url
          )
        `)
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsData = data || [];
      setPosts(postsData);

      // Fetch likes and comments for each post
      if (user?.id && postsData.length > 0) {
        await fetchPostsInteractions(postsData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsInteractions = async (posts: Post[]) => {
    if (!user?.id) return;

    const likesData: {[key: string]: {count: number, userLiked: boolean}} = {};
    const commentsData: {[key: string]: any[]} = {};

    await Promise.all(posts.map(async (post) => {
      try {
        const [likesCount, userLiked, comments] = await Promise.all([
          getLikesCount(post.id),
          hasLiked(post.id, user.id),
          getComments(post.id)
        ]);

        likesData[post.id] = { count: likesCount, userLiked };
        // Sort comments from latest to oldest
        const sortedComments = comments.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        commentsData[post.id] = sortedComments;
      } catch (error) {
        console.error(`Error fetching interactions for post ${post.id}:`, error);
        likesData[post.id] = { count: 0, userLiked: false };
        commentsData[post.id] = [];
      }
    }));

    setPostLikes(likesData);
    setPostComments(commentsData);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user?.id) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPost.trim(),
          author_id: user.id,
        });

      if (error) throw error;

      setNewPost('');
      setShowCreatePost(false);
      toast({
        title: "Success",
        description: "Post created successfully!"
      });

      // Refresh posts
      await fetchUserPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully!"
      });

      // Refresh posts
      await fetchUserPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    try {
      const currentLikeState = postLikes[postId];

      if (currentLikeState?.userLiked) {
        await unlikePost(postId, user.id);
      } else {
        await likePost(postId, user.id);
      }

      // Update the like state immediately
      const newLikesCount = await getLikesCount(postId);
      const newUserLiked = await hasLiked(postId, user.id);

      setPostLikes(prev => ({
        ...prev,
        [postId]: { count: newLikesCount, userLiked: newUserLiked }
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleComment = async (postId: string) => {
    const commentText = newComment[postId];
    if (!user?.id || !commentText?.trim()) return;

    try {
      await createComment(postId, user.id, commentText);

      // Refresh comments for this post
      const comments = await getComments(postId);
      const sortedComments = comments.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPostComments(prev => ({
        ...prev,
        [postId]: sortedComments
      }));

      // Clear the comment text for this specific post
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));

      toast({
        title: "Success",
        description: "Comment added successfully!"
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleShowLikes = async (postId: string) => {
    setLikesDialogLoading(true);
    setShowLikesDialog(true);

    try {
      const likers = await getLikers(postId);
      setSelectedPostLikers(likers);
    } catch (error) {
      console.error('Error fetching likers:', error);
      toast({
        title: "Error",
        description: "Failed to load likes",
        variant: "destructive"
      });
    } finally {
      setLikesDialogLoading(false);
    }
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-blue-600">Loading your posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="w-full backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          {/* Main navigation row */}
          <div className="flex items-center justify-between">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-blue-900 hover:text-blue-700 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <span className="text-blue-700 font-semibold">My Posts</span>
            </div>

            {/* Center - Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Lynkr
              </h1>
            </motion.div>

            {/* Right side - User actions */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 placeholder:text-blue-700/50"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-900 hover:text-blue-700"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-blue-900 hover:text-blue-700"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* User profile row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/30">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-600/90 text-white">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-blue-900">
                  {user?.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-sm text-blue-700/70">
                  {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                </p>
              </div>
            </div>

            {/* Create Post Button */}
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600/90 hover:bg-blue-700/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-sm border border-white/30">
                <DialogHeader>
                  <DialogTitle className="text-blue-900">Create New Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[120px] border-white/30 bg-white/20 backdrop-blur-sm focus:border-blue-500 focus:bg-white/30 text-blue-900 placeholder:text-blue-700/50"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreatePost(false)}
                      className="border-white/30 text-blue-900 hover:bg-white/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!newPost.trim() || creating}
                      className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                    >
                      {creating ? 'Creating...' : 'Create Post'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg p-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-semibold text-blue-900 mb-2">No posts yet</h3>
                <p className="text-blue-700/70 mb-6">Start sharing your thoughts with the world!</p>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="space-y-6"
            >
              {posts.map((post) => (
                <motion.div key={post.id} variants={fadeInUp}>
                  <Card className="bg-white/30 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white/30">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback className="bg-blue-600/90 text-white">
                            {post.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-blue-900">
                                {post.profiles?.full_name || 'User'}
                              </h3>
                              <p className="text-sm text-blue-700/70">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            
                            {/* Delete button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <p className="text-blue-900 mb-4 leading-relaxed">{post.content}</p>
                          
                          {/* Post actions */}
                          <div className="flex items-center gap-6 pt-3 border-t border-white/20">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-2 transition-colors ${
                                  postLikes[post.id]?.userLiked
                                    ? 'text-red-500'
                                    : 'hover:text-red-500'
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${postLikes[post.id]?.userLiked ? 'fill-current' : ''}`} />
                              </motion.button>
                              {postLikes[post.id]?.count > 0 ? (
                                <button
                                  onClick={() => handleShowLikes(post.id)}
                                  className="text-sm hover:underline transition-colors"
                                >
                                  {postLikes[post.id]?.count} {postLikes[post.id]?.count === 1 ? 'Like' : 'Likes'}
                                </button>
                              ) : (
                                <span className="text-sm">Like</span>
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => toggleComments(post.id)}
                              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-sm">
                                {postComments[post.id]?.length || 0} {postComments[post.id]?.length === 1 ? 'Comment' : 'Comments'}
                              </span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleShare(post.id)}
                              className="flex items-center gap-2 hover:text-green-600 transition-colors"
                            >
                              <Share2 className="h-4 w-4" />
                              <span className="text-sm">Share</span>
                            </motion.button>
                          </div>

                          {/* Comments Section */}
                          <AnimatePresence>
                            {showComments[post.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t border-white/20"
                              >
                                {/* Add Comment */}
                                <div className="flex gap-3 mb-4">
                                  <Avatar className="h-8 w-8 border border-white/30">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-blue-600/90 text-white text-xs">
                                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 flex gap-2">
                                    <Input
                                      placeholder="Write a comment..."
                                      value={newComment[post.id] || ''}
                                      onChange={(e) => setNewComment(prev => ({
                                        ...prev,
                                        [post.id]: e.target.value
                                      }))}
                                      className="border-white/30 bg-white/20 backdrop-blur-sm focus:border-blue-500 focus:bg-white/30 text-blue-900 placeholder:text-blue-700/50"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleComment(post.id);
                                        }
                                      }}
                                    />
                                    <Button
                                      onClick={() => handleComment(post.id)}
                                      disabled={!newComment[post.id]?.trim()}
                                      size="sm"
                                      className="bg-blue-600/90 hover:bg-blue-700/90"
                                    >
                                      Post
                                    </Button>
                                  </div>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {postComments[post.id]?.map((comment: any) => (
                                    <motion.div
                                      key={comment.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex gap-3"
                                    >
                                      <Avatar className="h-8 w-8 border border-white/30">
                                        <AvatarImage src={comment.profiles?.avatar_url} />
                                        <AvatarFallback className="bg-blue-600/90 text-white text-xs">
                                          {comment.profiles?.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-blue-900 text-sm">
                                              {comment.profiles?.full_name}
                                            </span>
                                            <span className="text-xs text-blue-700/70">
                                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </span>
                                          </div>
                                          <p className="text-blue-900 text-sm">{comment.content}</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Likes Dialog */}
      <Dialog open={showLikesDialog} onOpenChange={setShowLikesDialog}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold text-lg">People who liked this post</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {likesDialogLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-blue-400">Loading...</div>
              </div>
            ) : selectedPostLikers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No likes yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPostLikers.map((liker: any) => (
                  <motion.div
                    key={liker.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-700/30"
                    onClick={() => {
                      navigate(`/profile/${liker.profiles?.user_id}`);
                      setShowLikesDialog(false);
                    }}
                  >
                    <Avatar className="h-10 w-10 border-2 border-gray-600/50">
                      <AvatarImage src={liker.profiles?.avatar_url} />
                      <AvatarFallback className="bg-blue-600 text-white font-medium">
                        {liker.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-white hover:text-blue-400 transition-colors">
                        {liker.profiles?.full_name || 'User'}
                      </h4>
                      {liker.profiles?.current_position && (
                        <p className="text-sm text-gray-400">
                          {liker.profiles.current_position}
                          {liker.profiles?.company && ` at ${liker.profiles.company}`}
                        </p>
                      )}
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
