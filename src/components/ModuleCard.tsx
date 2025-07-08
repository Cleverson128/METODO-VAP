import React from 'react';
import { motion } from 'framer-motion';
import { Module } from '../types';
import { Lock, CheckCircle, Play, Clock, Trophy, Target } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface ModuleCardProps {
  module: Module;
  onClick: () => void;
  index: number;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick, index }) => {
  const { getTotalTimeForModule, getModuleExerciseScore } = useStudy();
  
  const totalTime = getTotalTimeForModule(module.id);
  const exerciseScore = getModuleExerciseScore(module.id);
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusColor = () => {
    if (module.completed) return 'border-[#0AFF0F] bg-[#0AFF0F]/5';
    if (module.locked) return 'border-gray-600';
    return 'border-gray-700 hover:border-[#0AFF0F]';
  };

  const getStatusIcon = () => {
    if (module.completed) return <CheckCircle className="w-6 h-6 text-[#0AFF0F]" />;
    if (module.locked) return <Lock className="w-6 h-6 text-gray-400" />;
    return <Play className="w-6 h-6 text-[#0AFF0F]" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={!module.locked ? { scale: 1.02, y: -5 } : {}}
      whileTap={!module.locked ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative bg-[#1E1E1E] rounded-xl p-6 cursor-pointer transition-all duration-300
        border-2 ${getStatusColor()}
        ${module.locked ? 'opacity-60 cursor-not-allowed' : ''}
        shadow-lg hover:shadow-xl
      `}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {getStatusIcon()}
        {exerciseScore !== null && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            exerciseScore >= 80 ? 'bg-[#0AFF0F]/20 text-[#0AFF0F]' : 
            exerciseScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
            'bg-red-500/20 text-red-400'
          }`}>
            {exerciseScore}%
          </div>
        )}
      </div>

      {/* Module Info */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-[#0AFF0F] rounded-lg flex items-center justify-center text-black font-bold text-lg">
            {module.id}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white leading-tight">{module.title}</h3>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{module.description}</p>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-[#0AFF0F]" />
              <span className="text-gray-300">{module.points} pts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-[#0AFF0F]" />
              <span className="text-gray-300">{module.estimatedTime}min</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {totalTime > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-[#0AFF0F]" />
                <span className="text-gray-300">{formatTime(totalTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Labels */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {module.completed && (
              <span className="text-[#0AFF0F] text-xs font-medium bg-[#0AFF0F]/10 px-2 py-1 rounded-full">
                CONCLUÍDO
              </span>
            )}
            {module.locked && (
              <span className="text-gray-400 text-xs font-medium bg-gray-600/20 px-2 py-1 rounded-full">
                BLOQUEADO
              </span>
            )}
            {!module.completed && !module.locked && totalTime > 0 && (
              <span className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-1 rounded-full">
                EM PROGRESSO
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="bg-[#0AFF0F] h-2 rounded-full transition-all duration-500"
            initial={{ width: 0 }}
            animate={{ width: module.completed ? '100%' : totalTime > 0 ? '50%' : '0%' }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};