import React from 'react';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmotion } from '../../context/EmotionContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { getAlerts } = useEmotion();
  const alerts = getAlerts();
  const unreadAlerts = alerts.filter(a => !a.resolved).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-secondary font-bold text-sm">ET</span>
            </div>
            <h1 className="text-xl font-bold text-secondary">Emotion Tracker</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-secondary transition-colors">
            <Bell size={20} />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-secondary">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === 'pole_director' ? 'Directeur de Pôle' : 
                 user?.role === 'director' ? 'Directeur' :
                 user?.role === 'manager' ? 'Manager' : 'Employé'}
              </p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={16} className="text-secondary" />
            </div>
          </div>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:text-secondary transition-colors">
            <Settings size={20} />
          </button>

          {/* Logout */}
          <button 
            onClick={logout}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;