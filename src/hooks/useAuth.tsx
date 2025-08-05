import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, bio?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateAvatar: (file: File) => Promise<{ error: any, url?: string }>;
  deleteAvatar: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, bio?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    // Create user first
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          bio: bio
        }
      }
    });
    
    if (signUpError) return { error: signUpError };
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateAvatar = async (file: File) => {
    if (!user) return { error: 'Not authenticated' };
    const { data: storageData, error: storageError } = await supabase.storage.from('avatars').upload(`public/${user.id}/${Date.now()}_${file.name}`, file, { upsert: true });
    if (storageError) return { error: storageError };
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storageData.path);
    const avatar_url = urlData.publicUrl;
    const { error } = await supabase.from('profiles').update({ avatar_url }).eq('user_id', user.id);
    return { error, url: avatar_url };
  };

  const deleteAvatar = async () => {
    if (!user) return { error: 'Not authenticated' };
    // Get current avatar_url
    const { data, error: fetchError } = await supabase.from('profiles').select('avatar_url').eq('user_id', user.id).single();
    if (fetchError) return { error: fetchError };
    const avatar_url = data?.avatar_url;
    if (avatar_url) {
      // Extract path from public URL
      const path = avatar_url.split('/storage/v1/object/public/avatars/')[1];
      if (path) {
        await supabase.storage.from('avatars').remove([`public/${user.id}/${path.split('/').pop()}`]);
      }
    }
    const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('user_id', user.id);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updateAvatar, deleteAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}