import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { likePost, unlikePost, getLikesCount, hasLiked } from '@/integrations/supabase/likes';
import { createComment, getComments, getCommentsCount } from '@/integrations/supabase/comments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  Home,
  Bell,
  MessageCircle,
  Users,
  User,
  LogOut,
  Search,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  TrendingUp,
  Briefcase,
  Calendar,
  Camera,
  Edit3,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Three.js Background Component
const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating network nodes
    const geometries = [
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.OctahedronGeometry(0.4),
      new THREE.TetrahedronGeometry(0.35),
    ];

    const materials = [
      new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.1,
        wireframe: true
      }),
      new THREE.MeshBasicMaterial({
        color: 0x1d4ed8,
        transparent: true,
        opacity: 0.08,
        wireframe: true
      }),
      new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.06,
        wireframe: true
      }),
    ];

    const meshes: Array<{
      mesh: THREE.Mesh;
      rotationSpeed: { x: number; y: number; z: number };
      floatSpeed: number;
      floatRange: number;
      initialY: number;
    }> = [];

    // Create network nodes
    for (let i = 0; i < 12; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (Math.random() - 0.5) * 25;
      mesh.position.y = (Math.random() - 0.5) * 15;
      mesh.position.z = (Math.random() - 0.5) * 20;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      scene.add(mesh);
      meshes.push({
        mesh,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.008,
          z: (Math.random() - 0.5) * 0.008,
        },
        floatSpeed: Math.random() * 0.015 + 0.008,
        floatRange: Math.random() * 1.5 + 0.8,
        initialY: mesh.position.y,
      });
    }

    // Add connecting lines between nodes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.03
    });

    for (let i = 0; i < meshes.length; i++) {
      for (let j = i + 1; j < meshes.length; j++) {
        const distance = meshes[i].mesh.position.distanceTo(meshes[j].mesh.position);
        if (distance < 8) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            meshes[i].mesh.position,
            meshes[j].mesh.position
          ]);
          const line = new THREE.Line(geometry, lineMaterial);
          scene.add(line);
        }
      }
    }

    camera.position.z = 10;
    camera.position.y = 2;

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.008;

      meshes.forEach(({ mesh, rotationSpeed, floatSpeed, floatRange, initialY }) => {
        mesh.rotation.x += rotationSpeed.x;
        mesh.rotation.y += rotationSpeed.y;
        mesh.rotation.z += rotationSpeed.z;

        mesh.position.y = initialY + Math.sin(time * floatSpeed) * floatRange;
      });

      camera.position.x = Math.sin(time * 0.3) * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

