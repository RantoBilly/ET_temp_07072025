import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, Building, Users, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmotion } from '../../context/EmotionContext';
import { mockUsers, mockDepartments } from '../../data/mockData';
import StatsCard from './StatsCard';
import EmotionChart from '../Charts/EmotionChart';
import EmotionCard from './EmotionCard';

const PoleDirectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getEmotionsByTeam, getEmotionStats } = useEmotion();
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [allEmotions, setAllEmotions] = useState<any[]>([]);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Get all departments under this pole director
      const poleDirectorDepartments = mockDepartments.filter(d => d.poleDirectorId === user.id);
      
      // Get all members from these departments
      const allMembers = mockUsers.filter(u => 
        poleDirectorDepartments.some(dept => dept.name === u.department)
      );
      
      // Get all emotions
      const memberIds = allMembers.map(m => m.id);
      const emotions = getEmotionsByTeam(memberIds, selectedPeriod);
      setAllEmotions(emotions);
      
      // Calculate department-specific data
      const departmentStats = poleDirectorDepartments.map(dept => {
        const deptMembers = allMembers.filter(m => m.department === dept.name);
        const deptMemberIds = deptMembers.map(m => m.id);
        const deptEmotions = getEmotionsByTeam(deptMemberIds, selectedPeriod);
        const deptStats = getEmotionStats(deptEmotions);
        
        const employees = deptMembers.filter(m => m.role === 'employee');
        const managers = deptMembers.filter(m => m.role === 'manager');
        const director = deptMembers.find(m => m.role === 'director');
        
        const morale = deptStats.total > 0 ? 
          ((deptStats.happy + deptStats.excited - deptStats.sad - deptStats.stressed - deptStats.tired) / deptStats.total * 100) : 0;
        
        const activeMembers = deptMembers.filter(member => 
          deptEmotions.some(emotion => emotion.userId === member.id)
        ).length;
        
        return {
          ...dept,
          totalMembers: deptMembers.length,
          employees: employees.length,
          managers: managers.length,
          director: director,
          morale,
          participation: deptMembers.length > 0 ? (activeMembers / deptMembers.length * 100) : 0,
          totalDeclarations: deptStats.total,
          stats: deptStats
        };
      });
      
      setDepartmentsData(departmentStats);
    }
  }, [user, selectedPeriod, getEmotionsByTeam, getEmotionStats]);

  const stats = getEmotionStats(allEmotions);
  const totalMembers = departmentsData.reduce((sum, dept) => sum + dept.totalMembers, 0);
  const totalDepartments = departmentsData.length;
  
  const overallMorale = departmentsData.length > 0 ? 
    departmentsData.reduce((sum, dept) => sum + dept.morale, 0) / departmentsData.length : 0;
  
  const avgParticipation = departmentsData.length > 0 ? 
    departmentsData.reduce((sum, dept) => sum + dept.participation, 0) / departmentsData.length : 0;

  const getAlertsCount = () => {
    return departmentsData.filter(dept => 
      dept.morale < -15 || dept.participation < 60
    ).length;
  };

  const alertsCount = getAlertsCount();

  const getMoraleColor = (morale: number) => {
    if (morale >= 20) return 'text-green-600 bg-green-50 border-green-200';
    if (morale >= 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMoraleLabel = (morale: number) => {
    if (morale >= 20) return 'Excellent';
    if (morale >= 0) return 'Correct';
    return 'Critique';
  };

  const getTopPerformingDepartment = () => {
    if (departmentsData.length === 0) return null;
    return departmentsData.reduce((best, current) => 
      current.morale > best.morale ? current : best
    );
  };

  const getBestParticipationDepartment = () => {
    if (departmentsData.length === 0) return null;
    return departmentsData.reduce((best, current) => 
      current.participation > best.participation ? current : best
    );
  };

  const topDepartment = getTopPerformingDepartment();
  const bestParticipation = getBestParticipationDepartment();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent-2 to-primary rounded-xl p-6 text-secondary">
        <h2 className="text-2xl font-bold mb-2">Tableau de bord Directeur de Pôle</h2>
        <p className="opacity-90 mb-2">
          Vue d'ensemble de toutes les directions sous votre responsabilité
        </p>
        <div className="text-sm opacity-75">
          {totalDepartments} départements • {totalMembers} collaborateurs au total
        </div>
        {alertsCount > 0 && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 mt-4 flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span className="text-sm">
              {alertsCount} département{alertsCount > 1 ? 's en' : ' en'} situation critique
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
          subtitle={`Répartis sur ${totalDepartments} départements`}
          icon={Users}
          color="primary"
        />
        
        <StatsCard
          title="Moral général"
          value={`${overallMorale.toFixed(1)}%`}
          subtitle={overallMorale >= 0 ? 'Globalement positif' : 'Nécessite attention'}
          icon={TrendingUp}
          color={overallMorale >= 0 ? 'green' : 'red'}
        />
        
        <StatsCard
          title="Départements en alerte"
          value={alertsCount}
          subtitle={`Sur ${totalDepartments} départements`}
          icon={AlertTriangle}
          color={alertsCount > 0 ? 'red' : 'green'}
        />
        
        <StatsCard
          title="Participation moyenne"
          value={`${avgParticipation.toFixed(1)}%`}
          subtitle="Tous départements confondus"
          icon={BarChart3}
          color="blue"
        />
      </div>

      {/* Top Performers */}
      {(topDepartment || bestParticipation) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topDepartment && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Meilleur moral</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-700">{topDepartment.name}</p>
                <p className="text-green-600">{topDepartment.morale.toFixed(1)}% de moral positif</p>
                <p className="text-sm text-green-600">
                  {topDepartment.totalMembers} collaborateurs • 
                  {topDepartment.participation.toFixed(1)}% de participation
                </p>
              </div>
            </div>
          )}
          
          {bestParticipation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800">Meilleure participation</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-700">{bestParticipation.name}</p>
                <p className="text-blue-600">{bestParticipation.participation.toFixed(1)}% de participation</p>
                <p className="text-sm text-blue-600">
                  {bestParticipation.totalMembers} collaborateurs • 
                  {bestParticipation.morale.toFixed(1)}% de moral
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Departments Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <Building size={20} />
          <span>Performance par département</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departmentsData.map(dept => (
            <div 
              key={dept.id}
              className={`p-6 rounded-lg border-2 transition-all ${getMoraleColor(dept.morale)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-secondary">{dept.name}</h4>
                  <p className="text-sm text-gray-600">
                    {dept.employees} employés • {dept.managers} managers
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMoraleColor(dept.morale)}`}>
                    {getMoraleLabel(dept.morale)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Moral:</span>
                    <span className="font-semibold">{dept.morale.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Participation:</span>
                    <span className="font-semibold">{dept.participation.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Membres:</span>
                    <span className="font-semibold">{dept.totalMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Déclarations:</span>
                    <span className="font-semibold">{dept.totalDeclarations}</span>
                  </div>
                </div>
              </div>

              {/* Emotion mini-chart */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">😊 {dept.stats.happy}</span>
                  <span className="text-purple-600">⭐ {dept.stats.excited}</span>
                  <span className="text-gray-600">😐 {dept.stats.neutral}</span>
                  <span className="text-orange-600">⚡ {dept.stats.stressed}</span>
                  <span className="text-indigo-600">😴 {dept.stats.tired}</span>
                  <span className="text-red-600">😢 {dept.stats.sad}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Emotion Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <Globe size={20} />
          <span>Répartition générale des émotions</span>
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
          emotions={allEmotions}
          type="bar"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Évolution générale des émotions"
        />
        
        <EmotionChart
          emotions={allEmotions}
          type="line"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Tendances temporelles"
        />
      </div>

      <EmotionChart
        emotions={allEmotions}
        type="doughnut"
        period={selectedPeriod === 7 ? 'week' : 'month'}
        title="Vue d'ensemble de tous les pôles"
      />
    </div>
  );
};

export default PoleDirectorDashboard;