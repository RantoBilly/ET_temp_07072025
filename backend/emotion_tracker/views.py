from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Company, Cluster, Service, Team, Collaborator,
    EmotionType, Emotion, EmotionTrend, Alert
)
from .serializers import (
    CompanySerializer, ClusterSerializer, ServiceSerializer, TeamSerializer,
    CollaboratorSerializer, EmotionTypeSerializer, EmotionSerializer,
    EmotionCreateSerializer, EmotionTrendSerializer, AlertSerializer,
    LoginSerializer, DashboardDataSerializer
)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]


class ClusterViewSet(viewsets.ModelViewSet):
    queryset = Cluster.objects.all()
    serializer_class = ClusterSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company', None)
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company', None)
        cluster_id = self.request.query_params.get('cluster', None)
        
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if cluster_id:
            queryset = queryset.filter(cluster_id=cluster_id)
        
        return queryset


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        service_id = self.request.query_params.get('service', None)
        company_id = self.request.query_params.get('company', None)
        
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        
        return queryset


class CollaboratorViewSet(viewsets.ModelViewSet):
    queryset = Collaborator.objects.all()
    serializer_class = CollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filtrer selon le rôle de l'utilisateur
        if user.role == 'employee':
            queryset = queryset.filter(id=user.id)
        elif user.role == 'manager':
            queryset = queryset.filter(
                Q(manager=user) | Q(id=user.id)
            )
        elif user.role == 'director':
            queryset = queryset.filter(service=user.service)
        elif user.role == 'pole_director':
            queryset = queryset.filter(cluster=user.cluster)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retourne les informations de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def team_members(self, request):
        """Retourne les membres de l'équipe de l'utilisateur"""
        user = request.user
        if user.role in ['manager', 'director']:
            if user.role == 'manager':
                members = Collaborator.objects.filter(manager=user)
            else:
                members = Collaborator.objects.filter(service=user.service)
            
            serializer = self.get_serializer(members, many=True)
            return Response(serializer.data)
        
        return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)


