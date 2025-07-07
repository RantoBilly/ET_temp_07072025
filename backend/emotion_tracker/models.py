from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import datetime, date, timedelta
import uuid


class Company(models.Model):
    """Modèle pour les entreprises"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom de l'entreprise")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Cluster(models.Model):
    """Modèle pour les clusters/pôles"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom du cluster")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='clusters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cluster"
        verbose_name_plural = "Clusters"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"


class Service(models.Model):
    """Modèle pour les services/départements"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_name = models.CharField(max_length=255, verbose_name="Nom du service")
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE, related_name='services', null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='services')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ['service_name']
    
    def __str__(self):
        return self.service_name


class Team(models.Model):
    """Modèle pour les équipes"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team_name = models.CharField(max_length=255, verbose_name="Nom de l'équipe")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='teams', null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Équipe"
        verbose_name_plural = "Équipes"
        ordering = ['team_name']
    
    def __str__(self):
        return self.team_name


class Collaborator(AbstractUser):
    """Modèle étendu pour les collaborateurs (utilisateurs)"""
    ROLE_CHOICES = [
        ('employee', 'Employé'),
        ('manager', 'Manager'),
        ('director', 'Directeur'),
        ('pole_director', 'Directeur de Pôle'),
        ('admin', 'Administrateur'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collaborator_id = models.CharField(max_length=50, unique=True, verbose_name="ID Collaborateur")
    first_name = models.CharField(max_length=150, verbose_name="Prénom")
    last_name = models.CharField(max_length=150, verbose_name="Nom")
    email = models.EmailField(unique=True, verbose_name="Adresse email")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee', verbose_name="Rôle")
    
    # Relations hiérarchiques
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='collaborators')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='collaborators')
    cluster = models.ForeignKey(Cluster, on_delete=models.SET_NULL, null=True, blank=True, related_name='collaborators')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='collaborators')
    
    # Manager hiérarchique
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_collaborators')
    
    # Champs calculés pour les émotions
    emotion_today_morning = models.CharField(max_length=50, null=True, blank=True)
    emotion_today_evening = models.CharField(max_length=50, null=True, blank=True)
    emotion_this_week = models.CharField(max_length=50, null=True, blank=True)
    emotion_this_month = models.CharField(max_length=50, null=True, blank=True)
    emotion_degree_this_week = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    emotion_degree_this_month = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    
    # Métadonnées
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Champs requis par AbstractUser
    username = models.CharField(max_length=150, unique=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'collaborator_id']
    
    class Meta:
        verbose_name = "Collaborateur"
        verbose_name_plural = "Collaborateurs"
        ordering = ['last_name', 'first_name']
    
    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)
        # Mettre à jour les champs émotionnels après sauvegarde
        self.update_emotion_fields()
    
    def update_emotion_fields(self):
        """Met à jour les champs émotionnels calculés"""
        from .models import Emotion  # Import local pour éviter les imports circulaires
        
        today = timezone.now().date()
        
        # Émotions du jour
        today_emotions = Emotion.objects.filter(collaborator=self, date=today)
        self.emotion_today_morning = today_emotions.filter(period='morning').first()
        self.emotion_today_evening = today_emotions.filter(period='evening').first()
        
        # Émotions de la semaine
        week_start = today - timedelta(days=today.weekday())
        week_emotions = Emotion.objects.filter(
            collaborator=self, 
            date__gte=week_start, 
            date__lte=today
        )
        if week_emotions.exists():
            # Émotion dominante de la semaine
            emotion_counts = {}
            total_degree = 0
            for emotion in week_emotions:
                emotion_type = emotion.emotion_type.emotion
                emotion_counts[emotion_type] = emotion_counts.get(emotion_type, 0) + 1
                total_degree += emotion.emotion_degree
            
            self.emotion_this_week = max(emotion_counts, key=emotion_counts.get) if emotion_counts else None
            self.emotion_degree_this_week = total_degree // len(week_emotions) if week_emotions else None
        
        # Émotions du mois
        month_start = today.replace(day=1)
        month_emotions = Emotion.objects.filter(
            collaborator=self,
            date__gte=month_start,
            date__lte=today
        )
        if month_emotions.exists():
            emotion_counts = {}
            total_degree = 0
            for emotion in month_emotions:
                emotion_type = emotion.emotion_type.emotion
                emotion_counts[emotion_type] = emotion_counts.get(emotion_type, 0) + 1
                total_degree += emotion.emotion_degree
            
            self.emotion_this_month = max(emotion_counts, key=emotion_counts.get) if emotion_counts else None
            self.emotion_degree_this_month = total_degree // len(month_emotions) if month_emotions else None
        
        # Sauvegarder sans déclencher update_emotion_fields à nouveau
        Collaborator.objects.filter(id=self.id).update(
            emotion_today_morning=self.emotion_today_morning,
            emotion_today_evening=self.emotion_today_evening,
            emotion_this_week=self.emotion_this_week,
            emotion_this_month=self.emotion_this_month,
            emotion_degree_this_week=self.emotion_degree_this_week,
            emotion_degree_this_month=self.emotion_degree_this_month
        )
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return self.full_name


