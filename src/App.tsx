import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmotionProvider } from './context/EmotionContext';
import Login from './components/Auth/Login';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import ManagerDashboard from './components/Dashboard/ManagerDashboard';
import DirectorDashboard from './components/Dashboard/DirectorDashboard';
import PoleDirectorDashboard from './components/Dashboard/PoleDirectorDashboard';
import EmotionDeclaration from './components/Employee/EmotionDeclaration';
import Statistics from './components/Statistics/Statistics';
import Settings from './components/Settings/Settings';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 animate-bounce-gentle">
            <span className="text-secondary font-bold text-xl">ET</span>
          </div>
          <p className="text-secondary font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        switch (user.role) {
          case 'employee':
            return <EmployeeDashboard />;
          case 'manager':
            return <ManagerDashboard />;
          case 'director':
            return <DirectorDashboard />;
          case 'pole_director':
            return <PoleDirectorDashboard />;
          default:
            return <EmployeeDashboard />;
        }
      case 'declare':
        return <EmotionDeclaration />;
      case 'team':
        return <ManagerDashboard />;
      case 'department':
        return <DirectorDashboard />;
      case 'directions':
        return <PoleDirectorDashboard />;
      case 'statistics':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      <Header />
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <EmotionProvider>
        <AppContent />
      </EmotionProvider>
    </AuthProvider>
  );
}

export default App;