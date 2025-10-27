# 💊 Medication Tracker - Backend API

API RESTful pour le suivi des médicaments, rappels de prise, historique et statistiques d’observance thérapeutique.  
Développée avec **Express.js**, **PostgreSQL (Neon)**, **Clerk** et **Upstash Redis**.

---

## ⚙️ Fonctionnalités principales

- 🔐 **Auth sécurisée (Clerk)** — JWT, middleware de protection.  
- 💊 **Gestion des médicaments** — ajout, modification, suppression, suivi du stock.  
- ⏰ **Rappels intelligents** — notifications de prise et alertes de renouvellement.  
- 📈 **Statistiques** — suivi des prises et taux d’observance.  
- 🚀 **Optimisation** — tâches planifiées, rate limiting, documentation Swagger.

---

## 🛠️ Stack technique

| Composant | Technologie |
|------------|--------------|
| Framework | Express.js |
| Base de données | PostgreSQL (Neon) |
| Authentification | Clerk |
| Cache / Limites | Upstash Redis |
| Documentation | Swagger |
| Déploiement | Render |

---

## 📋 Prérequis

- Node.js **v18+**  
- Compte **Clerk**  
- Base de données **Neon**  
- (Optionnel) **Upstash Redis**

---

## 🚀 Installation rapide

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd medication-tracker-backend

# 2. Installer les dépendances
npm install
```

Créer un fichier `.env` :
```env
DATABASE_URL=postgresql://user:password@ep-example.neon.tech/dbname?sslmode=require
CLERK_SECRET_KEY=sk_test_votre_cle
PORT=3000
```

```bash
# 3. Lancer le serveur
npm run dev
```

---

## 🔗 Endpoints principaux

| Endpoint | Méthode | Description |
|-----------|----------|-------------|
| `/api/medications` | GET / POST / PUT / DELETE | Gérer les médicaments |
| `/api/dose-history` | GET / POST | Historique des prises |
| `/api/reminders/today` | GET | Médicaments du jour |
| `/api/stats` | GET | Statistiques d’observance |

**Auth requise :**
```http
Authorization: Bearer <token_clerk>
```

---

## 📚 Documentation

Swagger UI disponible sur :  
👉 `http://localhost:3000/api-docs`

---

## 🧩 Structure du projet

```
backend/
├── config/          # Configuration
├── controllers/     # Logique métier
├── middleware/      # Sécurité & validation
├── routes/          # Routes API
└── docs/            # Documentation Swagger
```

---

## 🐛 Dépannage rapide

| Problème | Solution |
|-----------|-----------|
| Erreur DB | Vérifier `DATABASE_URL` et l’état de Neon |
| Auth invalide | Vérifier `CLERK_SECRET_KEY` |
| Rate limit | Ajuster la config Upstash |

---

## 🤝 Contribution

Les contributions sont les bienvenues :  
Fork → Branche → Commit → Pull Request 🚀

---

## 📄 Licence

Projet sous licence **MIT**.  
Développé avec ❤️ pour une meilleure observance thérapeutique.
