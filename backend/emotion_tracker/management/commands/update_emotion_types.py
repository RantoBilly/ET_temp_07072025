from django.core.management.base import BaseCommand
from emotion_tracker.models import EmotionType


class Command(BaseCommand):
    help = 'Met à jour les types d\'émotions avec les nouveaux degrés spécifiés'

    def handle(self, *args, **options):
        self.stdout.write('Mise à jour des types d\'émotions...')
        
        # Définir les types d'émotions avec leurs degrés
        emotion_types_data = [
            {
                'emotion': 'happy',
                'name': 'Heureux',
                'degree': 1,
                'emotions': 'Sentiment de joie et de satisfaction'
            },
            {
                'emotion': 'sad',
                'name': 'Triste',
                'degree': -1,
                'emotions': 'Sentiment de tristesse ou de mélancolie'
            },
            {
                'emotion': 'neutral',
                'name': 'Neutre',
                'degree': 0,
                'emotions': 'État émotionnel équilibré'
            },
            {
                'emotion': 'angry',
                'name': 'En colère',
                'degree': -5,
                'emotions': 'Sentiment de colère et d\'irritation'
            },
            {
                'emotion': 'excited',
                'name': 'Excité',
                'degree': 5,
                'emotions': 'Sentiment d\'enthousiasme et d\'énergie'
            },
            {
                'emotion': 'anxious',
                'name': 'Anxieux',
                'degree': -2,
                'emotions': 'Sentiment d\'anxiété et d\'inquiétude'
            },
            # Types existants pour compatibilité
            {
                'emotion': 'stressed',
                'name': 'Stressé',
                'degree': -3,
                'emotions': 'Sentiment de pression et d\'anxiété'
            },
            {
                'emotion': 'tired',
                'name': 'Fatigué',
                'degree': -1,
                'emotions': 'Sentiment de lassitude et de fatigue'
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for emotion_data in emotion_types_data:
            emotion_type, created = EmotionType.objects.get_or_create(
                emotion=emotion_data['emotion'],
                defaults=emotion_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'Créé: {emotion_type.name} (degré: {emotion_type.degree:+d})')
            else:
                # Mettre à jour si nécessaire
                updated = False
                if emotion_type.degree != emotion_data['degree']:
                    emotion_type.degree = emotion_data['degree']
                    updated = True
                
                if emotion_type.name != emotion_data['name']:
                    emotion_type.name = emotion_data['name']
                    updated = True
                
                if emotion_type.emotions != emotion_data['emotions']:
                    emotion_type.emotions = emotion_data['emotions']
                    updated = True
                
                if updated:
                    emotion_type.save()
                    updated_count += 1
                    self.stdout.write(f'Mis à jour: {emotion_type.name} (degré: {emotion_type.degree:+d})')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Terminé! {created_count} types d\'émotions créés, {updated_count} mis à jour.'
            )
        )
        
        # Afficher un résumé des types d'émotions
        self.stdout.write('\n=== RÉSUMÉ DES TYPES D\'ÉMOTIONS ===')
        
        emotion_types = EmotionType.objects.all().order_by('degree')
        
        positive_emotions = emotion_types.filter(degree__gt=0)
        neutral_emotions = emotion_types.filter(degree=0)
        negative_emotions = emotion_types.filter(degree__lt=0)
        
        self.stdout.write(f'\n🟢 ÉMOTIONS POSITIVES ({positive_emotions.count()}):')
        for emotion in positive_emotions:
            self.stdout.write(f'  • {emotion.name}: {emotion.degree:+d} ({emotion.get_intensity_level()})')
        
        self.stdout.write(f'\n⚪ ÉMOTIONS NEUTRES ({neutral_emotions.count()}):')
        for emotion in neutral_emotions:
            self.stdout.write(f'  • {emotion.name}: {emotion.degree:+d}')
        
        self.stdout.write(f'\n🔴 ÉMOTIONS NÉGATIVES ({negative_emotions.count()}):')
        for emotion in negative_emotions:
            self.stdout.write(f'  • {emotion.name}: {emotion.degree:+d} ({emotion.get_intensity_level()})')
        
        self.stdout.write(f'\nTotal: {emotion_types.count()} types d\'émotions configurés')