import React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ExerciseResult, User as AppUser } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { checkAndAwardAchievements } from '../lib/gamification';

interface StudyContextType {
  exerciseResults: ExerciseResult[];
  addExerciseResult: (result: ExerciseResult) => Promise<void>;
  getModuleExerciseScore: (moduleId: number) => number | null;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const fetchInitialData = async (currentUser: AppUser) => {
      const { data } = await supabase
        .from('exercise_results')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (data) {
        const results: ExerciseResult[] = data.map(r => ({
          moduleId: r.module_id,
          score: r.score,
          totalQuestions: r.total_questions,
          completedAt: new Date(r.completed_at),
        }));
        setExerciseResults(results);
      }
    };

    if (user) {
      fetchInitialData(user);
    }
  }, [user]);

  const addExerciseResult = async (result: ExerciseResult) => {
    if (!user) return;

    const updatedResults = [...exerciseResults.filter(r => r.moduleId !== result.moduleId), result];
    setExerciseResults(updatedResults);

    await supabase.from('exercise_results').upsert({
      user_id: user.id,
      module_id: result.moduleId,
      score: result.score,
      total_questions: result.totalQuestions,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,module_id' });
    
    // Busca o perfil mais recente do usuário no banco de dados
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (updatedProfile) {
      const freshUser: AppUser = {
        ...user,
        totalPoints: updatedProfile.total_points,
        level: updatedProfile.level,
        completedModules: updatedProfile.completed_modules,
        totalTimeStudied: updatedProfile.total_time_studied
      };
      
      const { newAchievements } = await checkAndAwardAchievements(freshUser, updatedResults);
      
      if (newAchievements.length > 0) {
        alert(`Parabéns! Você desbloqueou ${newAchievements.length} nova(s) conquista(s)!`);
        await refreshUser();
      }
    }
  };

  const getModuleExerciseScore = (moduleId: number): number | null => {
    const result = exerciseResults.find(r => r.moduleId === moduleId);
    return result ? Math.round((result.score / result.totalQuestions) * 100) : null;
  };

  return (
    <StudyContext.Provider value={{ exerciseResults, addExerciseResult, getModuleExerciseScore }}>
      {children}
    </StudyContext.Provider>
  );
};