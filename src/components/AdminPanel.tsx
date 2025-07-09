// src/components/AdminPanel.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Erro ao buscar usuários:', error.message);
      } else {
        setUsers(data as AdminUser[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-bold">Painel de Administração 👑</h1>

      <div className="bg-[#1E1E1E] rounded-xl p-4 border border-gray-700">
        <input
          type="text"
          placeholder="Buscar por email..."
          className="w-full p-2 rounded border border-gray-600 bg-[#272525] text-white"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
