import React, { useState, useMemo, useEffect } from 'react'; // Adicione useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { modules as staticModules } from '../data/modules';
import { ModuleCard } from './ModuleCard';
import { GamificationInfoModal } from './GamificationInfoModal';
import { Trophy, Target, BookOpen, Star, Award, TrendingUp, LogOut, ShieldCheck, UserCog, KeyRound, FileDown, HelpCircle } from 'lucide-react';
import { checkAndRewardGoals } from '../lib/gamification'; // Importe a nova função
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const {
    completedModules: completedModuleIds = [],
    totalPoints = 0,
    level = 1,
    achievements = [],
  } = user || {};
useEffect(() => {
    const checkGoals = async () => {
      if (user) {
        const goalsWereCompleted = await checkAndRewardGoals(user);
        if (goalsWereCompleted) {
          // Se alguma meta foi cumprida, atualiza os dados da UI
          refreshUser();
        }
      }
    };
    checkGoals();
  }, [user, refreshUser]); // Roda quando o usuário carrega
  const modules = useMemo(() => {
    return staticModules.map(module => {
        const isCompleted = completedModuleIds.includes(module.id);
        const isUnlocked = module.id === 1 || completedModuleIds.includes(module.id - 1);
        return { ...module, completed: isCompleted, locked: !isUnlocked };
    });
  }, [completedModuleIds]);

  const completedModulesCount = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const progressPercentage = totalModules > 0 ? (completedModulesCount / totalModules) * 100 : 0;
  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length || 0;

  const handleModuleClick = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (module && !module.locked) { navigate(`/module/${moduleId}`); }
  };
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const { data, error } = await supabase.storage.from('pdfs-cursos').download('metodo-vap.pdf');
      if (error) throw error;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'O-Metodo-VAP.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar o PDF:', error);
      setDownloadError('Falha no download. Verifique sua conexão ou tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getNextLevel = () => {
    const pointsForNext = level * 500;
    const pointsNeeded = pointsForNext - totalPoints;
    return { pointsNeeded: Math.max(pointsNeeded, 0) };
  };

  const { pointsNeeded } = getNextLevel();

  return (
    <>
      <div className="space-y-8 p-4 md:p-6">
        <div className="flex justify-end gap-2">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-lg hover:bg-[#0AFF0F]/10 transition-colors"><ShieldCheck className="w-4 h-4" /> Painel Admin</button>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-lg hover:bg-[#0AFF0F]/10 transition-colors"><LogOut className="w-4 h-4" /> Sair</button>
        </div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bem-vindo de volta, {user?.name}! 👋</h1>
          <p className="text-gray-400 text-lg md:text-xl">Continue sua jornada de aprendizado no Método VAP</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-gradient-to-r from-[#1E1E1E] to-[#0AFF0F]/5 rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div><h3 className="text-xl font-bold mb-2">Seu Progresso no Curso</h3><p className="text-gray-400">{completedModulesCount} de {totalModules} módulos concluídos</p></div>
            <div className="w-full md:w-64"><div className="flex items-center justify-between text-sm mb-2"><span>Progresso</span><span className="font-medium">{Math.round(progressPercentage)}%</span></div><div className="bg-gray-700 rounded-full h-3"><motion.div className="bg-[#0AFF0F] h-3 rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1, delay: 0.5 }} /></div></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 hover:border-[#0AFF0F]/50 transition-colors"><div className="flex items-center space-x-3 mb-4"><div className="w-12 h-12 bg-[#0AFF0F]/10 rounded-lg flex items-center justify-center"><Trophy className="w-6 h-6 text-[#0AFF0F]" /></div><div><p className="text-gray-400 text-sm">Total de Pontos</p><p className="text-2xl font-bold">{totalPoints}</p></div></div>{pointsNeeded > 0 && (<div className="text-xs text-gray-500">{pointsNeeded} pts para o próximo nível</div>)}</div>
          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 hover:border-[#0AFF0F]/50 transition-colors"><div className="flex items-center space-x-3 mb-4"><div className="w-12 h-12 bg-[#0AFF0F]/10 rounded-lg flex items-center justify-center"><Target className="w-6 h-6 text-[#0AFF0F]" /></div><div><p className="text-gray-400 text-sm">Nível Atual</p><p className="text-2xl font-bold">{level}</p></div></div><div className="flex items-center space-x-2"><div className="flex-1 bg-gray-700 rounded-full h-2"><div className="bg-[#0AFF0F] h-2 rounded-full" style={{ width: `${(totalPoints % 500) / 5}%` }} /></div><Star className="w-4 h-4 text-[#0AFF0F]" /></div></div>
          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 hover:border-[#0AFF0F]/50 transition-colors"><div className="flex items-center space-x-3 mb-4"><div className="w-12 h-12 bg-[#0AFF0F]/10 rounded-lg flex items-center justify-center"><Award className="w-6 h-6 text-[#0AFF0F]" /></div><div><p className="text-gray-400 text-sm">Conquistas</p><p className="text-2xl font-bold">{unlockedAchievementsCount}/10</p></div></div><div className="flex items-center space-x-1 text-xs text-gray-500"><TrendingUp className="w-3 h-3" /><span>Continue estudando!</span></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Ações e Configurações</h3>
            <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0AFF0F] transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span>Como funciona?</span>
            </button>
          </div>
          {downloadError && (<div className="p-3 mb-4 rounded-lg text-center font-medium bg-red-500/20 text-red-400">{downloadError}</div>)}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <button onClick={() => { const nextModule = modules.find(m => !m.completed && !m.locked); if (nextModule) navigate(`/module/${nextModule.id}`); }} className="flex flex-col items-center justify-center bg-[#0AFF0F] text-black p-4 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors"><BookOpen className="w-6 h-6 mb-2" /><span>Continuar</span></button>
            <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex flex-col items-center justify-center bg-[#272525] border border-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-800 disabled:cursor-wait"><FileDown className="w-6 h-6 mb-2" /><span>{isDownloading ? 'Baixando...' : 'Baixar PDF'}</span></button>
            <button onClick={() => navigate('/conquistas')} className="flex flex-col items-center justify-center bg-[#272525] border border-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"><Trophy className="w-6 h-6 mb-2" /><span>Conquistas</span></button>
            <button onClick={() => navigate('/metas')} className="flex flex-col items-center justify-center bg-[#272525] border border-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"><Target className="w-6 h-6 mb-2" /><span>Metas</span></button>
            <button onClick={() => navigate('/perfil')} className="flex flex-col items-center justify-center bg-[#272525] border border-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"><UserCog className="w-6 h-6 mb-2" /><span>Editar Perfil</span></button>
            <button onClick={() => navigate('/alterar-senha')} className="flex flex-col items-center justify-center bg-[#272525] border border-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"><KeyRound className="w-6 h-6 mb-2" /><span>Alterar Senha</span></button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Módulos do Curso</h2><div className="text-sm text-gray-400">{completedModulesCount}/{totalModules} concluídos</div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (<ModuleCard key={module.id} module={module} onClick={() => handleModuleClick(module.id)} index={index} />))}
          </div>
        </motion.div>
        {user?.achievements && user.achievements.some(a => a.unlocked) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Conquistas Recentes 🏆</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (<div key={achievement.id} className="flex items-center space-x-3 bg-[#0AFF0F]/10 border border-[#0AFF0F] rounded-lg p-4"><div className="w-10 h-10 bg-[#0AFF0F] rounded-lg flex items-center justify-center"><Trophy className="w-5 h-5 text-black" /></div><div><p className="font-medium text-[#0AFF0F]">{achievement.title}</p><p className="text-sm text-gray-400">{achievement.description}</p></div></div>))}
            </div>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {showInfoModal && <GamificationInfoModal onClose={() => setShowInfoModal(false)} />}
      </AnimatePresence>
    </>
  );
};