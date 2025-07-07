import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { EmotionEntry, EmotionStats, Alert, EmotionType } from '../types';
import { mockEmotions } from '../data/mockData';

interface EmotionContextType {
  emotions: EmotionEntry[];
  addEmotion: (emotion: Omit<EmotionEntry, 'id' | 'timestamp'>) => void;
  getEmotionsByUser: (userId: string, days?: number) => EmotionEntry[];
  getEmotionsByTeam: (userIds: string[], days?: number) => EmotionEntry[];
  getEmotionStats: (entries: EmotionEntry[]) => EmotionStats;
  getTodayEmotions: (userId: string) => { morning?: EmotionEntry; evening?: EmotionEntry };
  getAlerts: () => Alert[];
  exportData: (format: 'csv' | 'json') => void;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

interface EmotionProviderProps {
  children: ReactNode;
}

export const EmotionProvider: React.FC<EmotionProviderProps> = ({ children }) => {
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);

  useEffect(() => {
    // Load emotions from localStorage or use mock data
    const savedEmotions = localStorage.getItem('emotion-tracker-emotions');
    if (savedEmotions) {
      setEmotions(JSON.parse(savedEmotions));
    } else {
      setEmotions(mockEmotions);
      localStorage.setItem('emotion-tracker-emotions', JSON.stringify(mockEmotions));
    }
  }, []);

  const addEmotion = (emotion: Omit<EmotionEntry, 'id' | 'timestamp'>) => {
    const newEmotion: EmotionEntry = {
      ...emotion,
      id: `${emotion.userId}-${emotion.date}-${emotion.period}`,
      timestamp: Date.now()
    };

    const updatedEmotions = emotions.filter(
      e => !(e.userId === emotion.userId && e.date === emotion.date && e.period === emotion.period)
    );
    updatedEmotions.push(newEmotion);

    setEmotions(updatedEmotions);
    localStorage.setItem('emotion-tracker-emotions', JSON.stringify(updatedEmotions));
  };

  const getEmotionsByUser = (userId: string, days: number = 30): EmotionEntry[] => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return emotions
      .filter(e => e.userId === userId && new Date(e.date) >= startDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getEmotionsByTeam = (userIds: string[], days: number = 30): EmotionEntry[] => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return emotions
      .filter(e => userIds.includes(e.userId) && new Date(e.date) >= startDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getEmotionStats = (entries: EmotionEntry[]): EmotionStats => {
    const stats: EmotionStats = {
      total: entries.length,
      happy: 0,
      sad: 0,
      neutral: 0,
      stressed: 0,
      excited: 0,
      tired: 0
    };

    entries.forEach(entry => {
      stats[entry.emotion]++;
    });

    return stats;
  };

  const getTodayEmotions = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayEmotions = emotions.filter(e => e.userId === userId && e.date === today);
    
    return {
      morning: todayEmotions.find(e => e.period === 'morning'),
      evening: todayEmotions.find(e => e.period === 'evening')
    };
  };

  const getAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const today = new Date();
    
    // Check for consecutive negative emotions
    const negativeEmotions: EmotionType[] = ['sad', 'stressed', 'tired'];
    
    emotions
      .reduce((acc, emotion) => {
        if (!acc[emotion.userId]) acc[emotion.userId] = [];
        acc[emotion.userId].push(emotion);
        return acc;
      }, {} as Record<string, EmotionEntry[]>)
      .forEach = Object.entries;

    // Simplified alert generation for demo
    if (emotions.some(e => negativeEmotions.includes(e.emotion))) {
      alerts.push({
        id: 'alert-1',
        userId: 'multiple',
        type: 'consecutive_negative',
        message: 'Plusieurs employés ont déclaré des émotions négatives consécutives',
        date: today.toISOString().split('T')[0],
        resolved: false
      });
    }

    return alerts;
  };

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csv = [
        'Date,Utilisateur,Période,Émotion,Commentaire',
        ...emotions.map(e => `${e.date},${e.userId},${e.period},${e.emotion},"${e.comment || ''}"`)
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emotions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const json = JSON.stringify(emotions, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emotions-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  return (
    <EmotionContext.Provider value={{
      emotions,
      addEmotion,
      getEmotionsByUser,
      getEmotionsByTeam,
      getEmotionStats,
      getTodayEmotions,
      getAlerts,
      exportData
    }}>
      {children}
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};