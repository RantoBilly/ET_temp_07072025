from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    Company, Cluster, Service, Team, Collaborator,
    EmotionType, Emotion, EmotionTrend, Alert
)


class CompanySerializer(serializers.ModelSerializer):
    clusters_count = serializers.SerializerMethodField()
    services_count = serializers.SerializerMethodField()
    collaborators_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'clusters_count', 'services_count', 'collaborators_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_clusters_count(self, obj):
        return obj.clusters.count()
    
    def get_services_count(self, obj):
        return obj.services.count()
    
    def get_collaborators_count(self, obj):
        return obj.collaborators.count()


class ClusterSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    services_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cluster
        fields = ['id', 'name', 'company', 'company_name', 'services_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_services_count(self, obj):
        return obj.services.count()


class ServiceSerializer(serializers.ModelSerializer):
    cluster_name = serializers.CharField(source='cluster.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    teams_count = serializers.SerializerMethodField()
    collaborators_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'service_name', 'cluster', 'cluster_name', 
            'company', 'company_name', 'teams_count', 'collaborators_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_teams_count(self, obj):
        return obj.teams.count()
    
    def get_collaborators_count(self, obj):
        return obj.collaborators.count()


class TeamSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    collaborators_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            'id', 'team_name', 'service', 'service_name', 
            'company', 'company_name', 'collaborators_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_collaborators_count(self, obj):
        return obj.collaborators.count()


class CollaboratorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    team_name = serializers.CharField(source='team.team_name', read_only=True)
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Collaborator
        fields = [
            'id', 'collaborator_id', 'first_name', 'last_name', 'full_name',
            'email', 'role', 'team', 'team_name', 'service', 'service_name',
            'company', 'company_name', 'manager', 'manager_name',
            'emotion_today_morning', 'emotion_today_evening',
            'emotion_this_week', 'emotion_this_month',
            'emotion_degree_this_week', 'emotion_degree_this_month',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'full_name', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        collaborator = Collaborator.objects.create(**validated_data)
        if password:
            collaborator.set_password(password)
            collaborator.save()
        return collaborator


class EmotionTypeSerializer(serializers.ModelSerializer):
    usage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EmotionType
        fields = ['id', 'name', 'emotion', 'degree', 'emotions', 'usage_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_usage_count(self, obj):
        return obj.emotion_entries.count()


class EmotionSerializer(serializers.ModelSerializer):
    collaborator_name = serializers.CharField(source='collaborator.full_name', read_only=True)
    emotion_type_name = serializers.CharField(source='emotion_type.name', read_only=True)
    emotion_type_degree = serializers.IntegerField(source='emotion_type.degree', read_only=True)
    
    class Meta:
        model = Emotion
        fields = [
            'id', 'emotion_id', 'collaborator', 'collaborator_name',
            'emotion_type', 'emotion_type_name', 'emotion_type_degree',
            'date', 'period', 'week_number', 'month', 'year',
            'team', 'company', 'cluster', 'full_name',
            'emotion_degree', 'comment', 'half_day',
            'weekly_emotion_summary', 'monthly_emotion_insights',
            'creation_date'
        ]
        read_only_fields = [
            'id', 'emotion_id', 'week_number', 'month', 'year',
            'team', 'company', 'cluster', 'full_name', 'creation_date'
        ]


class EmotionCreateSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la création d'émotions"""
    
    class Meta:
        model = Emotion
        fields = ['collaborator', 'emotion_type', 'date', 'period', 'emotion_degree', 'comment']
    
    def validate(self, data):
        # Vérifier qu'il n'y a pas déjà une émotion pour cette période
        collaborator = data['collaborator']
        date = data['date']
        period = data['period']
        
        existing = Emotion.objects.filter(
            collaborator=collaborator,
            date=date,
            period=period
        ).first()
        
        if existing:
            raise serializers.ValidationError(
                f"Une émotion a déjà été déclarée pour {period} le {date}"
            )
        
        return data


class EmotionTrendSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.team_name', read_only=True)
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    
    class Meta:
        model = EmotionTrend
        fields = [
            'id', 'team', 'team_name', 'service', 'service_name',
            'weekly_emotion_trend', 'monthly_emotion_summary',
            'period_type', 'start_date', 'end_date',
            'average_emotion_score', 'dominant_emotion', 'participation_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AlertSerializer(serializers.ModelSerializer):
    collaborator_name = serializers.CharField(source='collaborator.full_name', read_only=True)
    team_name = serializers.CharField(source='team.team_name', read_only=True)
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.full_name', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'collaborator', 'collaborator_name', 'team', 'team_name',
            'service', 'service_name', 'alert_type', 'severity',
            'title', 'message', 'is_resolved', 'resolved_by', 'resolved_by_name',
            'resolved_at', 'resolution_notes', 'trigger_data',
            'notification_sent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('Compte utilisateur désactivé.')
            else:
                raise serializers.ValidationError('Email ou mot de passe incorrect.')
        else:
            raise serializers.ValidationError('Email et mot de passe requis.')
        
        return data


class EmotionStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques d'émotions"""
    total = serializers.IntegerField()
    happy = serializers.IntegerField()
    sad = serializers.IntegerField()
    neutral = serializers.IntegerField()
    stressed = serializers.IntegerField()
    excited = serializers.IntegerField()
    tired = serializers.IntegerField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    participation_rate = serializers.FloatField()
    average_score = serializers.FloatField()


class DashboardDataSerializer(serializers.Serializer):
    """Serializer pour les données du dashboard"""
    user_info = CollaboratorSerializer()
    recent_emotions = EmotionSerializer(many=True)
    emotion_stats = EmotionStatsSerializer()
    team_stats = EmotionStatsSerializer(required=False)
    alerts = AlertSerializer(many=True)
    trends = EmotionTrendSerializer(many=True)