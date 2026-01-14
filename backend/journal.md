# Journal de bord — Apprentissage SQL (SQLite → PostgreSQL)

## Vue d’ensemble du projet

Mini-projet backend visant à apprendre et comparer **SQLite (better-sqlite3)** et **PostgreSQL (pg)** à travers la gestion d’une bibliothèque (auteurs, livres, emprunts).

Objectif principal : comprendre les différences concrètes entre une base embarquée synchrone et une base relationnelle orientée production.

---

## Architecture du projet

- **connexion.js**
  Initialisation de la base et définition des tables (`authors`, `books`, `loans`).

- **models/** (`author.js`, `book.js`, `loan.js`)
  Implémentation des opérations CRUD via un pattern Repository (méthodes statiques).

- **seed.js**
  Script de peuplement initial de la base de données.

- **commands/query.js**
  Fonctions de requêtes avancées / utilitaires.

- **app.js**
  Point d’entrée du backend (API REST).

---

## Fonctionnement backend

- API RESTful exposant les ressources :

  - `authors`
  - `books`
  - `loans`

- Routes asynchrones avec `async/await` et `try/catch`
- Séparation claire entre :

  - connexion DB
  - seed
  - logique métier

---

## Journal de migration — SQLite → PostgreSQL

### Pourquoi migrer ?

SQLite est excellent pour apprendre et prototyper :

- simple
- rapide
- zéro configuration

Mais ses limites apparaissent vite :

- accès concurrent limité
- fonctionnement synchrone
- peu adapté à un déploiement web réel

PostgreSQL apporte :

- gestion asynchrone
- pool de connexions
- types stricts
- outils pensés pour la production

La migration était donc un **choix pédagogique** autant que technique.

---

### Problèmes rencontrés et solutions

#### 1. Types de données mal définis

Une colonne `birth_year` était en `DATE` alors qu’elle devait être un `INTEGER`.

Erreur :

```text
column "birth_year" is of type date but expression is of type integer
```

Cause : PostgreSQL conserve le schéma existant.
Solution : suppression et recréation des tables (`DROP TABLE ... CASCADE`).

> Leçon : toujours vérifier les types dès le départ, PostgreSQL est strict.

---

#### 2. Pool PostgreSQL fermé involontairement

Le script `seed()` était exécuté automatiquement à chaque import, ce qui appelait `pool.end()` et cassait l’API.

Solution :

```js
if (import.meta.url === `file://${process.argv[1]}`) {
	seed();
}
```

Le seed ne s’exécute plus que lorsqu’on lance le fichier directement.

---

#### 3. Refactor du schéma : `firstName/lastName` → `full_name`

Ce changement a impacté :

- le schéma DB
- les modèles
- les routes
- le seed
- tout le frontend

> Leçon : définir le schéma **avant** de brancher le frontend évite beaucoup de douleur.

---

#### 4. Imports ES Modules côté frontend

Oublier l’extension `.js` provoquait des erreurs 404.

```js
// 👎
import API_URL from "./config";

// 👍
import API_URL from "./config.js";
```

Avec `"type": "module"`, Node est strict.

---

## Différences clés SQLite vs PostgreSQL

### Mode d’exécution

```js
// SQLite
const books = db.prepare("SELECT * FROM books").all();

// PostgreSQL
const result = await pool.query("SELECT * FROM books");
const books = result.rows;
```

- SQLite : synchrone
- PostgreSQL : asynchrone

---

### Paramètres de requête

```js
// SQLite
db.prepare("SELECT * FROM books WHERE id = ?").get(id);

// PostgreSQL
pool.query("SELECT * FROM books WHERE id = $1", [id]);
```

---

### Gestion des connexions

- SQLite : une connexion, un fichier
- PostgreSQL : pool de connexions, config réseau

---

### Résultats retournés

- SQLite :

  - `.get()` → objet
  - `.all()` → tableau

- PostgreSQL :

  - `.query()` → `{ rows, rowCount }`

---

### Clés étrangères & cascade

- SQLite : `PRAGMA foreign_keys = ON`
- PostgreSQL : `ON DELETE CASCADE` natif

---

## Ce que j’ai appris

### SQLite (better-sqlite3)

- Très simple pour débuter
- Synchrone = compréhension immédiate
- Reset facile de la DB
- Mais pas pensé pour la production

### PostgreSQL (pg)

- Tout est async
- Typage strict
- Gestion avancée des erreurs
- Plus complexe à configurer
- Mais clairement taillé pour le web et le scaling

### De manière générale

- Le frontend doit matcher **exactement** le schéma backend
- Bien penser la DB avant de coder évite les refactors coûteux
- La migration est un excellent exercice pour comprendre les bases relationnelles

---

## Tableau comparatif

_(tableau conservé tel quel, déjà clair et non redondant)_ ✅

---

---

## Déploiement (Render + Netlify)

Le déploiement n'était **pas du tout prévu** au départ. Mais après avoir passé tout ce temps sur le projet, autant le mettre en ligne, non ?

### Backend sur Render

Render propose PostgreSQL gratuit (jusqu'à 90 jours). Parfait pour tester.

**Configuration** :

- Service : Web Service
- Build command : `npm install`
- Start command : `npm start`
- Environment : Node 20+

**Variables d'environnement critiques** :

```bash
DATABASE_URL=postgresql://user:password@host/db  # Fourni par Render
NODE_ENV=production
PORT=10000  # Auto-assigné par Render
```

**Pièges rencontrés** :

#### 1. Seed automatique sur Render

Mon code seed la DB automatiquement si elle est vide. Mais sur Render, la DB externe existe déjà !

Solution : vérifier l'environnement avant de seed :

```js
if (process.env.NODE_ENV !== "production") {
	// Seed uniquement en dev local
	await seed();
}
```

#### 2. CORS

Le frontend sur Netlify ne pouvait pas appeler l'API Render.

Solution :

```js
import cors from "cors";

app.use(
	cors({
		origin: "https://mon-frontend.netlify.app",
		credentials: true,
	})
);
```

#### 3. Connexion PostgreSQL externe

Render fournit `DATABASE_URL`, mais le code utilisait des variables séparées (`DB_HOST`, `DB_USER`, etc.).

Solution : parser l'URL ou utiliser directement `connectionString` :

```js
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }, // Obligatoire pour Render
});
```

---

### Frontend sur Netlify

Netlify est simple... en théorie.

**Configuration** :

- Build command : `npm run build`
- Publish directory : `dist`

**Problèmes rencontrés** :

#### 1. Fichiers non minifiés

Au départ, je copiais bêtement les fichiers HTML/CSS/JS dans `dist/` sans minification.

Résultat : bundle JS de 50KB non compressé. Pas terrible.

#### 2. SPA routing

Chaque page (`authors.html`, `loans.html`) était accessible directement en dev, mais pas en prod.

Netlify retournait 404 sur les rafraîchissements de page.

Solution : fichier `netlify.toml` :

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

> Sauf que ce n'est **pas** une SPA, donc cette solution est bancale. J'ai finalement laissé les routes telles quelles et documenté le problème.

#### 3. Variables d'environnement frontend

Le frontend appelait `http://localhost:5000/api` en dur.

Solution : fichier `config.js` avec switch environnement :

```js
const API_URL =
	window.location.hostname === "localhost"
		? "http://localhost:5000/api"
		: "https://backend.onrender.com/api";

export default API_URL;
```

> Leçon : toujours externaliser les URLs d'API, jamais en dur.

---

### Ce que j'ai appris sur le déploiement

- Le déploiement révèle des bugs invisibles en local (CORS, variables d'env, chemins relatifs)
- PostgreSQL hébergé != PostgreSQL local (SSL, pooling, latence)
- Un simple `npm start` en prod cache énormément de complexité
- Les services gratuits (Render, Netlify) sont excellents pour apprendre, mais ont des limites claires (quotas, sleep après inactivité)

---

## Build frontend (esbuild)

Initialement, je servais les fichiers sources directement. Aucun bundler. Juste du HTML/CSS/JS vanilla avec `<script type="module">`.

Ça marchait en dev, mais :

- Plusieurs fichiers JS = plusieurs requêtes HTTP
- Pas de minification
- Pas de tree-shaking
- Code source exposé tel quel

Bref, **pas adapté à la prod**.

### Pourquoi esbuild ?

- Ultra rapide (écrit en Go)
- Configuration minimale
- Bundle + minification en une ligne

Comparé à Webpack/Rollup, esbuild est 10-100x plus rapide. Pour un petit projet, c'est largement suffisant.

### Structure du build

```js
// frontend/build.js
import * as esbuild from "esbuild";

// 1. Nettoyer dist/
if (fs.existsSync("./dist")) {
	fs.rmSync("./dist", { recursive: true });
}

// 2. Bundler chaque point d'entrée
await esbuild.build({
	entryPoints: ["./src/main.js"],
	bundle: true,
	minify: true,
	outfile: "./dist/bundle-main.min.js",
});

// 3. Copier et modifier les HTML
// 4. Minifier les CSS
```

### Problèmes rencontrés

#### 1. esbuild ne minifie que le JS

Au départ, je pensais qu'`esbuild` minifiait tout (HTML, CSS, JS). Faux.

**esbuild = bundler JavaScript**. Il ne touche pas aux HTML/CSS.

Solution : ajouter `html-minifier-terser` et `clean-css` :

```js
import { minify } from "html-minifier-terser";
import CleanCSS from "clean-css";

// Minifier HTML
html = await minify(html, {
	collapseWhitespace: true,
	removeComments: true,
	minifyCSS: true,
});

// Minifier CSS
const cleanCSS = new CleanCSS({ level: 2 });
const minified = cleanCSS.minify(cssContent);
```

#### 2. Chemins relatifs cassés après build

Avant build :

```html
<script type="module" src="./src/main.js"></script>
```

Après build :

```html
<script src="./bundle-main.min.js"></script>
```

Il fallait **remplacer** le script dans les HTML. Regex fragile, mais fonctionnel :

```js
html = html.replace(
	/<script\s+(?:src="[^"]*"[^>]*type="module"|type="module"[^>]*src="[^"]*")[^>]*><\/script>/g,
	`<script src="${scriptName}"></script>`
);
```

#### 3. Organisation dist/ : fichiers .js dans src/ ou racine ?

Au départ : `dist/bundle-main.min.js`

Problème : incohérent avec `dist/src/style.css`.

Solution : tout mettre dans `dist/src/` :

```
dist/
├── index.html
├── pages/
│   ├── authors.html
│   └── ...
└── src/
    ├── bundle-main.min.js
    ├── bundle-authors.min.js
    └── style.css
```

Cohérent et propre.

#### 4. Dossier `dist/src/` créé deux fois

esbuild créait `dist/src/` automatiquement (ligne 31 du build). Puis mon code tentait de le recréer (ligne 81) → erreur `EEXIST`.

Solution :

```js
if (!fs.existsSync(srcDistDir)) {
	fs.mkdirSync(srcDistDir);
}
```

---

### Gains du build

Avant (sources brutes) :

- `main.js` : 2.3KB
- `authors.js` : 1.8KB
- Total : ~10KB (4 fichiers JS séparés)

Après (bundlé + minifié) :

- `bundle-main.min.js` : 1.1KB
- `bundle-authors.min.js` : 0.9KB
- Total : ~4KB

**Gain : 60% de réduction** + moins de requêtes HTTP.

---

### Ce que j'ai appris sur le build

- **esbuild ne fait que le JS** : il faut d'autres outils pour HTML/CSS
- La minification a un impact réel sur les perfs (surtout réseau mobile)
- Les chemins relatifs deviennent vite un cauchemar sans automatisation
- Un build simple (esbuild seul) est amplement suffisant pour un projet vanilla
- Les outils modernes (Vite, Next.js) cachent toute cette complexité, mais il est important de comprendre ce qui se passe en dessous

---

## CI/CD (bonus non prévu)

Je n'avais **jamais** touché au CI/CD avant. Mais tant qu'à déployer sur Render/Netlify, autant automatiser.

### Objectif

Chaque `git push` sur `main` devrait :

1. Lancer les tests (si j'en avais... 😅)
2. Builder le frontend
3. Déployer automatiquement

### GitHub Actions

Render et Netlify déploient automatiquement depuis GitHub, donc le CI/CD se résume à **valider le code avant merge**.

**Fichier `.github/workflows/ci.yml`** :

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      # Backend
      - name: Install backend deps
        run: cd backend && npm install

      - name: Run backend tests
        run: cd backend && npm test

      # Frontend
      - name: Install frontend deps
        run: cd frontend && npm install

      - name: Build frontend
        run: cd frontend && npm run build
```

### Problèmes rencontrés

#### 1. Pas de tests = CI inutile

Mon `npm test` retournait :

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

Donc le CI échouait systématiquement. J'ai temporairement mis :

```json
"test": "echo \"No tests yet\" && exit 0"
```

> Leçon : le CI/CD **force** à écrire des tests. C'est une bonne chose.

#### 2. Variables d'environnement dans le CI

Le backend a besoin de `DATABASE_URL` pour tourner. Mais dans le CI, elle n'existe pas.

Solution : mock la DB ou skip les tests d'intégration dans le CI.

#### 3. Build frontend inutile dans le CI

Netlify build déjà le frontend à chaque push. Donc le faire dans le CI est redondant.

J'ai gardé cette étape uniquement pour **valider** que le build ne casse pas.

---

### Ce que j'ai appris sur le CI/CD

- Le CI/CD est moins compliqué qu'il n'y paraît (pour un projet simple)
- Il révèle les incohérences dans les scripts `package.json`
- Automatiser le déploiement est satisfaisant, mais demande de la rigueur (branches, tests, variables d'env)
- GitHub Actions est gratuit pour les projets publics et très bien documenté

---

## Conclusion (mise à jour)

Ce projet, censé être **uniquement sur SQL**, s'est transformé en apprentissage complet du cycle de vie d'une application web :

- Migration SQLite → PostgreSQL
- Déploiement backend (Render) + frontend (Netlify)
- Build et optimisation (esbuild, minification)
- CI/CD basique (GitHub Actions)

Ce n'était **pas prévu**, mais j'ai appris énormément :

- SQL reste au cœur du projet, mais il ne vit pas en isolation
- Déployer révèle des bugs invisibles en local
- Le build et le CI/CD forcent à être rigoureux
- Les outils modernes (Render, Netlify, esbuild) permettent de se concentrer sur le code plutôt que sur l'infra

Il me reste encore beaucoup à apprendre (index, transactions avancées, optimisation SQL, tests automatisés), mais ce projet m'a donné une **vision globale** de ce qu'implique construire et maintenir une application web moderne.

Et surtout : **mieux vaut tard que jamais** pour apprendre le build et le déploiement. 🚀
