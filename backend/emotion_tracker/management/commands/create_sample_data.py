from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from emotion_tracker.models import (
    Company, Cluster, Service, Team, Collaborator, 
    EmotionType, Emotion, Alert
)
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Crée des données d\'exemple pour l\'application Emotion Tracker'

    def handle(self, *args, **options):
        self.stdout.write('Création des données d\'exemple...')
        
        # Créer l'entreprise
        company, created = Company.objects.get_or_create(
            name='Axian Group',
            defaults={'name': 'Axian Group'}
        )
        
        # Créer les clusters
        clusters_data = [
            {'name': 'Direction Générale', 'company': company},
            {'name': 'Direction Support', 'company': company},
        ]
        
        clusters = {}
        for cluster_data in clusters_data:
            cluster, created = Cluster.objects.get_or_create(
                name=cluster_data['name'],
                company=cluster_data['company'],
                defaults=cluster_data
            )
            clusters[cluster.name] = cluster
        
        # Créer les services
        services_data = [
            {'service_name': 'Marketing', 'cluster': clusters['Direction Générale'], 'company': company},
            {'service_name': 'IT', 'cluster': clusters['Direction Générale'], 'company': company},
            {'service_name': 'RH', 'cluster': clusters['Direction Support'], 'company': company},
            {'service_name': 'Finance', 'cluster': clusters['Direction Support'], 'company': company},
        ]
        
        services = {}
        for service_data in services_data:
            service, created = Service.objects.get_or_create(
                service_name=service_data['service_name'],
                company=service_data['company'],
                defaults=service_data
            )
            services[service.service_name] = service
        
        # Créer les équipes
        teams_data = [
            {'team_name': 'Équipe Marketing Digital', 'service': services['Marketing'], 'company': company},
            {'team_name': 'Équipe Développement', 'service': services['IT'], 'company': company},
            {'team_name': 'Équipe Recrutement', 'service': services['RH'], 'company': company},
            {'team_name': 'Équipe Comptabilité', 'service': services['Finance'], 'company': company},
        ]
        
        teams = {}
        for team_data in teams_data:
            team, created = Team.objects.get_or_create(
                team_name=team_data['team_name'],
                company=team_data['company'],
                defaults=team_data
            )
            teams[team.team_name] = team
        
        # Créer les types d'émotions
        emotion_types_data = [
            {'name': 'Heureux', 'emotion': 'happy', 'degree': 8, 'emotions': 'Sentiment de joie et de satisfaction'},
            {'name': 'Triste', 'emotion': 'sad', 'degree': 3, 'emotions': 'Sentiment de tristesse ou de mélancolie'},
            {'name': 'Neutre', 'emotion': 'neutral', 'degree': 5, 'emotions': 'État émotionnel équilibré'},
            {'name': 'Stressé', 'emotion': 'stressed', 'degree': 2, 'emotions': 'Sentiment de pression et d\'anxiété'},
            {'name': 'Excité', 'emotion': 'excited', 'degree': 9, 'emotions': 'Sentiment d\'enthousiasme et d\'énergie'},
            {'name': 'Fatigué', 'emotion': 'tired', 'degree': 4, 'emotions': 'Sentiment de lassitude et de fatigue'},
        ]
        
        emotion_types = {}
        for emotion_data in emotion_types_data:
            emotion_type, created = EmotionType.objects.get_or_create(
                emotion=emotion_data['emotion'],
                defaults=emotion_data
            )
            emotion_types[emotion_type.emotion] = emotion_type
        
        # Créer les collaborateurs
        collaborators_data = [
            # Directeurs de pôle
            {
                'collaborator_id': 'DG001',
                'first_name': 'Directeur',
                'last_name': 'Général',
                'email': 'dg@axian.com',
                'role': 'pole_director',
                'cluster': clusters['Direction Générale'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'DS001',
                'first_name': 'Directeur',
                'last_name': 'Support',
                'email': 'ds@axian.com',
                'role': 'pole_director',
                'cluster': clusters['Direction Support'],
                'company': company,
                'password': 'password123'
            },
            
            # Directeurs
            {
                'collaborator_id': 'DIR001',
                'first_name': 'Isabelle',
                'last_name': 'Mercier',
                'email': 'isabelle.mercier@axian.com',
                'role': 'director',
                'service': services['Marketing'],
                'cluster': clusters['Direction Générale'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'DIR002',
                'first_name': 'Laurent',
                'last_name': 'Blanc',
                'email': 'laurent.blanc@axian.com',
                'role': 'director',
                'service': services['IT'],
                'cluster': clusters['Direction Générale'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'DIR003',
                'first_name': 'Nathalie',
                'last_name': 'Vincent',
                'email': 'nathalie.vincent@axian.com',
                'role': 'director',
                'service': services['RH'],
                'cluster': clusters['Direction Support'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'DIR004',
                'first_name': 'François',
                'last_name': 'Petit',
                'email': 'francois.petit@axian.com',
                'role': 'director',
                'service': services['Finance'],
                'cluster': clusters['Direction Support'],
                'company': company,
                'password': 'password123'
            },
            
            # Managers
            {
                'collaborator_id': 'MAN001',
                'first_name': 'Claire',
                'last_name': 'Rousseau',
                'email': 'claire.rousseau@axian.com',
                'role': 'manager',
                'team': teams['Équipe Marketing Digital'],
                'service': services['Marketing'],
                'cluster': clusters['Direction Générale'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'MAN002',
                'first_name': 'Thomas',
                'last_name': 'Leroy',
                'email': 'thomas.leroy@axian.com',
                'role': 'manager',
                'team': teams['Équipe Développement'],
                'service': services['IT'],
                'cluster': clusters['Direction Générale'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'MAN003',
                'first_name': 'Anne',
                'last_name': 'Dubois',
                'email': 'anne.dubois@axian.com',
                'role': 'manager',
                'team': teams['Équipe Recrutement'],
                'service': services['RH'],
                'cluster': clusters['Direction Support'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'MAN004',
                'first_name': 'Michel',
                'last_name': 'Garnier',
                'email': 'michel.garnier@axian.com',
                'role': 'manager',
                'team': teams['Équipe Comptabilité'],
                'service': services['Finance'],
                'cluster': clusters['Direction Support'],
                'company': company,
                'password': 'password123'
            },
            
            # Employés
            {
                'collaborator_id': 'EMP001',
                'first_name': 'Marie',
                'last_name': 'Dupont',
                'email': 'marie.dupont@axian.com',
                'role': 'employee',
                'team': teams['Équipe Marketing Digital'],
                'service': services['Marketing'],
                'cluster': clusters['Direction Générale'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'EMP002',
                'first_name': 'Jean',
                'last_name': 'Martin',
                'email': 'jean.martin@axian.com',
                'role': 'employee',
                'team': teams['Équipe Développement'],
                'service': services['IT'],
                'cluster': clusters['Direction Générale'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'EMP003',
                'first_name': 'Sophie',
                'last_name': 'Bernard',
                'email': 'sophie.bernard@axian.com',
                'role': 'employee',
                'team': teams['Équipe Recrutement'],
                'service': services['RH'],
                'cluster': clusters['Direction Support'],
                'company': company,
                'password': 'password123'
            },
            {
                'collaborator_id': 'EMP004',
                'first_name': 'Pierre',
                'last_name': 'Moreau',
                'email': 'pierre.moreau@axian.com',
                'role': 'employee',
                'team': teams['Équipe Comptabilité'],
                'service': services['Finance'],
                'cluster': clusters['Direction Support'],
                'company': company,
                'password': 'password123'
            },
        ]
        
        collaborators = {}
        for collab_data in collaborators_data:
            password = collab_data.pop('password')
            collaborator, created = Collaborator.objects.get_or_create(
                email=collab_data['email'],
                defaults=collab_data
            )
            if created:
                collaborator.set_password(password)
                collaborator.save()
            collaborators[collaborator.collaborator_id] = collaborator
        
        # Définir les relations manager
        manager_relations = [
            ('EMP001', 'MAN001'),  # Marie -> Claire
            ('EMP002', 'MAN002'),  # Jean -> Thomas
            ('EMP003', 'MAN003'),  # Sophie -> Anne
            ('EMP004', 'MAN004'),  # Pierre -> Michel
        ]
        
        for employee_id, manager_id in manager_relations:
            employee = collaborators[employee_id]
            manager = collaborators[manager_id]
            employee.manager = manager
            employee.save()
        
        # Créer des émotions d'exemple pour les 30 derniers jours
        employees = [collab for collab in collaborators.values() if collab.role == 'employee']
        emotion_choices = list(emotion_types.keys())
        
        for i in range(30):
            current_date = date.today() - timedelta(days=i)
            
            for employee in employees:
                # Émotion du matin (90% de chance)
                if random.random() < 0.9:
                    emotion_type = emotion_types[random.choice(emotion_choices)]
                    Emotion.objects.get_or_create(
                        collaborator=employee,
                        date=current_date,
                        period='morning',
                        defaults={
                            'emotion_type': emotion_type,
                            'emotion_degree': emotion_type.degree + random.randint(-2, 2),
                            'comment': self.get_random_comment(emotion_type.emotion) if random.random() < 0.3 else None
                        }
                    )
                
                # Émotion du soir (85% de chance)
                if random.random() < 0.85:
                    emotion_type = emotion_types[random.choice(emotion_choices)]
                    Emotion.objects.get_or_create(
                        collaborator=employee,
                        date=current_date,
                        period='evening',
                        defaults={
                            'emotion_type': emotion_type,
                            'emotion_degree': emotion_type.degree + random.randint(-2, 2),
                            'comment': self.get_random_comment(emotion_type.emotion) if random.random() < 0.3 else None
                        }
                    )
        
        # Créer quelques alertes d'exemple
        alerts_data = [
            {
                'collaborator': employees[0],
                'alert_type': 'consecutive_negative',
                'severity': 'medium',
                'title': 'Émotions négatives consécutives',
                'message': f'{employees[0].full_name} a déclaré des émotions négatives plusieurs jours consécutifs.',
                'is_resolved': False
            },
            {
                'team': teams['Équipe Développement'],
                'alert_type': 'low_team_morale',
                'severity': 'high',
                'title': 'Moral d\'équipe faible',
                'message': 'L\'équipe Développement montre un moral en baisse cette semaine.',
                'is_resolved': False
            }
        ]
        
        for alert_data in alerts_data:
            Alert.objects.get_or_create(
                title=alert_data['title'],
                defaults=alert_data
            )
        
        self.stdout.write(
            self.style.SUCCESS('Données d\'exemple créées avec succès!')
        )
        self.stdout.write(f'- Entreprise: {company.name}')
        self.stdout.write(f'- Clusters: {len(clusters)}')
        self.stdout.write(f'- Services: {len(services)}')
        self.stdout.write(f'- Équipes: {len(teams)}')
        self.stdout.write(f'- Collaborateurs: {len(collaborators)}')
        self.stdout.write(f'- Types d\'émotions: {len(emotion_types)}')
        self.stdout.write(f'- Émotions créées: {Emotion.objects.count()}')
        self.stdout.write(f'- Alertes créées: {Alert.objects.count()}')
    
    def get_random_comment(self, emotion):
        comments = {
            'happy': [
                'Très bonne journée !',
                'Projet terminé avec succès',
                'Excellente ambiance d\'équipe',
                'Formation très enrichissante'
            ],
            'sad': [
                'Journée difficile',
                'Problèmes personnels',
                'Charge de travail importante',
                'Déçu du résultat'
            ],
            'neutral': [
                'Journée normale',
                'Rien de particulier',
                'Routine habituelle',
                'Journée standard'
            ],
            'stressed': [
                'Délais serrés',
                'Beaucoup de pression',
                'Trop de réunions',
                'Surcharge de travail'
            ],
            'excited': [
                'Nouveau projet passionnant !',
                'Bonne nouvelle !',
                'Formation intéressante',
                'Objectifs atteints !'
            ],
            'tired': [
                'Manque de sommeil',
                'Journée chargée',
                'Besoin de repos',
                'Fatigue accumulée'
            ]
        }
        
        return random.choice(comments.get(emotion, ['Pas de commentaire particulier']))