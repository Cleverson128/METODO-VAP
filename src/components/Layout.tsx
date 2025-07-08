import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen, Trophy, Clock, Star } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const unlockedAchievements = user?.achievements.filter(a => a.unlocked).length || 0;

  return (
    <div className="min-h-screen bg-[#272525] text-white">
      {/* Header */}
      <header className="bg-[#1E1E1E] border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-[#1E1E1E]/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-[#0AFF0F] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Método VAP</h1>
                <p className="text-xs text-gray-400">Portal Educacional</p>
              </div>
            </motion.div>
            
            {user && (
              <motion.div 
                className="flex items-center space-x-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="hidden md:flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 bg-[#272525] px-3 py-2 rounded-lg">
                    <Trophy className="w-4 h-4 text-[#0AFF0F]" />
                    <span className="font-medium">{user.totalPoints}</span>
                    <span className="text-gray-400">pts</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-[#272525] px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-[#0AFF0F]" />
                    <span className="font-medium">{formatTime(user.totalTimeStudied)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-[#272525] px-3 py-2 rounded-lg">
                    <Star className="w-4 h-4 text-[#0AFF0F]" />
                    <span className="font-medium">Nível {user.level}</span>
                  </div>

                  {unlockedAchievements > 0 && (
                    <div className="flex items-center space-x-2 bg-[#0AFF0F]/10 border border-[#0AFF0F] px-3 py-2 rounded-lg">
                      <Trophy className="w-4 h-4 text-[#0AFF0F]" />
                      <span className="font-medium text-[#0AFF0F]">{unlockedAchievements}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#0AFF0F] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                    <span className="hidden sm:block font-medium">{user.name}</span>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Sair</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};