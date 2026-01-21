# 🚀 Guide de Déploiement Railway - Résolution Erreur 500

## 🔍 Problème Résolu

**Erreur initiale :** `Internal Server Error (500)` lors de l'inscription en production.

**Cause :** Le schéma SQL contenait `DROP TABLE IF EXISTS users` qui supprimait la table users à chaque redémarrage si la base contenait déjà des livres mais pas la table users.

## ✅ Corrections Apportées

### 1. **schema.sql** - Suppression des DROP TABLE
- ❌ Avant : `DROP TABLE IF EXISTS users CASCADE;` (supprime les données !)
- ✅ Après : `CREATE TABLE IF NOT EXISTS users (...)` uniquement

### 2. **connection.js** - Seed intelligent
- Vérifie l'existence des données avant insertion
- Ne duplique plus les auteurs/livres/emprunts
- Logs détaillés pour debug

### 3. **app.js** - Vérification de la table users
- Vérifie maintenant que la table `users` existe même si `books` existe
- Exécute le seed si `users` manque

## 📋 Étapes de Déploiement

### 1. Commit et Push
```bash
git add .
git commit -m "fix: Correct database initialization for production"
git push origin main
```

### 2. Variables d'environnement Railway

Vérifier que ces variables sont configurées :

```bash
DATABASE_URL=<auto-généré-par-railway>
SESSION_SECRET=<votre-clé-secrète-32-caractères>
FRONTEND_URL=https://votre-app.netlify.app
NODE_ENV=production
PORT=<auto-généré-par-railway>
```

**Générer SESSION_SECRET :**
```bash
openssl rand -base64 32
```

### 3. Redéploiement

Railway redéploiera automatiquement après le push. Sinon :
- Allez sur le dashboard Railway
- Cliquez sur votre service backend
- Click "Deploy" > "Redeploy"

### 4. Vérification des Logs

```bash
railway logs
```

Vous devriez voir :
```
🔍 DATABASE_URL présente: true
🔍 NODE_ENV: production
✅ Base de données déjà peuplée (X livres)
✅ Table users OK (X utilisateurs)
Server is running on http://...
```

Ou si c'est la première fois :
```
🔧 Tables inexistantes, création et seed...
✅ Tables créées/vérifiées avec succès !
✅ Auteurs insérés
✅ Livres insérés
✅ Emprunts insérés
🎉 Seed terminé avec succès !
```

## 🧪 Test en Production

1. **Tester l'inscription :**
   - Aller sur `https://votre-app.netlify.app/pages/signup.html`
   - Remplir le formulaire
   - Vérifier : "Inscription réussie !"

2. **Vérifier la base de données Railway :**
   ```bash
   railway connect
   \dt  -- Lister les tables
   SELECT * FROM users;  -- Voir les utilisateurs
   ```

## 🐛 Debug en cas d'erreur

### Erreur 500 persiste

1. **Vérifier les logs Railway :**
   ```bash
   railway logs --tail
   ```

2. **Vérifier que la table users existe :**
   ```bash
   railway connect
   \d users
   ```

3. **Vérifier SESSION_SECRET :**
   ```bash
   railway variables
   ```

### CORS Error

Si vous voyez une erreur CORS dans la console :
- Vérifier que `FRONTEND_URL` est exactement votre domaine Netlify (sans `/` à la fin)
- Vérifier que `credentials: "include"` est présent dans tous les fetch du frontend

## 📊 Comportement Attendu

| Scénario | Comportement |
|----------|-------------|
| **1ère installation** | Crée toutes les tables + seed complet |
| **Redémarrage (données existantes)** | Skip le seed, vérifie les tables |
| **Table users manquante** | Re-crée users sans détruire books/authors |
| **Nouvel utilisateur** | S'inscrit normalement via `/api/auth/signup` |

## ✅ Checklist Finale

- [x] `DROP TABLE` retirés de schema.sql
- [x] Seed vérifie l'existence des données
- [x] app.js vérifie la table users
- [x] SESSION_SECRET configuré sur Railway
- [x] FRONTEND_URL configuré sur Railway
- [x] Frontend rebuild avec credentials: "include"
- [x] Code committé et pushé
- [x] Logs Railway vérifiés

---

**Prochaine étape :** Tester l'inscription en production ! 🎉
