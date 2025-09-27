import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Trophy, Maximize, Minimize, X, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { modules as staticModules } from '../data/modules';
import { supabase } from '../lib/supabase';

type CompletionInfo = {
  title: string;
  points: number;
};

export const ModulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { addExerciseResult } = useStudy();
  const [showExercises, setShowExercises] = useState(false);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  const moduleId = parseInt(id || '0');

  const { module, nextModule, prevModule, isCompleted } = useMemo(() => {
    const completedModuleIds = user?.completedModules || [];
    const currentModule = staticModules.find((m) => m.id === moduleId);
    if (!currentModule) return { module: undefined, nextModule: undefined, prevModule: undefined, isCompleted: false };

    const currentIndex = staticModules.findIndex((m) => m.id === moduleId);
    const nextMod = staticModules[currentIndex + 1];
    const prevMod = staticModules[currentIndex - 1];

    return {
      module: {
        ...currentModule,
        locked: !(currentModule.id === 1 || completedModuleIds.includes(currentModule.id - 1)),
      },
      nextModule: nextMod ? { ...nextMod, locked: !completedModuleIds.includes(currentModule.id) } : undefined,
      prevModule: prevMod,
      isCompleted: completedModuleIds.includes(moduleId),
    };
  }, [moduleId, user?.completedModules]);

  useEffect(() => {
    setShowExercises(false); // Reseta para a aba de vídeo ao trocar de módulo
  }, [moduleId]);

  useEffect(() => {
    const handleQuizResult = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'exerciseResult') {
        const newResult = { ...event.data.payload, completedAt: new Date() };
        addExerciseResult(newResult);
        alert(`Pontuação registrada: ${newResult.score} de ${newResult.totalQuestions}!`);
      }
    };
    window.addEventListener('message', handleQuizResult);
    return () => window.removeEventListener('message', handleQuizResult);
  }, [addExerciseResult]);

  const handleCompleteModule = async () => {
    if (!user || !module || isCompleted || isCompleting) return;
    setIsCompleting(true);

    try {
      const updatedCompletedModules = [...user.completedModules, module.id];

      const currentPoints = user.totalPoints ?? 0;
      const modulePoints = module.points ?? 0;
      let finalPoints = currentPoints + modulePoints;
      let finalLevel = Math.floor(finalPoints / 500) + 1;

      await supabase
        .from('profiles')
        .update({
          completed_modules: updatedCompletedModules,
          total_points: finalPoints,
          level: finalLevel,
        })
        .eq('id', user.id);

      const { data: allDbAchievements } = await supabase.from('achievements').select('id, slug, points_reward');
      const { data: unlockedData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      const unlockedUUIDs = new Set((unlockedData || []).map((a) => a.achievement_id));
      const achievementsToCheck = (allDbAchievements || []).filter((a) => !unlockedUUIDs.has(a.id));

      let newlyUnlocked: { user_id: string; achievement_id: string }[] = [];
      let bonusPoints = 0;

      for (const ach of achievementsToCheck) {
        let conditionMet = false;
        if (ach.slug === 'first-module' && updatedCompletedModules.length >= 1) conditionMet = true;
        if (ach.slug === 'streak-3' && updatedCompletedModules.length >= 3) conditionMet = true;
        if (ach.slug === 'streak-5' && updatedCompletedModules.length >= 5) conditionMet = true;
        if (ach.slug === 'scholar' && updatedCompletedModules.length >= 6) conditionMet = true;
        if (ach.slug === 'master' && updatedCompletedModules.length >= 12) conditionMet = true;
        if (ach.slug === 'marathon' && finalPoints >= 1500) conditionMet = true;
        if (ach.slug === 'legendary' && finalLevel >= 10) conditionMet = true;

        if (conditionMet) {
          newlyUnlocked.push({ user_id: user.id, achievement_id: ach.id });
          bonusPoints += ach.points_reward ?? 0;
        }
      }

      if (newlyUnlocked.length > 0) {
        await supabase.from('user_achievements').insert(newlyUnlocked);
        await supabase
          .from('profiles')
          .update({
            total_points: finalPoints + bonusPoints,
          })
          .eq('id', user.id);
        alert(`Parabéns! Você desbloqueou ${newlyUnlocked.length} nova(s) conquista(s)!`);
      }

      setCompletionInfo({ title: module.title, points: module.points ?? 0 });
      await refreshUser();
    } catch (error) {
      console.error('ERRO CRÍTICO no processo de conclusão:', error);
      alert('Ocorreu um erro ao salvar seu progresso. Por favor, tente novamente.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!module) {
    return <div className="text-center p-8">Módulo não encontrado.</div>;
  }
  if (module.locked) {
    return <div className="text-center p-8">Este módulo está bloqueado. Complete o módulo anterior para desbloquear.</div>;
  }

  // ✅ CORREÇÃO APLICADA AQUI
  const exerciseSrc = `/exercises/${module.exerciseFile}?moduleId=${module.id}`;

  const FullscreenModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      <div className="bg-[#1E1E1E] border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-[#0AFF0F] rounded-lg flex items-center justify-center text-black font-bold text-sm">
            {module.id}
          </div>
          <div>
            <h2 className="text-lg font-bold">{module.title}</h2>
            <p className="text-sm text-gray-400">{!showExercises ? '📺 Aula em Vídeo' : '📝 Exercícios Práticos'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
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
      <div className="flex-1 bg-black">
        {!showExercises ? (
          <iframe
            src={module.videoUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={`Aula - ${module.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <iframe
            src={exerciseSrc}
            className="w-full h-full"
            style={{ border: 'none' }}
            title={`Exercícios - ${module.title}`}
          />
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* ✅ UI RECONSTRUÍDA ABAIXO */}
        <header className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para os módulos
            </button>
            <h1 className="text-3xl font-bold">{`Módulo ${module.id}: ${module.title}`}</h1>
            <p className="text-gray-400">{module.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => prevModule && navigate(`/module/${prevModule.id}`)}
              disabled={!prevModule}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => nextModule && navigate(`/module/${nextModule.id}`)}
              disabled={!nextModule || nextModule.locked}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex items-center space-x-2 border-b border-gray-700 mb-4">
            <button onClick={() => setShowExercises(false)} className={`flex items-center space-x-2 py-3 px-4 transition-colors ${!showExercises ? 'border-b-2 border-[#0AFF0F] text-white' : 'text-gray-400 hover:text-white'}`}>
                <Video className="w-5 h-5" />
                <span>Aula</span>
            </button>
            <button onClick={() => setShowExercises(true)} className={`flex items-center space-x-2 py-3 px-4 transition-colors ${showExercises ? 'border-b-2 border-[#0AFF0F] text-white' : 'text-gray-400 hover:text-white'}`}>
                <FileText className="w-5 h-5" />
                <span>Exercícios</span>
            </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-700"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={showExercises ? 'exercises' : 'video'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!showExercises ? (
                <div className="relative group">
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
                  <button onClick={toggleFullscreen} className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="bg-[#272525] rounded-lg border border-gray-600">
                    <iframe
                      src={exerciseSrc}
                      className="w-full h-[80vh] rounded-lg"
                      style={{ border: 'none' }}
                      title={`Exercícios - ${module.title}`}
                    />
                  </div>
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 <strong>Dica:</strong> Complete os exercícios para reforçar seu aprendizado. As respostas são verificadas automaticamente.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        <div className="mt-6 flex justify-center">
            <button
                onClick={handleCompleteModule}
                disabled={isCompleted || isCompleting}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-3 font-bold rounded-lg transition-transform transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed bg-[#0AFF0F] text-black disabled:bg-gray-600 disabled:text-gray-400"
            >
                {isCompleting ? (
                    <span>Salvando...</span>
                ) : isCompleted ? (
                    <>
                        <CheckCircle className="w-6 h-6" />
                        <span>Módulo Concluído!</span>
                    </>
                ) : (
                    <>
                        <Trophy className="w-6 h-6" />
                        <span>Concluir Módulo e Ganhar {module.points} Pontos</span>
                    </>
                )}
            </button>
        </div>

      </div>

      <AnimatePresence>
        {completionInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#1E1E1E] border border-[#0AFF0F] rounded-2xl p-8 text-center max-w-md w-full relative">
                <Trophy className="w-16 h-16 text-[#0AFF0F] mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
                <p className="text-gray-300 mb-4">Você concluiu o módulo "{completionInfo.title}" com sucesso.</p>
                <div className="bg-black/40 rounded-lg p-4 mb-6">
                    <p className="text-lg">Você ganhou</p>
                    <p className="text-4xl font-bold text-[#0AFF0F]">{completionInfo.points} PONTOS</p>
                </div>
                <button 
                    onClick={() => setCompletionInfo(null)} 
                    className="w-full bg-[#0AFF0F] text-black font-bold py-3 rounded-lg hover:brightness-90 transition-all"
                >
                    Continuar
                </button>
            </div>
          </motion.div>
        )}
        {isFullscreen && <FullscreenModal />}
      </AnimatePresence>
    </>
  );
};