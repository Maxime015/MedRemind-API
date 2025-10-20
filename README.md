# 📊 MyWallet — API de Gestion Financière

**MyWallet** est une API RESTful conçue pour simplifier la gestion de vos finances personnelles.  
Elle permet de **suivre vos transactions**, **gérer vos abonnements récurrents** et **analyser votre situation financière** grâce à des résumés clairs et automatisés.

---

## 🚀 Fonctionnalités

### 🔐 Authentification Sécurisée
- Inscription et connexion avec validation des données  
- Authentification via **JWT (JSON Web Tokens)**  
- Middleware de protection des routes  
- Limitation des tentatives de connexion *(anti-brute-force)*  

### 💰 Gestion des Transactions
- ➕ Création de transactions (revenus / dépenses)  
- 📋 Liste complète des transactions  
- 🗑️ Suppression de transactions  
- 📊 Résumé financier : solde, revenus totaux, dépenses totales  

### 📅 Gestion des Abonnements
- ➕ Ajout d’abonnements (Netflix, Spotify, etc.)  
- 👀 Consultation et suppression des abonnements  
- 🌟 Attribution d’une note (1 à 5 étoiles)  
- 🖼️ Téléversement d’images via **Cloudinary**  
- 📈 Résumé global : coût total et nombre d’abonnements  

---

## 🛠️ Technologies Utilisées

| Domaine | Technologie |
|----------|--------------|
| Backend | Node.js, Express.js |
| Base de données | PostgreSQL (via **Neon**) |
| Authentification | JWT |
| Stockage d’images | Cloudinary |
| Rate Limiting | Upstash Redis |
| Documentation | Swagger / OpenAPI |
| Sécurité | bcryptjs, CORS, validation serveur |
| Planification | Cron Jobs |

---

## 📚 Documentation API

Consultez la documentation complète via Swagger UI :  
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

### Principaux Endpoints

#### 🔐 Authentification
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `POST` | `/api/auth/register` | Inscription utilisateur |
| `POST` | `/api/auth/login` | Connexion utilisateur |

#### 💰 Transactions
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `GET` | `/api/transactions` | Liste des transactions |
| `POST` | `/api/transactions` | Création d’une transaction |
| `DELETE` | `/api/transactions/:id` | Suppression d’une transaction |
| `GET` | `/api/transactions/summary` | Résumé financier |

#### 📅 Abonnements
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `GET` | `/api/subscriptions` | Liste des abonnements |
| `POST` | `/api/subscriptions` | Création d’un abonnement |
| `DELETE` | `/api/subscriptions/:id` | Suppression d’un abonnement |
| `GET` | `/api/subscriptions/summary` | Résumé des abonnements |

---

## ⚙️ Installation et Démarrage

### 🔧 Prérequis
- Node.js **v18+**
- Compte **PostgreSQL** (Neon recommandé)
- Compte **Cloudinary** pour les images

### 📦 Installation
```bash
git clone <votre-repo>
cd e-track-api
npm install
```

### 🧩 Configuration
Créez un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000/health

# Base de données
DATABASE_URL=votre_url_de_connexion_neon

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# JWT
JWT_SECRET=votre_secret_jwt_super_securise

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=votre_url_redis
UPSTASH_REDIS_REST_TOKEN=votre_token_redis
```

### 🚀 Démarrage
```bash
# Mode développement
npm run dev

# Mode production
npm start
```
> 💡 La base de données est initialisée automatiquement au premier démarrage.

---

## 🛡️ Sécurité Intégrée
- 🔒 Hachage des mots de passe avec **bcryptjs**  
- 🎫 Authentification **JWT** avec expiration  
- ⚡ Rate Limiting via **Redis**  
- ✅ Validation des données côté serveur  
- 🌐 Protection **CORS**  
- 📧 Vérification du format des emails  

---

## 🗄️ Structure de la Base de Données

### 👥 Users
| Champ | Type |
|--------|------|
| id | UUID |
| username | String |
| email | String |
| password | String |
| profile_image | String |
| created_at / updated_at | Timestamp |

### 💰 Transactions
| Champ | Type |
|--------|------|
| id | UUID |
| user_id | UUID |
| title | String |
| amount | Float |
| category | String |
| created_at | Timestamp |

### 📅 Subscriptions
| Champ | Type |
|--------|------|
| id | UUID |
| user_id | UUID |
| label | String |
| amount | Float |
| date | Date |
| recurrence | String |
| rating | Integer |
| image_url | String |
| created_at | Timestamp |

---

## 🎯 Exemples d’Utilisation

### ➕ Création d’un utilisateur
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

### ➕ Création d’un abonnement
```json
POST /api/subscriptions
{
  "label": "Netflix",
  "amount": 15.99,
  "date": "2024-01-15",
  "recurrence": "monthly",
  "rating": 4,
  "image": "data:image/jpeg;base64,..."
}
```

---

## 🤝 Contribution
Les contributions sont les bienvenues :
1. **Fork** le projet  
2. **Crée** une branche (`feature/ma-fonctionnalite`)  
3. **Committe** tes modifications  
4. **Soumets** une Pull Request  

---

## 📝 Licence
Projet sous licence **MIT**.  
Voir le fichier [`LICENSE`](LICENSE) pour plus de détails.

---

## 🆘 Support
- 📘 Consulter la documentation Swagger  
- 🧠 Vérifier les logs du serveur  
- 🐛 Ouvrir une *issue* sur GitHub  

---

**Développé avec ❤️ pour une meilleure gestion de vos finances.**
