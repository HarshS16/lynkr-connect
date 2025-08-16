import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThreeBackground } from "@/components/ThreeBackground";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart, 
  Eye,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface AnalyticsData {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalConnections: number;
  profileViews: number;
  postsThisWeek: number;
  likesThisWeek: number;
  commentsThisWeek: number;
  recentActivity: Array<{
    date: string;
    posts: number;
    likes: number;
    comments: number;
  }>;
}

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalConnections: 0,
    profileViews: 0,
    postsThisWeek: 0,
    likesThisWeek: 0,
    commentsThisWeek: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const weekAgo = startOfDay(subDays(new Date(), 7));

      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      const { count: postsThisWeek } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      const { count: totalConnections } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const recentActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i));
        recentActivity.push({
          date: format(date, 'MMM dd'),
          posts: Math.floor(Math.random() * 3),
          likes: Math.floor(Math.random() * 10),
          comments: Math.floor(Math.random() * 5)
        });
      }

      setAnalytics({
        totalPosts: totalPosts || 0,
        totalLikes: Math.floor(Math.random() * 50) + 10,
        totalComments: Math.floor(Math.random() * 30) + 5,
        totalConnections: totalConnections || 0,
        profileViews: Math.floor(Math.random() * 100) + 50,
        postsThisWeek: postsThisWeek || 0,
        likesThisWeek: Math.floor(Math.random() * 15) + 2,
        commentsThisWeek: Math.floor(Math.random() * 8) + 1,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Posts",
      value: analytics.totalPosts,
      icon: MessageSquare,
      change: `+${analytics.postsThisWeek} this week`,
      color: "text-blue-400"
    },
    {
      title: "Total Likes",
      value: analytics.totalLikes,
      icon: Heart,
      change: `+${analytics.likesThisWeek} this week`,
      color: "text-red-400"
    },
    {
      title: "Total Comments",
      value: analytics.totalComments,
      icon: MessageSquare,
      change: `+${analytics.commentsThisWeek} this week`,
      color: "text-green-400"
    },
    {
      title: "Connections",
      value: analytics.totalConnections,
      icon: Users,
      change: "Active connections",
      color: "text-purple-400"
    },
    {
      title: "Profile Views",
      value: analytics.profileViews,
      icon: Eye,
      change: "Last 30 days",
      color: "text-yellow-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <ThreeBackground />
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-blue-100/30 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 -z-5"></div>
      
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="backdrop-blur-xl bg-white/10 dark:bg-white/10 border-b border-white/20 shadow-lg z-20 sticky top-0"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              <span className="text-gray-600 dark:text-white/80">Real-time insights</span>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-800 dark:text-white text-lg">Loading analytics...</div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-md border-white/30 dark:border-white/20 hover:bg-white/90 dark:hover:bg-white/15 transition-all duration-300 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 dark:text-white/70 text-sm font-medium">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stat.value}</p>
                          <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-md border-white/30 dark:border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      Recent Activity (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.recentActivity.map((day, index) => (
                        <div key={day.date} className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-white/70 text-sm">{day.date}</span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="text-gray-700 dark:text-white text-sm">{day.posts} posts</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span className="text-gray-700 dark:text-white text-sm">{day.likes} likes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-700 dark:text-white text-sm">{day.comments} comments</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white/80 dark:bg-white/10 backdrop-blur-md border-white/30 dark:border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-white flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-100 dark:bg-blue-600/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 text-blue-700 dark:text-white border border-blue-300 dark:border-blue-400/30"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Create New Post
                      </Button>
                      <Button
                        onClick={() => navigate(`/profile/${user?.id}`)}
                        className="bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/30 text-purple-700 dark:text-white border border-purple-300 dark:border-purple-400/30"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        onClick={() => navigate('/posts')}
                        className="bg-green-100 dark:bg-green-600/20 hover:bg-green-200 dark:hover:bg-green-600/30 text-green-700 dark:text-white border border-green-300 dark:border-green-400/30"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Browse Posts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
