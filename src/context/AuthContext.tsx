import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { achievements } from '../data/achievements';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('vap-method-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('vap-method-user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Enhanced demo authentication
    if (email && password.length >= 3) {
      const userName = email.includes('@') ? email.split('@')[0] : email;
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        totalPoints: 0,
        level: 1,
        totalTimeStudied: 0,
        completedModules: [],
        achievements: achievements.map(a => ({ ...a, unlocked: false })),
        currentStreak: 0,
        lastStudyDate: new Date().toISOString().split('T')[0]
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('vap-method-user', JSON.stringify(newUser));
    } else {
      throw new Error('Email e senha são obrigatórios');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('vap-method-user');
    localStorage.removeItem('vap-study-sessions');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      
      // Calculate new level based on points
      if (updates.totalPoints !== undefined) {
        updatedUser.level = Math.floor(updates.totalPoints / 500) + 1;
      }
      
      setUser(updatedUser);
      localStorage.setItem('vap-method-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};