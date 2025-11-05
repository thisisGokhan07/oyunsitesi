'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfileRow } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: UserProfileRow | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfileRow>) => Promise<void>;
  isAdmin: boolean;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Try to create profile using RPC function first (more reliable)
        try {
          const { error: rpcError } = await (supabase.rpc as any)('ensure_user_profile', {
            user_uuid: userId,
            display_name: user?.user_metadata?.display_name || 'User',
          });

          if (rpcError) {
            console.log('RPC function not available, trying direct insert:', rpcError.message);
            
            // Fallback: Direct insert (RLS is disabled, so this should work)
            const newProfile: Partial<UserProfileRow> = {
              id: userId,
              display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User',
              role: 'user',
              is_premium: false,
              favorite_content: [],
            };

            const { data: created, error: createError } = await supabase
              .from('user_profiles')
              .insert(newProfile as any)
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              // Don't throw - profile might be created by trigger
              // Just fetch again after a short delay
              setTimeout(async () => {
                const { data: retryData } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', userId)
                  .maybeSingle();
                if (retryData) {
                  setProfile(retryData as UserProfileRow);
                }
              }, 1000);
            } else if (created) {
              setProfile(created as UserProfileRow);
            }
          } else {
            // RPC succeeded, fetch the profile
            const { data: fetched } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            if (fetched) {
              setProfile(fetched as UserProfileRow);
            }
          }
        } catch (error) {
          console.error('Error in profile creation:', error);
        }
      } else {
        setProfile(data as UserProfileRow);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!user) throw new Error('No user logged in');

    // Önce mevcut şifreyi doğrula
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      throw new Error('Mevcut şifre yanlış');
    }

    // Şifreyi güncelle
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;
  }

  async function updateProfile(updates: Partial<UserProfileRow>) {
    if (!user) throw new Error('No user logged in');

    const { error } = await (supabase
      .from('user_profiles')
      .update as any)(updates)
      .eq('id', user.id);

    if (error) throw error;

    await fetchProfile(user.id);
  }

  async function upgradeToPremium(durationMonths: number = 1) {
    if (!user) throw new Error('No user logged in');

    try {
      // Premium bitiş tarihini hesapla
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      // Mevcut premium süresini kontrol et
      const currentExpiresAt = profile?.premium_expires_at 
        ? new Date(profile.premium_expires_at) 
        : null;

      let finalExpiresAt = expiresAt;
      
      // Eğer aktif premium varsa, mevcut süreye ekle
      if (currentExpiresAt && currentExpiresAt > new Date()) {
        finalExpiresAt = new Date(currentExpiresAt);
        finalExpiresAt.setMonth(finalExpiresAt.getMonth() + durationMonths);
      }

      console.log('🔄 Premium upgrade başlatılıyor:', {
        userId: user.id,
        durationMonths,
        expiresAt: finalExpiresAt.toISOString(),
      });

      const { data, error } = await (supabase
        .from('user_profiles')
        .update as any)({
        is_premium: true,
        premium_expires_at: finalExpiresAt.toISOString(),
      })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('❌ Premium upgrade hatası:', error);
        throw error;
      }

      console.log('✅ Premium upgrade başarılı:', data);

      // Profili yeniden yükle
      await fetchProfile(user.id);

      // Güncellenmiş profili kontrol et
      const { data: updatedProfile } = await supabase
        .from('user_profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        console.log('✅ Premium durumu doğrulandı:', updatedProfile);
      } else {
        console.warn('⚠️ Premium durumu doğrulanamadı');
      }
    } catch (error: any) {
      console.error('❌ Premium upgrade exception:', error);
      throw error;
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    changePassword,
    updateProfile,
    upgradeToPremium,
    isAdmin: ['admin', 'super_admin', 'editor', 'moderator'].includes(profile?.role || ''),
    isPremium: profile?.is_premium || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
