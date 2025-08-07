import { supabase } from './client';

export async function likePost(postId: string, userId: string) {
  const { data, error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId })
    .select();

  if (!error) {
    // Fetch post author for notification
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (post && post.author_id !== userId) {
      await supabase.from('notifications').insert({
        user_id: post.author_id,
        from_user_id: userId,
        type: 'like',
        post_id,
        message: 'Someone liked your post'
      });
    }
  }

  return { data, error };
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