export interface Module {
  id: number;
  title: string;
  description: string;
  videoUrl: string; // Real iframe URL will be provided
  completed: boolean;
  locked: boolean;
  points: number;
  estimatedTime: number; // in minutes
  exerciseFile: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string; // 👈 Adiciona isso
  totalPoints: number;
  level: number;
  totalTimeStudied: number;
  completedModules: number[];
  achievements: Achievement[];
  currentStreak: number;
  lastStudyDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  points: number;
  condition: {
    type: 'modules_completed' | 'study_time' | 'streak' | 'perfect_score' | 'speed';
    value: number;
  };
}

export interface StudySession {
  moduleId: number;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
}

export interface ExerciseResult {
  moduleId: number;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}