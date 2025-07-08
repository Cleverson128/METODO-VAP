import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Play, Pause, Clock, Trophy, Target, Maximize, Minimize, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { modules } from '../data/modules';

export const ModulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { currentSession, startSession, endSession, getTotalTimeForModule } = useStudy();
  const [showExercises, setShowExercises] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const moduleId = parseInt(id || '0');
  const module = modules.find(m => m.id === moduleId);
  const currentIndex = modules.findIndex(m => m.id === moduleId);
  const nextModule = modules[currentIndex + 1];
  const prevModule = modules[currentIndex - 1];
  const isCompleted = user?.completedModules.includes(moduleId) || false;
  const totalStudyTime = getTotalTimeForModule(moduleId);

  useEffect(() => {
    if (module && !module.locked && !isStudying) {
      handleStartStudy();
    }

    return () => {
      if (currentSession && isStudying) {
        handlePauseStudy();
      }
    };
  }, [module?.id]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  const handleStartStudy = () => {
    if (module) {
      startSession(module.id);
      setIsStudying(true);
    }
  };

  const handlePauseStudy = () => {
    endSession();
    setIsStudying(false);
  };

  const handleCompleteModule = () => {
    if (user && module && !isCompleted) {
      const updatedCompletedModules = [...user.completedModules, module.id];
      const newPoints = user.totalPoints + module.points;
      const newLevel = Math.floor(newPoints / 500) + 1;

      updateUser({
        completedModules: updatedCompletedModules,
        totalPoints: newPoints,
        level: newLevel
      });

      // Unlock next module
      if (nextModule && nextModule.locked) {
        nextModule.locked = false;
      }

      // Show completion feedback
      alert(`🎉 Parabéns! Você completou o ${module.title} e ganhou ${module.points} pontos!`);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!module) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Módulo não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-[#0AFF0F] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (module.locked) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Módulo Bloqueado</h2>
          <p className="text-gray-400 mb-6">Complete os módulos anteriores para desbloquear este conteúdo</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#0AFF0F] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen Modal Component
  const FullscreenModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Fullscreen Header */}
      <div className="bg-[#1E1E1E] border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-[#0AFF0F] rounded-lg flex items-center justify-center text-black font-bold text-sm">
            {module.id}
          </div>
          <div>
            <h2 className="text-lg font-bold">{module.title}</h2>
            <p className="text-sm text-gray-400">
              {!showExercises ? '📺 Aula em Vídeo' : '📝 Exercícios Práticos'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isStudying && !showExercises && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              🔴 Estudando
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <Minimize className="w-4 h-4" />
            <span className="hidden sm:block">Sair da Tela Cheia</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fullscreen Content */}
      <div className="flex-1 bg-black">
        {!showExercises ? (
          // Video Lesson Fullscreen
          <iframe
            src={module.videoUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={`Aula - ${module.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          // Exercises Fullscreen
          <div className="h-full p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-[#0AFF0F]" />
                <h3 className="text-xl font-bold">Exercícios do Módulo {module.id}</h3>
              </div>
              
              <div className="bg-[#1E1E1E] rounded-lg border border-gray-600 h-[calc(100vh-200px)]">
                <iframe
                  src={`/exercises/${module.exerciseFile}`}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  title={`Exercícios - ${module.title}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Footer */}
      <div className="bg-[#1E1E1E] border-t border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex space-x-1 bg-[#272525] rounded-lg p-1">
            <button
              onClick={() => setShowExercises(false)}
              className={`py-2 px-4 rounded-md font-medium transition-colors text-sm ${
                !showExercises 
                  ? 'bg-[#0AFF0F] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📺 Aula
            </button>
            <button
              onClick={() => setShowExercises(true)}
              className={`py-2 px-4 rounded-md font-medium transition-colors text-sm ${
                showExercises 
                  ? 'bg-[#0AFF0F] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📝 Exercícios
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {prevModule && (
              <button
                onClick={() => {
                  setIsFullscreen(false);
                  navigate(`/module/${prevModule.id}`);
                }}
                className="flex items-center space-x-2 bg-[#272525] border border-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            {nextModule && (
              <button
                onClick={() => {
                  setIsFullscreen(false);
                  navigate(`/module/${nextModule.id}`);
                }}
                disabled={nextModule.locked}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  nextModule.locked 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#272525] border border-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={isStudying ? handlePauseStudy : handleStartStudy}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isStudying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-[#0AFF0F] text-black hover:bg-[#0AFF0F]/90'
                }`}
              >
                {isStudying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar Estudo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Iniciar Estudo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#0AFF0F] rounded-lg flex items-center justify-center text-black font-bold text-xl">
                {module.id}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">{module.title}</h1>
                <p className="text-gray-400 mt-1">{module.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 bg-[#272525] px-3 py-2 rounded-lg">
                <Trophy className="w-4 h-4 text-[#0AFF0F]" />
                <span>{module.points} pontos</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#272525] px-3 py-2 rounded-lg">
                <Target className="w-4 h-4 text-[#0AFF0F]" />
                <span>{module.estimatedTime}min estimado</span>
              </div>
              {totalStudyTime > 0 && (
                <div className="flex items-center space-x-2 bg-[#272525] px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-[#0AFF0F]" />
                  <span>{formatTime(totalStudyTime)} estudado</span>
                </div>
              )}
              {isCompleted && (
                <div className="bg-[#0AFF0F]/10 border border-[#0AFF0F] text-[#0AFF0F] px-3 py-2 rounded-lg">
                  ✓ Concluído
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between bg-[#1E1E1E] rounded-lg p-1 border border-gray-700"
        >
          <div className="flex space-x-1 flex-1">
            <button
              onClick={() => setShowExercises(false)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                !showExercises 
                  ? 'bg-[#0AFF0F] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📺 Aula em Vídeo
            </button>
            <button
              onClick={() => setShowExercises(true)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                showExercises 
                  ? 'bg-[#0AFF0F] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📝 Exercícios Práticos
            </button>
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 bg-[#272525] hover:bg-gray-700 px-4 py-3 rounded-lg transition-colors ml-2"
            title="Expandir para tela cheia"
          >
            <Maximize className="w-4 h-4" />
            <span className="hidden sm:block">Tela Cheia</span>
          </button>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-700"
        >
          {!showExercises ? (
            // Video Lesson
            <div className="relative">
              <div className="aspect-video bg-black">
                <iframe
                  src={module.videoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  title={`Aula - ${module.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              {isStudying && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  🔴 Estudando
                </div>
              )}
            </div>
          ) : (
            // Exercises
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-[#0AFF0F]" />
                <h3 className="text-xl font-bold">Exercícios do Módulo {module.id}</h3>
              </div>
              
              <div className="bg-[#272525] rounded-lg border border-gray-600">
                <iframe
                  src={`/exercises/${module.exerciseFile}`}
                  className="w-full h-96 rounded-lg"
                  frameBorder="0"
                  title={`Exercícios - ${module.title}`}
                />
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
                <p className="text-blue-400 text-sm">
                  💡 <strong>Dica:</strong> Complete os exercícios para reforçar seu aprendizado. 
                  As respostas são verificadas automaticamente no próprio exercício.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            {prevModule && (
              <button
                onClick={() => navigate(`/module/${prevModule.id}`)}
                className="flex items-center space-x-2 bg-[#272525] border border-gray-600 hover:bg-gray-700 px-4 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Módulo Anterior</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isCompleted && (
              <button
                onClick={handleCompleteModule}
                className="flex items-center space-x-2 bg-[#0AFF0F] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Marcar como Concluído</span>
              </button>
            )}

            {nextModule && (
              <button
                onClick={() => navigate(`/module/${nextModule.id}`)}
                disabled={nextModule.locked}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  nextModule.locked 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#272525] border border-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>Próximo Módulo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && <FullscreenModal />}
    </>
  );
};