import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { ThreeBackground } from "@/components/ThreeBackground";
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  image_url?: string;
  profiles: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    current_position?: string;
    company?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function PostView() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      fetchLikes();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          image_url,
          profiles:author_id (
            user_id,
            full_name,
            avatar_url,
            current_position,
            company
          )
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Post not found",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          author_id,
          profiles:author_id (
            user_id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('user_id')
        .eq('post_id', postId);

      if (!error && data) {
        setLikes(data);
        setIsLiked(user ? data.some(like => like.user_id === user.id) : false);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like posts",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }
      
      fetchLikes();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <ThreeBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-gray-800 dark:text-white text-lg">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <ThreeBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Post not found</h1>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <ThreeBackground />
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-blue-100/30 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 -z-5"></div>
      
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="backdrop-blur-xl bg-white/10 dark:bg-white/10 border-b border-white/20 shadow-lg z-20 sticky top-0"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Post View</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-md border-white/30 dark:border-white/20 shadow-lg">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                <Link to={`/profile/${post.profiles.user_id}`}>
                  <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-600">
                    <AvatarImage src={post.profiles.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white font-medium">
                      {post.profiles.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <Link 
                    to={`/profile/${post.profiles.user_id}`}
                    className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.profiles.full_name}
                  </Link>
                  {post.profiles.current_position && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {post.profiles.current_position}
                      {post.profiles.company && ` at ${post.profiles.company}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(post.created_at), 'MMM dd, yyyy • h:mm a')}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-800 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
                {post.image_url && (
                  <div className="mt-4">
                    <img 
                      src={post.image_url} 
                      alt="Post image" 
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    isLiked 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likes.length}</span>
                </Button>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{comments.length}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {comments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-md border-white/30 dark:border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                    Comments ({comments.length})
                  </h3>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <Link to={`/profile/${comment.profiles.user_id}`}>
                          <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600">
                            <AvatarImage src={comment.profiles.avatar_url} />
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {comment.profiles.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            <Link 
                              to={`/profile/${comment.profiles.user_id}`}
                              className="font-medium text-sm text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {comment.profiles.full_name}
                            </Link>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {comment.content}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-3">
                            {format(new Date(comment.created_at), 'MMM dd, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
