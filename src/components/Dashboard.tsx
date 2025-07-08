import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { modules } from '../data/modules';
import { ModuleCard } from './ModuleCard';
import { Trophy, Target, Clock, BookOpen, Star, Award, Calendar, TrendingUp, LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

 const completedModules = user?.completedModules.length || 0;
  const totalModules = modules.length;
  const progressPercentage = (completedModules / totalModules) * 100;
  const unlockedAchievements = user?.achievements.filter(a => a.unlocked).length || 0;

  const handleModuleClick = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (module && !module.locked) {
      navigate(`/module/${moduleId}`);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getNextLevel = () => {
    const currentLevel = user?.level || 1;
    const pointsForNext = currentLevel * 500;
    const currentPoints = user?.totalPoints || 0;
    const pointsNeeded = pointsForNext - currentPoints;
    return { pointsNeeded: Math.max(pointsNeeded, 0), pointsForNext };
  };

  const { pointsNeeded } = getNextLevel();

  return (
    <div className="space-y-8">
      {/* Top Bar with Logout */}
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-lg hover:bg-[#0AFF0F]/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Bem-vindo de volta, {user?.name}! 👋
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">
          Continue sua jornada de aprendizado no Método VAP
        </p>
      </motion.div>
      
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-[#1E1E1E] to-[#0AFF0F]/5 rounded-2xl p-6 border border-gray-700"
      >
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-xl font-bold mb-2">Seu Progresso no Curso</h3>
            <p className="text-gray-400">{completedModules} de {totalModules} módulos concluídos</p>
          </div>
          <div className="w-full md:w-64">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progresso</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3">
              <motion.div 
                className="bg-[#0AFF0F] h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Points */}
        <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 hover:border-[#0AFF0F]/50 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#0AFF0F]/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#0AFF0F]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total de Pontos</p>
              <p className="text-2xl font-bold">{user?.totalPoints || 0}</p>
            </div>
          </div>
          {pointsNeeded > 0 && (
            <div className="text-xs text-gray-500">
              {pointsNeeded} pts para o próximo nível
            </div>
          )}
        </div>

        {/* Current Level */}
        <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 hover:border-[#0AFF0F]/50 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#0AFF0F]/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-[#0AFF0F]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Nível Atual</p>
              <p className="text-2xl font-bold">{user?.level || 1}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#0AFF0F] h-2 rounded-full"
                style={{ width: `${((user?.totalPoints || 0) % 500) / 5}%` }}
              />
            </div>
            <Star className="w-4 h-4 text-[#0AFF0F]" />
          </div>
        </div>

        {/* Study Time */}
        <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 hover:border-[#0AFF0F]/50 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#0AFF0F]/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#0AFF0F]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tempo de Estudo</p>
              <p className="text-2xl font-bold">{formatTime(user?.totalTimeStudied || 0)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Última atividade hoje</span>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 hover:border-[#0AFF0F]/50 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#0AFF0F]/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-[#0AFF0F]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Conquistas</p>
              <p className="text-2xl font-bold">{unlockedAchievements}/10</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>Continue estudando!</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              const nextModule = modules.find(m => !m.completed && !m.locked);
              if (nextModule) navigate(`/module/${nextModule.id}`);
            }}
            className="bg-[#0AFF0F] text-black p-4 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors"
          >
            <BookOpen className="w-5 h-5 mb-2" />
            Continuar Estudos
          </button>
          <button className="bg-[#272525] border border-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors">
            <Trophy className="w-5 h-5 mb-2" />
            Ver Conquistas
          </button>
          <button className="bg-[#272525] border border-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors">
            <Target className="w-5 h-5 mb-2" />
            Metas de Estudo
          </button>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Módulos do Curso</h2>
          <div className="text-sm text-gray-400">
            {completedModules}/{totalModules} concluídos
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              onClick={() => handleModuleClick(module.id)}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Recent Achievements */}
      {user?.achievements && user.achievements.some(a => a.unlocked) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4">Conquistas Recentes 🏆</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.achievements
              .filter(a => a.unlocked)
              .slice(0, 3)
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 bg-[#0AFF0F]/10 border border-[#0AFF0F] rounded-lg p-4"
                >
                  <div className="w-10 h-10 bg-[#0AFF0F] rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0AFF0F]">{achievement.title}</p>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};