# 🎯 Checklist : Activation CI/CD - SQL Library

Cette checklist vous guide pour activer le CI/CD sur votre projet en **10 minutes chrono**.

---

## ✅ Prérequis

- [x] Compte GitHub avec le repository du projet
- [x] Compte Railway avec le projet déployé
- [x] Application backend déjà fonctionnelle en production

---

## 🚀 Étapes d'activation

### 1️⃣ Vérifier que GitHub Actions est prêt (1 min)

```bash
# Les fichiers CI/CD sont déjà créés, il suffit de push
git add .
git commit -m "ci: configuration CI/CD avec GitHub Actions et Railway"
git push origin main
```

**Vérification** :
- Allez sur https://github.com/VOTRE_USERNAME/VOTRE_REPO/actions
- Vous devriez voir le workflow "CI - Backend Validation" en cours d'exécution
- ✅ Badge vert = Validation réussie

---

### 2️⃣ Connecter Railway à GitHub (2 min)

1. Connectez-vous sur https://railway.app
2. Ouvrez votre projet "SQL Library"
3. Cliquez sur votre service backend
4. Allez dans **Settings** → **Source**
5. Cliquez sur **"Connect to GitHub Repository"**
6. Sélectionnez votre repository
7. Branche : `main`
8. Root Directory : laissez vide
9. **Sauvegardez**

**Vérification** :
- Dans Settings → Source, vous devriez voir "Connected to GitHub"
- Railway affichera "Auto-deploy enabled on main"

---

### 3️⃣ Configurer les variables d'environnement Railway (2 min)

Dans Railway, allez dans **Variables** et vérifiez/ajoutez :

```
✅ DATABASE_URL (déjà configuré automatiquement par Railway)
➕ NODE_ENV=production
➕ FRONTEND_URL=https://votre-frontend.vercel.app
```

> **Note** : `DATABASE_URL` est généré automatiquement quand vous ajoutez PostgreSQL à votre projet Railway. Ne le modifiez pas.

**Vérification** :
```bash
# Testez le health check
curl https://VOTRE_URL_RAILWAY.up.railway.app/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

---

### 4️⃣ Tester le workflow complet (5 min)

#### Test 1 : Validation CI

```bash
# Faites une petite modification
echo "// Test CI/CD" >> backend/src/app.js

# Commit et push
git add .
git commit -m "test: vérification pipeline CI"
git push origin main
```

**Observer** :
1. GitHub → Actions → Le workflow démarre automatiquement
2. Attendez ~1-2 minutes
3. ✅ Le workflow doit passer au vert

#### Test 2 : Déploiement automatique CD

Après que le CI soit vert :

1. Allez sur Railway → Deployments
2. Vous devriez voir un nouveau déploiement en cours
3. Attendez ~2-4 minutes
4. Status passe à "Success"

**Vérifier en production** :
```bash
curl https://VOTRE_URL_RAILWAY.up.railway.app/health
```

---

## 🎉 Félicitations !

Votre pipeline CI/CD est actif. À partir de maintenant :

| Action | Résultat automatique |
|--------|---------------------|
| `git push origin main` | GitHub Actions valide le code |
| ✅ CI validé | Railway déploie en production |
| ❌ CI échoue | Railway ne déploie PAS (sécurité) |

---

## 📚 Documentation complète

- **Guide détaillé** : [CICD.md](CICD.md)
- **Variables d'environnement** : [backend/.env.example](backend/.env.example)
- **Configuration Railway** : [railway.json](railway.json)
- **Workflow CI** : [.github/workflows/ci.yml](.github/workflows/ci.yml)

---

## 🔧 Dépannage rapide

### ❌ GitHub Actions ne se déclenche pas
- Vérifiez que le fichier `.github/workflows/ci.yml` est bien poussé sur GitHub
- Actions → Enable workflows si désactivé

### ❌ Railway ne déploie pas automatiquement
- Settings → Source → Vérifiez "Connected to GitHub"
- Watch paths doit inclure `backend/**` ou être vide
- Vérifiez que le commit a bien été pushé sur `main`

### ❌ Health check échoue
- Vérifiez les variables d'environnement (surtout `DATABASE_URL`)
- Regardez les logs Railway : Deployments → Cliquer sur le build → Deploy Logs

### 🆘 Besoin d'aide ?
Consultez le guide complet dans [CICD.md](CICD.md) section "Monitoring et dépannage"

---

## 🎯 Prochaines étapes (optionnel)

- [ ] Ajouter des tests unitaires (`npm test`)
- [ ] Configurer des notifications Discord/Slack
- [ ] Mettre en place un environnement staging (branche `dev`)
- [ ] Activer le monitoring (Sentry, LogRocket)

---

**Date de configuration** : 11 janvier 2026  
**Status** : ✅ Prêt à l'emploi
