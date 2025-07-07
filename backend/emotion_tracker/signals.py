from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Emotion, Alert, Collaborator


@receiver(post_save, sender=Emotion)
def check_emotion_alerts(sender, instance, created, **kwargs):
    """Vérifie et crée des alertes basées sur les émotions"""
    if not created:
        return
    
    collaborator = instance.collaborator
    
    # Vérifier les émotions négatives consécutives
    check_consecutive_negative_emotions(collaborator, instance)
    
    # Vérifier le niveau de stress élevé
    check_high_stress_level(collaborator, instance)
    
    # Vérifier le moral de l'équipe si c'est un manager
    if collaborator.role in ['manager', 'director', 'pole_director']:
        check_team_morale(collaborator)


def check_consecutive_negative_emotions(collaborator, current_emotion):
    """Vérifie s'il y a des émotions négatives consécutives"""
    negative_emotions = ['sad', 'stressed', 'tired']
    
    if current_emotion.emotion_type.emotion not in negative_emotions:
        return
    
    # Vérifier les 3 derniers jours
    end_date = current_emotion.date
    start_date = end_date - timedelta(days=2)
    
    recent_emotions = Emotion.objects.filter(
        collaborator=collaborator,
        date__gte=start_date,
        date__lte=end_date
    ).order_by('date', 'period')
    
    negative_count = sum(1 for emotion in recent_emotions 
                        if emotion.emotion_type.emotion in negative_emotions)
    
    if negative_count >= 3:
        # Vérifier si une alerte similaire existe déjà
        existing_alert = Alert.objects.filter(
            collaborator=collaborator,
            alert_type='consecutive_negative',
            is_resolved=False,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).first()
        
        if not existing_alert:
            Alert.objects.create(
                collaborator=collaborator,
                alert_type='consecutive_negative',
                severity='medium',
                title='Émotions négatives consécutives',
                message=f'{collaborator.full_name} a déclaré {negative_count} émotions négatives consécutives.',
                trigger_data={
                    'consecutive_count': negative_count,
                    'period_start': start_date.isoformat(),
                    'period_end': end_date.isoformat(),
                    'emotions': [
                        {
                            'date': e.date.isoformat(),
                            'period': e.period,
                            'emotion': e.emotion_type.emotion,
                            'degree': e.emotion_degree
                        } for e in recent_emotions
                    ]
                }
            )


def check_high_stress_level(collaborator, current_emotion):
    """Vérifie le niveau de stress élevé"""
    if current_emotion.emotion_type.emotion != 'stressed':
        return
    
    # Vérifier si le degré de stress est élevé (>= 7)
    if current_emotion.emotion_degree >= 7:
        # Vérifier les émotions de stress de la semaine
        week_start = current_emotion.date - timedelta(days=current_emotion.date.weekday())
        
        stress_emotions = Emotion.objects.filter(
            collaborator=collaborator,
            date__gte=week_start,
            date__lte=current_emotion.date,
            emotion_type__emotion='stressed'
        )
        
        if stress_emotions.count() >= 2:  # Au moins 2 déclarations de stress dans la semaine
            existing_alert = Alert.objects.filter(
                collaborator=collaborator,
                alert_type='high_stress_level',
                is_resolved=False,
                created_at__gte=timezone.now() - timedelta(days=7)
            ).first()
            
            if not existing_alert:
                avg_stress = sum(e.emotion_degree for e in stress_emotions) / len(stress_emotions)
                
                Alert.objects.create(
                    collaborator=collaborator,
                    alert_type='high_stress_level',
                    severity='high' if avg_stress >= 8 else 'medium',
                    title='Niveau de stress élevé',
                    message=f'{collaborator.full_name} présente un niveau de stress élevé cette semaine (moyenne: {avg_stress:.1f}/10).',
                    trigger_data={
                        'average_stress': avg_stress,
                        'stress_count': stress_emotions.count(),
                        'week_start': week_start.isoformat(),
                        'current_degree': current_emotion.emotion_degree
                    }
                )


def check_team_morale(manager):
    """Vérifie le moral de l'équipe pour un manager"""
    if manager.role == 'manager':
        team_members = Collaborator.objects.filter(manager=manager)
    elif manager.role == 'director':
        team_members = Collaborator.objects.filter(service=manager.service)
    elif manager.role == 'pole_director':
        team_members = Collaborator.objects.filter(cluster=manager.cluster)
    else:
        return
    
    if not team_members.exists():
        return
    
    # Analyser les émotions de l'équipe sur les 7 derniers jours
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=6)
    
    team_emotions = Emotion.objects.filter(
        collaborator__in=team_members,
        date__gte=start_date,
        date__lte=end_date
    )
    
    if not team_emotions.exists():
        return
    
    # Calculer le score de moral (émotions positives vs négatives)
    positive_emotions = ['happy', 'excited']
    negative_emotions = ['sad', 'stressed', 'tired']
    
    positive_count = team_emotions.filter(emotion_type__emotion__in=positive_emotions).count()
    negative_count = team_emotions.filter(emotion_type__emotion__in=negative_emotions).count()
    total_count = team_emotions.count()
    
    if total_count == 0:
        return
    
    # Calculer le pourcentage de moral négatif
    negative_percentage = (negative_count / total_count) * 100
    
    # Déclencher une alerte si plus de 60% des émotions sont négatives
    if negative_percentage >= 60:
        existing_alert = Alert.objects.filter(
            team=manager.team if manager.role == 'manager' else None,
            service=manager.service if manager.role == 'director' else None,
            alert_type='low_team_morale',
            is_resolved=False,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).first()
        
        if not existing_alert:
            entity_name = ""
            if manager.role == 'manager' and manager.team:
                entity_name = f"l'équipe {manager.team.team_name}"
            elif manager.role == 'director' and manager.service:
                entity_name = f"le département {manager.service.service_name}"
            elif manager.role == 'pole_director' and manager.cluster:
                entity_name = f"le cluster {manager.cluster.name}"
            
            Alert.objects.create(
                team=manager.team if manager.role == 'manager' else None,
                service=manager.service if manager.role == 'director' else None,
                alert_type='low_team_morale',
                severity='high' if negative_percentage >= 75 else 'medium',
                title='Moral d\'équipe faible',
                message=f'Le moral de {entity_name} est en baisse: {negative_percentage:.1f}% d\'émotions négatives cette semaine.',
                trigger_data={
                    'negative_percentage': negative_percentage,
                    'positive_count': positive_count,
                    'negative_count': negative_count,
                    'total_count': total_count,
                    'team_size': team_members.count(),
                    'period_start': start_date.isoformat(),
                    'period_end': end_date.isoformat()
                }
            )


@receiver(post_save, sender=Emotion)
@receiver(post_delete, sender=Emotion)
def update_collaborator_emotion_fields(sender, instance, **kwargs):
    """Met à jour les champs émotionnels du collaborateur après modification d'une émotion"""
    if instance.collaborator:
        instance.collaborator.update_emotion_fields()