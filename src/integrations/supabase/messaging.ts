export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participants?: ConversationParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string;
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  message_type: 'text' | 'image' | 'file';
  image_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  reply_to_message_id?: string;
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  reply_to_message?: Message;
}

export interface CreateMessageData {
  conversation_id: string;
  content?: string;
  message_type?: 'text' | 'image' | 'file';
  image_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to_message_id?: string;
}

export interface ConversationWithDetails extends Conversation {
  other_participant?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    current_position?: string;
  };
}
