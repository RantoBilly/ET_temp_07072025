import React from 'react';
import { 
  BarChart3, 
  Heart, 
  Users, 
  Building, 
  Globe, 
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 }
    ];

    if (user?.role === 'employee') {
      baseItems.push({ id: 'declare', label: 'Déclarer mon émotion', icon: Heart });
    }

    if (user?.role === 'manager') {
      baseItems.push({ id: 'team', label: 'Vue équipe', icon: Users });
    }

    if (user?.role === 'director') {
      baseItems.push({ id: 'department', label: 'Vue département', icon: Building });
    }

    if (user?.role === 'pole_director') {
      baseItems.push({ id: 'directions', label: 'Vue directions', icon: Globe });
    }

    baseItems.push(
      { id: 'statistics', label: 'Statistiques', icon: TrendingUp },
      { id: 'settings', label: 'Paramètres', icon: Settings }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-primary text-secondary font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-accent hover:text-secondary'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 px-4">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;