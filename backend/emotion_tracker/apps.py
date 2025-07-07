from django.apps import AppConfig


class EmotionTrackerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'emotion_tracker'
    verbose_name = 'Emotion Tracker'
    
    def ready(self):
        import emotion_tracker.signals