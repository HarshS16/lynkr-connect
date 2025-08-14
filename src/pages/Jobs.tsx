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
  MapPin,
  Clock,
  DollarSign,
  Building,
  Users,
  Calendar,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  ArrowLeft,
  Bell,
  Plus,
  User,
  LogOut,
  Briefcase,
  Star,
  TrendingUp
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary_range?: string;
  description: string;
  requirements: string[];
  posted_date: string;
  application_deadline?: string;
  posted_by: string;
  is_featured?: boolean;
  applicants_count?: number;
}

interface SavedJob {
  id: string;
  job_id: string;
  user_id: string;
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

export default function Jobs() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
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

  const fetchJobs = async () => {
    try {
      // For now, we'll use mock data since we don't have a jobs table yet
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          company_logo: '',
          location: 'San Francisco, CA',
          type: 'full-time',
          salary_range: '$120,000 - $160,000',
          description: 'We are looking for a Senior Frontend Developer to join our dynamic team. You will be responsible for building user-facing features using React, TypeScript, and modern web technologies.',
          requirements: ['5+ years React experience', 'TypeScript proficiency', 'Modern CSS frameworks', 'Git workflow'],
          posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          posted_by: 'hr@techcorp.com',
          is_featured: true,
          applicants_count: 24
        },
        {
          id: '2',
          title: 'Product Manager',
          company: 'StartupXYZ',
          company_logo: '',
          location: 'Remote',
          type: 'full-time',
          salary_range: '$100,000 - $140,000',
          description: 'Join our fast-growing startup as a Product Manager. Lead product strategy, work with cross-functional teams, and drive product development from conception to launch.',
          requirements: ['3+ years PM experience', 'Agile methodology', 'Data-driven mindset', 'Strong communication'],
          posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          application_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          posted_by: 'careers@startupxyz.com',
          is_featured: false,
          applicants_count: 18
        },
        {
          id: '3',
          title: 'UX/UI Designer',
          company: 'Design Studio Pro',
          company_logo: '',
          location: 'New York, NY',
          type: 'contract',
          salary_range: '$80 - $120/hour',
          description: 'Creative UX/UI Designer needed for exciting client projects. Design user experiences for web and mobile applications using modern design tools and methodologies.',
          requirements: ['Figma expertise', 'User research skills', 'Prototyping experience', 'Portfolio required'],
          posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          application_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          posted_by: 'hello@designstudiopro.com',
          is_featured: false,
          applicants_count: 31
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          company: 'CloudTech Solutions',
          company_logo: '',
          location: 'Austin, TX',
          type: 'full-time',
          salary_range: '$110,000 - $150,000',
          description: 'Experienced DevOps Engineer to manage cloud infrastructure, CI/CD pipelines, and ensure system reliability. Work with cutting-edge cloud technologies.',
          requirements: ['AWS/Azure experience', 'Docker & Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code'],
          posted_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          application_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          posted_by: 'jobs@cloudtech.com',
          is_featured: true,
          applicants_count: 15
        },
        {
          id: '5',
          title: 'Marketing Specialist',
          company: 'Growth Marketing Co.',
          company_logo: '',
          location: 'Los Angeles, CA',
          type: 'part-time',
          salary_range: '$25 - $35/hour',
          description: 'Part-time Marketing Specialist to develop and execute marketing campaigns. Focus on digital marketing, content creation, and social media management.',
          requirements: ['Digital marketing experience', 'Content creation skills', 'Social media expertise', 'Analytics tools'],
          posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          application_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          posted_by: 'hr@growthmarketing.com',
          is_featured: false,
          applicants_count: 42
        },
        {
          id: '6',
          title: 'Data Scientist',
          company: 'AI Innovations Ltd.',
          company_logo: '',
          location: 'Seattle, WA',
          type: 'full-time',
          salary_range: '$130,000 - $180,000',
          description: 'Data Scientist to work on machine learning projects and data analysis. Build predictive models and extract insights from large datasets.',
          requirements: ['Python/R proficiency', 'Machine learning', 'Statistical analysis', 'SQL expertise'],
          posted_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          application_deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          posted_by: 'careers@aiinnovations.com',
          is_featured: true,
          applicants_count: 19
        }
      ];
      
