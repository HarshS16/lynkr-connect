import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessaging';
import { ConversationWithDetails, Message } from '@/integrations/supabase/messaging';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Send,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Trash2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: ConversationWithDetails;
}

export function ChatDialog({ open, onOpenChange, conversation }: ChatDialogProps) {
  const { user } = useAuth();
  const { messages, loading, sending, sendMessage, uploadImage, markAsRead, deleteMessage } = useMessages(
    open ? conversation.id : null
  );
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (open) {
      markAsRead();
    }
  }, [open, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      await sendMessage({
        conversation_id: conversation.id,
        content: newMessage.trim(),
        message_type: 'text'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      
      await sendMessage({
        conversation_id: conversation.id,
        message_type: 'image',
        image_url: imageUrl
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const isMyMessage = (message: Message) => message.sender_id === user?.id;

  const renderMessage = (message: Message, index: number) => {
    const isMine = isMyMessage(message);
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'flex gap-3 mb-4',
          isMine ? 'justify-end' : 'justify-start'
        )}
      >
        {!isMine && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={message.sender?.avatar_url} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {message.sender?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn('max-w-[70%]', isMine && 'order-first')}>
          <div
            className={cn(
              'rounded-2xl px-4 py-2 relative group',
              isMine
                ? 'bg-blue-600 text-white'
                : 'bg-white/60 backdrop-blur-sm text-blue-900'
            )}
          >
            {message.message_type === 'text' && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
            
            {message.message_type === 'image' && message.image_url && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={message.image_url}
                  alt="Shared image"
                  className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.image_url, '_blank')}
                />
              </div>
            )}
            
            {isMine && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteMessage(message.id)}
                className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <p className={cn(
            'text-xs text-blue-700/60 mt-1',
            isMine ? 'text-right' : 'text-left'
          )}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] p-0 bg-white/90 backdrop-blur-xl border-white/30">
        <DialogHeader className="p-4 border-b border-white/30">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.other_participant?.avatar_url} />
              <AvatarFallback className="bg-blue-500 text-white">
                {conversation.other_participant?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-blue-900">
                {conversation.other_participant?.full_name || 'Unknown User'}
              </DialogTitle>
              {conversation.other_participant?.current_position && (
                <p className="text-sm text-blue-700/70">
                  {conversation.other_participant.current_position}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-700/70">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div>
              <AnimatePresence>
                {messages.map((message, index) => renderMessage(message, index))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/30">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
                disabled={sending || uploadingImage}
              />
            </div>
            
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending || uploadingImage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
