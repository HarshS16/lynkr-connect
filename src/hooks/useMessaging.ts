import { useState, useEffect, useCallback } from 'react';
import { messagingAPI } from '@/integrations/supabase/messagingAPI';
import { 
  ConversationWithDetails, 
  Message, 
  CreateMessageData 
} from '@/integrations/supabase/messaging';
import { useToast } from '@/hooks/use-toast';

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messagingAPI.getUserConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to conversation changes
    const subscription = messagingAPI.subscribeToConversations(async (conversation, eventType) => {
      // When a conversation is updated, refresh the conversations list
      await fetchConversations();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchConversations]);

  const createConversation = async (otherUserId: string) => {
    try {
      const conversationId = await messagingAPI.getOrCreateConversation(otherUserId);
      await fetchConversations(); // Refresh conversations
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation
  };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const data = await messagingAPI.getConversationMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, toast]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      
      // Subscribe to new messages
      const subscription = messagingAPI.subscribeToMessages(
        conversationId,
        (message, eventType) => {
          if (eventType === 'INSERT') {
            setMessages(prev => [...prev, message]);
          } else if (eventType === 'UPDATE') {
            setMessages(prev => prev.map(msg => msg.id === message.id ? message : msg));
          } else if (eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== message.id));
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [conversationId, fetchMessages]);

  const sendMessage = async (messageData: CreateMessageData) => {
    try {
      setSending(true);
      const newMessage = await messagingAPI.sendMessage(messageData);
      // Message will be added via subscription
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSending(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!conversationId) throw new Error('No conversation selected');
    
    try {
      const imageUrl = await messagingAPI.uploadMessageImage(file, conversationId);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markAsRead = async () => {
    if (!conversationId) return;
    
    try {
      await messagingAPI.markConversationAsRead(conversationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await messagingAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast({
        title: 'Message deleted',
        description: 'The message has been deleted.',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    uploadImage,
    markAsRead,
    deleteMessage,
    fetchMessages
  };
}
