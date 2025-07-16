import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import * as Icons from 'lucide-react'; // Importa todos os ícones para uso dinâmico

// Tipos para os dados que virão do Supabase
type Achievement = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  icon_name: string;
  points_reward: number;
  unlocked: boolean; // Adicionamos este campo para controle no frontend
  unlocked_at?: string;
};

// Componente para renderizar um ícone dinamicamente a partir de um nome
const LucideIcon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const IconComponent = (Icons as any)[name];
  // Se o ícone não for encontrado, usa um ícone padrão
  if (!IconComponent) {
    return <Icons.Award {...props} />;
  }
  return <IconComponent {...props} />;
};

export const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // 1. Busca TODAS as conquistas possíveis na tabela 'achievements'
        const { data: allAchievements, error: allError } = await supabase
          .from('achievements')
          .select('*');

        if (allError) throw allError;

        // 2. Busca APENAS as conquistas que o usuário logado já desbloqueou
        // A política de segurança (RLS) que criamos garante que ele só veja as dele
        const { data: userAchievements, error: userError } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at');

        if (userError) throw userError;

        // 3. Junta as duas informações
        const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
        const unlockedTimes: { [key: string]: string } = {};
        userAchievements.forEach(ua => {
            unlockedTimes[ua.achievement_id] = ua.unlocked_at;
        });


        const finalAchievements = allAchievements.map(ach => ({
          ...ach,
          unlocked: unlockedIds.has(ach.id),
          unlocked_at: unlockedTimes[ach.id],
        }));

        setAchievements(finalAchievements);
      } catch (err: any) {
        console.error('Erro ao buscar conquistas:', err);
        setError('Não foi possível carregar as conquistas.');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto p-4 md:p-6">
      <button onClick={() => navigate('/dashboard')} className="text-[#0AFF0F] hover:underline mb-4 inline-block">
        &larr; Voltar para o Dashboard
      </button>

      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Mural de Conquistas 🏆</h1>
        <p className="text-gray-400 mt-2">Aqui estão todas as suas medalhas e desafios.</p>
      </div>

      {loading && <p className="text-center">Carregando conquistas...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(ach => (
            <div
              key={ach.id}
              // Aplica estilo diferente se a conquista estiver desbloqueada
              className={`bg-[#1E1E1E] rounded-xl p-6 border transition-all duration-300 ${
                ach.unlocked 
                ? 'border-[#0AFF0F] shadow-lg shadow-[#0AFF0F]/10' 
                : 'border-gray-700 opacity-60'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    ach.unlocked ? 'bg-[#0AFF0F]/10' : 'bg-gray-700'
                }`}>
                  <LucideIcon name={ach.icon_name} className={`w-10 h-10 ${
                      ach.unlocked ? 'text-[#0AFF0F]' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className="text-xl font-bold">{ach.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{ach.description}</p>
                <p className={`font-bold mt-4 ${
                    ach.unlocked ? 'text-[#0AFF0F]' : 'text-gray-500'
                }`}>
                    + {ach.points_reward} pts
                </p>
                {ach.unlocked && ach.unlocked_at && (
                    <p className="text-xs text-gray-500 mt-2">
                        Desbloqueado em: {new Date(ach.unlocked_at).toLocaleDateString('pt-BR')}
                    </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};