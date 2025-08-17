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

    // Get conversations with participants (no nested profile join to avoid FK mismatch)
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user_id,
          last_read_at
        )
      `)
      .in('id', conversationIdList)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Build a set of the "other" participant IDs across conversations
    const otherIds = new Set<string>();
    for (const conv of data as any[]) {
      const participants: { user_id: string }[] = conv.participants || [];
      const other = participants.find(p => p.user_id !== currentUser.user!.id);
      if (other && other.user_id) otherIds.add(other.user_id);
    }
    const idList = Array.from(otherIds);

    // Fetch profiles for all other users (robust: try matching by user_id and by id)
    type Prof = { id: string; user_id: string; full_name?: string | null; avatar_url?: string | null; current_position?: string | null };
    const profileMapByUserId: Record<string, Prof> = {};
    const profileMapById: Record<string, Prof> = {};
    if (idList.length > 0) {
      const [{ data: byUserId, error: e1 }, { data: byId, error: e2 }] = await Promise.all([
        supabase.from('profiles').select('id, user_id, full_name, avatar_url, current_position').in('user_id', idList),
        supabase.from('profiles').select('id, user_id, full_name, avatar_url, current_position').in('id', idList),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      (byUserId || []).forEach((p: any) => {
        profileMapByUserId[p.user_id] = p;
        profileMapById[p.id] = p;
      });
      (byId || []).forEach((p: any) => {
        profileMapByUserId[p.user_id] = p;
        profileMapById[p.id] = p;
      });
    }

    // Get last message for each conversation and attach other participant profile
    const conversationsWithMessages = await Promise.all(
      data.map(async (conversation: any) => {
        const [{ data: lastMessage }, { data: otherMsg }] = await Promise.all([
          supabase
            .from('messages')
            .select(`
              id,
              content,
              message_type,
              created_at,
              sender:profiles(id, full_name, avatar_url)
            `)
            .eq('conversation_id', conversation.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('messages')
            .select(`
              id,
              sender:profiles(id, full_name, avatar_url)
            `)
            .eq('conversation_id', conversation.id)
            .eq('is_deleted', false)
            .neq('sender_id', currentUser.user!.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const other = (conversation.participants || []).find((p: any) => p.user_id !== currentUser.user!.id);
        // Prefer profile from a message sent by the other participant (bypasses participant RLS limits)
        const profFromMsg = otherMsg?.sender as any | null;
        const profFromMap = other ? profileMapByUserId[other.user_id] : null;
        let prof = profFromMsg || profFromMap || null;

        // As a final fallback, fetch profile directly by user_id
        if (!prof && other?.user_id) {
          const { data: directProf } = await supabase
            .from('profiles')
            .select('id, user_id, full_name, avatar_url, current_position')
            .eq('user_id', other.user_id)
            .maybeSingle();
          if (directProf) prof = directProf as any;
        }

        return {
          ...conversation,
          other_participant: prof
            ? {
                id: (prof as any).user_id || (prof as any).id,
                full_name: (prof as any).full_name,
                avatar_url: (prof as any).avatar_url,
                current_position: (prof as any).current_position,
              }
            : (other
                ? { id: other.user_id, full_name: undefined, avatar_url: undefined, current_position: undefined }
                : null),
          last_message: lastMessage || undefined,
        } as ConversationWithDetails;
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
