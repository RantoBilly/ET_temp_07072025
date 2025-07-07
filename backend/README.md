# Emotion Tracker - Backend Django

Backend API pour l'application Emotion Tracker développé avec Django REST Framework.

## 🚀 Installation et Configuration

### Prérequis
- Python 3.8+
- PostgreSQL 12+
- Redis (pour le cache et Celery)

### Installation

1. **Cloner le projet et créer l'environnement virtuel**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configuration de la base de données**
```bash
# Créer la base de données PostgreSQL
createdb emotion_tracker

# Variables d'environnement (créer un fichier .env)
DB_NAME=emotion_tracker
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
```

4. **Migrations et données d'exemple**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py create_sample_data
python manage.py createsuperuser
```

5. **Lancer le serveur**
```bash
python manage.py runserver
```

## 📊 Structure de la Base de Données

### Modèles Principaux

#### **Company** (Entreprise)
- `id`: UUID (PK)
- `name`: Nom de l'entreprise
- `created_at`, `updated_at`: Timestamps

#### **Cluster** (Pôle/Direction)
- `id`: UUID (PK)
- `name`: Nom du cluster
- `company`: FK vers Company
- Relations: Services, Collaborateurs

#### **Service** (Département)
- `id`: UUID (PK)
- `service_name`: Nom du service
- `cluster`: FK vers Cluster (optionnel)
- `company`: FK vers Company
- Relations: Teams, Collaborateurs

#### **Team** (Équipe)
- `id`: UUID (PK)
- `team_name`: Nom de l'équipe
- `service`: FK vers Service (optionnel)
- `company`: FK vers Company
- Relations: Collaborateurs

#### **Collaborator** (Utilisateur étendu)
- `id`: UUID (PK)
- `collaborator_id`: ID unique collaborateur
- `first_name`, `last_name`: Nom et prénom
- `email`: Email (unique)
- `role`: Rôle (employee, manager, director, pole_director, admin)
- `team`, `service`, `cluster`, `company`: Relations hiérarchiques
- `manager`: FK vers Collaborator (manager hiérarchique)
- Champs émotionnels calculés automatiquement

#### **EmotionType** (Type d'émotion)
- `id`: UUID (PK)
- `name`: Nom de l'émotion
- `emotion`: Code émotion (happy, sad, etc.)
- `degree`: Degré d'intensité (1-10)
- `emotions`: Description

#### **Emotion** (Déclaration d'émotion)
- `id`: UUID (PK)
- `emotion_id`: ID unique de la déclaration
- `collaborator`: FK vers Collaborator
- `emotion_type`: FK vers EmotionType
- `date`: Date de la déclaration
- `period`: Période (morning/evening)
- `emotion_degree`: Degré personnalisé (1-10)
- `comment`: Commentaire optionnel
- Champs calculés automatiquement (semaine, mois, année)

#### **EmotionTrend** (Tendances émotionnelles)
- `id`: UUID (PK)
- `team`, `service`: Relations optionnelles
- `weekly_emotion_trend`: Données JSON des tendances
- `monthly_emotion_summary`: Résumé mensuel JSON
- `period_type`: Type de période (weekly, monthly, quarterly)
- Métriques calculées (score moyen, émotion dominante, participation)

#### **Alert** (Alertes et notifications)
- `id`: UUID (PK)
- `collaborator`, `team`, `service`: Cibles de l'alerte
- `alert_type`: Type d'alerte
- `severity`: Sévérité (low, medium, high, critical)
- `title`, `message`: Contenu de l'alerte
- `is_resolved`: Statut de résolution
- `trigger_data`: Données JSON du déclencheur

## 🔐 Authentification et Permissions

### Système de Rôles
- **Employee**: Accès à ses propres données uniquement
- **Manager**: Accès à son équipe + ses propres données
- **Director**: Accès à son département complet
- **Pole Director**: Accès à tous les départements de son cluster
- **Admin**: Accès complet

### API Endpoints

#### Authentification
```
POST /api/auth/login/     # Connexion
POST /api/auth/logout/    # Déconnexion
```

#### Données organisationnelles
```
GET /api/companies/       # Liste des entreprises
GET /api/clusters/        # Liste des clusters
GET /api/services/        # Liste des services
GET /api/teams/           # Liste des équipes
GET /api/collaborators/   # Liste des collaborateurs
```

#### Émotions
```
GET /api/emotions/        # Liste des émotions (filtrées par rôle)
POST /api/emotions/       # Créer une nouvelle émotion
GET /api/emotions/today/  # Émotions du jour
GET /api/emotions/stats/  # Statistiques d'émotions
GET /api/emotions/export/ # Export des données
```

#### Dashboard
```
GET /api/dashboard/data/  # Toutes les données du dashboard
```

#### Alertes
```
GET /api/alerts/          # Liste des alertes
POST /api/alerts/{id}/resolve/ # Résoudre une alerte
GET /api/alerts/unresolved/    # Alertes non résolues
```

## 📈 Fonctionnalités Avancées

### Calculs Automatiques
- **Champs émotionnels**: Mise à jour automatique des émotions du jour/semaine/mois
- **Statistiques**: Calcul en temps réel des métriques d'équipe
- **Tendances**: Génération automatique des tendances émotionnelles

### Système d'Alertes
- **Émotions négatives consécutives**: Détection automatique
- **Moral d'équipe faible**: Surveillance des équipes
- **Faible participation**: Alerte sur l'engagement
- **Notifications**: Système de notification intégré

### Filtrage et Permissions
- **Filtrage automatique**: Selon le rôle utilisateur
- **Sécurité**: Accès restreint aux données autorisées
- **Audit**: Logs complets des actions

## 🛠️ Administration

### Interface Admin Django
Accessible via `/admin/` avec les fonctionnalités :
- Gestion complète des utilisateurs et organisations
- Visualisation des émotions et statistiques
- Gestion des alertes et résolutions
- Actions en lot pour l'administration

### Commandes de Gestion
```bash
# Créer des données d'exemple
python manage.py create_sample_data

# Générer des rapports
python manage.py generate_emotion_reports

# Nettoyer les anciennes données
python manage.py cleanup_old_data
```

## 🔧 Déploiement

### Variables d'Environnement Production
```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
DB_NAME=emotion_tracker_prod
DB_USER=prod_user
DB_PASSWORD=secure_password
DB_HOST=your-db-host
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
```

### Docker (optionnel)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "emotion_tracker.wsgi:application"]
```

## 📊 Monitoring et Logs

### Logs
- Fichiers de logs dans `/logs/`
- Niveaux: DEBUG, INFO, WARNING, ERROR
- Rotation automatique des logs

### Métriques
- Performance des API
- Utilisation de la base de données
- Taux de participation des utilisateurs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.