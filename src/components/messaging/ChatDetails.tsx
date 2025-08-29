import { ConversationWithDetails } from '@/integrations/supabase/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Image as ImageIcon, Link as LinkIcon, Users } from 'lucide-react';
import { useConversationDetails } from '@/hooks/useConversationDetails';

interface ChatDetailsProps {
  conversation?: ConversationWithDetails | null;
}

export function ChatDetails({ conversation: propConversation }: ChatDetailsProps) {
  const { conversation: realTimeConversation } = useConversationDetails(propConversation?.id || null);
  
  // Use real-time conversation if available, otherwise use the prop conversation
  const conversation = realTimeConversation || propConversation;

  if (!conversation) {
    return (
      <Card className="p-6 bg-white/90 backdrop-blur-xl border-blue-100 rounded-2xl text-blue-700 shadow-lg">
        Select a chat to see details
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-white/90 backdrop-blur-xl border-blue-100 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={conversation.other_participant?.avatar_url} />
            <AvatarFallback className="bg-blue-500 text-white">
              {conversation.other_participant?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-blue-900 truncate">{conversation.other_participant?.full_name}</p>
            {conversation.other_participant?.current_position && (
              <p className="text-sm text-blue-700/70 truncate">{conversation.other_participant.current_position}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/90 backdrop-blur-xl border-blue-100 rounded-2xl shadow-lg">
        <p className="font-medium text-blue-900 mb-3">Shared files</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-blue-800 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm">Photos</span>
            <Badge variant="secondary" className="ml-auto">—</Badge>
          </div>
          <div className="flex items-center gap-2 text-blue-800 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Documents</span>
            <Badge variant="secondary" className="ml-auto">—</Badge>
          </div>
          <div className="flex items-center gap-2 text-blue-800 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <LinkIcon className="h-4 w-4" />
            <span className="text-sm">Links</span>
            <Badge variant="secondary" className="ml-auto">—</Badge>
          </div>
          <div className="flex items-center gap-2 text-blue-800 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <Users className="h-4 w-4" />
            <span className="text-sm">Participants</span>
            <Badge variant="secondary" className="ml-auto">2</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ChatDetails;
