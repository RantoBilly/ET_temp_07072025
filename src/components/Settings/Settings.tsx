import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    weeklyReports: true,
    alertsEnabled: true,
    teamUpdates: user?.role !== 'employee'
  });
  const [privacy, setPrivacy] = useState({
    shareWithManager: true,
    anonymousMode: false,
    dataRetention: '12months'
  });
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'fr',
    compactMode: false
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ];

  const handleSave = () => {
    // Simulate saving settings
    alert('Paramètres sauvegardés avec succès !');
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      employee: 'Employé',
      manager: 'Manager',
      director: 'Directeur',
      pole_director: 'Directeur de Pôle'
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent-2 to-primary rounded-xl p-6 text-secondary">
        <h2 className="text-2xl font-bold mb-2">Paramètres</h2>
        <p className="opacity-90">
          Personnalisez votre expérience Emotion Tracker
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-secondary font-semibold'
                        : 'text-gray-600 hover:bg-accent hover:text-secondary'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <User size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary">{user?.name}</h3>
                    <p className="text-gray-600">{getRoleLabel(user?.role || '')}</p>
                    <p className="text-sm text-gray-500">{user?.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Département
                    </label>
                    <input
                      type="text"
                      value={user?.department || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Rôle
                    </label>
                    <input
                      type="text"
                      value={getRoleLabel(user?.role || '')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      readOnly
                    />
                  </div>
                </div>

                <div className="bg-accent rounded-lg p-4">
                  <p className="text-sm text-secondary/70">
                    <strong>Note:</strong> Les informations de profil sont gérées par votre administrateur système. 
                    Pour toute modification, veuillez contacter le service RH.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Préférences de notification</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-secondary">Rappels par email</h4>
                        <p className="text-sm text-gray-600">Recevoir un rappel quotidien pour déclarer vos émotions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailReminders}
                          onChange={(e) => setNotifications({...notifications, emailReminders: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-secondary">Rapports hebdomadaires</h4>
                        <p className="text-sm text-gray-600">Recevoir un résumé de vos émotions chaque semaine</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.weeklyReports}
                          onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-secondary">Alertes importantes</h4>
                        <p className="text-sm text-gray-600">Notifications pour les situations nécessitant attention</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.alertsEnabled}
                          onChange={(e) => setNotifications({...notifications, alertsEnabled: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {user?.role !== 'employee' && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-secondary">Mises à jour d'équipe</h4>
                          <p className="text-sm text-gray-600">Notifications sur l'activité de votre équipe</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.teamUpdates}
                            onChange={(e) => setNotifications({...notifications, teamUpdates: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Paramètres de confidentialité</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-secondary">Partage avec le manager</h4>
                        <p className="text-sm text-gray-600">Autoriser votre manager à voir vos déclarations détaillées</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy.shareWithManager}
                          onChange={(e) => setPrivacy({...privacy, shareWithManager: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-secondary">Mode anonyme</h4>
                        <p className="text-sm text-gray-600">Vos données contribuent aux statistiques sans identification personnelle</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy.anonymousMode}
                          onChange={(e) => setPrivacy({...privacy, anonymousMode: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-secondary mb-2">Rétention des données</h4>
                      <p className="text-sm text-gray-600 mb-3">Durée de conservation de vos données émotionnelles</p>
                      <select
                        value={privacy.dataRetention}
                        onChange={(e) => setPrivacy({...privacy, dataRetention: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="3months">3 mois</option>
                        <option value="6months">6 mois</option>
                        <option value="12months">12 mois</option>
                        <option value="24months">24 mois</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Protection des données</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Vos données sont chiffrées et stockées de manière sécurisée. Elles ne sont jamais partagées 
                        avec des tiers sans votre consentement explicite.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Préférences d'affichage</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-secondary mb-2">Thème</h4>
                      <p className="text-sm text-gray-600 mb-3">Choisissez l'apparence de l'interface</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'auto'].map(theme => (
                          <button
                            key={theme}
                            onClick={() => setAppearance({...appearance, theme})}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              appearance.theme === theme
                                ? 'border-primary bg-accent text-secondary'
                                : 'border-gray-200 hover:border-primary hover:bg-accent/50'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-lg mb-1">
                                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🔄'}
                              </div>
                              <div className="text-sm font-medium capitalize">
                                {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Auto'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-secondary mb-2">Langue</h4>
                      <p className="text-sm text-gray-600 mb-3">Langue de l'interface</p>
                      <select
                        value={appearance.language}
                        onChange={(e) => setAppearance({...appearance, language: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-secondary">Mode compact</h4>
                        <p className="text-sm text-gray-600">Affichage plus dense pour les écrans plus petits</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={appearance.compactMode}
                          onChange={(e) => setAppearance({...appearance, compactMode: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-accent-2 transition-colors"
              >
                <Save size={16} />
                <span>Sauvegarder les modifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;