from django.core.management.base import BaseCommand
from django.utils import timezone
from emotion_tracker.models import Emotion, Collaborator


class Command(BaseCommand):
    help = 'Met à jour tous les calculs automatiques des émotions existantes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--recalculate-all',
            action='store_true',
            help='Recalcule tous les champs pour toutes les émotions',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Nombre de jours à recalculer (défaut: 30)',
        )

    def handle(self, *args, **options):
        self.stdout.write('Mise à jour des calculs automatiques...')
        
        if options['recalculate_all']:
            emotions = Emotion.objects.all()
            self.stdout.write(f'Recalcul de toutes les émotions ({emotions.count()})')
        else:
            days = options['days']
            start_date = timezone.now().date() - timezone.timedelta(days=days)
            emotions = Emotion.objects.filter(date__gte=start_date)
            self.stdout.write(f'Recalcul des émotions des {days} derniers jours ({emotions.count()})')
        
        updated_count = 0
        
        for emotion in emotions:
            # Recalculer les champs automatiques
            old_date_period = emotion.date_period
            old_half_day = emotion.half_day
            old_weekly_summary = emotion.weekly_emotion_summary
            old_monthly_insights = emotion.monthly_emotion_insights
            
            # Recalculer
            emotion.date_period = emotion.calculate_date_period()
            emotion.half_day = emotion.calculate_half_day()
            emotion.weekly_emotion_summary = emotion.generate_weekly_summary()
            emotion.monthly_emotion_insights = emotion.generate_monthly_insights()
            
            # Vérifier s'il y a des changements
            if (emotion.date_period != old_date_period or 
                emotion.half_day != old_half_day or
                emotion.weekly_emotion_summary != old_weekly_summary or
                emotion.monthly_emotion_insights != old_monthly_insights):
                
                emotion.save()
                updated_count += 1
                
                if updated_count % 100 == 0:
                    self.stdout.write(f'Mis à jour: {updated_count} émotions...')
        
        self.stdout.write(
            self.style.SUCCESS(f'Terminé! {updated_count} émotions mises à jour.')
        )
        
        # Mettre à jour les champs des collaborateurs
        self.stdout.write('Mise à jour des champs émotionnels des collaborateurs...')
        
        collaborators = Collaborator.objects.all()
        for collaborator in collaborators:
            collaborator.update_emotion_fields()
        
        self.stdout.write(
            self.style.SUCCESS(f'Champs émotionnels mis à jour pour {collaborators.count()} collaborateurs.')
        )