from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Company, Cluster, Service, Team, Collaborator, 
    EmotionType, Emotion, EmotionTrend, Alert
)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'clusters_count', 'services_count', 'collaborators_count', 'created_at']
    search_fields = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def clusters_count(self, obj):
        return obj.clusters.count()
    clusters_count.short_description = 'Clusters'
    
    def services_count(self, obj):
        return obj.services.count()
    services_count.short_description = 'Services'
    
    def collaborators_count(self, obj):
        return obj.collaborators.count()
    collaborators_count.short_description = 'Collaborateurs'


@admin.register(Cluster)
class ClusterAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'services_count', 'collaborators_count', 'created_at']
    list_filter = ['company', 'created_at']
    search_fields = ['name', 'company__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def services_count(self, obj):
        return obj.services.count()
    services_count.short_description = 'Services'
    
    def collaborators_count(self, obj):
        return obj.collaborators.count()
    collaborators_count.short_description = 'Collaborateurs'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['service_name', 'cluster', 'company', 'teams_count', 'collaborators_count', 'created_at']
    list_filter = ['company', 'cluster', 'created_at']
    search_fields = ['service_name', 'company__name', 'cluster__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def teams_count(self, obj):
        return obj.teams.count()
    teams_count.short_description = 'Équipes'
    
    def collaborators_count(self, obj):
        return obj.collaborators.count()
    collaborators_count.short_description = 'Collaborateurs'


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['team_name', 'service', 'company', 'collaborators_count', 'created_at']
    list_filter = ['company', 'service', 'created_at']
    search_fields = ['team_name', 'service__service_name', 'company__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def collaborators_count(self, obj):
        return obj.collaborators.count()
    collaborators_count.short_description = 'Collaborateurs'


@admin.register(Collaborator)
class CollaboratorAdmin(UserAdmin):
    list_display = [
        'collaborator_id', 'full_name', 'email', 'role', 
        'team', 'service', 'manager', 'emotion_status', 'is_active'
    ]
    list_filter = ['role', 'company', 'service', 'team', 'is_active', 'date_joined']
    search_fields = ['collaborator_id', 'first_name', 'last_name', 'email']
    readonly_fields = ['id', 'date_joined', 'last_login']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('collaborator_id', 'first_name', 'last_name', 'email', 'username')
        }),
        ('Rôle et hiérarchie', {
            'fields': ('role', 'company', 'cluster', 'service', 'team', 'manager')
        }),
        ('État émotionnel actuel', {
            'fields': (
                'emotion_today_morning', 'emotion_today_evening',
                'emotion_this_week', 'emotion_this_month',
                'emotion_degree_this_week', 'emotion_degree_this_month'
            ),
            'classes': ['collapse']
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ['collapse']
        }),
        ('Dates importantes', {
            'fields': ('last_login', 'date_joined'),
            'classes': ['collapse']
        }),
    )
    
    add_fieldsets = (
        ('Informations requises', {
            'classes': ('wide',),
            'fields': ('collaborator_id', 'first_name', 'last_name', 'email', 'password1', 'password2'),
        }),
        ('Rôle et organisation', {
            'fields': ('role', 'company', 'service', 'team', 'manager')
        }),
    )
    
    def emotion_status(self, obj):
        morning = "🌅" if obj.emotion_today_morning else "❌"
        evening = "🌙" if obj.emotion_today_evening else "❌"
        return format_html(f"{morning} {evening}")
    emotion_status.short_description = 'Émotions du jour'


@admin.register(EmotionType)
class EmotionTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'emotion', 'degree', 'usage_count', 'created_at']
    list_filter = ['degree', 'created_at']
    search_fields = ['name', 'emotion']
    readonly_fields = ['id', 'created_at']
    ordering = ['degree', 'name']
    
    def usage_count(self, obj):
        return obj.emotion_entries.count()
    usage_count.short_description = 'Utilisations'


