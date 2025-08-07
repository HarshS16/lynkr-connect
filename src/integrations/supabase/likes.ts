import { supabase } from './client';

export async function likePost(postId: string, userId: string) {
  // First create the like
  const { data, error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId })
    .select();

  if (error) return { data: null, error };

  try {
    // Get post author and user info for notification
    const [{ data: post }, { data: user }] = await Promise.all([
      supabase.from('posts').select('author_id').eq('id', postId).single(),
      supabase.from('profiles').select('full_name').eq('user_id', userId).single()
    ]);

    if (post && user) {
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: post.author_id,
        from_user_id: userId,
        type: 'like',
        post_id: postId,
        message: `${user.full_name || 'Someone'} liked your post`
      });

      if (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }

  return { data, error: null };
}

export async function unlikePost(postId: string, userId: string) {
  return supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
}

export async function getLikesCount(postId: string) {
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  return count || 0;
}

export async function getLikers(postId: string) {
  return supabase
    .from('likes')
    .select(`
      user_id,
      profiles:user_id (full_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
}

export async function hasLiked(postId: string, userId: string) {
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('user_id', userId);
  return count ? count > 0 : false;
}