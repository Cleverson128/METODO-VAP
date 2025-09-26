import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Trophy, Maximize, Minimize, X } from 'lucide-react';
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
    const currentModule = staticModules.find(m => m.id === moduleId);
    if (!currentModule) return { module: undefined, nextModule: undefined, prevModule: undefined, isCompleted: false };

    const currentIndex = staticModules.findIndex(m => m.id === moduleId);
    const nextMod = staticModules[currentIndex + 1];
    const prevMod = staticModules[currentIndex - 1];
    
    return {
      module: { ...currentModule, locked: !(currentModule.id === 1 || completedModuleIds.includes(currentModule.id - 1)) },
      nextModule: nextMod ? { ...nextMod, locked: !completedModuleIds.includes(currentModule.id) } : undefined,
      prevModule: prevMod,
      isCompleted: completedModuleIds.includes(moduleId)
    };
  }, [moduleId, user?.completedModules]);

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
      let finalPoints = user.totalPoints + module.points;
      let finalLevel = Math.floor(finalPoints / 500) + 1;

      await supabase.from('profiles').update({
        completed_modules: updatedCompletedModules,
        total_points: finalPoints,
        level: finalLevel,
      }).eq('id', user.id);

      const { data: allDbAchievements } = await supabase.from('achievements').select('id, slug, points_reward');
      const { data: unlockedData } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id);
      
      const unlockedUUIDs = new Set((unlockedData || []).map(a => a.achievement_id));
      const achievementsToCheck = (allDbAchievements || []).filter(a => !unlockedUUIDs.has(a.id));
      
      let newlyUnlocked = [];
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
          bonusPoints += ach.points_reward;
        }
      }

      if (newlyUnlocked.length > 0) {
        await supabase.from('user_achievements').insert(newlyUnlocked);
        
        await supabase.from('profiles').update({
          total_points: finalPoints + bonusPoints
        }).eq('id', user.id);
        
        alert(`Parabéns! Você desbloqueou ${newlyUnlocked.length} nova(s) conquista(s)!`);
      }

      setCompletionInfo({ title: module.title, points: module.points });
      await refreshUser();

    } catch (error) {
      console.error("ERRO CRÍTICO no processo de conclusão:", error);
      alert("Ocorreu um erro ao salvar seu progresso. Por favor, tente novamente.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (!module) { return <div className="text-center p-8">Módulo não encontrado.</div>; }
  if (module.locked) { return <div className="text-center p-8">Este módulo está bloqueado.</div>; }

  const FullscreenModal = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-[#1E1E1E] border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-[#0AFF0F] rounded-lg flex items-center justify-center text-black font-bold text-sm">{module.id}</div>
          <div>
            <h2 className="text-lg font-bold">{module.title}</h2>
            <p className="text-sm text-gray-400">{!showExercises ? '📺 Aula do Módulo' : '📝 Exercícios Práticos'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
            <button onClick={toggleFullscreen} className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                <Minimize className="w-4 h-4" />
                <span className="hidden sm:block">Sair da Tela Cheia</span>
            </button>
            {/* CORREÇÃO: A função aqui deve ser 'toggleFullscreen' para fechar o modal. */}
            <button onClick={toggleFullscreen} className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>
      <div className="flex-1 bg-black">
        {!showExercises ? (
            <iframe src={module.videoUrl} className="w-full h-full" frameBorder="0" allowFullScreen title={`Aula - ${module.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        ) : (
            <div className="h-full p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6"><FileText className="w-6 h-6 text-[#0AFF0F]" /><h3 className="text-xl font-bold">Exercícios do Módulo {module.id}</h3></div>
                    <div className="bg-[#1E1E1E] rounded-lg border border-gray-600 h-[calc(100vh-200px)]">
                        <iframe src={`/exercises/${module.exerciseFile}?moduleId=${module.id}`} className="w-full h-full rounded-lg" frameBorder="0" title={`Exercícios - ${module.title}`} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /><span>Voltar ao Dashboard</span></button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4"><div className="w-16 h-16 bg-[#0AFF0F] rounded-lg flex items-center justify-center text-black font-bold text-xl">{module.id}</div><div><h1 className="text-2xl lg:text-3xl font-bold">{module.title}</h1><p className="text-gray-400 mt-1">{module.description}</p></div></div>
            <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-[#272525] px-3 py-2 rounded-lg"><Trophy className="w-4 h-4 text-[#0AFF0F]" /><span>{module.points} pontos</span></div>
                {isCompleted && <div className="bg-[#0AFF0F]/10 border border-[#0AFF0F] text-[#0AFF0F] px-3 py-2 rounded-lg">✓ Concluído</div>}
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center justify-between bg-[#1E1E1E] rounded-lg p-1 border border-gray-700">
            <div className="flex space-x-1 flex-1">
                <button onClick={() => setShowExercises(false)} className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${!showExercises ? 'bg-[#0AFF0F] text-black' : 'text-gray-400 hover:text-white'}`}>📚 Aulas do Módulo</button>
                <button onClick={() => setShowExercises(true)} className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${showExercises ? 'bg-[#0AFF0F] text-black' : 'text-gray-400 hover:text-white'}`}>📝 Exercícios Práticos</button>
            </div>
            <button onClick={toggleFullscreen} className="flex items-center space-x-2 bg-[#272525] hover:bg-gray-700 px-4 py-3 rounded-lg transition-colors ml-2" title="Expandir para tela cheia">
                <Maximize className="w-4 h-4" />
                <span className="hidden sm:block">Tela Cheia</span>
            </button>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-gray-700">{!showExercises ? <div className="relative"><div className="aspect-video bg-black"><iframe src={module.videoUrl} className="w-full h-full" frameBorder="0" allowFullScreen title={`Aula - ${module.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" /></div></div> : <div className="p-6"><div className="flex items-center space-x-3 mb-6"><FileText className="w-6 h-6 text-[#0AFF0F]" /><h3 className="text-xl font-bold">Exercícios do Módulo {module.id}</h3></div><div className="bg-[#272525] rounded-lg border border-gray-600"><iframe src={`/exercises/${module.exerciseFile}?moduleId=${module.id}`} className="w-full h-96 rounded-lg" frameBorder="0" title={`Exercícios - ${module.title}`} /></div><div className="mt-4 p-4 bg-blue-500/10 border border-blue-500 rounded-lg"><p className="text-blue-400 text-sm">💡 <strong>Dica:</strong> Complete os exercícios para reforçar seu aprendizado. As respostas são verificadas automaticamente no próprio exercício.</p></div></div>}</motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="flex items-center justify-between"><div className="flex items-center space-x-4">{prevModule && <button onClick={() => navigate(`/module/${prevModule.id}`)} className="flex items-center space-x-2 bg-[#272525] border border-gray-600 hover:bg-gray-700 px-4 py-3 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4" /><span>Módulo Anterior</span></button>}</div><div className="flex items-center space-x-4">{!isCompleted && <button onClick={handleCompleteModule} disabled={isCompleting} className="flex items-center space-x-2 bg-[#0AFF0F] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"><CheckCircle className="w-4 h-4" /><span>{isCompleting ? 'Salvando...' : 'Marcar como Concluído'}</span></button>}{nextModule && <button onClick={() => navigate(`/module/${nextModule.id}`)} disabled={nextModule.locked} className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${nextModule.locked ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#272525] border border-gray-600 hover:bg-gray-700'}`}><ArrowRight className="w-4 h-4" /><span>Próximo Módulo</span></button>}</div></motion.div>
      </div>

      <AnimatePresence>
        {completionInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} className="bg-[#1E1E1E] rounded-2xl p-8 border border-[#0AFF0F] text-center max-w-sm w-full shadow-2xl shadow-[#0AFF0F]/20">
              <CheckCircle className="w-16 h-16 text-[#0AFF0F] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Módulo Concluído!</h2>
              {/* CORREÇÃO: Corrigido erro de digitação e adicionada a tag de fechamento </p>. */}
              <p className="text-gray-300">Você completou com sucesso o módulo "{completionInfo.title}".</p>
              <p className="text-xl font-bold text-[#0AFF0F] my-4">+{completionInfo.points} pontos</p>
              <button onClick={() => setCompletionInfo(null)} className="mt-6 bg-[#0AFF0F] text-black w-full px-6 py-3 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors">Continuar</button>
            </motion.div>
          </motion.div>
        )}
        {isFullscreen && <FullscreenModal />}
      </AnimatePresence>
    </>
  );
};