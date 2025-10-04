// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User as AppUser, Achievement } from '../types';
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
      // Usamos a tabela 'users' em vez de 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*') 
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) throw profileError;

      const { data: allDbAchievements, error: allAchievementsError } = await supabase
        .from('achievements')
        .select('*');
      
      if (allAchievementsError) throw allAchievementsError;

      const { data: unlockedAchievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', supabaseUser.id);

      if (achievementsError) throw achievementsError;

      const unlockedIds = new Set((unlockedAchievementsData || []).map(a => a.achievement_id));
      
      const userAchievements: Achievement[] = (allDbAchievements || []).map(dbAch => ({
        id: dbAch.slug,
        title: dbAch.title,
        description: dbAch.description,
        icon: dbAch.icon_name,
        points: dbAch.points_reward,
        unlocked: unlockedIds.has(dbAch.id),
        condition: { type: dbAch.slug, value: 0 }
      }));

      const fullUser: AppUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata.name || 'Usuário',
        role: profileData.role || 'user', 
        totalPoints: profileData.total_points || 0,
        level: profileData.level || 1,
        completedModules: profileData.completed_modules || [],
        totalTimeStudied: profileData.total_time_studied || 0,
        achievements: userAchievements,
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

  // Lógica corrigida para interceptar o link de recuperação/invite
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const supabaseUser = session?.user;

      if (supabaseUser) {
        fetchUserProfile(supabaseUser);
        
        // LÓGICA DE REDIRECIONAMENTO PARA PRIMEIRO ACESSO
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            const urlHash = window.location.hash;
            
            // Verifica se o hash da URL contém o token e o tipo 'recovery' ou 'signup'
            if (urlHash.includes('type=recovery') || urlHash.includes('type=signup')) {
                // 1. Limpa o hash da URL para evitar loops e o vazamento do token.
                // Isso não é estritamente necessário para o redirecionamento, mas é boa prática.
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                
                // 2. Redireciona o usuário para a rota de alteração de senha
                // O 'replace' evita que a página de login volte ao histórico
                window.location.replace('/alterar-senha');
                return; // Interrompe o restante da lógica de sessão
            }
        }

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