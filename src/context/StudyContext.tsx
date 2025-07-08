import React, { createContext, useContext, useEffect, useState } from 'react';
import { StudySession, ExerciseResult } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface StudyContextType {
  currentSession: StudySession | null;
  studySessions: StudySession[];
  exerciseResults: ExerciseResult[];
  startSession: (moduleId: number) => void;
  endSession: () => void;
  addExerciseResult: (result: ExerciseResult) => void;
  getTotalTimeForModule: (moduleId: number) => number;
  getModuleExerciseScore: (moduleId: number) => number | null;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    const savedSessions = localStorage.getItem('vap-study-sessions');
    const savedResults = localStorage.getItem('vap-exercise-results');
    
    if (savedSessions) {
      try {
        setStudySessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Erro ao carregar sessões:', e);
      }
    }
    if (savedResults) {
      try {
        setExerciseResults(JSON.parse(savedResults));
      } catch (e) {
        console.error('Erro ao carregar exercícios:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vap-study-sessions', JSON.stringify(studySessions));
  }, [studySessions]);

  useEffect(() => {
    localStorage.setItem('vap-exercise-results', JSON.stringify(exerciseResults));
  }, [exerciseResults]);

  const startSession = (moduleId: number) => {
    const newSession: StudySession = {
      moduleId,
      startTime: new Date(),
      duration: 0
    };
    setCurrentSession(newSession);
  };

  const endSession = async () => {
    if (currentSession && user) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 60000);

      const completedSession: StudySession = {
        ...currentSession,
        endTime,
        duration: Math.max(duration, 0)
      };

      setStudySessions(prev => [...prev, completedSession]);
      updateUser({
        totalTimeStudied: user.totalTimeStudied + completedSession.duration
      });
      setCurrentSession(null);

      // 💾 Gravar no Supabase
      await supabase.from('progress').insert({
        user_id: user.id,
        module_id: completedSession.moduleId,
        start_time: completedSession.startTime.toISOString(),
        end_time: completedSession.endTime?.toISOString(),
        duration: completedSession.duration
      });
    }
  };

  const addExerciseResult = async (result: ExerciseResult) => {
    setExerciseResults(prev => {
      const filtered = prev.filter(r => r.moduleId !== result.moduleId);
      return [...filtered, result];
    });

    if (user) {
      await supabase.from('stats').upsert({
        user_id: user.id,
        module_id: result.moduleId,
        score: result.score,
        total_questions: result.totalQuestions
      }, {
        onConflict: 'user_id,module_id'
      });
    }
  };

  const getTotalTimeForModule = (moduleId: number): number => {
    return studySessions
      .filter(session => session.moduleId === moduleId)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  const getModuleExerciseScore = (moduleId: number): number | null => {
    const result = exerciseResults.find(r => r.moduleId === moduleId);
    return result ? Math.round((result.score / result.totalQuestions) * 100) : null;
  };

  return (
    <StudyContext.Provider value={{
      currentSession,
      studySessions,
      exerciseResults,
      startSession,
      endSession,
      addExerciseResult,
      getTotalTimeForModule,
      getModuleExerciseScore
    }}>
      {children}
    </StudyContext.Provider>
  );
};
