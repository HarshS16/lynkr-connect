import { supabase } from './client';

// Table: saved_posts (id uuid pk, user_id uuid, post_id uuid, created_at timestamptz)

export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') {
    console.error('isPostSaved error', error);
  }
  return !!data;
}

export async function savePost(userId: string, postId: string) {
  const { error } = await supabase
    .from('saved_posts')
    .insert({ user_id: userId, post_id: postId });
  if (error) throw error;
}

export async function unsavePost(userId: string, postId: string) {
  const { error } = await supabase
    .from('saved_posts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  if (error) throw error;
}

export async function getSavedPostIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((r) => r.post_id);
}

export async function getSavedPosts(userId: string) {
  const postIds = await getSavedPostIds(userId);
  if (postIds.length === 0) return [] as any[];
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      author_id,
      image_url,
      profiles:author_id (user_id, full_name, avatar_url)
    `)
    .in('id', postIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

