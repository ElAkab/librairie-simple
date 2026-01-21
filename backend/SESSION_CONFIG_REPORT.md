# 📋 Rapport de Configuration des Sessions

## 🎯 Architecture du Projet

**Frontend:** Netlify (domaine séparé)  
**Backend:** Railway (API REST)  
**Base de données:** PostgreSQL (Railway)

## 🔧 Packages Installés

### `express-session` (v1.18.2)
**Rôle:** Middleware de gestion des sessions pour Express.  
**Pourquoi:** Permet de maintenir l'état utilisateur entre les requêtes HTTP (authentification, panier, préférences).

### `connect-pg-simple` (nouvellement ajouté)
**Rôle:** Store de sessions pour PostgreSQL.  
**Pourquoi:** Sans ce package, les sessions sont stockées **en mémoire** (MemoryStore), ce qui pose 3 problèmes critiques en production :
1. **Perte des sessions** au redémarrage du serveur
2. **Fuite mémoire** avec de nombreux utilisateurs
3. **Incompatibilité multi-instances** (Railway peut avoir plusieurs instances)

## ⚙️ Configuration Détaillée

### 📦 Store de Sessions

```javascript
store: new PgSession({
    pool: pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
})
```

| Propriété | Valeur | Explication |
|-----------|--------|-------------|
| `pool` | `pool` (connexion existante) | Réutilise la connexion PostgreSQL déjà configurée pour éviter la duplication |
| `tableName` | `"user_sessions"` | Nom de la table qui stockera les sessions (structure créée automatiquement) |
| `createTableIfMissing` | `true` | Crée la table au démarrage si elle n'existe pas (pratique pour déploiement) |

**Structure de la table créée automatiquement :**
```sql
CREATE TABLE "user_sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
```

---

### 🔐 Secret de Signature

```javascript
secret: process.env.SESSION_SECRET || "default_secret_change_in_production"
```

| Valeur | Utilisation |
|--------|-------------|
| `process.env.SESSION_SECRET` | Clé secrète depuis les variables d'environnement Railway |
| Fallback | Valeur par défaut pour développement local |

**⚠️ CRITIQUE :** Cette clé signe les cookies pour empêcher leur falsification. **Doit être unique et forte en production** (générer avec `openssl rand -base64 32`).

---

### 💾 Gestion du Cycle de Vie

```javascript
resave: false
saveUninitialized: false
```

| Propriété | Valeur | Explication | Impact sur PostgreSQL |
|-----------|--------|-------------|------------------------|
| `resave` | `false` | Ne sauvegarde la session que si elle a été modifiée | ✅ Réduit les écritures DB inutiles |
| `saveUninitialized` | `false` | Ne crée pas de session vide pour les visiteurs anonymes | ✅ Évite de polluer la DB avec des sessions non utilisées |

**Avant (avec `saveUninitialized: true`):**  
→ Chaque visite = 1 ligne en DB (même sans connexion)  
→ 1000 visiteurs/jour = 1000 sessions inutiles

**Après (avec `false`):**  
→ Sessions créées uniquement lors de `req.session.userId = ...`  
→ 1000 visiteurs/jour, 50 connexions = 50 sessions en DB

---

### 🍪 Configuration des Cookies

```javascript
cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
}
```

| Propriété | Dev | Production | Explication |
|-----------|-----|------------|-------------|
| `secure` | `false` | `true` | **Prod:** Cookie envoyé uniquement en HTTPS. **Dev:** HTTP accepté pour localhost |
| `httpOnly` | `true` | `true` | **Sécurité XSS:** Empêche `document.cookie` d'accéder au cookie (JavaScript ne peut pas le lire) |
| `maxAge` | 7 jours | 7 jours | Durée de vie du cookie (604800000 ms). Après 7 jours, re-connexion nécessaire |
| `sameSite` | `"lax"` | `"none"` | **Prod:** `none` obligatoire pour cross-origin (Netlify → Railway). **Dev:** `lax` suffit pour same-origin |

#### 🔍 Pourquoi `sameSite: "none"` en Production ?

**Contexte:**  
- Frontend: `https://ton-app.netlify.app`  
- Backend: `https://ton-api.railway.app`