// Animation variants
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

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    user_id: string;
  };
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userPostsCount, setUserPostsCount] = useState(0);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState<{[key: string]: any[]}>({});
  const [postLikes, setPostLikes] = useState<{[key: string]: {count: number, userLiked: boolean}}>({});

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
    fetchUserPostsCount();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

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

      const postsData = data || [];
      setPosts(postsData);

      // Fetch likes and comments data for each post
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
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
  };

  const fetchUserPostsCount = async () => {
    if (!user?.id) return;

    try {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      if (error) {
        console.error('Error fetching user posts count:', error);
      } else {
        setUserPostsCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching user posts count:', error);
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
        commentsData[post.id] = comments;
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
      setShowCreatePost(false);
      toast({
        title: "Success",
        description: "Your post has been shared!"
      });

      fetchPosts();
      fetchUserPostsCount(); // Update user posts count
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

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    try {
      const currentLike = postLikes[postId];
      const isLiked = currentLike?.userLiked || false;

      if (isLiked) {
        await unlikePost(postId, user.id);
        setPostLikes(prev => ({
          ...prev,
          [postId]: {
            count: Math.max(0, (prev[postId]?.count || 0) - 1),
            userLiked: false
          }
        }));
      } else {
        await likePost(postId, user.id);
        setPostLikes(prev => ({
          ...prev,
          [postId]: {
            count: (prev[postId]?.count || 0) + 1,
            userLiked: true
          }
        }));
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleComment = async (postId: string) => {
    if (!user?.id || !newComment.trim()) return;

    try {
      await createComment(postId, user.id, newComment);

      // Refresh comments for this post
      const comments = await getComments(postId);
      setPostComments(prev => ({
        ...prev,
        [postId]: comments
      }));

      setNewComment('');
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

  const sidebarItems = [
    { id: 1, label: 'Home', icon: Home, active: activeTab === 0 },
    { id: 2, label: 'Network', icon: Users, active: activeTab === 1 },
    { id: 3, label: 'Jobs', icon: Briefcase, active: activeTab === 2 },
    { id: 4, label: 'Messages', icon: MessageCircle, active: activeTab === 3 },
    { id: 5, label: 'Notifications', icon: Bell, active: activeTab === 4 },
  ];

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
              {/* Sidebar Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 text-blue-900 hover:bg-white/30 rounded-lg transition-all"
              >
                <Menu className="h-5 w-5" />
              </motion.button>

              <motion.h1
                whileHover={{ scale: 1.05 }}
                className="text-3xl font-bold text-blue-900 tracking-tight drop-shadow-sm"
              >
                Lynkr
              </motion.h1>

              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Create Post Button */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-blue-600/90 backdrop-blur-sm text-white hover:bg-blue-700/90 border border-white/30"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post
                </Button>
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
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Layout */}
      <div className="flex h-screen pt-20">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{
            x: 0,
            width: sidebarCollapsed ? 80 : 320
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }}
          className={`${sidebarCollapsed ? 'w-20' : 'w-80'} backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-lg flex flex-col transition-all duration-150`}
        >
          <div className="p-6 border-b border-white/20">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
              <Avatar className="h-12 w-12 border-2 border-white/30">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-600/90 text-white">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-semibold text-blue-900">
                      {user?.user_metadata?.full_name || 'User'}
                    </h3>
                    <p className="text-sm text-blue-700/70">{user?.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    variants={fadeInUp}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} w-full p-4 rounded-xl transition-all duration-150 relative ${
                      activeTab === index
                        ? 'bg-blue-600/90 backdrop-blur-sm text-white shadow-lg'
                        : 'text-blue-900/70 hover:text-blue-900 hover:bg-white/20'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center justify-between flex-1"
                        >
                          <span className="font-medium">{item.label}</span>
                          {item.label === 'Notifications' && unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {sidebarCollapsed && item.label === 'Notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </nav>

          {/* Quick Stats */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="text-lg font-bold text-blue-900">{userPostsCount}</div>
                  <div className="text-xs text-blue-700/70">My Posts</div>
                </div>
                <div className="text-center p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="text-lg font-bold text-blue-900">{notifications.length}</div>
                  <div className="text-xs text-blue-700/70">Updates</div>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <div className="p-4 border-t border-white/20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-blue-900 hover:bg-white/30 transition-all`}
              title={sidebarCollapsed ? (sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar') : undefined}
            >
              <AnimatePresence mode="wait">
                {sidebarCollapsed ? (
                  <motion.div
                    key="expand"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapse"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="font-medium">Collapse</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Welcome Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-blue-700/70">
                  Stay connected with your professional network
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setShowCreatePost(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/90 backdrop-blur-sm rounded-xl">
                      <Edit3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Create Post</h3>
                      <p className="text-sm text-blue-700/70">Share an update</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/90 backdrop-blur-sm rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Network</h3>
                      <p className="text-sm text-blue-700/70">Find connections</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/90 backdrop-blur-sm rounded-xl">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Jobs</h3>
                      <p className="text-sm text-blue-700/70">Find opportunities</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/90 backdrop-blur-sm rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Analytics</h3>
                      <p className="text-sm text-blue-700/70">View insights</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Recent Posts</h2>

                {posts.length === 0 ? (
                  <Card className="bg-white/30 backdrop-blur-sm border border-white/30 shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="text-blue-700/70 mb-4">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      </div>
                      <p className="text-blue-900 font-medium">No posts yet</p>
                      <p className="text-blue-700/70 text-sm">Be the first to share something!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    {posts.map((post) => (
                      <motion.div key={post.id} variants={fadeInUp}>
                        <Card className="bg-white/30 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 border-2 border-white/30">
                                <AvatarFallback className="bg-blue-600/90 text-white">
                                  {post.profiles?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <Link
                                    to={`/profile/${post.profiles?.user_id}`}
                                    className="font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                                  >
                                    {post.profiles?.full_name}
                                  </Link>
                                  <span className="text-sm text-blue-700/70">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-blue-900 leading-relaxed mb-4 whitespace-pre-wrap">
                                  {post.content}
                                </p>
                                <div className="flex items-center gap-6 text-blue-700/70">
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
                                    <span className="text-sm">
                                      {postLikes[post.id]?.count || 0} {postLikes[post.id]?.count === 1 ? 'Like' : 'Likes'}
                                    </span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="text-sm">
                                      {postComments[post.id]?.length || 0} {postComments[post.id]?.length === 1 ? 'Comment' : 'Comments'}
                                    </span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 hover:text-green-600 transition-colors"
                                  >
                                    <Share2 className="h-4 w-4" />
                                    <span className="text-sm">Share</span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 hover:text-yellow-600 transition-colors ml-auto"
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </motion.button>
                                </div>

                                {/* Comments Section */}
                                <AnimatePresence>
                                  {showComments === post.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-4 pt-4 border-t border-white/20"
                                    >
                                      {/* Add Comment Form */}
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
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
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
                                            disabled={!newComment.trim()}
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
            </motion.div>
          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
            <DialogContent className="bg-white/90 backdrop-blur-xl border border-white/30 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-blue-900">Create a new post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="ghost" className="text-blue-700 hover:text-blue-900">
                      <Camera className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                    <Button type="button" variant="ghost" className="text-blue-700 hover:text-blue-900">
                      <Calendar className="h-4 w-4 mr-2" />
                      Event
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !newPost.trim()}
                    className="bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700/90"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-20 bottom-0 w-80 bg-white/90 backdrop-blur-xl border-l border-white/30 shadow-2xl z-30 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-blue-900">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border transition-all ${
                        notification.read
                          ? 'bg-white/30 border-white/30'
                          : 'bg-blue-50/50 border-blue-200/50'
                      }`}
                    >
                      <p className="text-blue-900 text-sm">{notification.message}</p>
                      <span className="text-xs text-blue-700/70">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-blue-700/50" />
                    <p className="text-blue-700/70">No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
