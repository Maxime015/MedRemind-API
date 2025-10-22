# 💊 MedRemind API

API Express.js pour l’application **MedRemind**, une plateforme intelligente de gestion des médicaments et des rappels de prise.  
Elle permet aux utilisateurs de suivre leurs traitements, recevoir des notifications push et gérer les réapprovisionnements de manière automatisée. 🚀

---

## 🧱 Architecture du projet

```
📦 medremind-api
 ┣ 📂 controllers/         # Logique métier (médicaments, rappels, etc.)
 ┣ 📂 middleware/          # Middleware d’authentification (Clerk)
 ┣ 📂 routes/              # Définition des routes API
 ┣ 📂 utils/               # Outils (notifications, gestion des tokens, etc.)
 ┣ 📜 db.js                # Configuration base de données (Neon)
 ┣ 📜 cron.js              # Tâches planifiées (rappels et refills)
 ┣ 📜 server.js            # Point d’entrée principal Express
 ┗ 📜 package.json         # Dépendances et scripts
```

---

## ⚙️ Technologies utilisées

- **Node.js / Express.js** 🟢 — Framework backend rapide et minimaliste  
- **PostgreSQL (Neon)** 🐘 — Base de données relationnelle scalable  
- **Clerk** 🔐 — Authentification sécurisée et gestion des utilisateurs  
- **Expo Server SDK** 🔔 — Envoi de notifications push  
- **node-cron** ⏰ — Planification des rappels automatiques  

---

## 🔐 Authentification

L’application utilise **Clerk** pour l’authentification des utilisateurs.  
Chaque requête doit inclure un **token d’authentification** dans les en-têtes HTTP.

Exemple d’en-tête :
```http
Authorization: Bearer <token_clerk>
```

Après vérification, Clerk fournit automatiquement le champ :
```json
{
  "user_id": "user_123xyz"
}
```

---

## 🗃️ Base de données (Neon PostgreSQL)

### 🧩 Tables principales

#### 👤 `users`
| Colonne | Type | Description |
|----------|------|-------------|
| id | SERIAL | Identifiant interne |
| clerk_user_id | TEXT | ID fourni par Clerk |
| email | TEXT | Adresse email |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière mise à jour |

#### 💊 `medications`
| Colonne | Type | Description |
|----------|------|-------------|
| id | SERIAL | Identifiant du médicament |
| user_id | INTEGER | Référence à l’utilisateur |
| name | TEXT | Nom du médicament |
| dosage | TEXT | Dosage |
| times | JSON | Horaires de prise |
| start_date | DATE | Date de début |
| duration | INTEGER | Durée du traitement |
| color | TEXT | Couleur d’affichage |
| reminder_enabled | BOOLEAN | Activation du rappel |
| current_supply | INTEGER | Stock actuel |
| total_supply | INTEGER | Stock total |
| refill_at | INTEGER | Seuil de réapprovisionnement |
| refill_reminder | BOOLEAN | Rappel de réapprovisionnement |
| last_refill_date | DATE | Dernière recharge |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière mise à jour |

#### 📅 `dose_history`
| Colonne | Type | Description |
|----------|------|-------------|
| id | SERIAL | Identifiant de la dose |
| user_id | INTEGER | Référence à l’utilisateur |
| medication_id | INTEGER | Référence au médicament |
| timestamp | TIMESTAMP | Heure de la dose |
| taken | BOOLEAN | Prise effectuée ou manquée |
| created_at | TIMESTAMP | Date d’enregistrement |

---

## 🛣️ Routes de l’API

### 💊 Médicaments
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `GET` | `/medications` | Récupère tous les médicaments de l’utilisateur |
| `POST` | `/medications` | Crée un nouveau médicament |
| `PUT` | `/medications/:id` | Met à jour un médicament |
| `DELETE` | `/medications/:id` | Supprime un médicament |

### 📅 Historique des doses
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `GET` | `/dose-history` | Récupère l’historique des prises |
| `POST` | `/dose-history` | Enregistre une dose (prise ou manquée) |

### 🔁 Rappels de réapprovisionnement
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `GET` | `/refill-reminders` | Récupère les rappels de réapprovisionnement |
| `POST` | `/refill-reminders` | Crée un rappel de refill |

### 🔔 Notifications
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| `POST` | `/notifications/register` | Enregistre un token Expo pour les notifications push |

---

## ⏰ Cron Jobs

Les tâches planifiées sont définies dans `cron.js` :

- 🔔 **Rappels quotidiens** — Notifications des médicaments à prendre  
- 🔁 **Alertes de réapprovisionnement** — Alerte lorsque le stock devient faible  

---

## 🚀 Installation et exécution

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/Maxime016/MedRemind-API.git backend
cd backend
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configurer les variables d’environnement
Créer un fichier `.env` à la racine :
```env
DATABASE_URL=postgresql://<user>:<password>@<neon-url>/<db-name>
CLERK_SECRET_KEY=<votre_clerk_secret_key>
EXPO_ACCESS_TOKEN=<votre_expo_access_token>
PORT=5000
```

### 4️⃣ Lancer le serveur
```bash
npm start
```

Le serveur sera accessible sur :  
👉 `http://localhost:5000`

---

## 🧠 Auteur

👨‍💻 **Développé par :** Ton Nom ou Équipe  
📅 **Année :** 2025  
💡 Projet académique / personnel pour la gestion intelligente des traitements médicaux.

---

## 🩺 Licence

Ce projet est distribué sous licence **MIT**.  
Vous êtes libre de l’utiliser, le modifier et le distribuer à condition de conserver la mention d’auteur.

---

> _« La santé numérique, au service d’une meilleure observance thérapeutique. »_ 💙