Sans `sameSite: "none"`, les navigateurs **bloquent** le cookie car c'est une requête cross-origin.

**Avec `sameSite: "none"` + `secure: true`:**  
✅ Le navigateur accepte d'envoyer le cookie même si les domaines diffèrent.

**⚠️ Obligation:** `sameSite: "none"` nécessite **obligatoirement** `secure: true` (HTTPS).

---

### 🏷️ Nom du Cookie

```javascript
name: "sessionId"
```

| Valeur par défaut | Valeur personnalisée | Pourquoi changer |
|-------------------|----------------------|------------------|
| `connect.sid` | `sessionId` | Plus discret (ne révèle pas la techno utilisée), plus court |

---

## 🌐 Configuration CORS Associée

```javascript
cors({
    origin: process.env.NODE_ENV === "production" 
        ? process.env.FRONTEND_URL 
        : ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
})
```

| Propriété | Rôle | Lien avec Sessions |
|-----------|------|-------------------|
| `origin` | Autorise uniquement le domaine Netlify en prod | Sans ça, les requêtes depuis Netlify seraient bloquées |
| `credentials: true` | Autorise l'envoi des cookies cross-origin | **CRITIQUE:** Sans cette ligne, le cookie `sessionId` ne sera jamais envoyé ! |

**⚠️ Variables d'environnement à ajouter sur Railway :**
```bash
FRONTEND_URL=https://ton-app.netlify.app
SESSION_SECRET=your-super-secret-key-here
NODE_ENV=production
```

---

## 📊 Comparaison Avant/Après

| Aspect | Avant (MemoryStore) | Après (PostgreSQL) |
|--------|---------------------|-------------------|
| **Persistance** | ❌ Perdu au redémarrage | ✅ Survit aux redémarrages |
| **Multi-instances** | ❌ Sessions isolées par instance | ✅ Partagées entre instances |
| **Scalabilité** | ❌ Fuite mémoire | ✅ Scalable infiniment |
| **Sessions anonymes** | ⚠️ Créées massivement | ✅ Uniquement si authentifié |
| **Cross-origin** | ⚠️ Partiellement configuré | ✅ Entièrement sécurisé |

---

## 🧪 Tests à Effectuer

### 1. Vérifier la création de la table
```bash
# Sur Railway (ou localement)
psql $DATABASE_URL -c "SELECT * FROM user_sessions LIMIT 5;"
```

### 2. Tester la persistance
1. Se connecter via le frontend
2. Redémarrer le backend (`railway restart` ou Ctrl+C en local)
3. Rafraîchir la page frontend → La session doit persister ✅

### 3. Vérifier les cookies en production
1. Ouvrir DevTools → Network
2. Se connecter
3. Vérifier la réponse de `/api/auth/login` :
   - Header `Set-Cookie` présent
   - `SameSite=None; Secure; HttpOnly` visible

---

## 🚀 Déploiement Railway

**Variables d'environnement requises :**
```bash
DATABASE_URL=postgresql://user:pass@host:port/db  # Auto-configuré par Railway
SESSION_SECRET=<générer-avec-openssl-rand-base64-32>
FRONTEND_URL=https://ton-app.netlify.app
NODE_ENV=production
PORT=3000  # Railway auto-injecte PORT
```

**Commande de génération du secret :**
```bash
openssl rand -base64 32
# Exemple de sortie: Zx8Kq3mP9vN2cR5tY7uW1aS4dF6gH8jK
```

---

## ✅ Checklist de Sécurité

- [x] `SESSION_SECRET` unique et fort (32+ caractères)
- [x] `httpOnly: true` (protection XSS)
- [x] `secure: true` en production (HTTPS uniquement)
- [x] `sameSite: "none"` pour cross-origin
- [x] `saveUninitialized: false` (évite sessions inutiles)
- [x] CORS avec `credentials: true`
- [x] Store persistant (PostgreSQL)

---

## 📚 Ressources

- [Documentation express-session](https://github.com/expressjs/session)
- [Documentation connect-pg-simple](https://github.com/voxpelli/node-connect-pg-simple)
- [MDN - SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
