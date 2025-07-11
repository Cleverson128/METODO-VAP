import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const session = await supabase.auth.getSession();
    const email = session.data.session?.user.email;

    if (!email) {
      setError('Sessão inválida. Faça login novamente.');
      return;
    }

    // Reautenticar usuário
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setError('Senha atual incorreta.');
      return;
    }

    // Alterar senha
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError('Erro ao atualizar senha.');
      return;
    }

    setSuccess('Senha alterada com sucesso!');
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-[#1E1E1E] rounded-xl border border-gray-700 text-white">
      <h2 className="text-2xl font-bold mb-4">Alterar Senha</h2>

      <label className="block mb-2">Senha atual</label>
      <input
        type="password"
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <label className="block mb-2">Nova senha</label>
      <input
        type="password"
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <label className="block mb-2">Confirme a nova senha</label>
      <input
        type="password"
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

      <button
        onClick={handleChangePassword}
        className="bg-[#0AFF0F] text-black px-4 py-2 rounded font-medium"
      >
        Alterar Senha
      </button>
    </div>
  );
};