class EmotionType(models.Model):
    """Modèle pour les types d'émotions"""
    
    # Constantes pour les degrés d'émotions
    EMOTION_DEGREES = {
        'happy': 1,
        'sad': -1,
        'neutral': 0,
        'angry': -5,
        'excited': 5,
        'anxious': -2,
        'stressed': -3,  # Ajouté pour compatibilité avec les données existantes
        'tired': -1,     # Ajouté pour compatibilité avec les données existantes
    }
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom de l'émotion")
    emotion = models.CharField(max_length=50, verbose_name="Code émotion")
    degree = models.IntegerField(validators=[MinValueValidator(-10), MaxValueValidator(10)], verbose_name="Degré")
    emotions = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Type d'émotion"
        verbose_name_plural = "Types d'émotions"
        ordering = ['degree', 'name']
        unique_together = ['emotion']  # Assurer l'unicité du code émotion
    
    def save(self, *args, **kwargs):
        # Auto-assigner le degré selon le code émotion
        if self.emotion in self.EMOTION_DEGREES:
            self.degree = self.EMOTION_DEGREES[self.emotion]
        
        # Auto-générer le nom si pas défini
        if not self.name and self.emotion:
            emotion_names = {
                'happy': 'Heureux',
                'sad': 'Triste',
                'neutral': 'Neutre',
                'angry': 'En colère',
                'excited': 'Excité',
                'anxious': 'Anxieux',
                'stressed': 'Stressé',
                'tired': 'Fatigué',
            }
            self.name = emotion_names.get(self.emotion, self.emotion.capitalize())
        
        super().save(*args, **kwargs)
    
    def get_emotion_category(self):
        """Retourne la catégorie de l'émotion (positive, négative, neutre)"""
        if self.degree > 0:
            return 'positive'
        elif self.degree < 0:
            return 'negative'
        else:
            return 'neutral'
    
    def get_intensity_level(self):
        """Retourne le niveau d'intensité de l'émotion"""
        abs_degree = abs(self.degree)
        if abs_degree >= 5:
            return 'très_forte'
        elif abs_degree >= 3:
            return 'forte'
        elif abs_degree >= 1:
            return 'modérée'
        else:
            return 'neutre'
    
    def __str__(self):
        return f"{self.name} (Degré: {self.degree:+d})"


