import React, { createContext, useContext, useEffect, useState } from 'react';
import { StudySession, ExerciseResult } from '../types';
import { useAuth } from './AuthContext';

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
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
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
        const sessions = JSON.parse(savedSessions);
        setStudySessions(sessions);
      } catch (error) {
        console.error('Error loading study sessions:', error);
      }
    }
    
    if (savedResults) {
      try {
        const results = JSON.parse(savedResults);
        setExerciseResults(results);
      } catch (error) {
        console.error('Error loading exercise results:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (studySessions.length > 0) {
      localStorage.setItem('vap-study-sessions', JSON.stringify(studySessions));
    }
  }, [studySessions]);

  useEffect(() => {
    if (exerciseResults.length > 0) {
      localStorage.setItem('vap-exercise-results', JSON.stringify(exerciseResults));
    }
  }, [exerciseResults]);

  const startSession = (moduleId: number) => {
    const newSession: StudySession = {
      moduleId,
      startTime: new Date(),
      duration: 0
    };
    setCurrentSession(newSession);
  };

  const endSession = () => {
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
    }
  };

  const addExerciseResult = (result: ExerciseResult) => {
    setExerciseResults(prev => {
      const filtered = prev.filter(r => r.moduleId !== result.moduleId);
      return [...filtered, result];
    });
  };

  const getTotalTimeForModule = (moduleId: number): number => {
    return studySessions
      .filter(session => session.moduleId === moduleId && session.duration > 0)
      .reduce((total, session) => total + session.duration, 0);
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