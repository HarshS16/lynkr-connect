import { supabase } from './client';

export async function createComment(postId: string, userId: string, content: string) {
  const { error } = await supabase
    .from('comments')
    .insert({ 
      post_id: postId, 
      user_id: userId, 
      content: content.trim() 
    });

  if (error) return { data: null, error };

  // Create notification for post author
  try {
    const [{ data: post }, { data: commenter }] = await Promise.all([
      supabase.from('posts').select('author_id').eq('id', postId).single(),
      supabase.from('profiles').select('full_name').eq('user_id', userId).single()
    ]);

    if (post && commenter && post.author_id !== userId) {
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: post.author_id,
        from_user_id: userId,
        type: 'comment',
        post_id: postId,
        message: `${commenter.full_name} commented on your post`
      });
      if (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the comment creation if notification fails
      }
    }
  } catch (notifError) {
    console.error('Error creating notification:', notifError);
    // Don't fail the comment creation if notification fails
  }

  return { data: true, error: null };
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles:profiles!comments_user_id_profiles_fkey (
        full_name,
        user_id,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data || [];
}

export async function getCommentsCount(postId: string) {
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  return count || 0;
}

export async function deleteComment(commentId: string, userId: string) {
  return supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);
}

export async function updateComment(commentId: string, userId: string, content: string) {
  return supabase
    .from('comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .eq('user_id', userId);
}