class EmotionTypeViewSet(viewsets.ModelViewSet):
    queryset = EmotionType.objects.all()
    serializer_class = EmotionTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmotionViewSet(viewsets.ModelViewSet):
    queryset = Emotion.objects.all()
    serializer_class = EmotionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filtrer selon le rôle de l'utilisateur
        if user.role == 'employee':
            queryset = queryset.filter(collaborator=user)
        elif user.role == 'manager':
            team_members = Collaborator.objects.filter(manager=user)
            queryset = queryset.filter(collaborator__in=team_members)
        elif user.role == 'director':
            service_members = Collaborator.objects.filter(service=user.service)
            queryset = queryset.filter(collaborator__in=service_members)
        elif user.role == 'pole_director':
            cluster_members = Collaborator.objects.filter(cluster=user.cluster)
            queryset = queryset.filter(collaborator__in=cluster_members)
        
        # Filtres par paramètres
        days = self.request.query_params.get('days', None)
        if days:
            start_date = timezone.now().date() - timedelta(days=int(days))
            queryset = queryset.filter(date__gte=start_date)
        
        collaborator_id = self.request.query_params.get('collaborator', None)
        if collaborator_id:
            queryset = queryset.filter(collaborator_id=collaborator_id)
        
        period = self.request.query_params.get('period', None)
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset.order_by('-date', '-creation_date')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmotionCreateSerializer
        return EmotionSerializer
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Retourne les émotions du jour pour l'utilisateur connecté"""
        today = timezone.now().date()
        emotions = Emotion.objects.filter(
            collaborator=request.user,
            date=today
        )
        
        result = {
            'morning': None,
            'evening': None
        }
        
        for emotion in emotions:
            result[emotion.period] = EmotionSerializer(emotion).data
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retourne les statistiques d'émotions"""
        queryset = self.get_queryset()
        
        # Calculer les statistiques
        stats = {
            'total': queryset.count(),
            'happy': queryset.filter(emotion_type__emotion='happy').count(),
            'sad': queryset.filter(emotion_type__emotion='sad').count(),
            'neutral': queryset.filter(emotion_type__emotion='neutral').count(),
            'stressed': queryset.filter(emotion_type__emotion='stressed').count(),
            'excited': queryset.filter(emotion_type__emotion='excited').count(),
            'tired': queryset.filter(emotion_type__emotion='tired').count(),
        }
        
        # Calculer le taux de participation
        days = int(request.query_params.get('days', 30))
        expected_declarations = days * 2  # matin + soir
        participation_rate = (stats['total'] / expected_declarations * 100) if expected_declarations > 0 else 0
        
        # Calculer le score moyen
        avg_score = queryset.aggregate(avg_score=Avg('emotion_degree'))['avg_score'] or 0
        
        stats.update({
            'participation_rate': round(participation_rate, 1),
            'average_score': round(avg_score, 1),
            'period_start': timezone.now().date() - timedelta(days=days),
            'period_end': timezone.now().date()
        })
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Exporte les données d'émotions"""
        queryset = self.get_queryset()
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'csv':
            # Logique d'export CSV
            pass
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class EmotionTrendViewSet(viewsets.ModelViewSet):
    queryset = EmotionTrend.objects.all()
    serializer_class = EmotionTrendSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filtrer selon le rôle
        if user.role == 'manager':
            queryset = queryset.filter(team__collaborators__manager=user)
        elif user.role == 'director':
            queryset = queryset.filter(service=user.service)
        elif user.role == 'pole_director':
            queryset = queryset.filter(service__cluster=user.cluster)
        
        return queryset


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filtrer selon le rôle
        if user.role == 'employee':
            queryset = queryset.filter(collaborator=user)
        elif user.role == 'manager':
            team_members = Collaborator.objects.filter(manager=user)
            queryset = queryset.filter(
                Q(collaborator__in=team_members) | 
                Q(team__collaborators__manager=user)
            )
        elif user.role == 'director':
            queryset = queryset.filter(
                Q(collaborator__service=user.service) |
                Q(service=user.service)
            )
        elif user.role == 'pole_director':
            queryset = queryset.filter(
                Q(collaborator__cluster=user.cluster) |
                Q(service__cluster=user.cluster)
            )
        
        # Filtrer par statut
        resolved = self.request.query_params.get('resolved', None)
        if resolved is not None:
            queryset = queryset.filter(is_resolved=resolved.lower() == 'true')
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Marquer une alerte comme résolue"""
        alert = self.get_object()
        notes = request.data.get('notes', '')
        
        alert.resolve(resolved_by=request.user, notes=notes)
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unresolved(self, request):
        """Retourne les alertes non résolues"""
        queryset = self.get_queryset().filter(is_resolved=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AuthViewSet(viewsets.ViewSet):
    """ViewSet pour l'authentification"""
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Connexion utilisateur"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': CollaboratorSerializer(user).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Déconnexion utilisateur"""
        try:
            request.user.auth_token.delete()
        except:
            pass
        
        return Response({'message': 'Déconnexion réussie'})


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet pour les données du dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def data(self, request):
        """Retourne toutes les données nécessaires pour le dashboard"""
        user = request.user
        days = int(request.query_params.get('days', 7))
        
        # Données utilisateur
        user_data = CollaboratorSerializer(user).data
        
        # Émotions récentes
        recent_emotions = Emotion.objects.filter(
            collaborator=user,
            date__gte=timezone.now().date() - timedelta(days=days)
        ).order_by('-date', '-creation_date')[:10]
        
        # Statistiques personnelles
        personal_stats = self._get_emotion_stats(user, days)
        
        # Statistiques d'équipe (si manager ou plus)
        team_stats = None
        if user.role in ['manager', 'director', 'pole_director']:
            team_stats = self._get_team_stats(user, days)
        
        # Alertes
        alerts = Alert.objects.filter(
            collaborator=user,
            is_resolved=False
        )[:5]
        
        # Tendances
        trends = EmotionTrend.objects.filter(
            start_date__gte=timezone.now().date() - timedelta(days=30)
        )[:5]
        
        data = {
            'user_info': user_data,
            'recent_emotions': EmotionSerializer(recent_emotions, many=True).data,
            'emotion_stats': personal_stats,
            'team_stats': team_stats,
            'alerts': AlertSerializer(alerts, many=True).data,
            'trends': EmotionTrendSerializer(trends, many=True).data
        }
        
        return Response(data)
    
    def _get_emotion_stats(self, user, days):
        """Calcule les statistiques d'émotions pour un utilisateur"""
        emotions = Emotion.objects.filter(
            collaborator=user,
            date__gte=timezone.now().date() - timedelta(days=days)
        )
        
        stats = {
            'total': emotions.count(),
            'happy': emotions.filter(emotion_type__emotion='happy').count(),
            'sad': emotions.filter(emotion_type__emotion='sad').count(),
            'neutral': emotions.filter(emotion_type__emotion='neutral').count(),
            'stressed': emotions.filter(emotion_type__emotion='stressed').count(),
            'excited': emotions.filter(emotion_type__emotion='excited').count(),
            'tired': emotions.filter(emotion_type__emotion='tired').count(),
        }
        
        expected = days * 2
        participation_rate = (stats['total'] / expected * 100) if expected > 0 else 0
        avg_score = emotions.aggregate(avg=Avg('emotion_degree'))['avg'] or 0
        
        stats.update({
            'participation_rate': round(participation_rate, 1),
            'average_score': round(avg_score, 1),
            'period_start': timezone.now().date() - timedelta(days=days),
            'period_end': timezone.now().date()
        })
        
        return stats
    
    def _get_team_stats(self, user, days):
        """Calcule les statistiques d'équipe selon le rôle"""
        if user.role == 'manager':
            team_members = Collaborator.objects.filter(manager=user)
        elif user.role == 'director':
            team_members = Collaborator.objects.filter(service=user.service)
        elif user.role == 'pole_director':
            team_members = Collaborator.objects.filter(cluster=user.cluster)
        else:
            return None
        
        emotions = Emotion.objects.filter(
            collaborator__in=team_members,
            date__gte=timezone.now().date() - timedelta(days=days)
        )
        
        stats = {
            'total': emotions.count(),
            'happy': emotions.filter(emotion_type__emotion='happy').count(),
            'sad': emotions.filter(emotion_type__emotion='sad').count(),
            'neutral': emotions.filter(emotion_type__emotion='neutral').count(),
            'stressed': emotions.filter(emotion_type__emotion='stressed').count(),
            'excited': emotions.filter(emotion_type__emotion='excited').count(),
            'tired': emotions.filter(emotion_type__emotion='tired').count(),
        }
        
        expected = team_members.count() * days * 2
        participation_rate = (stats['total'] / expected * 100) if expected > 0 else 0
        avg_score = emotions.aggregate(avg=Avg('emotion_degree'))['avg'] or 0
        
        stats.update({
            'participation_rate': round(participation_rate, 1),
            'average_score': round(avg_score, 1),
            'period_start': timezone.now().date() - timedelta(days=days),
            'period_end': timezone.now().date()
        })
        
        return stats