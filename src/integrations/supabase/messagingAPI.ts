import { supabase } from './client';
import { 
  Conversation, 
  Message, 
  CreateMessageData, 
  ConversationWithDetails 
} from './messaging';

export const messagingAPI = {
  // Get or create conversation between two users
  async getOrCreateConversation(otherUserId: string): Promise<string> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: currentUser.user.id,
      user2_id: otherUserId
    });

    if (error) throw error;
    return data;
  },

  // Get user's conversations with details
  async getUserConversations(): Promise<ConversationWithDetails[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    // First get conversations where user is a participant
    const { data: conversationIds, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUser.user.id);

    if (participantError) throw participantError;

    if (!conversationIds || conversationIds.length === 0) {
      return [];
    }

    const conversationIdList = conversationIds.map(p => p.conversation_id);

    // Get conversations with participants
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user_id,
          last_read_at,
          user:profiles(id, full_name, avatar_url, current_position)
        )
      `)
      .in('id', conversationIdList)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      data.map(async (conversation) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            message_type,
            created_at,
            sender:profiles(id, full_name)
          `)
          .eq('conversation_id', conversation.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const otherParticipant = conversation.participants?.find(
          p => p.user_id !== currentUser.user!.id
        );

        return {
          ...conversation,
          other_participant: otherParticipant?.user,
          last_message: lastMessage
        };
      })
    );

    return conversationsWithMessages;
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url),
        reply_to_message:messages(
          id,
          content,
          message_type,
          sender:profiles(id, full_name)
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data.reverse(); // Return in chronological order
  },

  // Send a message
  async sendMessage(messageData: CreateMessageData): Promise<Message> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        sender_id: currentUser.user.id
      })
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Upload image for message
  async uploadMessageImage(file: File, conversationId: string): Promise<string> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.user.id}/${conversationId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  // Mark conversation as read
  async markConversationAsRead(conversationId: string): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUser.user.id);

    if (error) throw error;
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(id, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();
  },

  // Subscribe to conversation updates
  subscribeToConversations(callback: (conversation: Conversation) => void) {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          callback(payload.new as Conversation);
        }
      )
      .subscribe();
  }
};
