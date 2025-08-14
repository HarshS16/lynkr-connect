import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ThreeBackground } from '@/components/ThreeBackground';
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Filter,
  ArrowLeft,
  Bell,
  Plus,
  User,
  LogOut,
  Menu
} from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  profiles: Profile;
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

export default function Network() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState<{[key: string]: string}>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchProfiles();
    fetchConnections();
    fetchPendingRequests();
    loadConnectionStatuses();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const fetchConnections = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_addressee_id_fkey (*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchPendingRequests = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_requester_id_fkey (*)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const loadConnectionStatuses = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('addressee_id, status')
        .eq('requester_id', user.id);

      if (error) throw error;

      const statuses: {[key: string]: string} = {};
      data?.forEach(connection => {
        statuses[connection.addressee_id] = connection.status;
      });
      setConnectionStatuses(statuses);
    } catch (error) {
      console.error('Error loading connection statuses:', error);
    }
  };

  const sendConnectionRequest = async (addresseeId: string) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
        .single();

      if (existingConnection) {
        toast({
          title: "Info",
          description: "Connection request already exists",
          variant: "default"
        });
        setLoading(false);
        return;
      }

      // Insert connection request
      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        });

      if (connectionError) throw connectionError;

      // Send notification
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: addresseeId,
            from_user_id: user.id,
            type: 'connection_request',
            message: `${user.user_metadata?.full_name || 'Someone'} sent you a connection request`
          });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the whole operation if notification fails
      }

      setConnectionStatuses(prev => ({
        ...prev,
        [addresseeId]: 'pending'
      }));

      toast({
        title: "Success",
        description: "Connection request sent!"
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptConnectionRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request accepted!"
      });

      fetchConnections();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive"
      });
    }
  };

  const declineConnectionRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'declined' })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request declined"
      });

      fetchPendingRequests();
    } catch (error) {
      console.error('Error declining connection:', error);
      toast({
        title: "Error",
        description: "Failed to decline connection",
        variant: "destructive"
      });
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  placeholder="Search people..."
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
        {/* Left Sidebar - Connections */}
        <motion.aside 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="w-80 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-lg flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-blue-900 mb-4">My Network</h2>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="p-4 border-b border-white/20">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                  >
                    <Avatar className="h-10 w-10 border border-white/30">
                      <AvatarImage src={request.profiles?.avatar_url} />
                      <AvatarFallback className="bg-blue-600/90 text-white text-sm">
                        {request.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-blue-900 text-sm truncate">
                        {request.profiles?.full_name}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          onClick={() => acceptConnectionRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white h-6 px-2 text-xs"
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineConnectionRequest(request.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50 h-6 px-2 text-xs"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Connections List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Connections ({connections.length})
            </h3>
            <div className="space-y-3">
              {connections.map((connection) => (
                <motion.div
                  key={connection.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all cursor-pointer"
                >
                  <Avatar className="h-12 w-12 border border-white/30">
                    <AvatarImage src={connection.profiles?.avatar_url} />
                    <AvatarFallback className="bg-blue-600/90 text-white">
                      {connection.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${connection.profiles?.user_id}`}>
                      <p className="font-medium text-blue-900 hover:text-blue-700 transition-colors">
                        {connection.profiles?.full_name}
                      </p>
                    </Link>
                    <p className="text-sm text-blue-700/70 truncate">
                      {connection.profiles?.bio || 'No bio available'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Content - People You May Know */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-blue-900">People You May Know</h1>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="border-white/30 bg-white/20 backdrop-blur-sm text-blue-900 hover:bg-white/30">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <div className="text-sm text-blue-700/70">
                    {filteredProfiles.length} people found
                  </div>
                </div>
              </div>
              <p className="text-blue-700/70">
                Discover and connect with professionals in your network
              </p>
            </motion.div>

            {/* People Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredProfiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    variants={fadeInUp}
                    layout
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20 overflow-hidden">
                      <CardContent className="p-6 text-center">
                        {/* Profile Picture */}
                        <Link to={`/profile/${profile.user_id}`}>
                          <div className="relative mb-4 cursor-pointer">
                            <Avatar className="h-20 w-20 mx-auto border-2 border-white/30 shadow-lg hover:border-blue-400 transition-colors">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback className="bg-blue-600/90 text-white text-xl font-semibold">
                                {profile.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                        </Link>

                        {/* Name */}
                        <Link to={`/profile/${profile.user_id}`}>
                          <h3 className="font-semibold text-blue-900 hover:text-blue-700 transition-colors mb-2 text-lg">
                            {profile.full_name}
                          </h3>
                        </Link>

                        {/* Bio */}
                        <p className="text-sm text-blue-700/70 mb-4 line-clamp-2 min-h-[2.5rem]">
                          {profile.bio || 'Professional looking to connect and grow their network'}
                        </p>

                        {/* Connect Button */}
                        <Button
                          onClick={() => sendConnectionRequest(profile.user_id)}
                          disabled={loading || connectionStatuses[profile.user_id] === 'pending'}
                          className="w-full bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm border border-blue-500/30 transition-all duration-300 group-hover:scale-105"
                        >
                          {connectionStatuses[profile.user_id] === 'pending' ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>

                        {/* Member Since */}
                        <p className="text-xs text-blue-700/50 mt-3">
                          Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredProfiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
                  <Users className="h-16 w-16 text-blue-600/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">No People Found</h3>
                  <p className="text-blue-700/70">
                    {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new people to connect with'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
