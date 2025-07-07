from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, ClusterViewSet, ServiceViewSet, TeamViewSet,
    CollaboratorViewSet, EmotionTypeViewSet, EmotionViewSet,
    EmotionTrendViewSet, AlertViewSet, AuthViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'clusters', ClusterViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'collaborators', CollaboratorViewSet)
router.register(r'emotion-types', EmotionTypeViewSet)
router.register(r'emotions', EmotionViewSet)
router.register(r'emotion-trends', EmotionTrendViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]