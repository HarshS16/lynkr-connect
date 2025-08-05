import { supabase } from './client';

export async function sendConnectionRequest(requesterId: string, addresseeId: string) {
  return supabase.from('connections').insert({ requester_id: requesterId, addressee_id: addresseeId });
}

export async function getConnections(userId: string) {
  // Get accepted connections for a user
  return supabase
    .from('connections')
    .select('id, requester_id, addressee_id, status, created_at')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');
}

export async function getPendingRequests(userId: string) {
  return supabase
    .from('connections')
    .select('id, requester_id')
    .eq('addressee_id', userId)
    .eq('status', 'pending');
}

export async function respondToRequest(connectionId: string, status: 'accepted' | 'rejected') {
  return supabase.from('connections').update({ status }).eq('id', connectionId);
}