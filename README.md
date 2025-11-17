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

## 🏗 Architecture du Système

```mermaid
graph TB
    CLIENT[Client Frontend] -->|HTTPS| API[API Express.js]
    
    subgraph "Backend Services"
        API --> MIDDLEWARE[Middleware]
        MIDDLEWARE --> AUTH[Clerk Auth]
        MIDDLEWARE --> RATE[Rate Limiting]
        MIDDLEWARE --> ROUTES[Routes]
        
        ROUTES --> MED[Medications Controller]
        ROUTES --> DOSE[Dose History Controller]
        ROUTES --> REM[Reminders Controller]
        
        MED --> DB[(PostgreSQL)]
        DOSE --> DB
        REM --> DB
    end
    
    subgraph "Background Jobs"
        CRON[Cron Job] -->|Every 14min| HEALTH[Health Check]
    end
    
    subgraph "External Services"
        AUTH --> CLERK[Clerk Auth Service]
        RATE --> UPSTASH[Upstash Redis]
    end
    
    subgraph "Documentation"
        API --> SWAGGER[Swagger UI]
    end

    style API fill:#4CAF50
    style DB fill:#2196F3
    style CLERK fill:#FF9800
```

---

## 🔄 Flux de Données

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant M as Middleware
    participant CT as Controller
    participant DB as Database
    participant EXT as External Services

    C->>A: Requête HTTP
    A->>M: Traitement middleware
    M->>EXT: Vérification auth (Clerk)
    EXT-->>M: Token validé
    M->>EXT: Vérification rate limit (Upstash)
    EXT-->>M: Requête autorisée
    
    alt Authentifié et autorisé
        M->>CT: Routage vers controller
        CT->>DB: Opération base de données
        DB-->>CT: Résultats
        CT-->>C: Réponse JSON
    else Non authentifié
        M-->>C: Erreur 401
    else Rate limit dépassé
        M-->>C: Erreur 429
    end
```

---

## 🔁 Flux Typique - Enregistrement d'une Prise

```mermaid
flowchart TD
    START[User takes medication] --> RECORD[Record Dose API]
    RECORD --> AUTH{Authentication}
    AUTH -->|Success| VALID{Medication exists?}
    AUTH -->|Fail| ERROR401[Error 401]
    
    VALID -->|Yes| INSERT[Insert dose history]
    VALID -->|No| ERROR404[Error 404]
    
    INSERT --> UPDATE[Update medication supply]
    UPDATE --> RESPONSE[Return dose record]
    RESPONSE --> DONE[Operation complete]
```

---

## ⚙️ Schéma de Base de Données

```mermaid
erDiagram
    MEDICATIONS {
        UUID id PK
        TEXT user_id
        VARCHAR name
        VARCHAR dosage
        TEXT[] times
        DATE start_date
        VARCHAR duration
        VARCHAR color
        BOOLEAN reminder_enabled
        INTEGER current_supply
        INTEGER total_supply
        INTEGER refill_at
        BOOLEAN refill_reminder
        DATE last_refill_date
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    DOSE_HISTORY {
        UUID id PK
        TEXT user_id
        UUID medication_id FK
        TIMESTAMP timestamp
        BOOLEAN taken
        TIMESTAMP created_at
    }
    
    MEDICATIONS ||--o{ DOSE_HISTORY : has
```

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
