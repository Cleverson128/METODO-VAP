// src/components/AdminPanel.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom'; // Importe o useNavigate

interface AdminUser {
  id: string;
  email: string;
  name: string;
  level: number;
  totalPoints: number;
  totalTimeStudied: number;
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState({ message: '', error: false }); // Estado para feedback
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const fetchUsers = async () => {
      // Nota: Idealmente, você buscaria os dados de uma view ou tabela 'profiles'
      // que não contém informações sensíveis, ao invés da tabela 'users' do auth.
      // Se 'users' for uma tabela pública sua, está correto.
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Erro ao buscar usuários:', error.message);
        setFeedback({ message: `Erro ao buscar usuários: ${error.message}`, error: true });
      } else {
        setUsers(data as AdminUser[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handlePasswordReset = async (email: string) => {
    setFeedback({ message: `Enviando link para ${email}...`, error: false });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/alterar-senha`, // Opcional: para onde o usuário vai depois de clicar no link
    });

    if (error) {
      console.error('Erro ao reenviar senha:', error.message);
      setFeedback({ message: `Erro ao enviar para ${email}: ${error.message}`, error: true });
    } else {
      setFeedback({ message: `Link de redefinição de senha enviado com sucesso para ${email}!`, error: false });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel de Administração 👑</h1>
        {/* Botão para voltar ao Dashboard (Item 7 da sua lista) */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-[#272525] border border-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors">
          &larr; Voltar ao Dashboard
        </button>
      </div>

      <div className="bg-[#1E1E1E] rounded-xl p-4 border border-gray-700">
        <input
          type="text"
          placeholder="Buscar por email..."
          className="w-full p-2 rounded border border-gray-600 bg-[#272525] text-white"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      {/* Exibição da mensagem de feedback */}
      {feedback.message && (
        <div className={`p-3 rounded-lg text-center font-medium ${feedback.error ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {feedback.message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Carregando usuários...</p>
      ) : (
        <div className="overflow-x-auto border border-gray-700 rounded-xl">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-[#272525] text-left text-[#0AFF0F]">
                <th className="p-3">Email</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Nível</th>
                <th className="p-3">Pontos</th>
                <th className="p-3">Tempo Estudado</th>
                <th className="p-3 text-center">Ações</th> {/* Nova Coluna */}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-[#0AFF0F]/5">
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.level}</td>
                  <td className="p-3">{user.totalPoints}</td>
                  <td className="p-3">{user.totalTimeStudied} min</td>
                  <td className="p-3 text-center">
                    {/* Botão de Reenviar Senha */}
                    <button
                      onClick={() => handlePasswordReset(user.email)}
                      className="bg-[#0f63ff] text-white px-3 py-1 rounded font-medium hover:bg-[#0f63ff]/80 transition-colors text-xs"
                    >
                      Reenviar Senha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};