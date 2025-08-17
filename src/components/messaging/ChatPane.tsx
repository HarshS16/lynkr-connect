import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessaging';
import { ConversationWithDetails, Message } from '@/integrations/supabase/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { Image as ImageIcon, Send, Smile, Trash2 } from 'lucide-react';

interface ChatPaneProps {
  conversation: ConversationWithDetails;
  heightClass?: string; // e.g., "h-[70vh]"
}

export function ChatPane({ conversation, heightClass = 'h-[70vh]' }: ChatPaneProps) {
  const { user } = useAuth();
  const { messages, loading, sending, sendMessage, uploadImage, markAsRead, deleteMessage } = useMessages(
    conversation?.id || null
  );

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    markAsRead();
    // Scroll to bottom on mount/changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    await sendMessage({
      conversation_id: conversation.id,
      content: newMessage.trim(),
      message_type: 'text',
    });
    setNewMessage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      await sendMessage({ conversation_id: conversation.id, message_type: 'image', image_url: imageUrl });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const isMyMessage = (m: Message) => m.sender_id === user?.id;

  const renderMessage = (message: Message, index: number) => {
    const mine = isMyMessage(message);
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={cn('flex gap-3 mb-4', mine ? 'justify-end' : 'justify-start')}
      >
        {!mine && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={message.sender?.avatar_url} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {message.sender?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={cn('max-w-[70%]', mine && 'order-first')}>
          <div
            className={cn(
              'rounded-2xl px-4 py-2 relative group',
              mine ? 'bg-blue-600 text-white' : 'bg-white/60 backdrop-blur-sm text-blue-900'
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
                  onClick={() => window.open(message.image_url!, '_blank')}
                />
              </div>
            )}
            {mine && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMessage(message.id)}
                className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className={cn('text-xs text-blue-700/60 mt-1', mine ? 'text-right' : 'text-left')}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn('flex flex-col rounded-2xl bg-white/40 backdrop-blur-md border border-white/30', heightClass)}>
      {/* Header */}
      <div className="p-4 border-b border-white/30 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.other_participant?.avatar_url} />
          <AvatarFallback className="bg-blue-500 text-white">
            {conversation.other_participant?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-blue-900 truncate">
            {conversation.other_participant?.full_name || 'Unknown User'}
          </p>
          {conversation.other_participant?.current_position && (
            <p className="text-xs text-blue-700/70 truncate">
              {conversation.other_participant.current_position}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-blue-700/70">No messages yet. Start the conversation!</div>
        ) : (
          <div>
            <AnimatePresence>
              {messages.map((m, i) => renderMessage(m, i))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
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
                  <Button type="button" variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
              placeholder="Write your message..."
              className="border-white/30 bg-white/30 backdrop-blur-sm focus:border-blue-500 focus:bg-white/40 text-blue-900"
              disabled={sending || uploadingImage}
            />
          </div>
          <Button type="submit" disabled={!newMessage.trim() || sending || uploadingImage} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>
    </div>
  );
}
export default ChatPane;

