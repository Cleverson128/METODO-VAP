import { Achievement } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'first-module',
    title: 'Primeiro Passo',
    description: 'Complete seu primeiro módulo do curso',
    icon: 'Trophy',
    unlocked: false,
    points: 50,
    condition: { type: 'modules_completed', value: 1 }
  },
  {
    id: 'streak-3',
    title: 'Dedicação Constante',
    description: 'Complete 3 módulos seguidos',
    icon: 'Flame',
    unlocked: false,
    points: 100,
    condition: { type: 'modules_completed', value: 3 }
  },
  {
    id: 'streak-5',
    title: 'Persistência Exemplar',
    description: 'Complete 5 módulos seguidos',
    icon: 'Target',
    unlocked: false,
    points: 150,
    condition: { type: 'modules_completed', value: 5 }
  },
  {
    id: 'time-warrior',
    title: 'Guerreiro do Tempo',
    description: 'Estude por mais de 10 horas (600 minutos)',
    icon: 'Clock',
    unlocked: false,
    points: 200,
    condition: { type: 'study_time', value: 600 }
  },
  {
    id: 'perfectionist',
    title: 'Perfeccionista',
    description: 'Obtenha 100% em 3 exercícios diferentes',
    icon: 'Star',
    unlocked: false,
    points: 250,
    condition: { type: 'perfect_score', value: 3 }
  },
  {
    id: 'speed-learner',
    title: 'Aprendiz Veloz',
    description: 'Complete um módulo em menos de 30 minutos',
    icon: 'Zap',
    unlocked: false,
    points: 75,
    condition: { type: 'speed', value: 30 }
  },
  {
    id: 'marathon',
    title: 'Maratonista dos Estudos',
    description: 'Estude por mais de 20 horas (1200 minutos)',
    icon: 'Activity',
    unlocked: false,
    points: 300,
    condition: { type: 'study_time', value: 1200 }
  },
  {
    id: 'scholar',
    title: 'Estudioso Dedicado',
    description: 'Complete metade do curso (6 módulos)',
    icon: 'BookOpen',
    unlocked: false,
    points: 400,
    condition: { type: 'modules_completed', value: 6 }
  },
  {
    id: 'master',
    title: 'Mestre do Método VAP',
    description: 'Complete todos os módulos do curso',
    icon: 'Crown',
    unlocked: false,
    points: 500,
    condition: { type: 'modules_completed', value: 12 }
  },
  {
    id: 'legendary',
    title: 'Legenda VAP',
    description: 'Alcance o nível 10 ou superior',
    icon: 'Award',
    unlocked: false,
    points: 600,
    condition: { type: 'modules_completed', value: 10 }
  }
];