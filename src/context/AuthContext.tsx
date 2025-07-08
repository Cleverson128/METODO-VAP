// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { achievements } from '../data/achievements';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('vap-method-user');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('vap-method-user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const { id, email: userEmail, user_metadata } = data.user;

    const newUser: User = {
      id,
      email: userEmail || '',
      name: user_metadata?.name || 'Usuário',
      totalPoints: 0,
      level: 1,
      totalTimeStudied: 0,
      completedModules: [],
      achievements: achievements.map(a => ({ ...a, unlocked: false })),
      currentStreak: 0,
      lastStudyDate: new Date().toISOString().split('T')[0]
    };

    // Verifica se já existe o usuário na tabela "users"
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar usuário:', fetchError.message);
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('users').insert({
        id,
        email: userEmail,
        name: newUser.name,
        total_points: 0,
        level: 1,
        total_time_studied: 0,
        completed_modules: [],
        current_streak: 0,
        last_study_date: newUser.lastStudyDate
      });
      if (insertError) {
        console.error('Erro ao inserir usuário:', insertError.message);
      }
    }

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('vap-method-user', JSON.stringify(newUser));
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };

    if (updates.totalPoints !== undefined) {
      updated.level = Math.floor(updates.totalPoints / 500) + 1;
    }

    setUser(updated);
    localStorage.setItem('vap-method-user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
