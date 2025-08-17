// import { useState, useEffect, useCallback } from 'react';
// import { messagingAPI } from '@/integrations/supabase/messagingAPI';
// import { 
//   ConversationWithDetails, 
//   Message, 
//   CreateMessageData 
// } from '@/integrations/supabase/messaging';
// import { useToast } from '@/hooks/use-toast';

// export function useConversations() {
//   const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   const fetchConversations = useCallback(async () => {
//     try {
//       setLoading(true);
//       const data = await messagingAPI.getUserConversations();
//       setConversations(data);
//     } catch (error) {
//       console.error('Error fetching conversations:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to load conversations',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   }, [toast]);

//   useEffect(() => {
//     fetchConversations();
//   }, [fetchConversations]);

//   const createConversation = async (otherUserId: string) => {
//     try {
//       const conversationId = await messagingAPI.getOrCreateConversation(otherUserId);
//       await fetchConversations(); // Refresh conversations
//       return conversationId;
//     } catch (error) {
//       console.error('Error creating conversation:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to start conversation',
//         variant: 'destructive',
//       });
//       throw error;
//     }
//   };

//   return {
//     conversations,
//     loading,
//     fetchConversations,
//     createConversation
//   };
// }

// export function useMessages(conversationId: string | null) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   const { toast } = useToast();

//   const fetchMessages = useCallback(async () => {
//     if (!conversationId) return;
    
//     try {
//       setLoading(true);
//       const data = await messagingAPI.getConversationMessages(conversationId);
//       setMessages(data);
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to load messages',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   }, [conversationId, toast]);

//   useEffect(() => {
//     if (conversationId) {
//       fetchMessages();
      
//       // Subscribe to new messages
//       const subscription = messagingAPI.subscribeToMessages(
//         conversationId,
//         (newMessage) => {
//           setMessages(prev => [...prev, newMessage]);
//         }
//       );

//       return () => {
//         subscription.unsubscribe();
//       };
//     }
//   }, [conversationId, fetchMessages]);

//   const sendMessage = async (messageData: CreateMessageData) => {
//     try {
//       setSending(true);
//       const newMessage = await messagingAPI.sendMessage(messageData);
//       // Message will be added via subscription
//       return newMessage;
//     } catch (error) {
//       console.error('Error sending message:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to send message',
//         variant: 'destructive',
//       });
//       throw error;
//     } finally {
//       setSending(false);
//     }
//   };

//   const uploadImage = async (file: File) => {
//     if (!conversationId) throw new Error('No conversation selected');
    
//     try {
//       const imageUrl = await messagingAPI.uploadMessageImage(file, conversationId);
//       return imageUrl;
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to upload image',
//         variant: 'destructive',
//       });
//       throw error;
//     }
//   };

//   const markAsRead = async () => {
//     if (!conversationId) return;
    
//     try {
//       await messagingAPI.markConversationAsRead(conversationId);
//     } catch (error) {
//       console.error('Error marking as read:', error);
//     }
//   };

//   const deleteMessage = async (messageId: string) => {
//     try {
//       await messagingAPI.deleteMessage(messageId);
//       setMessages(prev => prev.filter(msg => msg.id !== messageId));
//       toast({
//         title: 'Message deleted',
//         description: 'The message has been deleted.',
//       });
//     } catch (error) {
//       console.error('Error deleting message:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to delete message',
//         variant: 'destructive',
//       });
//     }
//   };

//   return {
//     messages,
//     loading,
//     sending,
//     sendMessage,
//     uploadImage,
//     markAsRead,
//     deleteMessage,
//     fetchMessages
//   };
// }


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { messagingAPI } from '@/integrations/supabase/messagingAPI';
import {
  ConversationWithDetails,
  Conversation,
  Profile,
  Message,
  CreateMessageData
} from '@/integrations/supabase/messaging';

/**
 * @description Custom hook to fetch and manage user conversations.
 * It hydrates raw conversation data with the details of the other participant.
 */
export function useConversations() {
  const { user } = useAuth(); // Get the current authenticated user
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // 1. Fetch the basic conversations for the current user.
      const rawConversations: Conversation[] = await messagingAPI.getUserConversations();

      if (rawConversations.length === 0) {
        setConversations([]);
        return;
      }

      // 2. Extract the ID of the *other* participant from each conversation.
      const otherParticipantIds = rawConversations.map(convo => {
        const otherParticipant = convo.participants.find(p => p.user_id !== user.id);
        return otherParticipant?.user_id;
      }).filter((id): id is string => !!id); // Filter out any null/undefined IDs to ensure type safety.

      // 3. Fetch the profiles for all other participants in a single, efficient query.
      const profiles: Profile[] = await messagingAPI.getProfilesByIds(otherParticipantIds);
      const profilesMap = new Map(profiles.map(p => [p.id, p]));

      // 4. Combine (hydrate) the raw conversations with the fetched profile data.
      const hydratedConversations = rawConversations.map(convo => {
        const otherParticipant = convo.participants.find(p => p.user_id !== user.id);
        const otherProfile = otherParticipant ? profilesMap.get(otherParticipant.user_id) : null;
        
        return {
          ...convo,
          other_participant: otherProfile,
        };
      });

      setConversations(hydratedConversations);

    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [fetchConversations, user]);

  const createConversation = async (otherUserId: string) => {
    try {
      const conversationId = await messagingAPI.getOrCreateConversation(otherUserId);
      await fetchConversations(); // Refresh the conversation list after creation
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation.',
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

// ---

/**
 * @description Custom hook to fetch, send, and manage messages for a specific conversation.
 * It also handles real-time subscriptions for new messages.
 * @param conversationId The ID of the conversation to manage messages for.
 */
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
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, toast]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      
      // Subscribe to new messages for this conversation in real-time.
      const subscription = messagingAPI.subscribeToMessages(
        conversationId,
        (newMessage) => {
          // Add the new message to the state, ensuring no duplicates.
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      );

      // Unsubscribe when the component unmounts or the conversationId changes.
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [conversationId, fetchMessages]);

  const sendMessage = async (messageData: CreateMessageData) => {
    try {
      setSending(true);
      const newMessage = await messagingAPI.sendMessage(messageData);
      // The new message will be added via the real-time subscription,
      // so no need to manually add it here.
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
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
        description: 'Failed to upload image.',
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
        title: 'Message Deleted',
        description: 'The message has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the message.',
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