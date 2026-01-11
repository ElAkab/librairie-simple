# 🔄 Guide CI/CD - SQL Library

Ce guide explique comment fonctionne le pipeline CI/CD de votre projet et comment l'utiliser au quotidien.

---

## 📚 Table des matières

1. [Qu'est-ce que le CI/CD ?](#quest-ce-que-le-cicd-)
2. [Architecture de notre pipeline](#architecture-de-notre-pipeline)
3. [Workflow étape par étape](#workflow-étape-par-étape)
4. [Première utilisation](#première-utilisation)
5. [Utilisation quotidienne](#utilisation-quotidienne)
6. [Monitoring et dépannage](#monitoring-et-dépannage)
7. [Évolutions futures](#évolutions-futures)

---

## Qu'est-ce que le CI/CD ?

### 🔍 Définitions

**CI (Continuous Integration)** = Intégration Continue
- Valide automatiquement votre code à chaque modification
- Vérifie que le code compile et que la syntaxe est correcte
- Exécute les tests (quand vous en aurez)
- Détecte les erreurs **avant** le déploiement

**CD (Continuous Deployment)** = Déploiement Continu
- Déploie automatiquement votre application en production
- Se déclenche après validation du CI
- Pas besoin de déployer manuellement via Railway

### 🎯 Avantages pour votre projet

✅ **Sécurité** : Impossible de déployer du code cassé  
✅ **Rapidité** : Push → Validation → Déploiement (< 5 minutes)  
✅ **Confiance** : Chaque commit est testé automatiquement  
✅ **Traçabilité** : Historique complet des déploiements  
✅ **Apprentissage** : Pratique professionnelle utilisée partout

---

## Architecture de notre pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW COMPLET CI/CD                        │
└─────────────────────────────────────────────────────────────────┘

1️⃣ DÉVELOPPEMENT LOCAL
   ├─ Vous codez dans VS Code
   ├─ npm run dev (test local)
   └─ git add . && git commit -m "message"

                        ⬇️

2️⃣ PUSH VERS GITHUB
   └─ git push origin main

                        ⬇️

3️⃣ CI - GITHUB ACTIONS (Automatique)
   ├─ 📥 Télécharge le code
   ├─ 🟢 Installe Node.js 20.19.5
   ├─ 📦 Installe les dépendances (npm ci)
   ├─ ✅ Valide la syntaxe (npm run validate)
   └─ ✅ ou ❌ Résultat visible sur GitHub

                        ⬇️ (si ✅)

4️⃣ CD - RAILWAY (Automatique)
   ├─ 🔔 Railway détecte le nouveau commit
   ├─ 🏗️ Build l'application
   ├─ 🗄️ Connecte PostgreSQL
   ├─ 🚀 Démarre le serveur
   ├─ 🏥 Vérifie /health endpoint
   └─ 🌍 Application en ligne !

                        ⬇️

5️⃣ PRODUCTION
   └─ https://librairie-simple-production-6ca3.up.railway.app
```

---

## Workflow étape par étape

### 📋 Ce qui se passe à chaque push

#### Étape 1 : GitHub Actions s'active (CI)

**Fichier** : [.github/workflows/ci.yml](.github/workflows/ci.yml)

```yaml
# Se déclenche automatiquement sur push vers main
on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'  # Seulement si le backend change
```

**Actions exécutées** :
1. Clone votre code
2. Installe Node.js 20.19.5 (version de production)
3. Exécute `npm ci` (installation propre des dépendances)
4. Exécute `npm run validate` (vérifie la syntaxe JavaScript)

**Résultat visible** :
- ✅ Badge vert sur GitHub = CI passé
- ❌ Badge rouge = Erreur détectée (push bloqué)

#### Étape 2 : Railway déploie (CD)

**Fichier** : [railway.json](railway.json)

```json
{
  "deploy": {
    "startCommand": "cd backend && npm start",
    "healthcheckPath": "/health",  // Vérifie que l'app démarre bien
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Actions exécutées** :
1. Railway détecte le commit
2. Build l'application (`npm ci`)
3. Démarre le serveur (`npm start`)
4. Appelle `/health` pour vérifier que tout fonctionne
5. Bascule le trafic vers la nouvelle version

**Temps moyen** : 2-4 minutes

---

## Première utilisation

### 🎬 Configuration initiale (à faire UNE FOIS)

#### 1. Activer GitHub Actions

```bash
# Les workflows sont déjà dans votre repo
# GitHub Actions s'active automatiquement
```

Vérification :
- Allez sur https://github.com/VOTRE_USERNAME/VOTRE_REPO/actions
- Vous devriez voir "CI - Backend Validation"

#### 2. Connecter Railway à GitHub

**Sur Railway** (https://railway.app) :

1. Cliquez sur votre projet "SQL Library"
2. Allez dans "Settings"
3. Section "Source" → "Connect to GitHub"
4. Sélectionnez votre repository
5. Configurez :
   - **Branch** : `main`
   - **Root Directory** : `/` (racine)
   - **Watch Paths** : `backend/**` (optionnel, pour ne déployer que si le backend change)

#### 3. Configurer les variables d'environnement

**Sur Railway** :

Variables → Ajouter :
```
NODE_ENV=production
FRONTEND_URL=https://votre-frontend.vercel.app
```

⚠️ **Important** : `DATABASE_URL` est déjà configurée automatiquement par Railway

#### 4. Vérifier le health check

Testez manuellement :
```bash
curl https://VOTRE_URL_RAILWAY.up.railway.app/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T...",
  "database": "connected",
  "environment": "production"
}
```

---

## Utilisation quotidienne

### 🚀 Workflow de développement

```bash
# 1. Créer une branche pour votre feature (bonne pratique)
git checkout -b feature/nouvelle-fonctionnalite

# 2. Coder et tester localement
npm run dev

# 3. Commit vos changements
git add .
git commit -m "feat: ajout de la recherche par auteur"

# 4. Push vers GitHub
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request sur GitHub
# → GitHub Actions valide automatiquement

# 6. Merger dans main
# → Railway déploie automatiquement
```

### 📊 Vérifier le statut du déploiement

#### Sur GitHub :
- Onglet "Actions" : voir l'exécution du CI
- Badge sur le commit : ✅ ou ❌

#### Sur Railway :
- Dashboard → "Deployments"
- Logs en temps réel
- Statut : Building → Deploying → Success

#### En ligne :
```bash
# Vérifier que la nouvelle version est déployée
curl https://VOTRE_URL.up.railway.app/health
```

---

## Monitoring et dépannage

### 🔍 Où voir les logs ?

#### GitHub Actions (CI)
```
GitHub → Repository → Actions → Cliquer sur le workflow
→ Voir les logs de chaque étape
```

Erreurs courantes :
- ❌ "npm ci failed" → Dépendance manquante dans package.json
- ❌ "validate failed" → Erreur de syntaxe JavaScript

#### Railway (CD)
```
Railway → Deployments → Cliquer sur le build
→ Build Logs ou Deploy Logs
```

Erreurs courantes :
- ❌ "Health check failed" → Serveur ne démarre pas
- ❌ "Database connection failed" → Variables d'environnement manquantes

### 🔧 Rollback (revenir en arrière)

Si le dernier déploiement pose problème :

**Sur Railway** :
1. Deployments → Cliquer sur un ancien déploiement fonctionnel
2. "Redeploy" → Confirmer

**Ou via Git** :
```bash
# Revenir au commit précédent
git revert HEAD
git push origin main
# → Railway redéploiera la version précédente
```

### 🏥 Utiliser le health check

Le endpoint `/health` vous permet de :
- ✅ Vérifier que l'API est accessible
- ✅ Confirmer la connexion à PostgreSQL
- ✅ Monitorer l'environnement (dev/prod)

**Cas d'usage** :
```bash
# Test manuel
curl https://VOTRE_URL.up.railway.app/health

# Intégration avec des outils de monitoring (UptimeRobot, Pingdom)
# → Recevoir une alerte si l'app tombe

# Script de vérification automatique
#!/bin/bash
HEALTH=$(curl -s https://VOTRE_URL.up.railway.app/health | jq -r '.status')
if [ "$HEALTH" != "healthy" ]; then
  echo "❌ L'application est DOWN !"
else
  echo "✅ Application healthy"
fi
```

---

## Évolutions futures

### 🧪 Quand vous ajouterez des tests

1. Installer un framework de test :
```bash
cd backend
npm install --save-dev jest supertest
```

2. Ajouter dans `package.json` :
```json
"scripts": {
  "test": "jest --coverage"
}
```

3. Décommenter dans [.github/workflows/ci.yml](.github/workflows/ci.yml) :
```yaml
# Actuellement commenté lignes 70-90
test-backend:
  name: Exécuter les tests
  runs-on: ubuntu-latest
  needs: validate-backend
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm test  # ← Vos tests s'exécuteront ici
```

### 🌿 Stratégie de branches

Pour des projets plus complexes :

```
main (production)
  └─ dev (staging)
      ├─ feature/login
      ├─ feature/search
      └─ bugfix/cors
```

Configuration :
- `dev` → Déploiement automatique vers Railway Staging
- `main` → Déploiement automatique vers Railway Production

### 🔔 Notifications

Recevoir des alertes quand un déploiement échoue :

**Discord** :
```yaml
# Ajouter à .github/workflows/ci.yml
- name: Notify Discord
  if: failure()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

**Email** : Configuré par défaut sur GitHub (Settings → Notifications)

### 📈 Métriques et analyse

Outils gratuits à intégrer :
- **Sentry** : Tracking des erreurs en production
- **LogRocket** : Session replay et debugging
- **Railway Analytics** : Utilisation CPU/RAM/DB

---

## 📝 Récapitulatif

### ✅ Ce que vous avez maintenant

| Composant | Fichier | Rôle |
|-----------|---------|------|
| **CI Validation** | `.github/workflows/ci.yml` | Valide le code avant merge |
| **Health Check** | `backend/src/app.js` (/health) | Monitoring de l'application |
| **Railway Config** | `railway.json` | Configuration du déploiement |
| **Env Variables** | `backend/.env.example` | Documentation des variables |
| **Script Validation** | `package.json` (validate) | Vérifie la syntaxe |

### 🎯 Votre premier déploiement CI/CD

1. Faire une petite modification (ex: ajouter un `console.log`)
2. Commit et push :
   ```bash
   git add .
   git commit -m "test: premier déploiement CI/CD"
   git push origin main
   ```
3. Observer :
   - GitHub Actions → Workflow en cours
   - Railway → Build en cours
4. Vérifier :
   ```bash
   curl https://VOTRE_URL.up.railway.app/health
   ```

### 📖 Ressources

- **GitHub Actions** : https://docs.github.com/en/actions
- **Railway Docs** : https://docs.railway.app
- **CI/CD Best Practices** : https://www.atlassian.com/continuous-delivery/principles

---

**Félicitations !** 🎉 Vous avez maintenant un pipeline CI/CD professionnel sur votre projet d'apprentissage.
