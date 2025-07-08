import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, User, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro no login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('aluno@metodovap.com');
    setPassword('demo123');
    setIsLoading(true);
    setError('');
    
    try {
      await login('aluno@metodovap.com', 'demo123');
    } catch (error) {
      setError('Erro no login demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#272525] flex items-center justify-center px-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8">
            <div className="w-16 h-16 bg-[#0AFF0F] rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Método VAP</h1>
              <p className="text-[#0AFF0F] text-lg font-medium">Portal Educacional</p>
            </div>
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">
            Transforme seu futuro com conhecimento aplicado
          </h2>
          
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Acesse o curso completo com 12 módulos interativos, exercícios práticos e 
            sistema de progresso para maximizar seu aprendizado no Método VAP.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-700">
              <Zap className="w-6 h-6 text-[#0AFF0F] mb-2" />
              <p className="text-white font-medium">12 Módulos</p>
              <p className="text-gray-400 text-sm">Conteúdo completo</p>
            </div>
            <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-700">
              <User className="w-6 h-6 text-[#0AFF0F] mb-2" />
              <p className="text-white font-medium">Progresso</p>
              <p className="text-gray-400 text-sm">Acompanhamento real</p>
            </div>
            <div className="bg-[#1E1E1E] rounded-lg p-4 border border-gray-700">
              <BookOpen className="w-6 h-6 text-[#0AFF0F] mb-2" />
              <p className="text-white font-medium">Certificado</p>
              <p className="text-gray-400 text-sm">Ao completar</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="bg-[#1E1E1E] rounded-2xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Fazer Login</h3>
              <p className="text-gray-400">Acesse sua conta para continuar seus estudos</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-6"
              >
                <p className="text-red-400 text-sm text-center">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#272525] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0AFF0F] focus:ring-1 focus:ring-[#0AFF0F] transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#272525] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0AFF0F] focus:ring-1 focus:ring-[#0AFF0F] transition-colors"
                    placeholder="Sua senha"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0AFF0F] text-black py-3 rounded-lg font-medium hover:bg-[#0AFF0F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar na Plataforma'}
              </motion.button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1E1E1E] text-gray-400">ou</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full mt-4 bg-[#272525] border border-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Testar Demo
              </motion.button>
            </div>

            <div className="mt-6 bg-[#272525] rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">🎓 Acesso Demo:</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Email: qualquer email válido</p>
                <p>Senha: mínimo 3 caracteres</p>
                <p className="text-[#0AFF0F] mt-2">ou clique em "Testar Demo"</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};