import React, { useState, useEffect } from 'react';
import { Download, Calendar, Users, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmotion } from '../../context/EmotionContext';
import { mockUsers } from '../../data/mockData';
import EmotionChart from '../Charts/EmotionChart';
import StatsCard from '../Dashboard/StatsCard';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const { getEmotionsByTeam, getEmotionStats, exportData } = useEmotion();
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [statistics, setStatistics] = useState<any>({});

  useEffect(() => {
    if (user) {
      let relevantUsers: any[] = [];
      
      // Get relevant users based on role
      switch (user.role) {
        case 'employee':
          relevantUsers = [user];
          break;
        case 'manager':
          relevantUsers = mockUsers.filter(u => u.managerId === user.id || u.id === user.id);
          break;
        case 'director':
          relevantUsers = mockUsers.filter(u => u.department === user.department);
          break;
        case 'pole_director':
          // Get all users from departments under this pole director
          relevantUsers = mockUsers.filter(u => {
            const userDepartments = ['Marketing', 'IT', 'RH', 'Finance']; // Based on mockData
            return userDepartments.includes(u.department);
          });
          break;
      }
      
      const userIds = relevantUsers.map(u => u.id);
      const emotions = getEmotionsByTeam(userIds, selectedPeriod);
      const stats = getEmotionStats(emotions);
      
      // Calculate additional statistics
      const totalUsers = relevantUsers.length;
      const activeUsers = relevantUsers.filter(u => 
        emotions.some(e => e.userId === u.id)
      ).length;
      
      const participationRate = totalUsers > 0 ? (activeUsers / totalUsers * 100) : 0;
      
      // Group by date for trend analysis
      const dailyStats: Record<string, any> = {};
      emotions.forEach(emotion => {
        if (!dailyStats[emotion.date]) {
          dailyStats[emotion.date] = { happy: 0, sad: 0, neutral: 0, stressed: 0, excited: 0, tired: 0, total: 0 };
        }
        dailyStats[emotion.date][emotion.emotion]++;
        dailyStats[emotion.date].total++;
      });
      
      const avgDailyDeclarations = Object.keys(dailyStats).length > 0 ? 
        Object.values(dailyStats).reduce((sum: number, day: any) => sum + day.total, 0) / Object.keys(dailyStats).length : 0;
      
      setStatistics({
        emotions,
        stats,
        totalUsers,
        activeUsers,
        participationRate,
        avgDailyDeclarations,
        dailyStats,
        relevantUsers
      });
    }
  }, [user, selectedPeriod, getEmotionsByTeam, getEmotionStats]);

  const handleExport = () => {
    exportData(selectedFormat);
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'employee': return 'Statistiques personnelles';
      case 'manager': return 'Statistiques de l\'équipe';
      case 'director': return 'Statistiques du département';
      case 'pole_director': return 'Statistiques générales';
      default: return 'Statistiques';
    }
  };

  const getScope = () => {
    switch (user?.role) {
      case 'employee': return 'Vos données personnelles';
      case 'manager': return `Votre équipe (${statistics.totalUsers} personnes)`;
      case 'director': return `Département ${user?.department} (${statistics.totalUsers} personnes)`;
      case 'pole_director': return `Tous les départements (${statistics.totalUsers} personnes)`;
      default: return '';
    }
  };

  const getMoodTrend = () => {
    if (!statistics.stats) return 0;
    const { happy, excited, sad, stressed, tired, total } = statistics.stats;
    if (total === 0) return 0;
    return ((happy + excited - sad - stressed - tired) / total * 100);
  };

  const getBestDay = () => {
    if (!statistics.dailyStats) return null;
    
    let bestDay = '';
    let bestScore = -Infinity;
    
    Object.entries(statistics.dailyStats).forEach(([date, stats]: [string, any]) => {
      const score = (stats.happy + stats.excited - stats.sad - stats.stressed - stats.tired) / stats.total * 100;
      if (score > bestScore) {
        bestScore = score;
        bestDay = date;
      }
    });
    
    return bestDay ? { date: bestDay, score: bestScore } : null;
  };

  const getWorstDay = () => {
    if (!statistics.dailyStats) return null;
    
    let worstDay = '';
    let worstScore = Infinity;
    
    Object.entries(statistics.dailyStats).forEach(([date, stats]: [string, any]) => {
      const score = (stats.happy + stats.excited - stats.sad - stats.stressed - stats.tired) / stats.total * 100;
      if (score < worstScore) {
        worstScore = score;
        worstDay = date;
      }
    });
    
    return worstDay ? { date: worstDay, score: worstScore } : null;
  };

  const moodTrend = getMoodTrend();
  const bestDay = getBestDay();
  const worstDay = getWorstDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent-2 to-primary rounded-xl p-6 text-secondary">
        <h2 className="text-2xl font-bold mb-2">{getRoleTitle()}</h2>
        <p className="opacity-90 mb-4">{getScope()}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            {[7, 14, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === days
                    ? 'bg-secondary text-primary'
                    : 'bg-white/20 text-secondary hover:bg-white/30'
                }`}
              >
                {days === 7 ? '7j' : days === 14 ? '14j' : days === 30 ? '30j' : '90j'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'json')}
              className="px-3 py-2 rounded-lg bg-white/20 text-secondary border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <Download size={16} />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Déclarations totales"
          value={statistics.stats?.total || 0}
          subtitle={`Sur ${selectedPeriod} derniers jours`}
          icon={FileText}
          color="primary"
        />
        
        <StatsCard
          title="Taux de participation"
          value={`${(statistics.participationRate || 0).toFixed(1)}%`}
          subtitle={`${statistics.activeUsers || 0}/${statistics.totalUsers || 0} utilisateurs actifs`}
          icon={Users}
          color="blue"
        />
        
        <StatsCard
          title="Tendance générale"
          value={moodTrend >= 0 ? 'Positive' : 'Négative'}
          subtitle={`${moodTrend.toFixed(1)}% de moral`}
          icon={TrendingUp}
          color={moodTrend >= 0 ? 'green' : 'red'}
        />
        
        <StatsCard
          title="Moyenne quotidienne"
          value={Math.round(statistics.avgDailyDeclarations || 0)}
          subtitle="Déclarations par jour"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Best/Worst Days */}
      {(bestDay || worstDay) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bestDay && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Meilleure journée</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-700">
                  {new Date(bestDay.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-green-600">{bestDay.score.toFixed(1)}% de moral positif</p>
              </div>
            </div>
          )}
          
          {worstDay && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">Journée difficile</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-red-700">
                  {new Date(worstDay.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-red-600">{worstDay.score.toFixed(1)}% de moral</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-6">Analyse détaillée</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statistics.stats && Object.entries(statistics.stats)
            .filter(([key]) => key !== 'total')
            .map(([emotion, count]) => {
              const percentage = statistics.stats.total > 0 ? ((count as number) / statistics.stats.total * 100) : 0;
              const emotionLabels = {
                happy: 'Heureux',
                sad: 'Triste',
                neutral: 'Neutre',
                stressed: 'Stressé',
                excited: 'Excité',
                tired: 'Fatigué'
              };
              
              return (
                <div key={emotion} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{count as number}</div>
                  <div className="text-sm text-gray-600">{emotionLabels[emotion as keyof typeof emotionLabels]}</div>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Charts */}
      {statistics.emotions && statistics.emotions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmotionChart
            emotions={statistics.emotions}
            type="line"
            period={selectedPeriod <= 14 ? 'week' : 'month'}
            title="Évolution temporelle"
          />
          
          <EmotionChart
            emotions={statistics.emotions}
            type="bar"
            period={selectedPeriod <= 14 ? 'week' : 'month'}
            title="Répartition par jour"
          />
        </div>
      )}

      {statistics.emotions && statistics.emotions.length > 0 && (
        <EmotionChart
          emotions={statistics.emotions}
          type="doughnut"
          period={selectedPeriod <= 14 ? 'week' : 'month'}
          title="Distribution globale des émotions"
        />
      )}

      {/* Export Information */}
      <div className="bg-accent rounded-xl p-6 border border-accent-2">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <Download size={20} />
          <span>Export des données</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-secondary mb-2">Format CSV</h4>
            <p className="text-sm text-secondary/70 mb-3">
              Idéal pour l'analyse dans Excel ou Google Sheets. Contient toutes les déclarations avec dates, utilisateurs et commentaires.
            </p>
            <ul className="text-xs text-secondary/60 space-y-1">
              <li>• Compatible avec tous les tableurs</li>
              <li>• Facilite les analyses statistiques</li>
              <li>• Format léger et universel</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-secondary mb-2">Format JSON</h4>
            <p className="text-sm text-secondary/70 mb-3">
              Format structuré pour les développeurs et outils d'analyse avancés. Conserve toute la structure des données.
            </p>
            <ul className="text-xs text-secondary/60 space-y-1">
              <li>• Structure de données complète</li>
              <li>• Compatible avec les outils de BI</li>
              <li>• Facilite l'intégration technique</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;