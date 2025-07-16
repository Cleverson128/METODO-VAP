// src/components/GamificationInfoModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, TrendingUp, Star } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const GamificationInfoModal: React.FC<Props> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
          className="bg-[#1E1E1E] rounded-2xl p-8 border border-gray-700 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white max-w-none">
            <h2 className="text-3xl font-bold text-center mb-6 text-[#0AFF0F]">
              Como Funciona a Gamificação? 🚀
            </h2>
            <p>
              Sua jornada de aprendizado no Portal Método VAP é também uma aventura! Cada passo que você dá, cada módulo que completa e cada desafio que supera se transforma em recompensas.
            </p>

            <div className="mt-6 space-y-4">
              {/* Pontos */}
              <div className="flex items-start gap-4">
                <div className="bg-[#0AFF0F]/10 p-3 rounded-lg"><Star className="w-6 h-6 text-[#0AFF0F]" /></div>
                <div>
                  <h3 className="font-bold text-lg">1. Pontos (PTS): Seu Medidor de Esforço</h3>
                  <p>Você ganha pontos por cada ação importante que realiza, como concluir módulos e desbloquear conquistas. Seu total de pontos está sempre visível no topo da página!</p>
                </div>
              </div>

              {/* Níveis */}
              <div className="flex items-start gap-4">
                <div className="bg-[#0AFF0F]/10 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-[#0AFF0F]" /></div>
                <div>
                  <h3 className="font-bold text-lg">2. Níveis: Sua Evolução Profissional</h3>
                  <p>A cada <strong>500 pontos</strong> que você acumula, você sobe de nível automaticamente, demonstrando sua maestria e dedicação ao método.</p>
                </div>
              </div>

              {/* Conquistas */}
              <div className="flex items-start gap-4">
                <div className="bg-[#0AFF0F]/10 p-3 rounded-lg"><Award className="w-6 h-6 text-[#0AFF0F]" /></div>
                <div>
                  <h3 className="font-bold text-lg">3. Conquistas: Suas Medalhas de Honra</h3>
                  <p>São medalhas especiais por atingir marcos importantes (ex: concluir o primeiro módulo). Elas te dão um bônus de pontos e podem ser vistas no seu <strong>Mural de Conquistas</strong>.</p>
                </div>
              </div>
            </div>

            <p className="text-center mt-8 text-lg">
              <strong>Bons estudos, e que comece a jornada!</strong>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
