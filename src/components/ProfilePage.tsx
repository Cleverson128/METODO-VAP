// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth(); // Usamos o contexto para obter o usuário
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Popula o campo de nome com o nome atual do usuário
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Atualiza o 'data' (que inclui o nome) nas informações do usuário no Supabase
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { name: name },
    });

    if (updateError) {
      setError(`Erro ao atualizar perfil: ${updateError.message}`);
    } else if (data.user) {
      // IMPORTANTE: Atualiza o usuário no contexto para refletir a mudança em toda a aplicação
      if (updateUser) {
        updateUser(data.user);
      }
      setMessage('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 text-white max-w-2xl mx-auto p-4 md:p-0">
      <button onClick={() => navigate('/dashboard')} className="text-[#0AFF0F] hover:underline mb-4 inline-block">
        &larr; Voltar para o Dashboard
      </button>
      <h1 className="text-3xl font-bold">Editar Perfil</h1>

      <form onSubmit={handleUpdateProfile} className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-700 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-2 rounded border border-gray-600 bg-[#272525] text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded border border-gray-600 bg-[#272525] text-white focus:ring-[#0AFF0F] focus:border-[#0AFF0F]"
          />
        </div>
        <div>
          <button type="submit" disabled={loading} className="w-full bg-[#0AFF0F] text-black p-3 rounded-lg font-bold hover:bg-[#0AFF0F]/90 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
      {message && <p className="text-center text-green-400 mt-4">{message}</p>}
      {error && <p className="text-center text-red-400 mt-4">{error}</p>}
    </div>
  );
};