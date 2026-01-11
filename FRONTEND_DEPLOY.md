# Déploiement Frontend avec Vercel - Optionnel

Si vous souhaitez déployer le frontend séparément avec CI/CD :

## Configuration Vercel

1. **Connecter le repository** sur https://vercel.com
2. **Framework Preset** : Choisir "Other" (vanilla JS)
3. **Root Directory** : Définir `frontend`
4. **Build Command** : Laisser vide (pas de build nécessaire)
5. **Output Directory** : `.` (racine du dossier frontend)

## Variables d'environnement

Ajouter dans les paramètres Vercel :
```
VITE_API_URL=https://votre-backend.up.railway.app
```

## Alternative : Servir depuis le backend

Pour servir le frontend directement depuis Express (plus simple pour ce projet) :

1. Décommenter la ligne dans `backend/src/app.js` :
   ```javascript
   app.use(express.static(path.join(__dirname, "../../frontend")));
   ```

2. Le frontend sera accessible sur la même URL que le backend
   (exemple: https://librairie-simple-production-6ca3.up.railway.app)

3. Modifier `frontend/src/config.js` pour détecter l'environnement correctement
