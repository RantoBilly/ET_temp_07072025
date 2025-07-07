import React, { useState, useEffect } from 'react';
import { Smile, Frown, Meh, Zap, Star, Moon, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmotion } from '../../context/EmotionContext';
import { EmotionType } from '../../types';

const EmotionDeclaration: React.FC = () => {
  const { user } = useAuth();
  const { addEmotion, getTodayEmotions } = useEmotion();
  const [period, setPeriod] = useState<'morning' | 'evening'>('morning');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todayEmotions, setTodayEmotions] = useState({ morning: undefined, evening: undefined });

  useEffect(() => {
    if (user) {
      const emotions = getTodayEmotions(user.id);
      setTodayEmotions(emotions);
      
      // Auto-select period based on time and existing entries
      const currentHour = new Date().getHours();
      if (currentHour < 14 && !emotions.morning) {
        setPeriod('morning');
      } else if (!emotions.evening) {
        setPeriod('evening');
      } else if (!emotions.morning) {
        setPeriod('morning');
      }
    }
  }, [user, getTodayEmotions]);

  const emotions = [
    { type: 'happy' as EmotionType, icon: Smile, label: 'Heureux', color: 'text-green-500', bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100', borderColor: 'border-green-300' },
    { type: 'excited' as EmotionType, icon: Star, label: 'Excité', color: 'text-purple-500', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100', borderColor: 'border-purple-300' },
    { type: 'neutral' as EmotionType, icon: Meh, label: 'Neutre', color: 'text-gray-500', bgColor: 'bg-gray-50', hoverColor: 'hover:bg-gray-100', borderColor: 'border-gray-300' },
    { type: 'stressed' as EmotionType, icon: Zap, label: 'Stressé', color: 'text-orange-500', bgColor: 'bg-orange-50', hoverColor: 'hover:bg-orange-100', borderColor: 'border-orange-300' },
    { type: 'tired' as EmotionType, icon: Moon, label: 'Fatigué', color: 'text-indigo-500', bgColor: 'bg-indigo-50', hoverColor: 'hover:bg-indigo-100', borderColor: 'border-indigo-300' },
    { type: 'sad' as EmotionType, icon: Frown, label: 'Triste', color: 'text-red-500', bgColor: 'bg-red-50', hoverColor: 'hover:bg-red-100', borderColor: 'border-red-300' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmotion || !user) return;

    setIsSubmitting(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      addEmotion({
        userId: user.id,
        date: today,
        period,
        emotion: selectedEmotion,
        comment: comment.trim() || undefined,
      });

      // Update local state immediately
      const updatedEmotions = getTodayEmotions(user.id);
      setTodayEmotions(updatedEmotions);
      
      // Reset form
      setSelectedEmotion(null);
      setComment('');
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Erreur lors de la déclaration:', error);
      alert('Erreur lors de la déclaration. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isAlreadyDeclared = (checkPeriod: 'morning' | 'evening') => {
    return checkPeriod === 'morning' ? !!todayEmotions.morning : !!todayEmotions.evening;
  };

  const canDeclare = () => {
    return !isAlreadyDeclared(period) && selectedEmotion;
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-slide-up">
          <CheckCircle className="text-green-500" size={24} />
          <div>
            <h3 className="font-semibold text-green-800">Émotion enregistrée avec succès !</h3>
            <p className="text-sm text-green-600">
              Votre émotion du {period === 'morning' ? 'matin' : 'soir'} a été prise en compte.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent-2 rounded-xl p-6 text-secondary">
        <div className="flex items-center space-x-3 mb-2">
          <Clock size={24} />
          <h2 className="text-2xl font-bold">Déclarer mon émotion</h2>
        </div>
        <p className="opacity-90">
          Comment vous sentez-vous aujourd'hui ? Votre bien-être est important pour nous.
        </p>
        <div className="mt-4 text-sm opacity-75">
          {getCurrentTime()} - {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">Période</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPeriod('morning')}
            disabled={isAlreadyDeclared('morning')}
            className={`p-4 rounded-lg border-2 transition-all ${
              period === 'morning'
                ? 'border-primary bg-accent text-secondary'
                : isAlreadyDeclared('morning')
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 hover:border-primary hover:bg-accent/50'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🌅</div>
              <div className="font-semibold">Matin</div>
              <div className="text-sm opacity-75">Avant 14h</div>
              {isAlreadyDeclared('morning') && (
                <div className="text-xs mt-2 text-green-600 flex items-center justify-center space-x-1">
                  <CheckCircle size={12} />
                  <span>Déclaré</span>
                </div>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setPeriod('evening')}
            disabled={isAlreadyDeclared('evening')}
            className={`p-4 rounded-lg border-2 transition-all ${
              period === 'evening'
                ? 'border-primary bg-accent text-secondary'
                : isAlreadyDeclared('evening')
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 hover:border-primary hover:bg-accent/50'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🌙</div>
              <div className="font-semibold">Soir</div>
              <div className="text-sm opacity-75">Après 14h</div>
              {isAlreadyDeclared('evening') && (
                <div className="text-xs mt-2 text-green-600 flex items-center justify-center space-x-1">
                  <CheckCircle size={12} />
                  <span>Déclaré</span>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Emotion Selection Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Comment vous sentez-vous ce {period === 'morning' ? 'matin' : 'soir'} ?
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {emotions.map((emotion) => {
            const Icon = emotion.icon;
            const isSelected = selectedEmotion === emotion.type;
            
            return (
              <button
                key={emotion.type}
                type="button"
                onClick={() => setSelectedEmotion(emotion.type)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? `${emotion.borderColor} ${emotion.color} ${emotion.bgColor} scale-105 shadow-lg`
                    : `border-gray-200 ${emotion.hoverColor} hover:scale-105 hover:shadow-md`
                }`}
              >
                <div className="text-center space-y-3">
                  <Icon size={32} className={emotion.color} />
                  <div className="font-semibold text-secondary">{emotion.label}</div>
                  {isSelected && (
                    <div className="flex justify-center">
                      <CheckCircle size={16} className={emotion.color} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Comment */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-secondary">
            <MessageCircle size={16} />
            <span>Commentaire (optionnel)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez plus de détails sur votre état émotionnel..."
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right">
            {comment.length}/500 caractères
          </div>
        </div>

        {/* Submit Button */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!canDeclare() || isSubmitting || isAlreadyDeclared(period)}
            className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 ${
              canDeclare() && !isAlreadyDeclared(period)
                ? 'bg-primary hover:bg-accent-2 text-secondary hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span>Enregistrement...</span>
              </div>
            ) : isAlreadyDeclared(period) ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle size={16} />
                <span>Déjà déclaré pour ce {period === 'morning' ? 'matin' : 'soir'}</span>
              </div>
            ) : !selectedEmotion ? (
              'Sélectionnez une émotion pour continuer'
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Déclarer mon émotion</span>
              </div>
            )}
          </button>
          
          {selectedEmotion && !isAlreadyDeclared(period) && (
            <p className="text-sm text-gray-600 text-center">
              Vous êtes sur le point de déclarer que vous vous sentez{' '}
              <span className="font-semibold text-secondary">
                {emotions.find(e => e.type === selectedEmotion)?.label.toLowerCase()}
              </span>{' '}
              ce {period === 'morning' ? 'matin' : 'soir'}.
            </p>
          )}
        </div>
      </form>

      {/* Today's Summary */}
      {(todayEmotions.morning || todayEmotions.evening) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Mes émotions aujourd'hui</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayEmotions.morning && (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="text-2xl">🌅</div>
                <div className="flex-1">
                  <div className="font-semibold">Matin</div>
                  <div className="text-sm text-gray-600 capitalize flex items-center space-x-2">
                    <span>{emotions.find(e => e.type === todayEmotions.morning?.emotion)?.label}</span>
                    <CheckCircle size={12} className="text-green-500" />
                  </div>
                  {todayEmotions.morning.comment && (
                    <div className="text-xs text-gray-500 mt-1 bg-white/50 p-2 rounded">
                      "{todayEmotions.morning.comment}"
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {todayEmotions.evening && (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-2xl">🌙</div>
                <div className="flex-1">
                  <div className="font-semibold">Soir</div>
                  <div className="text-sm text-gray-600 capitalize flex items-center space-x-2">
                    <span>{emotions.find(e => e.type === todayEmotions.evening?.emotion)?.label}</span>
                    <CheckCircle size={12} className="text-green-500" />
                  </div>
                  {todayEmotions.evening.comment && (
                    <div className="text-xs text-gray-500 mt-1 bg-white/50 p-2 rounded">
                      "{todayEmotions.evening.comment}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-accent rounded-xl p-6 border border-accent-2">
        <h3 className="text-lg font-semibold text-secondary mb-3">💡 Conseils</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary/70">
          <div>
            <h4 className="font-semibold text-secondary mb-2">Pourquoi déclarer ses émotions ?</h4>
            <ul className="space-y-1">
              <li>• Améliorer le bien-être au travail</li>
              <li>• Permettre un suivi personnalisé</li>
              <li>• Contribuer à un environnement sain</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-secondary mb-2">Confidentialité</h4>
            <ul className="space-y-1">
              <li>• Vos données sont sécurisées</li>
              <li>• Accès limité selon les rôles</li>
              <li>• Anonymisation possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDeclaration;