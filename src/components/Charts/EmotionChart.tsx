import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { EmotionEntry, EmotionStats } from '../../types';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EmotionChartProps {
  emotions: EmotionEntry[];
  type: 'bar' | 'line' | 'doughnut';
  period: 'week' | 'month';
  title?: string;
}

const EmotionChart: React.FC<EmotionChartProps> = ({
  emotions,
  type,
  period,
  title
}) => {
  const emotionColors = {
    happy: '#22c55e',
    sad: '#ef4444',
    neutral: '#64748b',
    stressed: '#f97316',
    excited: '#8b5cf6',
    tired: '#6b7280',
  };

  const emotionLabels = {
    happy: 'Heureux',
    sad: 'Triste',
    neutral: 'Neutre',
    stressed: 'Stressé',
    excited: 'Excité',
    tired: 'Fatigué',
  };

  const processDataForChart = () => {
    if (type === 'doughnut') {
      const stats: Record<string, number> = {
        happy: 0,
        sad: 0,
        neutral: 0,
        stressed: 0,
        excited: 0,
        tired: 0,
      };

      emotions.forEach(emotion => {
        stats[emotion.emotion]++;
      });

      return {
        labels: Object.keys(stats).map(key => emotionLabels[key as keyof typeof emotionLabels]),
        datasets: [{
          data: Object.values(stats),
          backgroundColor: Object.keys(stats).map(key => emotionColors[key as keyof typeof emotionColors]),
          borderWidth: 2,
          borderColor: '#ffffff',
        }]
      };
    }

    // For bar and line charts - group by date
    const groupedData: Record<string, Record<string, number>> = {};
    
    emotions.forEach(emotion => {
      const date = emotion.date;
      if (!groupedData[date]) {
        groupedData[date] = {
          happy: 0, sad: 0, neutral: 0, stressed: 0, excited: 0, tired: 0
        };
      }
      groupedData[date][emotion.emotion]++;
    });

    const sortedDates = Object.keys(groupedData).sort();
    const labels = sortedDates.map(date => 
      format(parseISO(date), period === 'week' ? 'EEE dd' : 'dd/MM', { locale: fr })
    );

    const datasets = Object.keys(emotionColors).map(emotion => ({
      label: emotionLabels[emotion as keyof typeof emotionLabels],
      data: sortedDates.map(date => groupedData[date][emotion] || 0),
      backgroundColor: emotionColors[emotion as keyof typeof emotionColors] + '20',
      borderColor: emotionColors[emotion as keyof typeof emotionColors],
      borderWidth: 2,
      fill: type === 'line' ? false : true,
      tension: 0.4,
    }));

    return { labels, datasets };
  };

  const data = processDataForChart();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          }
        }
      },
      title: title ? {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      } : undefined,
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      },
    } : undefined,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const chartProps = {
    data,
    options,
    height: 300,
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {type === 'bar' && <Bar {...chartProps} />}
      {type === 'line' && <Line {...chartProps} />}
      {type === 'doughnut' && <Doughnut {...chartProps} />}
    </div>
  );
};

export default EmotionChart;