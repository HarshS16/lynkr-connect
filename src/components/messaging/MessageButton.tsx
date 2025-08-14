import { useState } from 'react';
import { useConversations } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { ChatDialog } from './ChatDialog';
import { ConversationWithDetails } from '@/integrations/supabase/messaging';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageButtonProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
  userPosition?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function MessageButton({ 
  userId, 
  userName, 
  userAvatar, 
  userPosition,
  variant = 'outline',
  size = 'sm',
  className 
}: MessageButtonProps) {
  const { createConversation } = useConversations();
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMessageClick = async () => {
    try {
      setLoading(true);
      const conversationId = await createConversation(userId);
      
      // Create a conversation object for the dialog
      const newConversation: ConversationWithDetails = {
        id: conversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        other_participant: {
          id: userId,
          full_name: userName,
          avatar_url: userAvatar,
          current_position: userPosition
        }
      };
      
      setConversation(newConversation);
      setShowChatDialog(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleMessageClick}
        disabled={loading}
        className={className}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {loading ? 'Starting...' : 'Message'}
      </Button>

      {conversation && (
        <ChatDialog
          open={showChatDialog}
          onOpenChange={setShowChatDialog}
          conversation={conversation}
        />
      )}
    </>
  );
}
