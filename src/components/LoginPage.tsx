import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#272525] text-white">
      {/* Lado visual com imagem */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#1E1E1E] p-10">
        <BookOpen className="w-16 h-16 text-[#0AFF0F] mb-4" />
        <h2 className="text-3xl font-bold mb-2">Bem-vindo ao Método VAP</h2>
        <p className="text-gray-400 text-center max-w-md">
          Um portal completo para transformar seu aprendizado com gamificação, estatísticas e muito mais.
        </p>
      </div>

      {/* Formulário de login */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center w-full md:w-1/2 p-8"
      >
        <div className="bg-[#1E1E1E] p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#0AFF0F]">Acessar o Portal</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-gray-300">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded bg-[#272525] border border-gray-600 focus:outline-none focus:border-[#0AFF0F]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-300">Senha</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded bg-[#272525] border border-gray-600 focus:outline-none focus:border-[#0AFF0F]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0AFF0F] text-black font-semibold py-2 rounded hover:bg-[#0aff0fcc] transition"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
