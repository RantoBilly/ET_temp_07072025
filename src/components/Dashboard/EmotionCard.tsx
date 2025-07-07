import React from 'react';
import { EmotionType } from '../../types';
import { Smile, Frown, Meh, Zap, Star, Moon } from 'lucide-react';

interface EmotionCardProps {
  emotion: EmotionType;
  count: number;
  percentage: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const EmotionCard: React.FC<EmotionCardProps> = ({
  emotion,
  count,
  percentage,
  isSelected = false,
  onClick
}) => {
  const getEmotionConfig = (emotion: EmotionType) => {
    const configs = {
      happy: { icon: Smile, label: 'Heureux', color: 'emotion-happy', bgColor: 'bg-green-50' },
      sad: { icon: Frown, label: 'Triste', color: 'emotion-sad', bgColor: 'bg-red-50' },
      neutral: { icon: Meh, label: 'Neutre', color: 'emotion-neutral', bgColor: 'bg-gray-50' },
      stressed: { icon: Zap, label: 'Stressé', color: 'emotion-stressed', bgColor: 'bg-orange-50' },
      excited: { icon: Star, label: 'Excité', color: 'emotion-excited', bgColor: 'bg-purple-50' },
      tired: { icon: Moon, label: 'Fatigué', color: 'emotion-tired', bgColor: 'bg-gray-50' }
    };
    return configs[emotion];
  };

  const config = getEmotionConfig(emotion);
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl transition-all duration-200 cursor-pointer ${
        isSelected 
          ? `ring-2 ring-${config.color} ${config.bgColor}` 
          : `${config.bgColor} hover:shadow-md`
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
          <Icon size={20} className={`text-${config.color}`} />
        </div>
        <span className="text-2xl font-bold text-secondary">{count}</span>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-secondary">{config.label}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-${config.color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default EmotionCard;