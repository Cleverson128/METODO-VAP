// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User as AppUser } from '../types';
import { achievements as allAchievementsData } from '../data/achievements';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('total_points, level, completed_modules')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) throw profileError;

      const { data: unlockedAchievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', supabaseUser.id);

      if (achievementsError) throw achievementsError;

      const unlockedIds = new Set(unlockedAchievementsData.map(a => a.achievement_id));
      
      const fullUser: AppUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata.name || 'Usuário',
        totalPoints: profileData.total_points || 0,
        level: profileData.level || 1,
        completedModules: profileData.completed_modules || [],
        achievements: allAchievementsData.map(a => ({ ...a, unlocked: unlockedIds.has(a.id) })),
        totalTimeStudied: 0, 
        currentStreak: 0,
        lastStudyDate: new Date().toISOString().split('T')[0]
      };
      
      setUser(fullUser);
    } catch (error) {
      console.error("AuthContext: Erro ao buscar perfil completo:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const supabaseUser = session?.user;
      if (supabaseUser) {
        fetchUserProfile(supabaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
  const refreshUser = useCallback(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if(session?.user) {
          await fetchUserProfile(session.user);
      }
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
