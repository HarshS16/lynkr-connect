import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ThreeBackground } from '@/components/ThreeBackground';
import ChatPane from '@/components/messaging/ChatPane';
import ChatDetails from '@/components/messaging/ChatDetails';
import { ConversationWithDetails } from '@/integrations/supabase/messaging';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Users,
  Bell,
  LogOut,
  Plus
} from 'lucide-react';

export default function Messages() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);


  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    const otherUser = conversation.other_participant;
    return otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConversationClick = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
  };

  const getMessagePreview = (conversation: ConversationWithDetails) => {
    if (!conversation.last_message) return 'No messages yet';
    
    const message = conversation.last_message;
    if (message.message_type === 'image') return '📷 Image';
    if (message.message_type === 'file') return '📎 File';
    return message.content || 'Message';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      <ThreeBackground />
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="w-full backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg sticky top-0 z-20"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Dashboard Navigation */}
              <div className="flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-blue-900 hover:text-blue-700 transition-colors font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/network"
                  className="text-blue-900/80 hover:text-blue-700 transition-colors font-medium"
                >
                  Network
                </Link>
                <Link
                  to="/jobs"
                  className="text-blue-900/80 hover:text-blue-700 transition-colors font-medium"
                >
                  Jobs
                </Link>
                <span className="text-blue-700 font-semibold">Messages</span>
              </div>

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
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900 placeholder:text-blue-700/50"
                />
              </div>
            </div>

            {/* User Profile and Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                {user && (
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-3 text-blue-900 hover:text-blue-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">View Profile</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/network')}
                  className="text-blue-900 hover:text-blue-700 hover:bg-white/20"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Network
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-900 hover:text-blue-700 hover:bg-white/20 relative"
                >
                  <Bell className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-blue-900 hover:text-blue-700 hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-7xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Conversations list */}
              <div className="lg:col-span-3">
                <Card className="bg-white/30 backdrop-blur-sm border-white/30 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-blue-900 font-semibold">Chats</h2>
                      <span className="text-xs text-blue-700/60">{filteredConversations.length}</span>
                    </div>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-blue-700/70 mt-2">Loading conversations...</p>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">No conversations</h3>
                        <p className="text-blue-700/70 mb-4">Start connecting with people to begin!</p>
                        <Button onClick={() => navigate('/network')} className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Users className="h-4 w-4 mr-2" />Explore Network
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                        <AnimatePresence>
                          {filteredConversations.map((conversation, index) => (
                            <motion.div
                              key={conversation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleConversationClick(conversation)}
                              className={"p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all cursor-pointer group " + (selectedConversation?.id===conversation.id?"ring-2 ring-blue-300":"")}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={conversation.other_participant?.avatar_url} />
                                  <AvatarFallback className="bg-blue-500 text-white">
                                    {conversation.other_participant?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-medium text-blue-900 truncate">
                                      {conversation.other_participant?.full_name || 'Unknown User'}
                                    </h3>
                                    {conversation.last_message && (
                                      <span className="text-[10px] text-blue-700/60 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-blue-700/80 truncate mt-0.5">
                                    {getMessagePreview(conversation)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Middle: Chat */}
              <div className="lg:col-span-6">
                {selectedConversation ? (
                  <ChatPane conversation={selectedConversation} heightClass="h-[70vh]" />
                ) : (
                  <Card className="p-6 bg-white/30 backdrop-blur-sm border-white/30 rounded-2xl h-[70vh] flex items-center justify-center text-blue-700/70">
                    Select a chat to start messaging
                  </Card>
                )}
              </div>

              {/* Right: Details */}
              <div className="lg:col-span-3">
                <ChatDetails conversation={selectedConversation} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
