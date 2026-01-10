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

## Conclusion

Ce projet, pourtant simple en apparence, m’a permis de réellement comprendre :

- les différences entre SQLite et PostgreSQL
- l’impact du choix de la base sur l’architecture
- l’importance du schéma de données

Il me reste encore beaucoup à apprendre (index, transactions avancées, optimisation), mais cette migration m’a donné une base solide et une meilleure vision de ce qui se passe “sous le capot” des applications web modernes.
