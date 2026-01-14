# Bibliothèque SQL - Application Full-Stack

Application de gestion de bibliothèque construite avec Node.js, Express et PostgreSQL. Ce projet illustre les concepts fondamentaux des bases de données relationnelles et l'architecture d'une application web moderne.

## 📋 Vue d'ensemble

Une application complète permettant de gérer une collection de livres, auteurs et emprunts avec :

- **Backend** : API REST avec Express.js et PostgreSQL
- **Frontend** : Interface HTML/CSS/JavaScript vanilla
- **Base de données** : PostgreSQL avec relations (clés étrangères, cascade)

## 🏗️ Architecture

### Structure du projet

```
.
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── app.js       # Point d'entrée
│   │   ├── db/          # Connexion et schéma
│   │   ├── models/      # Couche d'accès aux données
│   │   ├── routes/      # Routes API REST
│   │   └── scripts/     # Utilitaires (seed, reset)
│   └── package.json
│
└── frontend/            # Interface utilisateur
    ├── src/             # Sources (JS, CSS)
    ├── pages/           # Pages HTML
    ├── build.js         # Script de build (esbuild)
    └── package.json
```

### Modèle de données

Trois tables principales avec relations :

- **authors** : `id`, `full_name`, `nationality`, `birth_year`
- **books** : `id`, `title`, `author_id` (FK), `publication_year`, `available`
- **loans** : `id`, `book_id` (FK), `borrower_name`, `loan_date`, `return_date`

Les suppressions sont gérées en cascade (`ON DELETE CASCADE`).

## 🚀 Installation et démarrage

### Prérequis

- Node.js ≥ 20
- PostgreSQL ≥ 14
- npm ou pnpm

### Configuration

1. **Cloner le dépôt**

```bash
git clone https://github.com/ElAkab/librairie-simple.git
cd librairie-simple
```

2. **Configuration Backend**

```bash
cd backend
npm install
```

Créer un fichier `.env` à partir de `.env.example` :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/library
NODE_ENV=development
PORT=5000
```

3. **Configuration Frontend**

```bash
cd ../frontend
npm install
```

### Démarrage

**Backend** (avec auto-reload)

```bash
cd backend
npm run dev
```

**Frontend** (après build)

```bash
cd frontend
npm run build
npm run preview
```

L'API sera accessible sur `http://localhost:5000` et le frontend sur `http://localhost:8080`.

## 📡 API REST

### Routes principales

| Méthode | Endpoint              | Description                  |
| ------- | --------------------- | ---------------------------- |
| GET     | `/api/books`          | Liste tous les livres        |
| GET     | `/api/books/:id`      | Récupère un livre            |
| POST    | `/api/books`          | Crée un livre                |
| PUT     | `/api/books/:id`      | Met à jour un livre          |
| DELETE  | `/api/books/:id`      | Supprime un livre            |
| GET     | `/api/authors`        | Liste tous les auteurs       |
| POST    | `/api/authors`        | Crée un auteur               |
| GET     | `/api/loans`          | Liste tous les emprunts      |
| POST    | `/api/loans`          | Enregistre un emprunt        |
| PUT     | `/api/loans/:id`      | Marque un emprunt retourné   |

### Exemple de requête

```bash
# Créer un auteur
curl -X POST http://localhost:5000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Albert Camus", "nationality": "French", "birth_year": 1913}'

# Lister les livres
curl http://localhost:5000/api/books
```

## 🛠️ Scripts disponibles

### Backend

```bash
npm start          # Démarre le serveur
npm run dev        # Mode développement avec auto-reload
npm run db:reset   # Réinitialise la base de données
```

### Frontend

```bash
npm run build      # Build optimisé (minification + bundling)
npm run preview    # Prévisualise le build
npm run validate   # Valide les fichiers HTML
```

## 🔄 Migration SQLite → PostgreSQL

Ce projet a initialement été développé avec SQLite (`better-sqlite3`) avant d'être migré vers PostgreSQL. Cette migration a permis d'appréhender les différences majeures :

### Principales différences

