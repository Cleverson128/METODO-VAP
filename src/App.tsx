// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { Layout } from './components/Layout';
import LoginPage from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ModulePage } from './components/ModulePage';
import { AdminPanel } from './components/AdminPanel';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { MetasPage } from './components/MetasPage';

// Importando as páginas que criamos
import { AchievementsPage } from './components/AchievementsPage';
import { ProfilePage } from './components/ProfilePage'; // Adicione a importação da página de perfil


function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Rota Principal (Dashboard) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rota dos Módulos */}
            <Route
              path="/module/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ModulePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rota do Painel Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rota de Alterar Senha */}
            <Route
              path="/alterar-senha"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChangePasswordPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ROTA DE CONQUISTAS - ADICIONADA CORRETAMENTE */}
            <Route
              path="/conquistas"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AchievementsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ROTA DE PERFIL - ADICIONADA CORRETAMENTE */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* ROTA DE METAS - ADICIONADA CORRETAMENTE */}
            <Route
              path="/metas"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MetasPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rota Coringa - Redireciona para a página inicial */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </StudyProvider>
    </AuthProvider>
  );
}

export default App;
