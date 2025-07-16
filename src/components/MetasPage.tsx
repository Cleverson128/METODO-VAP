import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Target, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipo para os dados de uma meta
type Goal = {
  id: string;
  description: string;
  is_completed: boolean;
};

export const MetasPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('study_goals')
          .select('id, description, is_completed')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setGoals(data);
      } catch (err: any) {
        setError('Não foi possível carregar as metas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('study_goals')
        .insert({ user_id: user.id, description: newGoal })
        .select()
        .single();

      if (error) throw error;
      setGoals([...goals, data]);
      setNewGoal('');
    } catch (err) {
      setError('Não foi possível adicionar a meta.');
      console.error(err);
    }
  };

  const toggleCompleteGoal = async (goalId: string, currentState: boolean) => {
    try {
      const { data, error } = await supabase
        .from('study_goals')
        .update({ is_completed: !currentState })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      setGoals(goals.map(g => g.id === goalId ? data : g));
    } catch (err) {
      setError('Não foi possível atualizar a meta.');
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Tem certeza que deseja apagar esta meta?')) return;

    try {
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (err) {
      setError('Não foi possível apagar a meta.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-white max-w-3xl mx-auto p-4 md:p-6">
      <button onClick={() => navigate('/dashboard')} className="text-[#0AFF0F] hover:underline mb-4 inline-block">
        &larr; Voltar para o Dashboard
      </button>

      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Minhas Metas de Estudo 🎯</h1>
        <p className="text-gray-400 mt-2">Defina seus objetivos e acompanhe seu progresso.</p>
      </div>
      
      {/* Formulário para adicionar nova meta */}
      <form onSubmit={handleAddGoal} className="flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Ex: Finalizar o Módulo 3 esta semana"
          className="flex-1 p-3 rounded-lg border border-gray-600 bg-[#272525] text-white focus:ring-2 focus:ring-[#0AFF0F] focus:border-[#0AFF0F]"
        />
        <button type="submit" className="bg-[#0AFF0F] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#0AFF0F]/90 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Adicionar</span>
        </button>
      </form>

      {error && <p className="text-center text-red-400">{error}</p>}

      {/* Lista de metas */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#0AFF0F]" />
          </div>
        ) : (
          <AnimatePresence>
            {goals.map(goal => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  goal.is_completed ? 'bg-green-500/10 border-green-500/30' : 'bg-[#1E1E1E] border-gray-700'
                }`}
              >
                <button 
                  onClick={() => toggleCompleteGoal(goal.id, goal.is_completed)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    goal.is_completed ? 'bg-[#0AFF0F] border-[#0AFF0F]' : 'border-gray-500 hover:border-[#0AFF0F]'
                  }`}
                >
                  {goal.is_completed && <Check className="w-5 h-5 text-black" />}
                </button>
                <p className={`flex-1 ${goal.is_completed ? 'line-through text-gray-400' : 'text-white'}`}>
                  {goal.description}
                </p>
                <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && goals.length === 0 && (
          <div className="text-center p-10 border-2 border-dashed border-gray-700 rounded-lg">
            <Target className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <h3 className="font-bold text-lg">Nenhuma meta definida.</h3>
            <p className="text-gray-500">Comece adicionando sua primeira meta de estudo acima!</p>
          </div>
        )}
      </div>
    </div>
  );
};
