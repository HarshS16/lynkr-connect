import { supabase } from './client';

export async function likePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId });

  if (error) return { data: null, error };

  const [{ data: post }, { data: liker }] = await Promise.all([
    supabase.from('posts').select('author_id').eq('id', postId).single(),
    supabase.from('profiles').select('full_name').eq('user_id', userId).single()
  ]);

  if (post && liker && post.author_id !== userId) {
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: post.author_id,
      from_user_id: userId,
      type: 'like',
      post_id,
      message: `${liker.full_name} liked your post`
    });
    if (notifError) return { data: null, error: notifError };
  }

  return { data: true, error: null };
}

export async function unlikePost(postId: string, userId: string) {
  return supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
}

export async function getLikesCount(postId: string) {
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  return count || 0;
}

export async function hasLiked(postId: string, userId: string) {
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  return !!data;
}

export async function getLikers(postId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('user_id, profiles(full_name, avatar_url)')
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching likers:', error);
    return [];
  }
  return data || [];
}