| Aspect               | SQLite                      | PostgreSQL                     |
| -------------------- | --------------------------- | ------------------------------ |
| **Exécution**        | Synchrone                   | Asynchrone (async/await)       |
| **Paramètres**       | `?` (positionnels)          | `$1`, `$2` (numérotés)         |
| **Résultats**        | `.get()`, `.all()`          | `.query().rows`                |
| **Connexion**        | Fichier local               | Pool de connexions             |
| **Types**            | Faiblement typé             | Fortement typé                 |
| **Production**       | Limité (concurrence)        | Adapté (scalabilité)           |

### Exemple de migration

**Avant (SQLite)** :

```javascript
const books = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
```

**Après (PostgreSQL)** :

```javascript
const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
const books = result.rows[0];
```

## 📦 Build et optimisation

Le frontend utilise **esbuild** pour :

- Bundler les modules ES
- Minifier le code JavaScript
- Réduire la taille des fichiers (~60% de gain)

Le processus de build inclut également :

- Minification HTML (`html-minifier-terser`)
- Minification CSS (`clean-css`)
- Remplacement des chemins sources par les bundles

**Résultat** : Passage de ~10KB (sources) à ~4KB (build).

## 🌐 Déploiement

### Backend - Render

Configuration requise :

- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Environment Variables** :
  - `DATABASE_URL` (fourni par Render)
  - `NODE_ENV=production`
  - `PORT=10000`

Points d'attention :

- SSL requis pour PostgreSQL distant : `ssl: { rejectUnauthorized: false }`
- CORS configuré pour autoriser le frontend Netlify

### Frontend - Netlify

Configuration requise :

- **Build Command** : `npm run build`
- **Publish Directory** : `dist`

Configuration CORS et détection d'environnement via `src/config.js` :

```javascript
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://backend.onrender.com/api";
```

## 🧪 CI/CD

GitHub Actions configuré pour valider les builds à chaque push :

```yaml
name: CI
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install
      - run: cd frontend && npm install && npm run build
```

## 🎓 Concepts clés

### Pattern Repository

Les modèles utilisent des **méthodes statiques** uniquement (pas d'instances) :

```javascript
class Book {
  static async findById(id) {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
    return result.rows[0];
  }
}
```

### Gestion de la disponibilité

La création d'un emprunt met automatiquement à jour la disponibilité du livre :

```javascript
static async createLoan(bookId, borrowerName, loanDate) {
  // Créer l'emprunt
  const result = await pool.query(/* ... */);
  
  // Mettre à jour la disponibilité
  await Book.updateAvailability(bookId, false);
  
  return result.rows[0].id;
}
```

### Prepared Statements

Protection contre les injections SQL via paramètres :

```javascript
// ✅ Sécurisé
pool.query("SELECT * FROM books WHERE id = $1", [id]);

// ❌ Vulnérable
pool.query(`SELECT * FROM books WHERE id = ${id}`);
```

## 📚 Ressources et apprentissages

Ce projet a permis d'explorer :

- SQL relationnel (jointures, clés étrangères, contraintes)
- Architecture API REST
- Modèle asynchrone Node.js
- Build et optimisation frontend
- Déploiement sur services cloud (Render, Netlify)
- CI/CD avec GitHub Actions
- Migration entre systèmes de bases de données

## 🔒 Sécurité

- Utilisation de prepared statements (protection SQL injection)
- Variables d'environnement pour les secrets (`.env` non versionné)
- CORS configuré avec origines autorisées
- SSL/TLS pour connexion PostgreSQL en production

## 📝 Licence

MIT - Projet à vocation pédagogique

## 👤 Auteur

**Akab**

- GitHub: [@ElAkab](https://github.com/ElAkab)
- Repository: [librairie-simple](https://github.com/ElAkab/librairie-simple)

---

**Note** : Ce projet a été créé dans un cadre d'apprentissage des bases de données SQL et des architectures web modernes. Pour plus de détails sur le processus de développement et les défis rencontrés, consultez le fichier `backend/journal.md`.