@admin.register(Emotion)
class EmotionAdmin(admin.ModelAdmin):
    list_display = [
        'emotion_id', 'collaborator_name', 'emotion_type', 'date', 
        'period', 'emotion_degree', 'team', 'has_comment'
    ]
    list_filter = [
        'emotion_type', 'period', 'date', 'week_number', 'month', 'year',
        'collaborator__service', 'collaborator__team'
    ]
    search_fields = [
        'emotion_id', 'collaborator__first_name', 'collaborator__last_name',
        'collaborator__collaborator_id', 'comment'
    ]
    readonly_fields = [
        'id', 'emotion_id', 'week_number', 'month', 'year', 
        'creation_date', 'full_name', 'team', 'company', 'cluster'
    ]
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('emotion_id', 'collaborator', 'emotion_type', 'emotion_degree')
        }),
        ('Temporalité', {
            'fields': ('date', 'period', 'week_number', 'month', 'year')
        }),
        ('Contexte organisationnel', {
            'fields': ('team', 'company', 'cluster', 'full_name'),
            'classes': ['collapse']
        }),
        ('Commentaire et détails', {
            'fields': ('comment', 'half_day', 'emotion_illustration')
        }),
        ('Données calculées', {
            'fields': ('weekly_emotion_summary', 'monthly_emotion_insights'),
            'classes': ['collapse']
        }),
        ('Métadonnées', {
            'fields': ('creation_date',),
            'classes': ['collapse']
        }),
    )
    
    def collaborator_name(self, obj):
        return obj.collaborator.full_name
    collaborator_name.short_description = 'Collaborateur'
    
    def has_comment(self, obj):
        return "✓" if obj.comment else "✗"
    has_comment.short_description = 'Commentaire'
    has_comment.boolean = True


@admin.register(EmotionTrend)
class EmotionTrendAdmin(admin.ModelAdmin):
    list_display = [
        'entity_name', 'period_type', 'start_date', 'end_date',
        'average_emotion_score', 'dominant_emotion', 'participation_rate'
    ]
    list_filter = ['period_type', 'start_date', 'team__service', 'service']
    search_fields = ['team__team_name', 'service__service_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'start_date'
    
    def entity_name(self, obj):
        if obj.team:
            return f"Équipe: {obj.team.team_name}"
        elif obj.service:
            return f"Service: {obj.service.service_name}"
        return "Global"
    entity_name.short_description = 'Entité'


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'alert_type', 'severity', 'target_entity',
        'is_resolved', 'created_at', 'resolved_by'
    ]
    list_filter = [
        'alert_type', 'severity', 'is_resolved', 'created_at',
        'collaborator__service', 'team__service'
    ]
    search_fields = ['title', 'message', 'collaborator__full_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informations de l\'alerte', {
            'fields': ('alert_type', 'severity', 'title', 'message')
        }),
        ('Cible', {
            'fields': ('collaborator', 'team', 'service')
        }),
        ('Résolution', {
            'fields': ('is_resolved', 'resolved_by', 'resolved_at', 'resolution_notes')
        }),
        ('Données techniques', {
            'fields': ('trigger_data', 'notification_sent'),
            'classes': ['collapse']
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def target_entity(self, obj):
        if obj.collaborator:
            return f"👤 {obj.collaborator.full_name}"
        elif obj.team:
            return f"👥 {obj.team.team_name}"
        elif obj.service:
            return f"🏢 {obj.service.service_name}"
        return "🌐 Global"
    target_entity.short_description = 'Cible'
    
    actions = ['mark_as_resolved', 'mark_as_unresolved']
    
    def mark_as_resolved(self, request, queryset):
        updated = queryset.update(is_resolved=True, resolved_by=request.user)
        self.message_user(request, f'{updated} alerte(s) marquée(s) comme résolue(s).')
    mark_as_resolved.short_description = "Marquer comme résolu"
    
    def mark_as_unresolved(self, request, queryset):
        updated = queryset.update(is_resolved=False, resolved_by=None, resolved_at=None)
        self.message_user(request, f'{updated} alerte(s) marquée(s) comme non résolue(s).')
    mark_as_unresolved.short_description = "Marquer comme non résolu"


# Configuration de l'admin
admin.site.site_header = "Emotion Tracker - Administration"
admin.site.site_title = "Emotion Tracker Admin"
admin.site.index_title = "Gestion de la plateforme Emotion Tracker"