      setJobs(mockJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    }
  };

  const fetchSavedJobs = async () => {
    if (!user?.id) return;
    
    try {
      // Mock saved jobs for now
      setSavedJobs([]);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!user?.id) return;

    const isAlreadySaved = savedJobs.some(saved => saved.job_id === jobId);
    
    try {
      if (isAlreadySaved) {
        // Remove from saved jobs
        setSavedJobs(prev => prev.filter(saved => saved.job_id !== jobId));
        toast({
          title: "Success",
          description: "Job removed from saved jobs"
        });
      } else {
        // Add to saved jobs
        const newSavedJob: SavedJob = {
          id: Date.now().toString(),
          job_id: jobId,
          user_id: user.id,
          created_at: new Date().toISOString()
        };
        setSavedJobs(prev => [...prev, newSavedJob]);
        toast({
          title: "Success",
          description: "Job saved successfully!"
        });
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive"
      });
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-500/90';
      case 'part-time': return 'bg-green-500/90';
      case 'contract': return 'bg-purple-500/90';
      case 'remote': return 'bg-orange-500/90';
      default: return 'bg-gray-500/90';
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'Full Time';
      case 'part-time': return 'Part Time';
      case 'contract': return 'Contract';
      case 'remote': return 'Remote';
      default: return type;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = !typeFilter || job.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const featuredJobs = filteredJobs.filter(job => job.is_featured);
  const regularJobs = filteredJobs.filter(job => !job.is_featured);

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
                  placeholder="Search jobs..."
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Find Your Dream Job</h1>
              <p className="text-blue-700/70 text-lg">
                Discover opportunities that match your skills and aspirations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-blue-700/70">
                {filteredJobs.length} jobs found
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 w-48 border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border-white/30 bg-white/30 backdrop-blur-sm border rounded-md focus:border-blue-500 focus:bg-white/40 text-blue-900"
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>

            <Button variant="outline" size="sm" className="border-white/30 bg-white/20 backdrop-blur-sm text-blue-900 hover:bg-white/30">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </motion.div>

        {/* Featured Jobs */}
        {featuredJobs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-blue-900">Featured Jobs</h2>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20 overflow-hidden relative">
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 bg-yellow-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Featured
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-white/30">
                            <AvatarImage src={job.company_logo} />
                            <AvatarFallback className="bg-blue-600/90 text-white font-semibold">
                              {job.company.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-blue-900 text-lg group-hover:text-blue-700 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-blue-700/70 font-medium">{job.company}</p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                          className="text-blue-600 hover:bg-blue-50/50"
                        >
                          {savedJobs.some(saved => saved.job_id === job.id) ? (
                            <BookmarkCheck className="h-5 w-5" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getJobTypeColor(job.type)}`}>
                          {getJobTypeLabel(job.type)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-xs font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        {job.salary_range && (
                          <span className="px-3 py-1 rounded-full bg-green-100/50 text-green-700 text-xs font-medium flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary_range}
                          </span>
                        )}
                      </div>

                      <p className="text-blue-700/70 text-sm mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-blue-700/60">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(job.posted_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applicants_count} applicants
                          </span>
                        </div>

                        <Button
                          size="sm"
                          className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                        >
                          Apply Now
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All Jobs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-900">All Opportunities</h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {regularJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={fadeInUp}
                  layout
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12 border-2 border-white/30">
                            <AvatarImage src={job.company_logo} />
                            <AvatarFallback className="bg-blue-600/90 text-white font-semibold">
                              {job.company.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-blue-900 text-lg group-hover:text-blue-700 transition-colors">
                                {job.title}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSaveJob(job.id)}
                                className="text-blue-600 hover:bg-blue-50/50"
                              >
                                {savedJobs.some(saved => saved.job_id === job.id) ? (
                                  <BookmarkCheck className="h-5 w-5" />
                                ) : (
                                  <Bookmark className="h-5 w-5" />
                                )}
                              </Button>
                            </div>

                            <p className="text-blue-700/70 font-medium mb-3">{job.company}</p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getJobTypeColor(job.type)}`}>
                                {getJobTypeLabel(job.type)}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-xs font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </span>
                              {job.salary_range && (
                                <span className="px-3 py-1 rounded-full bg-green-100/50 text-green-700 text-xs font-medium flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {job.salary_range}
                                </span>
                              )}
                            </div>

                            <p className="text-blue-700/70 text-sm mb-3 line-clamp-1">
                              {job.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-blue-700/60">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(job.posted_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {job.applicants_count} applicants
                                </span>
                                {job.application_deadline && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              <Button
                                size="sm"
                                className="bg-blue-600/90 hover:bg-blue-700/90 text-white"
                              >
                                Apply Now
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
                <Briefcase className="h-16 w-16 text-blue-600/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">No Jobs Found</h3>
                <p className="text-blue-700/70">
                  {searchQuery || locationFilter || typeFilter
                    ? 'Try adjusting your search criteria'
                    : 'Check back later for new job opportunities'}
                </p>
              </div>
            </motion.div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
