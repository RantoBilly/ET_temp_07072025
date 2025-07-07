from django.core.management.base import BaseCommand
from django.utils import timezone
from emotion_tracker.models import Emotion


class Command(BaseCommand):
    help = 'Met à jour toutes les émotions existantes pour utiliser le degré de leur EmotionType'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Affiche les changements sans les appliquer',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write('=== MODE DRY RUN - Aucune modification ne sera appliquée ===')
        
        self.stdout.write('Mise à jour des degrés d\'émotions existantes...')
        
        emotions = Emotion.objects.select_related('emotion_type').all()
        updated_count = 0
        
        for emotion in emotions:
            old_degree = emotion.emotion_degree
            new_degree = emotion.emotion_type.degree
            
            if old_degree != new_degree:
                if dry_run:
                    self.stdout.write(
                        f'[DRY RUN] Émotion {emotion.emotion_id}: '
                        f'{emotion.emotion_type.name} ({old_degree} → {new_degree})'
                    )
                else:
                    emotion.emotion_degree = new_degree
                    emotion.save(update_fields=['emotion_degree'])
                    self.stdout.write(
                        f'Mis à jour: {emotion.emotion_id} - '
                        f'{emotion.emotion_type.name} ({old_degree} → {new_degree})'
                    )
                
                updated_count += 1
                
                if updated_count % 100 == 0:
                    self.stdout.write(f'Traité: {updated_count} émotions...')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'[DRY RUN] {updated_count} émotions seraient mises à jour.')
            )
            self.stdout.write('Exécutez sans --dry-run pour appliquer les changements.')
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Terminé! {updated_count} émotions mises à jour.')
            )
        
        # Afficher un résumé des types d'émotions et leurs degrés
        self.stdout.write('\n=== RÉSUMÉ DES TYPES D\'ÉMOTIONS ===')
        
        from emotion_tracker.models import EmotionType
        emotion_types = EmotionType.objects.all().order_by('degree')
        
        for emotion_type in emotion_types:
            usage_count = emotion_type.emotion_entries.count()
            self.stdout.write(
                f'{emotion_type.name}: degré {emotion_type.degree:+d} '
                f'({usage_count} utilisations)'
            )