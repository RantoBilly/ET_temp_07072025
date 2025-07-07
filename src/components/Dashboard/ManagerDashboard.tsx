import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, Award, UserCheck, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmotion } from '../../context/EmotionContext';
import { mockUsers } from '../../data/mockData';
import StatsCard from './StatsCard';
import EmotionChart from '../Charts/EmotionChart';
import EmotionCard from './EmotionCard';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getEmotionsByTeam, getEmotionStats, getEmotionsByUser } = useEmotion();
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [teamEmotions, setTeamEmotions] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Get team members
      const members = mockUsers.filter(u => u.managerId === user.id);
      setTeamMembers(members);
      
      // Get team emotions
      const memberIds = members.map(m => m.id);
      const emotions = getEmotionsByTeam(memberIds, selectedPeriod);
      setTeamEmotions(emotions);
    }
  }, [user, selectedPeriod, getEmotionsByTeam]);

  const stats = getEmotionStats(teamEmotions);
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(member => 
    teamEmotions.some(emotion => emotion.userId === member.id)
  ).length;

  const getTeamMorale = () => {
    if (stats.total === 0) return 0;
    const positiveEmotions = stats.happy + stats.excited;
    const negativeEmotions = stats.sad + stats.stressed + stats.tired;
    return ((positiveEmotions - negativeEmotions) / stats.total * 100);
  };

  const getAlertsCount = () => {
    // Simple alert calculation - count members with recent negative emotions
    const recentNegativeMembers = teamMembers.filter(member => {
      const memberEmotions = getEmotionsByUser(member.id, 3);
      const negativeCount = memberEmotions.filter(e => 
        ['sad', 'stressed', 'tired'].includes(e.emotion)
      ).length;
      return negativeCount >= 2;
    });
    
    return recentNegativeMembers.length;
  };

  const teamMorale = getTeamMorale();
  const alertsCount = getAlertsCount();

  const getTeamMemberStats = () => {
    return teamMembers.map(member => {
      const memberEmotions = getEmotionsByUser(member.id, selectedPeriod);
      const memberStats = getEmotionStats(memberEmotions);
      const recentEmotions = getEmotionsByUser(member.id, 7);
      const hasRecentNegative = recentEmotions.filter(e => 
        ['sad', 'stressed', 'tired'].includes(e.emotion)
      ).length >= 2;
      
      return {
        ...member,
        totalDeclarations: memberStats.total,
        dominantEmotion: getDominantEmotion(memberStats),
        needsAttention: hasRecentNegative,
        participationRate: (memberStats.total / (selectedPeriod * 2)) * 100
      };
    });
  };

  const getDominantEmotion = (stats: any) => {
    const emotions = ['happy', 'excited', 'neutral', 'stressed', 'tired', 'sad'];
    let maxCount = 0;
    let dominantEmotion = '';
    
    emotions.forEach(emotion => {
      if (stats[emotion] > maxCount) {
        maxCount = stats[emotion];
        dominantEmotion = emotion;
      }
    });
    
    return dominantEmotion || 'neutral';
  };

  const teamMemberStats = getTeamMemberStats();

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'text-green-500 bg-green-50',
      excited: 'text-purple-500 bg-purple-50',
      neutral: 'text-gray-500 bg-gray-50',
      stressed: 'text-orange-500 bg-orange-50',
      tired: 'text-indigo-500 bg-indigo-50',
      sad: 'text-red-500 bg-red-50'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  const getEmotionLabel = (emotion: string) => {
    const labels = {
      happy: 'Heureux',
      excited: 'Excité',
      neutral: 'Neutre',
      stressed: 'Stressé',
      tired: 'Fatigué',
      sad: 'Triste'
    };
    return labels[emotion as keyof typeof labels] || 'Neutre';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent-2 to-primary rounded-xl p-6 text-secondary">
        <h2 className="text-2xl font-bold mb-2">Tableau de bord Manager</h2>
        <p className="opacity-90">
          Département: {user?.department} • {totalMembers} membre{totalMembers > 1 ? 's' : ''} sous votre responsabilité
        </p>
        {alertsCount > 0 && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 mt-4 flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span className="text-sm">
              {alertsCount} membre{alertsCount > 1 ? 's' : ''} nécessite{alertsCount > 1 ? 'nt' : ''} votre attention
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
          title="Membres de l'équipe"
          value={totalMembers}
          subtitle={`${activeMembers} actifs`}
          icon={Users}
          color="primary"
        />
        
        <StatsCard
          title="Moral de l'équipe"
          value={`${teamMorale.toFixed(1)}%`}
          subtitle={teamMorale >= 0 ? 'Positif' : 'À surveiller'}
          icon={TrendingUp}
          color={teamMorale >= 0 ? 'green' : 'red'}
        />
        
        <StatsCard
          title="Alertes"
          value={alertsCount}
          subtitle="Membres à surveiller"
          icon={AlertTriangle}
          color={alertsCount > 0 ? 'red' : 'green'}
        />
        
        <StatsCard
          title="Participation moyenne"
          value={`${((activeMembers / totalMembers) * 100).toFixed(1)}%`}
          subtitle="Taux d'engagement"
          icon={UserCheck}
          color="blue"
        />
      </div>

      {/* Team Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <Users size={20} />
          <span>Vue d'ensemble de l'équipe</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMemberStats.map(member => (
            <div 
              key={member.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                member.needsAttention 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-secondary font-semibold text-sm">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary">{member.name}</h4>
                    <p className="text-xs text-gray-600">{member.email}</p>
                  </div>
                </div>
                {member.needsAttention && (
                  <AlertTriangle size={16} className="text-red-500" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">État dominant:</span>
                  <span className={`text-xs px-2 py-1 rounded ${getEmotionColor(member.dominantEmotion)}`}>
                    {getEmotionLabel(member.dominantEmotion)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Déclarations:</span>
                  <span className="text-sm font-semibold">{member.totalDeclarations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Participation:</span>
                  <span className="text-sm font-semibold">{member.participationRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emotion Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <TrendingUp size={20} />
          <span>Répartition des émotions de l'équipe</span>
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
          emotions={teamEmotions}
          type="bar"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Évolution des émotions de l'équipe"
        />
        
        <EmotionChart
          emotions={teamEmotions}
          type="doughnut"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Répartition globale"
        />
      </div>
    </div>
  );
};

export default ManagerDashboard;