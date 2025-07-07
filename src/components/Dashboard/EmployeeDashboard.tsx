import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Heart, MessageCircle, Award, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmotion } from '../../context/EmotionContext';
import StatsCard from './StatsCard';
import EmotionChart from '../Charts/EmotionChart';
import EmotionCard from './EmotionCard';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getEmotionsByUser, getEmotionStats, getTodayEmotions } = useEmotion();
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [userEmotions, setUserEmotions] = useState<any[]>([]);
  const [todayEmotions, setTodayEmotions] = useState<any>({});

  useEffect(() => {
    if (user) {
      const emotions = getEmotionsByUser(user.id, selectedPeriod);
      const today = getTodayEmotions(user.id);
      setUserEmotions(emotions);
      setTodayEmotions(today);
    }
  }, [user, selectedPeriod, getEmotionsByUser, getTodayEmotions]);

  const stats = getEmotionStats(userEmotions);
  const totalDeclarations = stats.total;
  const participationRate = selectedPeriod === 7 ? (totalDeclarations / 14) * 100 : (totalDeclarations / (selectedPeriod * 2)) * 100;

  const getMoodTrend = () => {
    const recentEmotions = userEmotions.slice(0, 7);
    const olderEmotions = userEmotions.slice(7, 14);
    
    const getPositivityScore = (emotions: any[]) => {
      if (emotions.length === 0) return 0;
      const positiveCount = emotions.filter(e => ['happy', 'excited'].includes(e.emotion)).length;
      return (positiveCount / emotions.length) * 100;
    };
    
    const recentScore = getPositivityScore(recentEmotions);
    const olderScore = getPositivityScore(olderEmotions);
    
    return recentScore - olderScore;
  };

  const moodTrend = getMoodTrend();

  const getDominantEmotion = () => {
    if (stats.total === 0) return null;
    
    const emotions = ['happy', 'excited', 'neutral', 'stressed', 'tired', 'sad'];
    let maxCount = 0;
    let dominantEmotion = '';
    
    emotions.forEach(emotion => {
      if (stats[emotion as keyof typeof stats] > maxCount) {
        maxCount = stats[emotion as keyof typeof stats] as number;
        dominantEmotion = emotion;
      }
    });
    
    return dominantEmotion;
  };

  const hasNotDeclaredToday = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 14 && !todayEmotions.morning) return 'morning';
    if (currentHour >= 14 && !todayEmotions.evening) return 'evening';
    return null;
  };

  const getWelcomeMessage = () => {
    const currentHour = new Date().getHours();
    const name = user?.name.split(' ')[0];
    
    if (currentHour < 12) return `Bonjour ${name} !`;
    if (currentHour < 18) return `Bonne après-midi ${name} !`;
    return `Bonsoir ${name} !`;
  };

  const getEncouragementMessage = () => {
    const dominantEmotion = getDominantEmotion();
    const messages = {
      happy: "Votre positivité rayonne ! Continuez comme ça ! 🌟",
      excited: "Votre enthousiasme est contagieux ! 🚀",
      neutral: "L'équilibre est une force. Prenez soin de vous. 🧘‍♂️",
      stressed: "Prenez le temps de respirer. Vous gérez très bien ! 💪",
      tired: "Le repos est important. N'hésitez pas à faire des pauses. 😴",
      sad: "Nous sommes là pour vous. N'hésitez pas à en parler. 🤗"
    };
    
    return dominantEmotion ? messages[dominantEmotion as keyof typeof messages] : "Merci de partager vos émotions avec nous ! 💝";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary via-accent-2 to-primary rounded-xl p-6 text-secondary">
        <h2 className="text-2xl font-bold mb-2">{getWelcomeMessage()}</h2>
        <p className="opacity-90 mb-4">{getEncouragementMessage()}</p>
        
        {hasNotDeclaredToday() && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock size={16} />
              <span>
                N'oubliez pas de déclarer votre émotion du {hasNotDeclaredToday() === 'morning' ? 'matin' : 'soir'} !
              </span>
            </div>
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
          title="Déclarations totales"
          value={totalDeclarations}
          subtitle={`Sur ${selectedPeriod} derniers jours`}
          icon={MessageCircle}
          color="primary"
        />
        
        <StatsCard
          title="Taux de participation"
          value={`${participationRate.toFixed(1)}%`}
          subtitle="Déclarations matin + soir"
          icon={Calendar}
          trend={{
            value: Math.round(moodTrend),
            isPositive: moodTrend >= 0
          }}
          color="blue"
        />
        
        <StatsCard
          title="Humeur générale"
          value={moodTrend >= 0 ? 'Positive' : 'Difficile'}
          subtitle={`${moodTrend >= 0 ? '+' : ''}${moodTrend.toFixed(1)}% vs période précédente`}
          icon={Heart}
          color={moodTrend >= 0 ? 'green' : 'red'}
        />
        
        <StatsCard
          title="Émotion dominante"
          value={getDominantEmotion() || 'Aucune'}
          subtitle={`${stats[getDominantEmotion() as keyof typeof stats] || 0} occurrences`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Today's Emotions */}
      {(todayEmotions.morning || todayEmotions.evening) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
            <Calendar size={20} />
            <span>Mes émotions aujourd'hui</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todayEmotions.morning && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">🌅</div>
                  <div>
                    <h4 className="font-semibold text-secondary">Ce matin</h4>
                    <p className="text-sm text-gray-600 capitalize">{todayEmotions.morning.emotion}</p>
                  </div>
                </div>
                {todayEmotions.morning.comment && (
                  <p className="text-sm text-gray-700 bg-white/50 p-3 rounded">
                    "{todayEmotions.morning.comment}"
                  </p>
                )}
              </div>
            )}
            
            {todayEmotions.evening && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">🌙</div>
                  <div>
                    <h4 className="font-semibold text-secondary">Ce soir</h4>
                    <p className="text-sm text-gray-600 capitalize">{todayEmotions.evening.emotion}</p>
                  </div>
                </div>
                {todayEmotions.evening.comment && (
                  <p className="text-sm text-gray-700 bg-white/50 p-3 rounded">
                    "{todayEmotions.evening.comment}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emotion Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center space-x-2">
          <TrendingUp size={20} />
          <span>Répartition de mes émotions</span>
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
          emotions={userEmotions}
          type="line"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Évolution de mes émotions"
        />
        
        <EmotionChart
          emotions={userEmotions}
          type="doughnut"
          period={selectedPeriod === 7 ? 'week' : 'month'}
          title="Répartition générale"
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;