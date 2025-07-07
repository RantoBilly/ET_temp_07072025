import React, { useState, useEffect } from 'react';
import { Building, TrendingUp, Users, AlertTriangle, BarChart3, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmotion } from '../../context/EmotionContext';
import { mockUsers } from '../../data/mockData';
import StatsCard from './StatsCard';
import EmotionChart from '../Charts/EmotionChart';
import EmotionCard from './EmotionCard';

const DirectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getEmotionsByTeam, getEmotionStats, getEmotionsByUser } = useEmotion();
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [departmentEmotions, setDepartmentEmotions] = useState<any[]>([]);
  const [departmentMembers, setDepartmentMembers] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Get all department members (employees + managers)
      const allMembers = mockUsers.filter(u => u.department === user.department);
      const departmentManagers = allMembers.filter(u => u.role === 'manager');
      const employees = allMembers.filter(u => u.role === 'employee');
      
      setDepartmentMembers(allMembers);
      setManagers(departmentManagers);
      
      // Get department emotions
      const memberIds = allMembers.map(m => m.id);
      const emotions = getEmotionsByTeam(memberIds, selectedPeriod);
      setDepartmentEmotions(emotions);
    }
  }, [user, selectedPeriod, getEmotionsByTeam]);

  const stats = getEmotionStats(departmentEmotions);
  const totalMembers = departmentMembers.length;
  const totalEmployees = departmentMembers.filter(m => m.role === 'employee').length;
  const totalManagers = managers.length;

  const getDepartmentMorale = () => {
    if (stats.total === 0) return 0;
    const positiveEmotions = stats.happy + stats.excited;
    const negativeEmotions = stats.sad + stats.stressed + stats.tired;
    return ((positiveEmotions - negativeEmotions) / stats.total * 100);
  };

  const getManagersPerformance = () => {
    return managers.map(manager => {
      const teamMembers = departmentMembers.filter(m => m.managerId === manager.id);
      const teamIds = teamMembers.map(m => m.id);
      const teamEmotions = getEmotionsByTeam(teamIds, selectedPeriod);
      const teamStats = getEmotionStats(teamEmotions);
      
      const teamMorale = teamStats.total > 0 ? 
        ((teamStats.happy + teamStats.excited - teamStats.sad - teamStats.stressed - teamStats.tired) / teamStats.total * 100) : 0;
      
      const activeMembers = teamMembers.filter(member => 
        teamEmotions.some(emotion => emotion.userId === member.id)
      ).length;
      
      return {
        ...manager,
        teamSize: teamMembers.length,
        teamMorale: teamMorale,
        participation: teamMembers.length > 0 ? (activeMembers / teamMembers.length * 100) : 0,
        totalDeclarations: teamStats.total
      };
    });
  };

  const departmentMorale = getDepartmentMorale();
  const managersPerformance = getManagersPerformance();
  const avgParticipation = managersPerformance.length > 0 ? 
    managersPerformance.reduce((sum, m) => sum + m.participation, 0) / managersPerformance.length : 0;

  const getAlertsCount = () => {
    return managersPerformance.filter(manager => 
      manager.teamMorale < -20 || manager.participation < 50
    ).length;
  };

  const alertsCount = getAlertsCount();

  const getMoraleColor = (morale: number) => {
    if (morale >= 20) return 'text-green-600 bg-green-50';
    if (morale >= 0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMoraleLabel = (morale: number) => {
    if (morale >= 20) return 'Excellent';
    if (morale >= 0) return 'Correct';
    return 'À surveiller';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent-2 to-primary rounded-xl p-6 text-secondary">
        <h2 className="text-2xl font-bold mb-2">Tableau de bord Directeur</h2>
        <p className="opacity-90 mb-2">
          Département: {user?.department}
        </p>
        <div className="text-sm opacity-75">
          {totalEmployees} employés • {totalManagers} managers • {totalMembers} personnes au total
        </div>
        {alertsCount > 0 && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 mt-4 flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span className="text-sm">
              {alertsCount} équipe{alertsCount > 1 ? 's' : ''} nécessite{alertsCount > 1 ? 'nt' : ''} votre attention
            </span>
          </div>
        )}
      </div>

      {/* Period Selection */}
      <div className="flex space-x-2">
        {[7, 14, 30].map(days => (
          <button
            key={days}
            onClick={() => setSelectedPeriod(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === days
                ? 'bg-primary text-secondary'
                : 'bg-white text-gray-600 hover:bg-accent'
            }`}
          >
            {days === 7 ? 'Cette semaine' : days === 14 ? '2 semaines' : 'Ce mois'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total collaborateurs"
          value={totalMembers}
          subtitle={`${totalEmployees} employés, ${totalManagers} managers`}
          icon={Users}
          color="primary"
        />
        
        <StatsCard
          title="Moral du département"
          value={`${departmentMorale.toFixed(1)}%`}
          subtitle={departmentMorale >= 0 ? 'Positif' : 'À améliorer'}
          icon={TrendingUp}
          color={departmentMorale >= 0 ? 'green' : 'red'}
        />
        
        <StatsCard
          title="Équipes en alerte"
          value={alertsCount}
          subtitle={`Sur ${totalManagers} équipes`}
          icon={AlertTriangle}
          color={alertsCount > 0 ? 'red' : 'green'}
        />
        
        <StatsCard
          title="Participation moyenne"
          value={`${avgParticipation.toFixed(1)}%`}
          subtitle="Tous les managers"
          icon={BarChart3}
          color="blue"
        />
      </div>

      {/* Managers Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <Users size={20} />
          <span>Performance des équipes</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managersPerformance.map(manager => (
            <div 
              key={manager.id}
              className={`p-5 rounded-lg border-2 transition-all ${
                manager.teamMorale < -20 || manager.participation < 50
                  ? 'border-red-200 bg-red-50' 
                  : manager.teamMorale >= 20 && manager.participation >= 80
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-secondary font-semibold">
                    {manager.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary">{manager.name}</h4>
                  <p className="text-sm text-gray-600">Manager • {manager.teamSize} membres</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Moral équipe:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getMoraleColor(manager.teamMorale)}`}>
                      {getMoraleLabel(manager.teamMorale)}
                    </span>
                    <span className="text-sm font-semibold">{manager.teamMorale.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Participation:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          manager.participation >= 80 ? 'bg-green-500' : 
                          manager.participation >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(manager.participation, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{manager.participation.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Déclarations:</span>
                  <span className="text-sm font-semibold">{manager.totalDeclarations}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Emotion Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <Building size={20} />
          <span>Répartition des émotions du département</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats).filter(([key]) => key !== 'total').map(([emotion, count]) => (
            <EmotionCard
              key={emotion}
              emotion={emotion as any}
              count={count as number}
              percentage={stats.total > 0 ? ((count as number) / stats.total * 100) : 0}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionChart
          emotions={departmentEmotions}
          type="bar"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Évolution des émotions du département"
        />
        
        <EmotionChart
          emotions={departmentEmotions}
          type="line"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Tendances émotionnelles"
        />
      </div>

      <EmotionChart
        emotions={departmentEmotions}
        type="doughnut"
        period={selectedPeriod === 7 ? 'week' : 'month'}
        title="Vue d'ensemble du département"
      />
    </div>
  );
};

export default DirectorDashboard;