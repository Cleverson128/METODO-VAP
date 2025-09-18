import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Save, Loader } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setIsLoading(true);
    setMessage('');

    // 1. Atualiza os metadados do usuário na autenticação do Supabase
    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: { name: name.trim() }
    });

    if (userUpdateError) {
      setMessage('Erro ao atualizar o nome.');
      setIsLoading(false);
      console.error(userUpdateError);
      return;
    }
    
    // 2. Atualiza a tabela 'profiles' se ela também tiver um campo 'name' (opcional, mas bom ter)
    // Se não tiver, pode remover este bloco.
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', user.id);

    if (profileUpdateError) {
        // Não tratamos como um erro fatal, mas registramos no console
        console.error("Aviso: Falha ao atualizar o nome na tabela 'profiles'.", profileUpdateError);
    }

    // 3. Atualiza os dados no app
    await refreshUser();
    
    setIsLoading(false);
    setMessage('Nome atualizado com sucesso!');
  };

  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar para o Dashboard</span>
      </button>

      <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-gray-700">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-[#0AFF0F] rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        
        <form onSubmit={handleUpdateProfile}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#272525] border border-gray-600 rounded-lg p-3 text-white focus:ring-[#0AFF0F] focus:border-[#0AFF0F]"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || name === user.name}
              className="flex items-center justify-center gap-2 bg-[#0AFF0F] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#0AFF0F]/90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              <span>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
            {message && <p className="text-sm text-green-400">{message}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};