class Emotion(models.Model):
    """Modèle principal pour les déclarations d'émotions"""
    PERIOD_CHOICES = [
        ('morning', 'Matin'),
        ('evening', 'Soir'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emotion_id = models.CharField(max_length=100, unique=True, verbose_name="ID Émotion")
    collaborator = models.ForeignKey(Collaborator, on_delete=models.CASCADE, related_name='emotions')
    emotion_type = models.ForeignKey(EmotionType, on_delete=models.CASCADE, related_name='emotion_entries')
    
    # Informations temporelles
    date = models.DateField(verbose_name="Date")
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, verbose_name="Période")
    week_number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(53)], verbose_name="Numéro de semaine")
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)], verbose_name="Mois")
    year = models.IntegerField(verbose_name="Année")
    
    # Informations contextuelles
    team = models.CharField(max_length=255, blank=True, verbose_name="Équipe")
    company = models.CharField(max_length=255, blank=True, verbose_name="Entreprise")
    cluster = models.CharField(max_length=255, blank=True, verbose_name="Cluster")
    full_name = models.CharField(max_length=300, blank=True, verbose_name="Nom complet")
    
    # Données calculées et insights
    weekly_emotion_summary = models.TextField(blank=True, verbose_name="Résumé émotionnel hebdomadaire")
    monthly_emotion_insights = models.TextField(blank=True, verbose_name="Insights émotionnels mensuels")
    emotion_degree = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)], verbose_name="Degré d'émotion")
    
    # Champs additionnels
    creation_date = models.DateTimeField(auto_now_add=True)
    half_day = models.CharField(max_length=10, blank=True, verbose_name="Demi-journée")
    date_period = models.CharField(max_length=20, blank=True, verbose_name="Période de date")
    emotion_illustration = models.TextField(blank=True, verbose_name="Illustration émotion")
    
    # Commentaire optionnel
    comment = models.TextField(blank=True, null=True, verbose_name="Commentaire")
    
    class Meta:
        verbose_name = "Déclaration d'émotion"
        verbose_name_plural = "Déclarations d'émotions"
        ordering = ['-date', '-creation_date']
        unique_together = ['collaborator', 'date', 'period']
        indexes = [
            models.Index(fields=['date', 'period']),
            models.Index(fields=['collaborator', 'date']),
            models.Index(fields=['week_number', 'year']),
            models.Index(fields=['month', 'year']),
        ]
    
    def calculate_date_period(self):
        """Calcule la période de date selon les règles métier"""
        if not self.date:
            return ""
        
        today = timezone.now().date()
        emotion_date = self.date
        
        # Si la date est aujourd'hui
        if emotion_date == today:
            return "Ce jour"
        
        # Si la date est dans la même semaine
        today_week_start = today - timedelta(days=today.weekday())
        today_week_end = today_week_start + timedelta(days=6)
        
        if today_week_start <= emotion_date <= today_week_end:
            return "Cette semaine"
        
        # Si la date est dans le même mois
        if emotion_date.year == today.year and emotion_date.month == today.month:
            return "Ce mois"
        
        # Si la date est dans la même année
        if emotion_date.year == today.year:
            return "Cette année"
        
        # Sinon, afficher l'année
        return str(emotion_date.year)
    
    def calculate_half_day(self):
        """Calcule la demi-journée selon l'heure de création"""
        if not self.creation_date:
            return ""
        
        # Utiliser l'heure locale
        local_time = timezone.localtime(self.creation_date)
        hour = local_time.hour
        
        if hour >= 12:
            return "soir"
        else:
            return "jour"
    
    def generate_weekly_summary(self):
        """Génère un résumé émotionnel hebdomadaire"""
        if not self.date:
            return ""
        
        # Obtenir toutes les émotions de la semaine pour ce collaborateur
        week_start = self.date - timedelta(days=self.date.weekday())
        week_end = week_start + timedelta(days=6)
        
        week_emotions = Emotion.objects.filter(
            collaborator=self.collaborator,
            date__gte=week_start,
            date__lte=week_end
        ).exclude(id=self.id)  # Exclure l'émotion actuelle si elle existe déjà
        
        if not week_emotions.exists():
            return f"Première émotion de la semaine du {week_start.strftime('%d/%m')}"
        
        # Analyser les émotions de la semaine
        emotion_counts = {}
        total_degree = 0
        
        for emotion in week_emotions:
            emotion_type = emotion.emotion_type.emotion
            emotion_counts[emotion_type] = emotion_counts.get(emotion_type, 0) + 1
            total_degree += emotion.emotion_degree
        
        # Ajouter l'émotion actuelle
        current_emotion = self.emotion_type.emotion
        emotion_counts[current_emotion] = emotion_counts.get(current_emotion, 0) + 1
        total_degree += self.emotion_degree
        
        total_emotions = len(week_emotions) + 1
        avg_degree = total_degree / total_emotions
        
        # Émotion dominante
        dominant_emotion = max(emotion_counts, key=emotion_counts.get)
        
        # Traduction des émotions
        emotion_labels = {
            'happy': 'heureux',
            'sad': 'triste',
            'neutral': 'neutre',
            'stressed': 'stressé',
            'excited': 'excité',
            'tired': 'fatigué',
            'angry': 'en colère',
            'anxious': 'anxieux'
        }
        
        dominant_label = emotion_labels.get(dominant_emotion, dominant_emotion)
        
        return f"Semaine du {week_start.strftime('%d/%m')}: {total_emotions} déclarations, " \
               f"tendance {dominant_label} ({emotion_counts[dominant_emotion]} fois), " \
               f"niveau moyen {avg_degree:.1f}/10"
    
    def generate_monthly_insights(self):
        """Génère des insights émotionnels mensuels"""
        if not self.date:
            return ""
        
        # Obtenir toutes les émotions du mois pour ce collaborateur
        month_start = self.date.replace(day=1)
        if self.date.month == 12:
            month_end = self.date.replace(year=self.date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = self.date.replace(month=self.date.month + 1, day=1) - timedelta(days=1)
        
        month_emotions = Emotion.objects.filter(
            collaborator=self.collaborator,
            date__gte=month_start,
            date__lte=month_end
        ).exclude(id=self.id)
        
        if not month_emotions.exists():
            return f"Première émotion du mois de {self.date.strftime('%B %Y')}"
        
        # Analyser les tendances du mois
        emotion_counts = {}
        weekly_averages = {}
        total_degree = 0
        
        for emotion in month_emotions:
            emotion_type = emotion.emotion_type.emotion
            emotion_counts[emotion_type] = emotion_counts.get(emotion_type, 0) + 1
            total_degree += emotion.emotion_degree
            
            # Grouper par semaine
            week_key = emotion.date.isocalendar()[1]
            if week_key not in weekly_averages:
                weekly_averages[week_key] = []
            weekly_averages[week_key].append(emotion.emotion_degree)
        
        # Ajouter l'émotion actuelle
        current_emotion = self.emotion_type.emotion
        emotion_counts[current_emotion] = emotion_counts.get(current_emotion, 0) + 1
        total_degree += self.emotion_degree
        
        current_week = self.date.isocalendar()[1]
        if current_week not in weekly_averages:
            weekly_averages[current_week] = []
        weekly_averages[current_week].append(self.emotion_degree)
        
        total_emotions = len(month_emotions) + 1
        avg_degree = total_degree / total_emotions
        
        # Calculer la tendance (amélioration/dégradation)
        week_avgs = []
        for week in sorted(weekly_averages.keys()):
            week_avg = sum(weekly_averages[week]) / len(weekly_averages[week])
            week_avgs.append(week_avg)
        
        trend = ""
        if len(week_avgs) >= 2:
            if week_avgs[-1] > week_avgs[0]:
                trend = "tendance à l'amélioration"
            elif week_avgs[-1] < week_avgs[0]:
                trend = "tendance à la baisse"
            else:
                trend = "tendance stable"
        
        # Émotion dominante
        dominant_emotion = max(emotion_counts, key=emotion_counts.get)
        emotion_labels = {
            'happy': 'heureux',
            'sad': 'triste',
            'neutral': 'neutre',
            'stressed': 'stressé',
            'excited': 'excité',
            'tired': 'fatigué',
            'angry': 'en colère',
            'anxious': 'anxieux'
        }
        dominant_label = emotion_labels.get(dominant_emotion, dominant_emotion)
        
        return f"Mois de {self.date.strftime('%B %Y')}: {total_emotions} déclarations, " \
               f"état dominant {dominant_label}, niveau moyen {avg_degree:.1f}/10" \
               f"{', ' + trend if trend else ''}"
    
    def save(self, *args, **kwargs):
        # Générer l'ID unique si pas encore défini
        if not self.emotion_id:
            self.emotion_id = f"{self.collaborator.collaborator_id}-{self.date}-{self.period}"
        
        # Auto-remplir les champs temporels
        if self.date:
            self.week_number = self.date.isocalendar()[1]
            self.month = self.date.month
            self.year = self.date.year
        
        # Auto-remplir les champs contextuels
        if self.collaborator:
            self.full_name = self.collaborator.full_name
            if self.collaborator.team:
                self.team = self.collaborator.team.team_name
            if self.collaborator.company:
                self.company = self.collaborator.company.name
            if self.collaborator.cluster:
                self.cluster = self.collaborator.cluster.name
        
        # Calculer les champs automatiques
        self.date_period = self.calculate_date_period()
        self.half_day = self.calculate_half_day()
        
        # Générer les résumés et insights
        self.weekly_emotion_summary = self.generate_weekly_summary()
        self.monthly_emotion_insights = self.generate_monthly_insights()
        
        super().save(*args, **kwargs)
        
        # Mettre à jour les champs émotionnels du collaborateur
        if self.collaborator:
            self.collaborator.update_emotion_fields()
    
    def __str__(self):
        return f"{self.collaborator.full_name} - {self.emotion_type.name} - {self.date} ({self.period})"


class EmotionTrend(models.Model):
    """Modèle pour les tendances émotionnelles"""
    TREND_PERIOD_CHOICES = [
        ('weekly', 'Hebdomadaire'),
        ('monthly', 'Mensuel'),
        ('quarterly', 'Trimestriel'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relations
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='emotion_trends', null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='emotion_trends', null=True, blank=True)
    
    # Données de tendance
    weekly_emotion_trend = models.JSONField(default=dict, verbose_name="Tendance émotionnelle hebdomadaire")
    monthly_emotion_summary = models.JSONField(default=dict, verbose_name="Résumé émotionnel mensuel")
    
    # Période et métadonnées
    period_type = models.CharField(max_length=20, choices=TREND_PERIOD_CHOICES, verbose_name="Type de période")
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    
    # Données calculées
    average_emotion_score = models.FloatField(null=True, blank=True, verbose_name="Score émotionnel moyen")
    dominant_emotion = models.CharField(max_length=100, blank=True, verbose_name="Émotion dominante")
    participation_rate = models.FloatField(null=True, blank=True, verbose_name="Taux de participation")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Tendance émotionnelle"
        verbose_name_plural = "Tendances émotionnelles"
        ordering = ['-start_date']
        unique_together = ['team', 'service', 'period_type', 'start_date']
    
    def __str__(self):
        entity = self.team.team_name if self.team else self.service.service_name if self.service else "Global"
        return f"Tendance {self.period_type} - {entity} - {self.start_date}"


class Alert(models.Model):
    """Modèle pour les alertes et notifications"""
    ALERT_TYPE_CHOICES = [
        ('consecutive_negative', 'Émotions négatives consécutives'),
        ('low_team_morale', 'Moral d\'équipe faible'),
        ('high_stress_level', 'Niveau de stress élevé'),
        ('low_participation', 'Faible participation'),
        ('significant_change', 'Changement significatif'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Moyen'),
        ('high', 'Élevé'),
        ('critical', 'Critique'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relations
    collaborator = models.ForeignKey(Collaborator, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    
    # Informations de l'alerte
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPE_CHOICES, verbose_name="Type d'alerte")
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium', verbose_name="Sévérité")
    title = models.CharField(max_length=255, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    
    # Métadonnées
    is_resolved = models.BooleanField(default=False, verbose_name="Résolu")
    resolved_by = models.ForeignKey(Collaborator, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts')
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="Résolu le")
    resolution_notes = models.TextField(blank=True, verbose_name="Notes de résolution")
    
    # Données contextuelles
    trigger_data = models.JSONField(default=dict, verbose_name="Données déclencheur")
    notification_sent = models.BooleanField(default=False, verbose_name="Notification envoyée")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['alert_type', 'is_resolved']),
            models.Index(fields=['severity', 'created_at']),
        ]
    
    def resolve(self, resolved_by, notes=""):
        """Marquer l'alerte comme résolue"""
        self.is_resolved = True
        self.resolved_by = resolved_by
        self.resolved_at = timezone.now()
        self.resolution_notes = notes
        self.save()
    
    def __str__(self):
        return f"{self.title} - {self.get_severity_display()} - {self.created_at.strftime('%d/%m/%Y')}"