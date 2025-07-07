import React, { useState } from 'react';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Email ou mot de passe incorrect');
    }
  };

  const demoUsers = [
    { email: 'marie.dupont@company.com', role: 'Employé' },
    { email: 'claire.rousseau@company.com', role: 'Manager' },
    { email: 'isabelle.mercier@company.com', role: 'Directeur' },
    { email: 'dg@company.com', role: 'Directeur de Pôle' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-primary/20 to-accent-2 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Emotion Tracker</h1>
          <p className="text-secondary/70">Plateforme RH de suivi émotionnel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="votre.email@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-secondary font-semibold py-3 px-4 rounded-lg hover:bg-accent-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Demo Users */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-sm font-semibold text-secondary mb-4">Comptes de démonstration :</h3>
          <div className="space-y-2">
            {demoUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(user.email);
                  setPassword('password');
                }}
                className="w-full text-left p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors text-sm"
              >
                <div className="font-medium text-secondary">{user.email}</div>
                <div className="text-xs text-secondary/70">{user.role}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-secondary/50 mt-4">
            Mot de passe pour tous les comptes : <code className="bg-gray-100 px-1 rounded">password</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;